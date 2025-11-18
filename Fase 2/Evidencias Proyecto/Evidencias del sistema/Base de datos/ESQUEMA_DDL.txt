CREATE TABLE cargo (
    id_cargo SERIAL PRIMARY KEY,
    nombre_cargo TEXT NOT NULL UNIQUE,
    descripcion_cargo TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE usuario (
    id_usuario SERIAL PRIMARY KEY,
    usuario TEXT NOT NULL UNIQUE,
    clave TEXT NOT NULL,
    rol TEXT NOT NULL CHECK (
        rol IN (
            'admin',
            'planner',
            'supervisor',
            'mechanic',
            'guard',
            'driver',
            'repuestos',
            'jefe_taller'
        )
    ),
    ultima_conexion TIMESTAMPTZ,
    estado_usuario BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE empleado (
    id_empleado SERIAL PRIMARY KEY,
    nombre TEXT NOT NULL,
    apellido_paterno TEXT NOT NULL,
    apellido_materno TEXT,
    rut TEXT NOT NULL UNIQUE,
    email TEXT,
    telefono1 TEXT,
    telefono2 TEXT,
    fecha_nacimiento DATE,
    cargo_id INT NOT NULL REFERENCES cargo(id_cargo),
    usuario_id INT REFERENCES usuario(id_usuario),
    estado_empleado TEXT NOT NULL DEFAULT 'activo' CHECK (estado_empleado IN ('activo', 'inactivo')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE marca_vehiculo (
    id_marca_vehiculo SERIAL PRIMARY KEY,
    nombre_marca TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE tipo_vehiculo (
    id_tipo_vehiculo SERIAL PRIMARY KEY,
    tipo_vehiculo TEXT NOT NULL UNIQUE,
    descripcion_tipo_vehiculo TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE sucursal (
    id_sucursal SERIAL PRIMARY KEY,
    nombre_sucursal TEXT NOT NULL UNIQUE,
    direccion_sucursal TEXT,
    region_sucursal TEXT,
    comuna_sucursal TEXT,
    telefono_sucursal TEXT,
    email_sucursal TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE modelo_vehiculo (
    id_modelo_vehiculo SERIAL PRIMARY KEY,
    nombre_modelo TEXT NOT NULL,
    anio_modelo INT,
    marca_vehiculo_id INT NOT NULL REFERENCES marca_vehiculo(id_marca_vehiculo),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (nombre_modelo, marca_vehiculo_id)
);

CREATE TABLE categoria_vehiculo (
    id_categoria_vehiculo SERIAL PRIMARY KEY,
    nombre_categoria TEXT NOT NULL UNIQUE,
    descripcion_categoria TEXT,
    color_hex TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE modelo_categoria (
    id_modelo_categoria SERIAL PRIMARY KEY,
    modelo_vehiculo_id INT NOT NULL REFERENCES modelo_vehiculo(id_modelo_vehiculo) ON DELETE CASCADE,
    categoria_vehiculo_id INT NOT NULL REFERENCES categoria_vehiculo(id_categoria_vehiculo) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (modelo_vehiculo_id, categoria_vehiculo_id)
);

CREATE TABLE tipo_falla (
    id_tipo_falla SERIAL PRIMARY KEY,
    nombre_tipo_falla TEXT NOT NULL UNIQUE,
    descripcion_tipo_falla TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE prioridad_ot_catalogo (
    id_prioridad_ot SERIAL PRIMARY KEY,
    valor TEXT NOT NULL UNIQUE,
    etiqueta TEXT NOT NULL,
    color_hex TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE estado_ot_catalogo (
    id_estado_ot SERIAL PRIMARY KEY,
    valor TEXT NOT NULL UNIQUE,
    etiqueta TEXT NOT NULL,
    orden_visual INT DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE perfil_usuario (
    id_perfil SERIAL PRIMARY KEY,
    usuario_id INT NOT NULL UNIQUE REFERENCES usuario(id_usuario) ON DELETE CASCADE,
    rol TEXT NOT NULL,
    titulo TEXT,
    landing_page TEXT,
    modulos JSONB NOT NULL DEFAULT '[]'::jsonb,
    widgets JSONB NOT NULL DEFAULT '[]'::jsonb,
    creado_en TIMESTAMPTZ NOT NULL DEFAULT now(),
    actualizado_en TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE permiso (
    id_permiso SERIAL PRIMARY KEY,
    codigo TEXT NOT NULL UNIQUE,
    nombre_permiso TEXT NOT NULL,
    descripcion_permiso TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE rol_permiso (
    id_rol_permiso SERIAL PRIMARY KEY,
    rol TEXT NOT NULL,
    permiso_id INT NOT NULL REFERENCES permiso(id_permiso) ON DELETE CASCADE,
    permitido BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (rol, permiso_id)
);

CREATE TABLE permiso_usuario (
    id_permiso_usuario SERIAL PRIMARY KEY,
    usuario_id INT NOT NULL REFERENCES usuario(id_usuario) ON DELETE CASCADE,
    permiso_id INT NOT NULL REFERENCES permiso(id_permiso) ON DELETE CASCADE,
    permitido BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (usuario_id, permiso_id)
);

CREATE TABLE config_agenda (
    id_config_agenda SERIAL PRIMARY KEY,
    hora_inicio TIME NOT NULL DEFAULT '07:30',
    hora_fin TIME NOT NULL DEFAULT '16:30',
    hora_inicio_colacion TIME NOT NULL DEFAULT '12:30',
    hora_fin_colacion TIME NOT NULL DEFAULT '13:15',
    duracion_diagnostico INTEGER NOT NULL DEFAULT 2,
    duracion_reparacion INTEGER NOT NULL DEFAULT 4,
    dias_habiles TEXT[] NOT NULL DEFAULT ARRAY['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'],
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE notificacion (
    id_notificacion SERIAL PRIMARY KEY,
    usuario_id INT REFERENCES usuario(id_usuario) ON DELETE SET NULL,
    titulo TEXT NOT NULL,
    mensaje TEXT NOT NULL,
    tipo TEXT,
    leido BOOLEAN NOT NULL DEFAULT false,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE auditoria_usuario (
    id_auditoria SERIAL PRIMARY KEY,
    usuario_id INT REFERENCES usuario(id_usuario) ON DELETE CASCADE,
    actor_id INT REFERENCES usuario(id_usuario) ON DELETE SET NULL,
    accion TEXT NOT NULL,
    detalle TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE vehiculo (
    id_vehiculo SERIAL PRIMARY KEY,
    patente_vehiculo TEXT NOT NULL UNIQUE,
    anio_vehiculo INT,
    fecha_adquisicion_vehiculo DATE,
    capacidad_carga_vehiculo DECIMAL(10,2),
    estado_vehiculo TEXT NOT NULL DEFAULT 'disponible'
        CHECK (estado_vehiculo IN ('disponible', 'en ruta', 'mantenimiento')),
    kilometraje_vehiculo DECIMAL(10,2),
    modelo_vehiculo_id INT NOT NULL REFERENCES modelo_vehiculo(id_modelo_vehiculo),
    tipo_vehiculo_id INT NOT NULL REFERENCES tipo_vehiculo(id_tipo_vehiculo),
    sucursal_id INT NOT NULL REFERENCES sucursal(id_sucursal),
    categoria_vehiculo_id INT REFERENCES categoria_vehiculo(id_categoria_vehiculo),
    observaciones TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE solicitud_diagnostico (
    id_solicitud_diagnostico SERIAL PRIMARY KEY,
    vehiculo_id INT REFERENCES vehiculo(id_vehiculo),
    empleado_id INT NOT NULL REFERENCES empleado(id_empleado),
    patente_vehiculo TEXT,
    tipo_problema TEXT NOT NULL,
    tipo_falla_id INT REFERENCES tipo_falla(id_tipo_falla),
    prioridad TEXT NOT NULL DEFAULT 'normal'
        CHECK (prioridad IN ('normal', 'urgente')),
    fecha_solicitada DATE NOT NULL,
    bloque_horario TEXT NOT NULL,
    comentarios TEXT,
    fotos TEXT[],
    estado_solicitud TEXT NOT NULL DEFAULT 'pendiente_confirmacion'
        CHECK (
            estado_solicitud IN (
                'pendiente_confirmacion',
                'confirmada',
                'rechazada',
                'completada'
            )
        ),
    tipo_trabajo TEXT,
    fecha_confirmada DATE,
    bloque_horario_confirmado TEXT,
    orden_trabajo_id INT,
    box_id INT,
    mecanico_id INT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE orden_trabajo (
    id_orden_trabajo SERIAL PRIMARY KEY,
    codigo_ot TEXT UNIQUE,
    descripcion_ot TEXT,
    estado_ot TEXT NOT NULL DEFAULT 'pendiente'
        CHECK (
            estado_ot IN (
                'pendiente',
                'en curso',
                'en_reparacion',
                'finalizada',
                'cancelada'
            )
        ),
    prioridad_ot TEXT DEFAULT 'normal'
        CHECK (prioridad_ot IN ('normal', 'alta', 'critica')),
    prioridad_id INT REFERENCES prioridad_ot_catalogo(id_prioridad_ot),
    fecha_inicio_ot TIMESTAMPTZ NOT NULL DEFAULT now(),
    fecha_cierre_ot TIMESTAMPTZ,
    hora_confirmada TEXT,
    empleado_id INT NOT NULL REFERENCES empleado(id_empleado),
    vehiculo_id INT NOT NULL REFERENCES vehiculo(id_vehiculo),
    sucursal_id INT REFERENCES sucursal(id_sucursal),
    solicitud_diagnostico_id INT REFERENCES solicitud_diagnostico(id_solicitud_diagnostico),
    detalle_reparacion TEXT,
    checklist_id INT,
    mecanico_apoyo_ids INT[],
    estado_cierre TEXT DEFAULT 'pendiente'
        CHECK (estado_cierre IN ('pendiente', 'cerrada')),
    fecha_cierre_tecnico TIMESTAMPTZ,
    confirmado_ingreso BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE checklist_diagnostico (
    id_checklist SERIAL PRIMARY KEY,
    orden_trabajo_id INT NOT NULL REFERENCES orden_trabajo(id_orden_trabajo) ON DELETE CASCADE,
    empleado_id INT REFERENCES empleado(id_empleado) ON DELETE SET NULL,
    datos JSONB NOT NULL,
    clasificacion_prioridad TEXT,
    estado TEXT DEFAULT 'completado',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (orden_trabajo_id)
);

CREATE TABLE servicio (
    id_servicio SERIAL PRIMARY KEY,
    nombre_servicio TEXT NOT NULL,
    descripcion_servicio TEXT,
    orden_trabajo_id INT NOT NULL REFERENCES orden_trabajo(id_orden_trabajo),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE repuesto (
    id_repuesto SERIAL PRIMARY KEY,
    nombre_repuesto TEXT NOT NULL,
    descripcion_repuesto TEXT,
    stock_repuesto INT NOT NULL DEFAULT 0,
    unidad_medida TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE ot_repuesto (
    id_ot_repuesto SERIAL PRIMARY KEY,
    cantidad_ot_repuesto INT NOT NULL,
    orden_trabajo_id INT NOT NULL REFERENCES orden_trabajo(id_orden_trabajo) ON DELETE CASCADE,
    repuesto_id INT NOT NULL REFERENCES repuesto(id_repuesto),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE incidencia (
    id_incidencia SERIAL PRIMARY KEY,
    fecha_incidencia TIMESTAMPTZ NOT NULL DEFAULT now(),
    descripcion_incidencia TEXT,
    estado_incidencia TEXT NOT NULL DEFAULT 'pendiente'
        CHECK (estado_incidencia IN ('pendiente', 'en revision', 'resuelta')),
    gravedad_incidencia TEXT
        CHECK (gravedad_incidencia IN ('baja', 'media', 'alta', 'critica')),
    observaciones_incidencia TEXT,
    orden_trabajo_id INT NOT NULL REFERENCES orden_trabajo(id_orden_trabajo),
    empleado_id INT REFERENCES empleado(id_empleado),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE acceso (
    id_acceso SERIAL PRIMARY KEY,
    empleado_id INT NOT NULL REFERENCES empleado(id_empleado),
    vehiculo_id INT REFERENCES vehiculo(id_vehiculo),
    fecha_ingreso TIMESTAMPTZ NOT NULL DEFAULT now(),
    fecha_salida TIMESTAMPTZ,
    observaciones TEXT,
    imagen_url TEXT,
    estado_acceso TEXT DEFAULT 'en_progreso'
        CHECK (estado_acceso IN ('en_progreso', 'completado', 'rechazado')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE historial_accesos (
    id_historial_accesos SERIAL PRIMARY KEY,
    acceso_id INT NOT NULL REFERENCES acceso(id_acceso) ON DELETE CASCADE,
    evento TEXT NOT NULL,
    descripcion TEXT,
    actor_id INT REFERENCES usuario(id_usuario) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE llaves (
    id_llaves SERIAL PRIMARY KEY,
    vehiculo_id INT NOT NULL REFERENCES vehiculo(id_vehiculo),
    empleado_id INT NOT NULL REFERENCES empleado(id_empleado),
    fecha_prestamo_llaves TIMESTAMPTZ NOT NULL DEFAULT now(),
    fecha_devolucion_llaves TIMESTAMPTZ,
    observaciones_llaves TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE asignacion_vehiculo (
    id_asignacion SERIAL PRIMARY KEY,
    empleado_id INT NOT NULL REFERENCES empleado(id_empleado) ON DELETE CASCADE,
    vehiculo_id INT NOT NULL REFERENCES vehiculo(id_vehiculo) ON DELETE CASCADE,
    sucursal_id INT REFERENCES sucursal(id_sucursal),
    estado_asignacion TEXT NOT NULL DEFAULT 'activo' CHECK (estado_asignacion IN ('activo','finalizado')),
    fecha_asignacion TIMESTAMPTZ NOT NULL DEFAULT now(),
    fecha_fin TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT asignacion_unica_activa UNIQUE (empleado_id, estado_asignacion)
        DEFERRABLE INITIALLY IMMEDIATE
);

CREATE TABLE driver_history (
    id_driver_history SERIAL PRIMARY KEY,
    empleado_id INT NOT NULL REFERENCES empleado(id_empleado) ON DELETE CASCADE,
    solicitud_diagnostico_id INT REFERENCES solicitud_diagnostico(id_solicitud_diagnostico) ON DELETE SET NULL,
    vehiculo_id INT REFERENCES vehiculo(id_vehiculo) ON DELETE SET NULL,
    descripcion TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE aprobacion_asignacion_ot (
    id_aprobacion SERIAL PRIMARY KEY,
    orden_trabajo_id INT NOT NULL REFERENCES orden_trabajo(id_orden_trabajo) ON DELETE CASCADE,
    mecanico_id INT NOT NULL REFERENCES empleado(id_empleado) ON DELETE CASCADE,
    estado TEXT NOT NULL DEFAULT 'pendiente'
        CHECK (estado IN ('pendiente', 'aprobada', 'rechazada', 'revocada')),
    comentarios TEXT,
    aprobado_por INT REFERENCES usuario(id_usuario) ON DELETE SET NULL,
    aprobado_en TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (orden_trabajo_id, mecanico_id)
);

ALTER TABLE cargo ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuario ENABLE ROW LEVEL SECURITY;
ALTER TABLE empleado ENABLE ROW LEVEL SECURITY;
ALTER TABLE marca_vehiculo ENABLE ROW LEVEL SECURITY;
ALTER TABLE modelo_vehiculo ENABLE ROW LEVEL SECURITY;
ALTER TABLE tipo_vehiculo ENABLE ROW LEVEL SECURITY;
ALTER TABLE sucursal ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehiculo ENABLE ROW LEVEL SECURITY;
ALTER TABLE solicitud_diagnostico ENABLE ROW LEVEL SECURITY;
ALTER TABLE orden_trabajo ENABLE ROW LEVEL SECURITY;
ALTER TABLE servicio ENABLE ROW LEVEL SECURITY;
ALTER TABLE repuesto ENABLE ROW LEVEL SECURITY;
ALTER TABLE ot_repuesto ENABLE ROW LEVEL SECURITY;
ALTER TABLE incidencia ENABLE ROW LEVEL SECURITY;
ALTER TABLE acceso ENABLE ROW LEVEL SECURITY;
ALTER TABLE llaves ENABLE ROW LEVEL SECURITY;
ALTER TABLE categoria_vehiculo ENABLE ROW LEVEL SECURITY;
ALTER TABLE modelo_categoria ENABLE ROW LEVEL SECURITY;
ALTER TABLE tipo_falla ENABLE ROW LEVEL SECURITY;
ALTER TABLE prioridad_ot_catalogo ENABLE ROW LEVEL SECURITY;
ALTER TABLE estado_ot_catalogo ENABLE ROW LEVEL SECURITY;
ALTER TABLE perfil_usuario ENABLE ROW LEVEL SECURITY;
ALTER TABLE permiso ENABLE ROW LEVEL SECURITY;
ALTER TABLE rol_permiso ENABLE ROW LEVEL SECURITY;
ALTER TABLE permiso_usuario ENABLE ROW LEVEL SECURITY;
ALTER TABLE config_agenda ENABLE ROW LEVEL SECURITY;
ALTER TABLE notificacion ENABLE ROW LEVEL SECURITY;
ALTER TABLE auditoria_usuario ENABLE ROW LEVEL SECURITY;
ALTER TABLE historial_accesos ENABLE ROW LEVEL SECURITY;
ALTER TABLE asignacion_vehiculo ENABLE ROW LEVEL SECURITY;
ALTER TABLE driver_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklist_diagnostico ENABLE ROW LEVEL SECURITY;
ALTER TABLE aprobacion_asignacion_ot ENABLE ROW LEVEL SECURITY;

