-- =====================================================
-- CONSULTAS PARA GENERAR MODELO DE DATOS
-- Sistema APT - PepsiCo Chile
-- =====================================================

-- 1. OBTENER TODAS LAS TABLAS CON SUS COLUMNAS Y TIPOS
SELECT 
    t.table_name AS "Tabla",
    c.column_name AS "Atributo",
    c.data_type AS "Tipo_Dato",
    c.character_maximum_length AS "Longitud",
    c.is_nullable AS "Permite_Null",
    c.column_default AS "Valor_Default",
    CASE 
        WHEN pk.column_name IS NOT NULL THEN 'PK'
        WHEN fk.column_name IS NOT NULL THEN 'FK'
        ELSE ''
    END AS "Tipo_Clave"
FROM 
    information_schema.tables t
    INNER JOIN information_schema.columns c ON t.table_name = c.table_name
    LEFT JOIN (
        SELECT ku.table_name, ku.column_name
        FROM information_schema.table_constraints tc
        INNER JOIN information_schema.key_column_usage ku 
            ON tc.constraint_name = ku.constraint_name
        WHERE tc.constraint_type = 'PRIMARY KEY'
    ) pk ON c.table_name = pk.table_name AND c.column_name = pk.column_name
    LEFT JOIN (
        SELECT ku.table_name, ku.column_name
        FROM information_schema.table_constraints tc
        INNER JOIN information_schema.key_column_usage ku 
            ON tc.constraint_name = ku.constraint_name
        WHERE tc.constraint_type = 'FOREIGN KEY'
    ) fk ON c.table_name = fk.table_name AND c.column_name = fk.column_name
WHERE 
    t.table_schema = 'public'
    AND t.table_type = 'BASE TABLE'
    AND t.table_name NOT LIKE 'pg_%'
ORDER BY 
    t.table_name, 
    c.ordinal_position;

-- =====================================================
-- 2. OBTENER TODAS LAS RELACIONES (FOREIGN KEYS)
-- =====================================================
SELECT
    tc.table_name AS "Tabla_Origen",
    kcu.column_name AS "Atributo_FK",
    ccu.table_name AS "Tabla_Destino",
    ccu.column_name AS "Atributo_PK_Destino",
    tc.constraint_name AS "Nombre_Constraint"
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE 
    tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_schema = 'public'
ORDER BY 
    tc.table_name, 
    kcu.column_name;

-- =====================================================
-- 3. OBTENER TODAS LAS TABLAS CON RESUMEN
-- =====================================================
SELECT 
    t.table_name AS "Tabla",
    COUNT(c.column_name) AS "Cantidad_Atributos",
    COUNT(CASE WHEN pk.column_name IS NOT NULL THEN 1 END) AS "Cantidad_PK",
    COUNT(CASE WHEN fk.column_name IS NOT NULL THEN 1 END) AS "Cantidad_FK"
FROM 
    information_schema.tables t
    LEFT JOIN information_schema.columns c ON t.table_name = c.table_name
    LEFT JOIN (
        SELECT ku.table_name, ku.column_name
        FROM information_schema.table_constraints tc
        INNER JOIN information_schema.key_column_usage ku 
            ON tc.constraint_name = ku.constraint_name
        WHERE tc.constraint_type = 'PRIMARY KEY'
    ) pk ON c.table_name = pk.table_name AND c.column_name = pk.column_name
    LEFT JOIN (
        SELECT ku.table_name, ku.column_name
        FROM information_schema.table_constraints tc
        INNER JOIN information_schema.key_column_usage ku 
            ON tc.constraint_name = ku.constraint_name
        WHERE tc.constraint_type = 'FOREIGN KEY'
    ) fk ON c.table_name = fk.table_name AND c.column_name = fk.column_name
WHERE 
    t.table_schema = 'public'
    AND t.table_type = 'BASE TABLE'
    AND t.table_name NOT LIKE 'pg_%'
GROUP BY 
    t.table_name
ORDER BY 
    t.table_name;

-- =====================================================
-- 4. ESTRUCTURA COMPLETA POR TABLA (DETALLADA)
-- =====================================================

-- TABLA: cargo
SELECT 
    'cargo' AS "Tabla",
    column_name AS "Atributo",
    data_type AS "Tipo",
    is_nullable AS "Null",
    column_default AS "Default"
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'cargo'
ORDER BY ordinal_position;

-- TABLA: usuario
SELECT 
    'usuario' AS "Tabla",
    column_name AS "Atributo",
    data_type AS "Tipo",
    is_nullable AS "Null",
    column_default AS "Default"
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'usuario'
ORDER BY ordinal_position;

-- TABLA: empleado
SELECT 
    'empleado' AS "Tabla",
    column_name AS "Atributo",
    data_type AS "Tipo",
    is_nullable AS "Null",
    column_default AS "Default"
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'empleado'
ORDER BY ordinal_position;

-- TABLA: marca_vehiculo
SELECT 
    'marca_vehiculo' AS "Tabla",
    column_name AS "Atributo",
    data_type AS "Tipo",
    is_nullable AS "Null",
    column_default AS "Default"
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'marca_vehiculo'
ORDER BY ordinal_position;

-- TABLA: modelo_vehiculo
SELECT 
    'modelo_vehiculo' AS "Tabla",
    column_name AS "Atributo",
    data_type AS "Tipo",
    is_nullable AS "Null",
    column_default AS "Default"
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'modelo_vehiculo'
ORDER BY ordinal_position;

-- TABLA: tipo_vehiculo
SELECT 
    'tipo_vehiculo' AS "Tabla",
    column_name AS "Atributo",
    data_type AS "Tipo",
    is_nullable AS "Null",
    column_default AS "Default"
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'tipo_vehiculo'
ORDER BY ordinal_position;

-- TABLA: sucursal
SELECT 
    'sucursal' AS "Tabla",
    column_name AS "Atributo",
    data_type AS "Tipo",
    is_nullable AS "Null",
    column_default AS "Default"
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'sucursal'
ORDER BY ordinal_position;

-- TABLA: vehiculo
SELECT 
    'vehiculo' AS "Tabla",
    column_name AS "Atributo",
    data_type AS "Tipo",
    is_nullable AS "Null",
    column_default AS "Default"
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'vehiculo'
ORDER BY ordinal_position;

-- TABLA: orden_trabajo
SELECT 
    'orden_trabajo' AS "Tabla",
    column_name AS "Atributo",
    data_type AS "Tipo",
    is_nullable AS "Null",
    column_default AS "Default"
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'orden_trabajo'
ORDER BY ordinal_position;

-- TABLA: acceso
SELECT 
    'acceso' AS "Tabla",
    column_name AS "Atributo",
    data_type AS "Tipo",
    is_nullable AS "Null",
    column_default AS "Default"
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'acceso'
ORDER BY ordinal_position;

-- TABLA: llaves
SELECT 
    'llaves' AS "Tabla",
    column_name AS "Atributo",
    data_type AS "Tipo",
    is_nullable AS "Null",
    column_default AS "Default"
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'llaves'
ORDER BY ordinal_position;

-- TABLA: servicio
SELECT 
    'servicio' AS "Tabla",
    column_name AS "Atributo",
    data_type AS "Tipo",
    is_nullable AS "Null",
    column_default AS "Default"
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'servicio'
ORDER BY ordinal_position;

-- TABLA: repuesto
SELECT 
    'repuesto' AS "Tabla",
    column_name AS "Atributo",
    data_type AS "Tipo",
    is_nullable AS "Null",
    column_default AS "Default"
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'repuesto'
ORDER BY ordinal_position;

-- TABLA: ot_repuesto
SELECT 
    'ot_repuesto' AS "Tabla",
    column_name AS "Atributo",
    data_type AS "Tipo",
    is_nullable AS "Null",
    column_default AS "Default"
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'ot_repuesto'
ORDER BY ordinal_position;

-- TABLA: incidencia
SELECT 
    'incidencia' AS "Tabla",
    column_name AS "Atributo",
    data_type AS "Tipo",
    is_nullable AS "Null",
    column_default AS "Default"
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'incidencia'
ORDER BY ordinal_position;

-- =====================================================
-- 5. RELACIONES COMPLETAS CON CARDINALIDAD
-- =====================================================
SELECT
    tc.table_name AS "Tabla_Origen",
    kcu.column_name AS "Atributo_FK",
    '→' AS "Relacion",
    ccu.table_name AS "Tabla_Destino",
    ccu.column_name AS "Atributo_PK_Destino",
    CASE 
        WHEN kcu.column_name LIKE '%_id' THEN 'N:1'
        ELSE '1:N'
    END AS "Cardinalidad"
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE 
    tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_schema = 'public'
ORDER BY 
    tc.table_name, 
    kcu.column_name;

-- =====================================================
-- 6. RESUMEN COMPLETO PARA MODELO DE DATOS
-- =====================================================
-- Esta consulta combina todo en un formato útil

WITH tablas_info AS (
    SELECT 
        t.table_name,
        COUNT(DISTINCT c.column_name) AS num_columnas,
        STRING_AGG(
            c.column_name || ' (' || c.data_type || 
            CASE WHEN c.is_nullable = 'NO' THEN ', NOT NULL' ELSE '' END ||
            CASE WHEN pk.column_name IS NOT NULL THEN ', PK' ELSE '' END ||
            CASE WHEN fk.column_name IS NOT NULL THEN ', FK' ELSE '' END
            , ', ' 
            ORDER BY c.ordinal_position
        ) AS columnas
    FROM 
        information_schema.tables t
        INNER JOIN information_schema.columns c ON t.table_name = c.table_name
        LEFT JOIN (
            SELECT ku.table_name, ku.column_name
            FROM information_schema.table_constraints tc
            INNER JOIN information_schema.key_column_usage ku 
                ON tc.constraint_name = ku.constraint_name
            WHERE tc.constraint_type = 'PRIMARY KEY'
        ) pk ON c.table_name = pk.table_name AND c.column_name = pk.column_name
        LEFT JOIN (
            SELECT ku.table_name, ku.column_name
            FROM information_schema.table_constraints tc
            INNER JOIN information_schema.key_column_usage ku 
                ON tc.constraint_name = ku.constraint_name
            WHERE tc.constraint_type = 'FOREIGN KEY'
        ) fk ON c.table_name = fk.table_name AND c.column_name = fk.column_name
    WHERE 
        t.table_schema = 'public'
        AND t.table_type = 'BASE TABLE'
        AND t.table_name NOT LIKE 'pg_%'
    GROUP BY 
        t.table_name
)
SELECT 
    table_name AS "Tabla",
    num_columnas AS "Num_Atributos",
    columnas AS "Lista_Atributos"
FROM 
    tablas_info
ORDER BY 
    table_name;









