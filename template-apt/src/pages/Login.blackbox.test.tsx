import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import Login from './Login';

// Mock de useAuth
const mockLogin = vi.fn();
const mockNavigate = vi.fn();

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    login: mockLogin,
    user: null,
    loading: false,
  }),
}));

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    BrowserRouter: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    Link: ({ children, to }: { children: React.ReactNode; to: string }) => <a href={to}>{children}</a>,
  };
});

const renderWithRouter = () => {
  return render(
    <BrowserRouter>
      <Login />
    </BrowserRouter>
  );
};

describe('🔲 Pruebas de Caja Negra - Login', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLogin.mockImplementation((username, password) => {
      if (username === 'admin' && password === 'admin123') {
        return Promise.resolve();
      }
      if (username === 'inactive' && password === 'password123') {
        return Promise.reject(new Error('Usuario inactivo'));
      }
      return Promise.reject(new Error('Usuario o contraseña incorrectos'));
    });
  });

  describe('✅ Pruebas Funcionales - Comportamiento del Sistema', () => {
    it('CASO 1: Debería permitir login exitoso con credenciales válidas y redirigir', async () => {
      // ARRANGE: Preparar el escenario
      const user = userEvent.setup();
      renderWithRouter();

      // ACT: Simular entrada del usuario y acción
      await user.type(screen.getByLabelText(/Usuario/i), 'admin');
      await user.type(screen.getByLabelText(/Contraseña/i), 'admin123');
      await user.click(screen.getByRole('button', { name: /Iniciar Sesión/i }));

      // ASSERT: Verificar resultado esperado (redirección)
      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith('admin', 'admin123');
        expect(mockNavigate).toHaveBeenCalledWith('/');
      });
    });

    it('CASO 2: Debería mostrar error con credenciales inválidas', async () => {
      // ARRANGE
      const user = userEvent.setup();
      renderWithRouter();

      // ACT
      await user.type(screen.getByLabelText(/Usuario/i), 'admin');
      await user.type(screen.getByLabelText(/Contraseña/i), 'wrongpassword');
      await user.click(screen.getByRole('button', { name: /Iniciar Sesión/i }));

      // ASSERT: Verificar mensaje de error
      await waitFor(() => {
        expect(screen.getByText(/Usuario o contraseña incorrectos/i)).toBeInTheDocument();
      });
    });

    it('CASO 3: Debería mostrar mensaje específico para usuario inactivo', async () => {
      // ARRANGE
      const user = userEvent.setup();
      renderWithRouter();

      // ACT
      await user.type(screen.getByLabelText(/Usuario/i), 'inactive');
      await user.type(screen.getByLabelText(/Contraseña/i), 'password123');
      await user.click(screen.getByRole('button', { name: /Iniciar Sesión/i }));

      // ASSERT
      await waitFor(() => {
        expect(screen.getByText(/Tu usuario está bloqueado/i)).toBeInTheDocument();
      });
    });

    it('CASO 4: Debería mostrar estado de carga durante el proceso de login', async () => {
      // ARRANGE
      const user = userEvent.setup();
      renderWithRouter();
      
      // Simular login lento
      mockLogin.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

      // ACT
      await user.type(screen.getByLabelText(/Usuario/i), 'admin');
      await user.type(screen.getByLabelText(/Contraseña/i), 'admin123');
      const submitButton = screen.getByRole('button', { name: /Iniciar Sesión/i });
      await user.click(submitButton);

      // ASSERT: Verificar que el botón muestra estado de carga
      await waitFor(() => {
        expect(submitButton).toBeDisabled();
      });
    });
  });

  describe('✅ Pruebas de Validación - Reglas de Negocio', () => {
    it('CASO 5: Debería rechazar login con campos vacíos', async () => {
      // ARRANGE
      const user = userEvent.setup();
      renderWithRouter();

      // ACT: Intentar enviar sin llenar campos
      await user.click(screen.getByRole('button', { name: /Iniciar Sesión/i }));

      // ASSERT: Verificar mensajes de error
      await waitFor(() => {
        expect(screen.getByText(/Ingresa tu usuario o RUT/i)).toBeInTheDocument();
        expect(screen.getByText(/La contraseña es obligatoria/i)).toBeInTheDocument();
      });
      expect(mockLogin).not.toHaveBeenCalled();
    });

    it('CASO 6: Debería rechazar usuario con formato inválido (muy corto)', async () => {
      // ARRANGE
      const user = userEvent.setup();
      renderWithRouter();

      // ACT: Usuario con menos de 3 caracteres
      await user.type(screen.getByLabelText(/Usuario/i), 'ab');
      await user.type(screen.getByLabelText(/Contraseña/i), 'password123');
      await user.click(screen.getByRole('button', { name: /Iniciar Sesión/i }));

      // ASSERT
      await waitFor(() => {
        expect(screen.getByText(/El usuario solo puede tener letras/i)).toBeInTheDocument();
      });
      expect(mockLogin).not.toHaveBeenCalled();
    });

    it('CASO 7: Debería rechazar contraseña muy corta (menos de 6 caracteres)', async () => {
      // ARRANGE
      const user = userEvent.setup();
      renderWithRouter();

      // ACT: Contraseña con 5 caracteres
      await user.type(screen.getByLabelText(/Usuario/i), 'admin');
      await user.type(screen.getByLabelText(/Contraseña/i), '12345');
      await user.click(screen.getByRole('button', { name: /Iniciar Sesión/i }));

      // ASSERT
      await waitFor(() => {
        expect(screen.getByText(/Debe tener al menos 6 caracteres/i)).toBeInTheDocument();
      });
      expect(mockLogin).not.toHaveBeenCalled();
    });

    it('CASO 8: Debería aceptar contraseña con exactamente 6 caracteres (límite mínimo)', async () => {
      // ARRANGE
      const user = userEvent.setup();
      renderWithRouter();

      // ACT: Contraseña con exactamente 6 caracteres
      await user.type(screen.getByLabelText(/Usuario/i), 'admin');
      await user.type(screen.getByLabelText(/Contraseña/i), '123456');
      await user.click(screen.getByRole('button', { name: /Iniciar Sesión/i }));

      // ASSERT: No debe mostrar error de longitud
      await waitFor(() => {
        const error = screen.queryByText(/Debe tener al menos 6 caracteres/i);
        expect(error).not.toBeInTheDocument();
      });
      expect(mockLogin).toHaveBeenCalled();
    });

    it('CASO 9: Debería rechazar usuario con caracteres especiales no permitidos', async () => {
      // ARRANGE
      const user = userEvent.setup();
      renderWithRouter();

      // ACT: Usuario con caracteres especiales
      await user.type(screen.getByLabelText(/Usuario/i), 'admin@#$');
      await user.type(screen.getByLabelText(/Contraseña/i), 'password123');
      await user.click(screen.getByRole('button', { name: /Iniciar Sesión/i }));

      // ASSERT
      await waitFor(() => {
        expect(screen.getByText(/El usuario solo puede tener letras/i)).toBeInTheDocument();
      });
      expect(mockLogin).not.toHaveBeenCalled();
    });
  });

  describe('✅ Pruebas de Casos Límite - Valores Extremos', () => {
    it('CASO 10: Debería aceptar usuario con máximo de caracteres permitidos (50)', async () => {
      // ARRANGE
      const user = userEvent.setup();
      renderWithRouter();
      const longUsername = 'a'.repeat(50); // Exactamente 50 caracteres

      // ACT
      await user.type(screen.getByLabelText(/Usuario/i), longUsername);
      await user.type(screen.getByLabelText(/Contraseña/i), 'password123');
      await user.click(screen.getByRole('button', { name: /Iniciar Sesión/i }));

      // ASSERT: No debe mostrar error de longitud
      await waitFor(() => {
        const error = screen.queryByText(/El usuario solo puede tener letras/i);
        expect(error).not.toBeInTheDocument();
      });
      expect(mockLogin).toHaveBeenCalledWith(longUsername, 'password123');
    });

    it('CASO 11: Debería rechazar usuario con más del máximo de caracteres (51)', async () => {
      // ARRANGE
      const user = userEvent.setup();
      renderWithRouter();
      const tooLongUsername = 'a'.repeat(51); // Más de 50 caracteres

      // ACT
      await user.type(screen.getByLabelText(/Usuario/i), tooLongUsername);
      await user.type(screen.getByLabelText(/Contraseña/i), 'password123');
      await user.click(screen.getByRole('button', { name: /Iniciar Sesión/i }));

      // ASSERT
      await waitFor(() => {
        expect(screen.getByText(/El usuario solo puede tener letras/i)).toBeInTheDocument();
      });
      expect(mockLogin).not.toHaveBeenCalled();
    });

    it('CASO 12: Debería manejar espacios en blanco (trim)', async () => {
      // ARRANGE
      const user = userEvent.setup();
      renderWithRouter();

      // ACT: Usuario y contraseña con espacios al inicio y final
      await user.type(screen.getByLabelText(/Usuario/i), '  admin  ');
      await user.type(screen.getByLabelText(/Contraseña/i), '  admin123  ');
      await user.click(screen.getByRole('button', { name: /Iniciar Sesión/i }));

      // ASSERT: Debe hacer trim y enviar sin espacios
      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith('admin', 'admin123');
      });
    });
  });

  describe('✅ Pruebas de Flujo Completo - Experiencia del Usuario', () => {
    it('CASO 13: Debería completar flujo completo: ingresar datos → validar → enviar → redirigir', async () => {
      // ARRANGE
      const user = userEvent.setup();
      renderWithRouter();

      // ACT: Flujo completo
      // 1. Ingresar usuario
      const usuarioInput = screen.getByLabelText(/Usuario/i);
      await user.type(usuarioInput, 'admin');
      expect(usuarioInput).toHaveValue('admin');

      // 2. Ingresar contraseña
      const passwordInput = screen.getByLabelText(/Contraseña/i);
      await user.type(passwordInput, 'admin123');
      expect(passwordInput).toHaveValue('admin123');

      // 3. Enviar formulario
      await user.click(screen.getByRole('button', { name: /Iniciar Sesión/i }));

      // ASSERT: Verificar todo el flujo
      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith('admin', 'admin123');
        expect(mockNavigate).toHaveBeenCalledWith('/');
      });
    });

    it('CASO 14: Debería permitir corregir campos después de mostrar errores', async () => {
      // ARRANGE
      const user = userEvent.setup();
      renderWithRouter();

      // ACT 1: Intentar enviar con campos vacíos
      await user.click(screen.getByRole('button', { name: /Iniciar Sesión/i }));
      
      // ASSERT 1: Verificar que se muestran errores
      await waitFor(() => {
        expect(screen.getByText(/Ingresa tu usuario o RUT/i)).toBeInTheDocument();
      });

      // ACT 2: Corregir campos y llenar con datos válidos
      const usuarioInput = screen.getByLabelText(/Usuario/i);
      const passwordInput = screen.getByLabelText(/Contraseña/i);
      
      await user.clear(usuarioInput);
      await user.clear(passwordInput);
      await user.type(usuarioInput, 'admin');
      await user.type(passwordInput, 'admin123');

      // ASSERT 2: Verificar que los campos tienen los valores correctos
      expect(usuarioInput).toHaveValue('admin');
      expect(passwordInput).toHaveValue('admin123');
      
      // Verificar que ahora se puede enviar el formulario
      await user.click(screen.getByRole('button', { name: /Iniciar Sesión/i }));
      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith('admin', 'admin123');
      });
    });
  });
});

