-- ════════════════════════════════════════════════════════════════════
-- customer_onboarding_status_base_entity
-- NOMENCLADOR PROPIO DEL MICROSERVICIO
-- Justificación: único consumidor en el ecosistema. Si en el futuro
-- aparece un segundo consumidor, se promueve a catalog-service según
-- la regla §4.9.6 de docs/help.md.
-- Idempotente: INSERT ... ON CONFLICT (code) DO UPDATE.
-- ════════════════════════════════════════════════════════════════════
INSERT INTO "customer_onboarding_status_base_entity" ("code", "displayName", "description", "metadata", "createdBy", "active", "type")
VALUES
  ('NOT_STARTED', 'No iniciado', 'Onboarding aún no iniciado', jsonb_build_object('description','Onboarding aún no iniciado'), 'system', TRUE, 'customeronboardingstatus'),
  ('IN_PROGRESS', 'En progreso', 'En proceso de KYC/validación', jsonb_build_object('description','En proceso de KYC/validación'), 'system', TRUE, 'customeronboardingstatus'),
  ('APPROVED', 'Aprobado', 'Aprobado y operativo', jsonb_build_object('description','Aprobado y operativo'), 'system', TRUE, 'customeronboardingstatus'),
  ('REJECTED', 'Rechazado', 'Rechazado por compliance', jsonb_build_object('description','Rechazado por compliance'), 'system', TRUE, 'customeronboardingstatus'),
  ('EXPIRED', 'Expirado', 'Documentación expirada', jsonb_build_object('description','Documentación expirada'), 'system', TRUE, 'customeronboardingstatus'),
  ('BLOCKED', 'Bloqueado', 'Bloqueado por anti-fraude', jsonb_build_object('description','Bloqueado por anti-fraude'), 'system', TRUE, 'customeronboardingstatus')
ON CONFLICT ("code") DO UPDATE SET
  "displayName"      = EXCLUDED."displayName",
  "description"      = EXCLUDED."description",
  "metadata"         = EXCLUDED."metadata",
  "active"           = TRUE,
  "modificationDate" = NOW();
