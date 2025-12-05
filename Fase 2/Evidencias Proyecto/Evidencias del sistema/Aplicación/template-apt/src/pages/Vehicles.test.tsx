import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import Vehicles from './Vehicles';

// Mock de useAuth
const mockUser = {
  id_usuario: 1,
  usuario: 'test',
  rol: 'guard',
};

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: mockUser,
    loading: false,
  }),
}));

// Mock de supabase - devolver error para que cargue desde localStorage
vi.mock('../lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        order: vi.fn(() => Promise.resolve({ data: null, error: { message: 'Mock error' } })),
        eq: vi.fn(() => Promise.resolve({ data: null, error: null })),
      })),
      insert: vi.fn(() => Promise.resolve({ data: null, error: null })),
      update: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ data: null, error: null })),
      })),
      delete: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ data: null, error: null })),
      })),
    })),
  },
}));

// Helper para renderizar el componente con router
const renderWithRouter = () => {
  return render(
    <BrowserRouter>
      <Vehicles />
    </BrowserRouter>
  );
};

describe('Vehicles - Pruebas de Props y Datos', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    
    // Mockear datos de modelos, tipos y sucursales
    localStorage.setItem('apt_modelos', JSON.stringify([
      { id_modelo_vehiculo: 1, nombre_modelo: 'Camión 1', marca: { nombre_marca: 'Mercedes' } },
      { id_modelo_vehiculo: 2, nombre_modelo: 'Furgón 1', marca: { nombre_marca: 'Volvo' } },
    ]));
    localStorage.setItem('apt_tipos', JSON.stringify([
      { id_tipo_vehiculo: 1, tipo_vehiculo: 'Camión' },
      { id_tipo_vehiculo: 2, tipo_vehiculo: 'Furgón' },
    ]));
    localStorage.setItem('apt_sucursales', JSON.stringify([
      { id_sucursal: 1, nombre_sucursal: 'Sucursal Centro' },
      { id_sucursal: 2, nombre_sucursal: 'Sucursal Norte' },
    ]));
  });

  describe('Renderizado del componente', () => {
    it('debería mostrar el botón de agregar vehículo', async () => {
      renderWithRouter();
      
      await waitFor(() => {
        expect(screen.getByText(/Agregar Vehículo/i)).toBeInTheDocument();
      });
    });

    it('debería abrir el modal al hacer clic en agregar vehículo', async () => {
      const user = userEvent.setup();
      renderWithRouter();

      await waitFor(() => {
        const buttons = screen.getAllByText(/Agregar Vehículo/i);
        expect(buttons.length).toBeGreaterThan(0);
      });

      const buttons = screen.getAllByText(/Agregar Vehículo/i);
      const agregarButton = buttons.find(btn => btn.tagName === 'BUTTON') || buttons[0];
      await user.click(agregarButton);

      await waitFor(() => {
        const modalTitle = screen.getByRole('heading', { name: /Agregar Vehículo/i });
        expect(modalTitle).toBeInTheDocument();
      });
    });
  });

  describe('Renderizado de campos del formulario', () => {
    it('debería mostrar todos los campos del formulario cuando se abre el modal', async () => {
      const user = userEvent.setup();
      renderWithRouter();

      // Abrir el modal
      await waitFor(() => {
        const buttons = screen.getAllByText(/Agregar Vehículo/i);
        expect(buttons.length).toBeGreaterThan(0);
      });

      const buttons = screen.getAllByText(/Agregar Vehículo/i);
      const agregarButton = buttons.find(btn => btn.tagName === 'BUTTON') || buttons[0];
      await user.click(agregarButton);

      // Esperar a que el modal se abra
      await waitFor(() => {
        const modalTitle = screen.getByRole('heading', { name: /Agregar Vehículo/i });
        expect(modalTitle).toBeInTheDocument();
      }, { timeout: 3000 });

      // Verificar que los labels existen (puede haber múltiples, así que usamos queryAllByText)
      expect(screen.queryAllByText(/Patente/i).length).toBeGreaterThan(0);
      expect(screen.queryAllByText(/Modelo/i).length).toBeGreaterThan(0);
      expect(screen.queryAllByText(/Tipo/i).length).toBeGreaterThan(0);
      expect(screen.queryAllByText(/Sucursal/i).length).toBeGreaterThan(0);
      expect(screen.queryAllByText(/Año/i).length).toBeGreaterThan(0);
      expect(screen.queryAllByText(/Estado/i).length).toBeGreaterThan(0);
      expect(screen.queryAllByText(/Fecha de Adquisición/i).length).toBeGreaterThan(0);
      expect(screen.queryAllByText(/Capacidad de Carga/i).length).toBeGreaterThan(0);
      expect(screen.queryAllByText(/Kilometraje/i).length).toBeGreaterThan(0);
      
      // Verificar que los inputs existen dentro del modal
      const modal = document.querySelector('.bg-white.rounded-lg.shadow-xl');
      expect(modal).toBeInTheDocument();
      if (modal) {
        expect(modal.querySelector('input[type="text"]')).toBeInTheDocument();
        expect(modal.querySelectorAll('select').length).toBeGreaterThan(0);
        expect(modal.querySelector('input[type="date"]')).toBeInTheDocument();
        expect(modal.querySelectorAll('input[type="number"]').length).toBeGreaterThan(0);
      }
    });
  });

  describe('Mostrar datos ingresados en los campos', () => {
    it('debería mostrar la patente cuando se ingresa', async () => {
      const user = userEvent.setup();
      renderWithRouter();

      // Abrir modal
      await waitFor(() => {
        expect(screen.getByText(/Agregar Vehículo/i)).toBeInTheDocument();
      });
      await user.click(screen.getByText(/Agregar Vehículo/i));

      // Esperar a que aparezca el campo
      await waitFor(() => {
        const patenteInput = document.querySelector('input[type="text"]') as HTMLInputElement;
        expect(patenteInput).toBeInTheDocument();
      });

      const patenteInput = document.querySelector('input[type="text"]') as HTMLInputElement;
      await user.type(patenteInput, 'ABC1234');

      expect(patenteInput).toHaveValue('ABC1234');
    });

    it('debería mostrar el año cuando se ingresa', async () => {
      const user = userEvent.setup();
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText(/Agregar Vehículo/i)).toBeInTheDocument();
      });
      await user.click(screen.getByText(/Agregar Vehículo/i));

      await waitFor(() => {
        const numberInputs = document.querySelectorAll('input[type="number"]');
        expect(numberInputs.length).toBeGreaterThan(0);
      });

      const numberInputs = document.querySelectorAll('input[type="number"]');
      const anioInput = numberInputs[0] as HTMLInputElement; // El primer input number es el año
      await user.type(anioInput, '2020');

      expect(anioInput).toHaveValue(2020);
    });

    it('debería mostrar la capacidad de carga cuando se ingresa', async () => {
      const user = userEvent.setup();
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText(/Agregar Vehículo/i)).toBeInTheDocument();
      });
      await user.click(screen.getByText(/Agregar Vehículo/i));

      await waitFor(() => {
        const numberInputs = document.querySelectorAll('input[type="number"]');
        expect(numberInputs.length).toBeGreaterThan(1);
      });

      const numberInputs = document.querySelectorAll('input[type="number"]');
      // La capacidad de carga es el segundo input number (después del año)
      const capacidadInput = numberInputs[1] as HTMLInputElement;
      await user.type(capacidadInput, '15.5');

      expect(capacidadInput).toHaveValue(15.5);
    });

    it('debería mostrar el kilometraje cuando se ingresa', async () => {
      const user = userEvent.setup();
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText(/Agregar Vehículo/i)).toBeInTheDocument();
      });
      await user.click(screen.getByText(/Agregar Vehículo/i));

      await waitFor(() => {
        const numberInputs = document.querySelectorAll('input[type="number"]');
        expect(numberInputs.length).toBeGreaterThan(2);
      });

      const numberInputs = document.querySelectorAll('input[type="number"]');
      // El kilometraje es el tercer input number
      const kilometrajeInput = numberInputs[2] as HTMLInputElement;
      await user.type(kilometrajeInput, '50000');

      expect(kilometrajeInput).toHaveValue(50000);
    });

    it('debería mostrar la fecha de adquisición cuando se selecciona', async () => {
      const user = userEvent.setup();
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText(/Agregar Vehículo/i)).toBeInTheDocument();
      });
      await user.click(screen.getByText(/Agregar Vehículo/i));

      await waitFor(() => {
        const fechaInput = document.querySelector('input[type="date"]') as HTMLInputElement;
        expect(fechaInput).toBeInTheDocument();
      });

      const fechaInput = document.querySelector('input[type="date"]') as HTMLInputElement;
      await user.type(fechaInput, '2020-01-15');

      expect(fechaInput).toHaveValue('2020-01-15');
    });
  });

  describe('Mostrar opciones en los selects', () => {
    it('debería mostrar las opciones de modelo disponibles', async () => {
      const user = userEvent.setup();
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText(/Agregar Vehículo/i)).toBeInTheDocument();
      });
      await user.click(screen.getByText(/Agregar Vehículo/i));

      await waitFor(() => {
        const selects = document.querySelectorAll('select');
        expect(selects.length).toBeGreaterThan(0);
      });

      // Esperar a que se carguen las opciones desde localStorage
      await waitFor(() => {
        const selects = document.querySelectorAll('select');
        const modeloSelect = selects[0] as HTMLSelectElement;
        const options = Array.from(modeloSelect.querySelectorAll('option'));
        expect(options.length).toBeGreaterThan(1);
      }, { timeout: 3000 });

      const selects = document.querySelectorAll('select');
      const modeloSelect = selects[0] as HTMLSelectElement;
      const options = Array.from(modeloSelect.querySelectorAll('option'));
      
      // Debería tener al menos la opción por defecto y las opciones de modelos
      expect(options.length).toBeGreaterThan(1);
      expect(options.some(opt => opt.textContent?.includes('Seleccionar modelo'))).toBe(true);
    });

    it('debería mostrar el modelo seleccionado', async () => {
      const user = userEvent.setup();
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText(/Agregar Vehículo/i)).toBeInTheDocument();
      });
      await user.click(screen.getByText(/Agregar Vehículo/i));

      await waitFor(() => {
        const selects = document.querySelectorAll('select');
        expect(selects.length).toBeGreaterThan(0);
      });

      // Esperar a que se carguen las opciones
      await waitFor(() => {
        const selects = document.querySelectorAll('select');
        const modeloSelect = selects[0] as HTMLSelectElement;
        const options = Array.from(modeloSelect.querySelectorAll('option'));
        expect(options.length).toBeGreaterThan(1);
      }, { timeout: 3000 });

      const selects = document.querySelectorAll('select');
      const modeloSelect = selects[0] as HTMLSelectElement;
      await user.selectOptions(modeloSelect, '1');

      expect(modeloSelect).toHaveValue('1');
    });

    it('debería mostrar las opciones de tipo disponibles', async () => {
      const user = userEvent.setup();
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText(/Agregar Vehículo/i)).toBeInTheDocument();
      });
      await user.click(screen.getByText(/Agregar Vehículo/i));

      await waitFor(() => {
        const selects = document.querySelectorAll('select');
        expect(selects.length).toBeGreaterThan(1);
      });

      // Esperar a que se carguen las opciones
      await waitFor(() => {
        const selects = document.querySelectorAll('select');
        const tipoSelect = selects[1] as HTMLSelectElement;
        const options = Array.from(tipoSelect.querySelectorAll('option'));
        expect(options.length).toBeGreaterThan(1);
      }, { timeout: 3000 });

      const selects = document.querySelectorAll('select');
      const tipoSelect = selects[1] as HTMLSelectElement;
      const options = Array.from(tipoSelect.querySelectorAll('option'));
      
      expect(options.length).toBeGreaterThan(1);
    });

    it('debería mostrar las opciones de estado disponibles', async () => {
      const user = userEvent.setup();
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText(/Agregar Vehículo/i)).toBeInTheDocument();
      });
      await user.click(screen.getByText(/Agregar Vehículo/i));

      await waitFor(() => {
        const selects = document.querySelectorAll('select');
        expect(selects.length).toBeGreaterThanOrEqual(4);
      });

      const selects = document.querySelectorAll('select');
      // El quinto select es el estado (después de Modelo, Tipo, Sucursal, y antes de otros)
      // Buscamos el select que tiene la opción "Disponible"
      let estadoSelect: HTMLSelectElement | null = null;
      for (const select of Array.from(selects)) {
        const options = Array.from(select.querySelectorAll('option'));
        if (options.some(opt => opt.textContent?.includes('Disponible'))) {
          estadoSelect = select as HTMLSelectElement;
          break;
        }
      }
      
      expect(estadoSelect).not.toBeNull();
      if (estadoSelect) {
        const options = Array.from(estadoSelect.querySelectorAll('option'));
        // Debería tener las opciones: Disponible, En Ruta, Mantenimiento
        expect(options.length).toBeGreaterThanOrEqual(3);
        expect(options.some(opt => opt.textContent?.includes('Disponible'))).toBe(true);
        expect(options.some(opt => opt.textContent?.includes('En Ruta'))).toBe(true);
        expect(options.some(opt => opt.textContent?.includes('Mantenimiento'))).toBe(true);
      }
    });

    it('debería mostrar el estado seleccionado', async () => {
      const user = userEvent.setup();
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText(/Agregar Vehículo/i)).toBeInTheDocument();
      });
      await user.click(screen.getByText(/Agregar Vehículo/i));

      await waitFor(() => {
        const selects = document.querySelectorAll('select');
        expect(selects.length).toBeGreaterThan(0);
      });

      const selects = document.querySelectorAll('select');
      // Buscar el select de estado
      let estadoSelect: HTMLSelectElement | null = null;
      for (const select of Array.from(selects)) {
        const options = Array.from(select.querySelectorAll('option'));
        if (options.some(opt => opt.textContent?.includes('Disponible'))) {
          estadoSelect = select as HTMLSelectElement;
          break;
        }
      }
      
      expect(estadoSelect).not.toBeNull();
      if (estadoSelect) {
        await user.selectOptions(estadoSelect, 'en ruta');
        expect(estadoSelect).toHaveValue('en ruta');
      }
    });
  });

  describe('Mostrar datos completos del formulario', () => {
    it('debería mantener todos los datos ingresados en el formulario', async () => {
      const user = userEvent.setup();
      renderWithRouter();

      // Abrir modal
      await waitFor(() => {
        expect(screen.getByText(/Agregar Vehículo/i)).toBeInTheDocument();
      });
      await user.click(screen.getByText(/Agregar Vehículo/i));

      // Esperar a que se carguen los campos
      await waitFor(() => {
        const patenteInput = document.querySelector('input[type="text"]');
        expect(patenteInput).toBeInTheDocument();
      });

      // Llenar todos los campos
      const patenteInput = document.querySelector('input[type="text"]') as HTMLInputElement;
      await user.type(patenteInput, 'ABC1234');
      
      const numberInputs = document.querySelectorAll('input[type="number"]');
      const anioInput = numberInputs[0] as HTMLInputElement;
      await user.type(anioInput, '2020');
      
      const fechaInput = document.querySelector('input[type="date"]') as HTMLInputElement;
      if (fechaInput) {
        await user.type(fechaInput, '2020-01-15');
      }
      
      const capacidadInput = numberInputs[1] as HTMLInputElement;
      await user.type(capacidadInput, '15.5');
      
      const kilometrajeInput = numberInputs[2] as HTMLInputElement;
      await user.type(kilometrajeInput, '50000');

      // Esperar a que se carguen las opciones en los selects
      await waitFor(() => {
        const selects = document.querySelectorAll('select');
        const modeloSelect = selects[0] as HTMLSelectElement;
        const options = Array.from(modeloSelect.querySelectorAll('option'));
        expect(options.length).toBeGreaterThan(1);
      }, { timeout: 3000 });

      // Seleccionar opciones
      const selects = document.querySelectorAll('select');
      const modeloSelect = selects[0] as HTMLSelectElement;
      const tipoSelect = selects[1] as HTMLSelectElement;
      const sucursalSelect = selects[2] as HTMLSelectElement;
      
      // Verificar que tienen opciones antes de seleccionar
      if (Array.from(modeloSelect.querySelectorAll('option')).length > 1) {
        await user.selectOptions(modeloSelect, '1'); // Modelo
      }
      if (Array.from(tipoSelect.querySelectorAll('option')).length > 1) {
        await user.selectOptions(tipoSelect, '1'); // Tipo
      }
      if (Array.from(sucursalSelect.querySelectorAll('option')).length > 1) {
        await user.selectOptions(sucursalSelect, '1'); // Sucursal
      }
      
      // Buscar el select de estado
      let estadoSelect: HTMLSelectElement | null = null;
      for (const select of Array.from(selects)) {
        const options = Array.from(select.querySelectorAll('option'));
        if (options.some(opt => opt.textContent?.includes('Disponible'))) {
          estadoSelect = select as HTMLSelectElement;
          break;
        }
      }
      if (estadoSelect) {
        await user.selectOptions(estadoSelect, 'disponible');
      }

      // Verificar que todos los valores se mantienen
      expect(patenteInput).toHaveValue('ABC1234');
      expect(anioInput).toHaveValue(2020);
      if (fechaInput) {
        expect(fechaInput).toHaveValue('2020-01-15');
      }
      expect(capacidadInput).toHaveValue(15.5);
      expect(kilometrajeInput).toHaveValue(50000);
      const selectsFinal = document.querySelectorAll('select');
      if (Array.from(selectsFinal[0].querySelectorAll('option')).length > 1) {
        expect(selectsFinal[0]).toHaveValue('1'); // Modelo
      }
      if (Array.from(selectsFinal[1].querySelectorAll('option')).length > 1) {
        expect(selectsFinal[1]).toHaveValue('1'); // Tipo
      }
      if (Array.from(selectsFinal[2].querySelectorAll('option')).length > 1) {
        expect(selectsFinal[2]).toHaveValue('1'); // Sucursal
      }
      if (estadoSelect) {
        expect(estadoSelect).toHaveValue('disponible');
      }
    });
  });

  describe('Botones del formulario', () => {
    it('debería mostrar el botón de cancelar', async () => {
      const user = userEvent.setup();
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText(/Agregar Vehículo/i)).toBeInTheDocument();
      });
      await user.click(screen.getByText(/Agregar Vehículo/i));

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Cancelar/i })).toBeInTheDocument();
      });
    });

    it('debería mostrar el botón de guardar', async () => {
      const user = userEvent.setup();
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText(/Agregar Vehículo/i)).toBeInTheDocument();
      });
      await user.click(screen.getByText(/Agregar Vehículo/i));

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Guardar/i })).toBeInTheDocument();
      });
    });
  });
});

