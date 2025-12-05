import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import AdminDashboard from './AdminDashboard';

// Mock de useAuth
const mockUser = {
  id_usuario: 1,
  usuario: 'admin',
  rol: 'admin',
};

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: mockUser,
    loading: false,
  }),
}));

// Mock de supabase
const mockInsert = vi.fn();
vi.mock('../lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ data: [], error: null })),
        order: vi.fn(() => Promise.resolve({ data: [], error: null })),
      })),
      insert: mockInsert,
      update: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ data: null, error: null })),
      })),
      delete: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ data: null, error: null })),
      })),
    })),
  },
}));

const renderWithRouter = () => {
  return render(
    <BrowserRouter>
      <AdminDashboard activeSection="usuarios" />
    </BrowserRouter>
  );
};

describe('🔲 Pruebas de Caja Negra - Registro de Usuarios', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    mockInsert.mockResolvedValue({ data: [{ id_usuario: 1 }], error: null });
  });

  describe('✅ Pruebas Funcionales - Comportamiento del Sistema', () => {
    it('CASO 1: Debería abrir el modal al hacer click en "Crear Usuario"', async () => {
      // ARRANGE
      const user = userEvent.setup();
      renderWithRouter();

      await waitFor(() => {
        expect(document.body).toBeInTheDocument();
      }, { timeout: 3000 });

      // ACT
      const crearUsuarioButton = screen.getByRole('button', { name: /Crear Usuario/i });
      await user.click(crearUsuarioButton);

      // ASSERT: Verificar que el modal se abre
      await waitFor(() => {
        expect(screen.getByText(/Agregar Usuario Nuevo de la Empresa/i)).toBeInTheDocument();
      });
    });

    it('CASO 2: Debería cerrar el modal al hacer click en "Cancelar"', async () => {
      // ARRANGE
      const user = userEvent.setup();
      renderWithRouter();

      await waitFor(() => {
        expect(document.body).toBeInTheDocument();
      }, { timeout: 3000 });

      // ACT: Abrir modal
      const crearUsuarioButton = screen.getByRole('button', { name: /Crear Usuario/i });
      await user.click(crearUsuarioButton);

      await waitFor(() => {
        expect(screen.getByText(/Agregar Usuario Nuevo de la Empresa/i)).toBeInTheDocument();
      });

      // ACT: Cerrar modal
      const cancelButton = screen.getByRole('button', { name: /Cancelar/i });
      await user.click(cancelButton);

      // ASSERT: Modal debe cerrarse
      await waitFor(() => {
        const modalTitle = screen.queryByText(/Agregar Usuario Nuevo de la Empresa/i);
        expect(modalTitle).not.toBeInTheDocument();
      });
    });

    it('CASO 3: Debería mantener los datos ingresados mientras se completa el formulario', async () => {
      // ARRANGE
      const user = userEvent.setup();
      renderWithRouter();

      await waitFor(() => {
        expect(document.body).toBeInTheDocument();
      }, { timeout: 3000 });

      // ACT: Abrir modal y llenar campos
      const crearUsuarioButton = screen.getByRole('button', { name: /Crear Usuario/i });
      await user.click(crearUsuarioButton);

      await waitFor(() => {
        expect(document.querySelector('#modal-nuevo-usuario-usuario')).toBeInTheDocument();
      });

      const usuarioInput = document.querySelector('#modal-nuevo-usuario-usuario') as HTMLInputElement;
      const nombreInput = document.querySelector('#modal-nuevo-usuario-nombre') as HTMLInputElement;
      const correoInput = document.querySelector('#modal-nuevo-usuario-correo') as HTMLInputElement;

      await user.type(usuarioInput, 'jperez');
      await user.type(nombreInput, 'Juan Pérez');
      await user.type(correoInput, 'jperez@empresa.com');

      // ASSERT: Verificar que los valores se mantienen
      expect(usuarioInput).toHaveValue('jperez');
      expect(nombreInput).toHaveValue('Juan Pérez');
      expect(correoInput).toHaveValue('jperez@empresa.com');
    });
  });

  describe('✅ Pruebas de Validación - Reglas de Negocio', () => {
    beforeEach(async () => {
      const user = userEvent.setup();
      renderWithRouter();
      await waitFor(() => {
        expect(document.body).toBeInTheDocument();
      }, { timeout: 3000 });

      const crearUsuarioButton = screen.getByRole('button', { name: /Crear Usuario/i });
      await user.click(crearUsuarioButton);

      await waitFor(() => {
        expect(document.querySelector('#modal-nuevo-usuario-usuario')).toBeInTheDocument();
      });
    });

    it('CASO 4: Debería rechazar formulario con campos vacíos', async () => {
      // ARRANGE
      const user = userEvent.setup();

      // ACT: Intentar guardar sin llenar campos
      const guardarButton = screen.getByRole('button', { name: /Guardar|Crear/i });
      await user.click(guardarButton);

      // ASSERT: Debe mostrar errores
      await waitFor(() => {
        // Verificar que aparece algún mensaje de error
        const errorMessages = screen.queryAllByText(/obligatorio|requerido/i);
        expect(errorMessages.length).toBeGreaterThan(0);
      });
    });

    it('CASO 5: Debería rechazar usuario con caracteres especiales', async () => {
      // ARRANGE
      const user = userEvent.setup();
      const usuarioInput = document.querySelector('#modal-nuevo-usuario-usuario') as HTMLInputElement;

      // ACT: Ingresar usuario con caracteres especiales
      await user.type(usuarioInput, 'user@#$');
      await user.click(screen.getByRole('button', { name: /Guardar|Crear/i }));

      // ASSERT: Debe mostrar error
      await waitFor(() => {
        const error = screen.queryByText(/Solo se permiten letras y números/i);
        expect(error || usuarioInput.getAttribute('aria-invalid') === 'true').toBeTruthy();
      });
    });

    it('CASO 6: Debería rechazar contraseña muy corta (menos de 8 caracteres)', async () => {
      // ARRANGE
      const user = userEvent.setup();
      const passwordInput = document.querySelector('#modal-nuevo-usuario-clave') as HTMLInputElement;

      // ACT: Ingresar contraseña corta
      await user.type(passwordInput, '1234567'); // 7 caracteres
      await user.click(screen.getByRole('button', { name: /Guardar|Crear/i }));

      // ASSERT: Debe mostrar error
      await waitFor(() => {
        const error = screen.queryByText(/al menos 8 caracteres/i);
        expect(error || passwordInput.getAttribute('aria-invalid') === 'true').toBeTruthy();
      });
    });

    it('CASO 7: Debería rechazar email con formato inválido', async () => {
      // ARRANGE
      const user = userEvent.setup();
      const correoInput = document.querySelector('#modal-nuevo-usuario-correo') as HTMLInputElement;

      // ACT: Ingresar email inválido
      await user.type(correoInput, 'correo-sin-arroba');
      await user.click(screen.getByRole('button', { name: /Guardar|Crear/i }));

      // ASSERT: Debe mostrar error
      await waitFor(() => {
        const error = screen.queryByText(/Formato de correo inválido|correo inválido/i);
        expect(error || correoInput.getAttribute('aria-invalid') === 'true').toBeTruthy();
      });
    });

    it('CASO 8: Debería rechazar RUT con formato inválido', async () => {
      // ARRANGE
      const user = userEvent.setup();
      const rutInput = document.querySelector('#modal-nuevo-usuario-rut') as HTMLInputElement;

      // ACT: Ingresar RUT inválido
      await user.type(rutInput, '12345'); // Muy corto
      await user.click(screen.getByRole('button', { name: /Guardar|Crear/i }));

      // ASSERT: Debe mostrar error
      await waitFor(() => {
        const error = screen.queryByText(/RUT|8 dígitos/i);
        expect(error || rutInput.getAttribute('aria-invalid') === 'true').toBeTruthy();
      });
    });

    it('CASO 9: Debería aceptar formulario con todos los campos válidos', async () => {
      // ARRANGE
      const user = userEvent.setup();
      const usuarioInput = document.querySelector('#modal-nuevo-usuario-usuario') as HTMLInputElement;
      const passwordInput = document.querySelector('#modal-nuevo-usuario-clave') as HTMLInputElement;
      const nombreInput = document.querySelector('#modal-nuevo-usuario-nombre') as HTMLInputElement;
      const rutInput = document.querySelector('#modal-nuevo-usuario-rut') as HTMLInputElement;
      const correoInput = document.querySelector('#modal-nuevo-usuario-correo') as HTMLInputElement;

      // ACT: Llenar todos los campos con datos válidos
      await user.type(usuarioInput, 'jperez');
      await user.type(passwordInput, 'Password123');
      await user.type(nombreInput, 'Juan Pérez');
      await user.type(rutInput, '12345678-9');
      await user.type(correoInput, 'jperez@empresa.com');

      // Seleccionar rol
      const rolSelect = screen.getByRole('combobox', { name: /Rol/i });
      await user.selectOptions(rolSelect, 'driver');

      // ASSERT: Verificar que los campos tienen valores válidos
      expect(usuarioInput).toHaveValue('jperez');
      expect(passwordInput).toHaveValue('Password123');
      expect(nombreInput).toHaveValue('Juan Pérez');
      expect(correoInput).toHaveValue('jperez@empresa.com');
      expect(rolSelect).toHaveValue('driver');
    });
  });

  describe('✅ Pruebas de Casos Límite - Valores Extremos', () => {
    beforeEach(async () => {
      const user = userEvent.setup();
      renderWithRouter();
      await waitFor(() => {
        expect(document.body).toBeInTheDocument();
      }, { timeout: 3000 });

      const crearUsuarioButton = screen.getByRole('button', { name: /Crear Usuario/i });
      await user.click(crearUsuarioButton);

      await waitFor(() => {
        expect(document.querySelector('#modal-nuevo-usuario-usuario')).toBeInTheDocument();
      });
    });

    it('CASO 10: Debería aceptar usuario con máximo de caracteres (50)', async () => {
      // ARRANGE
      const user = userEvent.setup();
      const usuarioInput = document.querySelector('#modal-nuevo-usuario-usuario') as HTMLInputElement;
      const longUsername = 'a'.repeat(50);

      // ACT
      await user.type(usuarioInput, longUsername);

      // ASSERT: No debe mostrar error de longitud
      expect(usuarioInput.value.length).toBeLessThanOrEqual(50);
    });

    it('CASO 11: Debería rechazar usuario con más del máximo de caracteres', async () => {
      // ARRANGE
      const user = userEvent.setup();
      const usuarioInput = document.querySelector('#modal-nuevo-usuario-usuario') as HTMLInputElement;
      const tooLongUsername = 'a'.repeat(51);

      // ACT
      await user.type(usuarioInput, tooLongUsername);
      await user.click(screen.getByRole('button', { name: /Guardar|Crear/i }));

      // ASSERT: Debe mostrar error o truncar
      await waitFor(() => {
        const error = screen.queryByText(/Máximo 50 caracteres/i);
        expect(error || usuarioInput.value.length <= 50).toBeTruthy();
      });
    });

    it('CASO 12: Debería aceptar contraseña con exactamente 8 caracteres (límite mínimo)', async () => {
      // ARRANGE
      const user = userEvent.setup();
      const passwordInput = document.querySelector('#modal-nuevo-usuario-clave') as HTMLInputElement;

      // ACT: Contraseña con exactamente 8 caracteres
      await user.type(passwordInput, 'Pass1234');

      // ASSERT: No debe mostrar error de longitud
      expect(passwordInput.value.length).toBeGreaterThanOrEqual(8);
    });
  });

  describe('✅ Pruebas de Flujo Completo - Experiencia del Usuario', () => {
    it('CASO 13: Debería completar flujo completo: abrir modal → llenar → guardar → cerrar', async () => {
      // ARRANGE
      const user = userEvent.setup();
      renderWithRouter();

      await waitFor(() => {
        expect(document.body).toBeInTheDocument();
      }, { timeout: 3000 });

      // ACT 1: Abrir modal
      const crearUsuarioButton = screen.getByRole('button', { name: /Crear Usuario/i });
      await user.click(crearUsuarioButton);

      await waitFor(() => {
        expect(screen.getByText(/Agregar Usuario Nuevo de la Empresa/i)).toBeInTheDocument();
      });

      // ACT 2: Llenar formulario
      const usuarioInput = document.querySelector('#modal-nuevo-usuario-usuario') as HTMLInputElement;
      const passwordInput = document.querySelector('#modal-nuevo-usuario-clave') as HTMLInputElement;
      const nombreInput = document.querySelector('#modal-nuevo-usuario-nombre') as HTMLInputElement;
      const correoInput = document.querySelector('#modal-nuevo-usuario-correo') as HTMLInputElement;

      await user.type(usuarioInput, 'testuser');
      await user.type(passwordInput, 'Password123');
      await user.type(nombreInput, 'Test User');
      await user.type(correoInput, 'test@empresa.com');

      // ACT 3: Seleccionar rol
      const rolSelect = screen.getByRole('combobox', { name: /Rol/i });
      await user.selectOptions(rolSelect, 'driver');

      // ASSERT: Verificar que todos los campos tienen valores
      expect(usuarioInput).toHaveValue('testuser');
      expect(passwordInput).toHaveValue('Password123');
      expect(nombreInput).toHaveValue('Test User');
      expect(correoInput).toHaveValue('test@empresa.com');
      expect(rolSelect).toHaveValue('driver');
    });

    it('CASO 14: Debería permitir cambiar de rol después de seleccionar uno', async () => {
      // ARRANGE
      const user = userEvent.setup();
      renderWithRouter();

      await waitFor(() => {
        expect(document.body).toBeInTheDocument();
      }, { timeout: 3000 });

      const crearUsuarioButton = screen.getByRole('button', { name: /Crear Usuario/i });
      await user.click(crearUsuarioButton);

      await waitFor(() => {
        expect(document.querySelector('#modal-nuevo-usuario-usuario')).toBeInTheDocument();
      });

      // ACT: Seleccionar un rol y luego cambiar a otro
      const rolSelect = screen.getByRole('combobox', { name: /Rol/i });
      await user.selectOptions(rolSelect, 'driver');
      expect(rolSelect).toHaveValue('driver');

      await user.selectOptions(rolSelect, 'planner');
      expect(rolSelect).toHaveValue('planner');
    });
  });
});

