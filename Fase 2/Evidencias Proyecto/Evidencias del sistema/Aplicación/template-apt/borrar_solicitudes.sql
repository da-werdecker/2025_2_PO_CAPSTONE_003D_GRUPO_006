-- ============================================================
-- ELIMINAR SOLO SOLICITUDES DE DIAGNÓSTICO
-- ============================================================
-- Este script elimina únicamente las solicitudes y sus relaciones directas
-- MANTIENE: usuarios, vehículos, empleados, catálogos, accesos, llaves, etc.
-- ============================================================

-- Paso 1: Ver cuántas solicitudes hay
SELECT COUNT(*) as total_solicitudes FROM solicitud_diagnostico;

-- Paso 2: Eliminar aprobaciones relacionadas con solicitudes
DELETE FROM aprobacion_asignacion_ot 
WHERE orden_trabajo_id IN (
    SELECT id_orden_trabajo 
    FROM orden_trabajo 
    WHERE solicitud_diagnostico_id IS NOT NULL
);

-- Paso 3: Eliminar checklists relacionados con órdenes de solicitudes
DELETE FROM checklist_diagnostico 
WHERE orden_trabajo_id IN (
    SELECT id_orden_trabajo 
    FROM orden_trabajo 
    WHERE solicitud_diagnostico_id IS NOT NULL
);

-- Paso 4: Eliminar servicios relacionados con órdenes de solicitudes
DELETE FROM servicio 
WHERE orden_trabajo_id IN (
    SELECT id_orden_trabajo 
    FROM orden_trabajo 
    WHERE solicitud_diagnostico_id IS NOT NULL
);

-- Paso 5: Eliminar relaciones OT-Repuesto de órdenes de solicitudes
DELETE FROM ot_repuesto 
WHERE orden_trabajo_id IN (
    SELECT id_orden_trabajo 
    FROM orden_trabajo 
    WHERE solicitud_diagnostico_id IS NOT NULL
);

-- Paso 6: Eliminar incidencias relacionadas con órdenes de solicitudes
DELETE FROM incidencia 
WHERE orden_trabajo_id IN (
    SELECT id_orden_trabajo 
    FROM orden_trabajo 
    WHERE solicitud_diagnostico_id IS NOT NULL
);

-- Paso 7: Eliminar órdenes de trabajo relacionadas con solicitudes
DELETE FROM orden_trabajo 
WHERE solicitud_diagnostico_id IS NOT NULL;

-- Paso 8: Eliminar historial de choferes relacionado con solicitudes
DELETE FROM driver_history 
WHERE solicitud_diagnostico_id IS NOT NULL;

-- Paso 9: Eliminar todas las solicitudes de diagnóstico
DELETE FROM solicitud_diagnostico;

-- Paso 10: Verificar que se eliminaron
SELECT COUNT(*) as solicitudes_restantes FROM solicitud_diagnostico;
