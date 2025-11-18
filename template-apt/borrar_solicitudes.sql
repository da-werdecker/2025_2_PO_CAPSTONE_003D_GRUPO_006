-- Script para borrar todas las solicitudes de diagnóstico de la BD
-- IMPORTANTE: Este script eliminará TODAS las solicitudes de diagnóstico

-- Paso 1: Ver cuántas solicitudes hay antes de borrar
SELECT COUNT(*) as total_solicitudes FROM solicitud_diagnostico;

-- Paso 2: Ver cuántas órdenes de trabajo están relacionadas
SELECT COUNT(*) as ordenes_relacionadas 
FROM orden_trabajo 
WHERE solicitud_diagnostico_id IS NOT NULL;

-- Paso 3: Actualizar las órdenes de trabajo para quitar la referencia
-- (Esto evita problemas de foreign key)
UPDATE orden_trabajo 
SET solicitud_diagnostico_id = NULL 
WHERE solicitud_diagnostico_id IS NOT NULL;

-- Paso 4: Borrar todas las solicitudes de diagnóstico
DELETE FROM solicitud_diagnostico;

-- Paso 5: Verificar que se borraron
SELECT COUNT(*) as solicitudes_restantes FROM solicitud_diagnostico;

-- ============================================
-- OPCIÓN ALTERNATIVA: Borrar solo solicitudes específicas
-- ============================================

-- Ejemplo: Borrar solo solicitudes pendientes
-- DELETE FROM solicitud_diagnostico WHERE estado_solicitud = 'pendiente_confirmacion';

-- Ejemplo: Borrar solicitudes de una fecha específica
-- DELETE FROM solicitud_diagnostico WHERE fecha_solicitada < '2025-01-01';

-- Ejemplo: Borrar solicitudes completadas
-- DELETE FROM solicitud_diagnostico WHERE estado_solicitud = 'completada';



