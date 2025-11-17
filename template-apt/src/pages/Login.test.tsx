import { describe, it, expect, beforeEach, vi } from 'vitest';
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

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Helper para renderizar el componente con router
const renderWithRouter = () => {
  return render(
    <BrowserRouter>
      <Login />
    </BrowserRouter>
  );
};

describe('Login - Pruebas de Props y Datos', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLogin.mockResolvedValue(undefined);
    mockNavigate.mockImplementation(() => {});
  });

  describe('Renderizado del componente', () => {
    it('debería mostrar el título de inicio de sesión', () => {
      renderWithRouter();
      expect(screen.getByText(/Inicia sesión en tu cuenta/i)).toBeInTheDocument();
    });

    it('debería mostrar los campos de usuario y contraseña', () => {
      renderWithRouter();
      expect(screen.getByLabelText(/Usuario/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Contraseña/i)).toBeInTheDocument();
    });

    it('debería mostrar el botón de iniciar sesión', () => {
      renderWithRouter();
      expect(screen.getByRole('button', { name: /Iniciar Sesión/i })).toBeInTheDocument();
    });

    it('debería mostrar el enlace para volver al inicio', () => {
      renderWithRouter();
      expect(screen.getByText(/Volver al inicio/i)).toBeInTheDocument();
    });
  });

  describe('Mostrar datos ingresados en los campos', () => {
    it('debería mostrar el usuario cuando se ingresa', async () => {
      const user = userEvent.setup();
      renderWithRouter();

      const usernameInput = screen.getByLabelText(/Usuario/i);
      await user.type(usernameInput, 'admin.taller');

      expect(usernameInput).toHaveValue('admin.taller');
    });

    it('debería mostrar la contraseña cuando se ingresa', async () => {
      const user = userEvent.setup();
      renderWithRouter();

      const passwordInput = screen.getByLabelText(/Contraseña/i);
      await user.type(passwordInput, 'password123');

      expect(passwordInput).toHaveValue('password123');
    });

    it('debería mantener ambos valores cuando se ingresan usuario y contraseña', async () => {
      const user = userEvent.setup();
      renderWithRouter();

      const usernameInput = screen.getByLabelText(/Usuario/i);
      const passwordInput = screen.getByLabelText(/Contraseña/i);

      await user.type(usernameInput, 'admin.taller');
      await user.type(passwordInput, 'password123');

      expect(usernameInput).toHaveValue('admin.taller');
      expect(passwordInput).toHaveValue('password123');
    });
  });

  describe('Validación de campos', () => {
    it('debería mostrar error cuando el usuario está vacío', async () => {
      const user = userEvent.setup();
      renderWithRouter();

      const submitButton = screen.getByRole('button', { name: /Iniciar Sesión/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Ingresa tu usuario o RUT/i)).toBeInTheDocument();
      });
    });

    it('debería mostrar error cuando la contraseña está vacía', async () => {
      const user = userEvent.setup();
      renderWithRouter();

      const usernameInput = screen.getByLabelText(/Usuario/i);
      await user.type(usernameInput, 'admin');

      const submitButton = screen.getByRole('button', { name: /Iniciar Sesión/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/La contraseña es obligatoria/i)).toBeInTheDocument();
      });
    });

    it('debería mostrar error cuando el usuario tiene formato inválido', async () => {
      const user = userEvent.setup();
      renderWithRouter();

      const usernameInput = screen.getByLabelText(/Usuario/i);
      await user.type(usernameInput, 'ab'); // Menos de 3 caracteres

      const passwordInput = screen.getByLabelText(/Contraseña/i);
      await user.type(passwordInput, 'password123');

      const submitButton = screen.getByRole('button', { name: /Iniciar Sesión/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/El usuario solo puede tener letras/i)).toBeInTheDocument();
      });
    });

    it('debería mostrar error cuando la contraseña es muy corta', async () => {
      const user = userEvent.setup();
      renderWithRouter();

      const usernameInput = screen.getByLabelText(/Usuario/i);
      await user.type(usernameInput, 'admin');

      const passwordInput = screen.getByLabelText(/Contraseña/i);
      await user.type(passwordInput, '12345'); // Menos de 6 caracteres

      const submitButton = screen.getByRole('button', { name: /Iniciar Sesión/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Debe tener al menos 6 caracteres/i)).toBeInTheDocument();
      });
    });

    it('no debería mostrar errores cuando los campos son válidos', async () => {
      const user = userEvent.setup();
      renderWithRouter();

      const usernameInput = screen.getByLabelText(/Usuario/i);
      await user.type(usernameInput, 'admin.taller');

      const passwordInput = screen.getByLabelText(/Contraseña/i);
      await user.type(passwordInput, 'password123');

      // Los campos no deberían tener errores antes de enviar
      expect(screen.queryByText(/Ingresa tu usuario/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/La contraseña es obligatoria/i)).not.toBeInTheDocument();
    });
  });

  describe('Envío del formulario', () => {
    it('debería llamar a login cuando el formulario es válido', async () => {
      const user = userEvent.setup();
      renderWithRouter();

      const usernameInput = screen.getByLabelText(/Usuario/i);
      const passwordInput = screen.getByLabelText(/Contraseña/i);

      await user.type(usernameInput, 'admin.taller');
      await user.type(passwordInput, 'password123');

      const submitButton = screen.getByRole('button', { name: /Iniciar Sesión/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith('admin.taller', 'password123');
      });
    });

    it('debería mostrar estado de carga en el botón', async () => {
      const user = userEvent.setup();
      mockLogin.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
      
      renderWithRouter();

      const usernameInput = screen.getByLabelText(/Usuario/i);
      const passwordInput = screen.getByLabelText(/Contraseña/i);

      await user.type(usernameInput, 'admin.taller');
      await user.type(passwordInput, 'password123');

      const submitButton = screen.getByRole('button', { name: /Iniciar Sesión/i });
      await user.click(submitButton);

      await waitFor(() => {
        const loadingButton = screen.getByRole('button', { name: /Iniciando sesión/i });
        expect(loadingButton).toBeInTheDocument();
        expect(loadingButton).toBeDisabled();
      }, { timeout: 2000 });
    });

    it('debería mostrar error cuando las credenciales son incorrectas', async () => {
      const user = userEvent.setup();
      mockLogin.mockRejectedValue(new Error('Credenciales incorrectas'));

      renderWithRouter();

      const usernameInput = screen.getByLabelText(/Usuario/i);
      const passwordInput = screen.getByLabelText(/Contraseña/i);

      await user.type(usernameInput, 'admin.taller');
      await user.type(passwordInput, 'wrongpassword');

      const submitButton = screen.getByRole('button', { name: /Iniciar Sesión/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Usuario o contraseña incorrectos/i)).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('debería navegar después de un login exitoso', async () => {
      const user = userEvent.setup();
      mockLogin.mockResolvedValue(undefined);

      renderWithRouter();

      const usernameInput = screen.getByLabelText(/Usuario/i);
      const passwordInput = screen.getByLabelText(/Contraseña/i);

      await user.type(usernameInput, 'admin.taller');
      await user.type(passwordInput, 'password123');

      const submitButton = screen.getByRole('button', { name: /Iniciar Sesión/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalled();
        expect(mockNavigate).toHaveBeenCalledWith('/');
      }, { timeout: 3000 });
    });
  });

  describe('Placeholders y ayuda', () => {
    it('debería mostrar el placeholder del campo usuario', () => {
      renderWithRouter();
      const usernameInput = screen.getByPlaceholderText(/Ej: admin.taller/i);
      expect(usernameInput).toBeInTheDocument();
    });

    it('debería mostrar el placeholder del campo contraseña', () => {
      renderWithRouter();
      const passwordInput = screen.getByPlaceholderText(/Ingresa tu contraseña/i);
      expect(passwordInput).toBeInTheDocument();
    });

    it('debería mostrar el texto de ayuda para el usuario', () => {
      renderWithRouter();
      expect(screen.getByText(/Ingresa tu nombre de usuario corporativo/i)).toBeInTheDocument();
    });
  });
});

