-- Conta Copilot — Endurecimiento de seguridad
-- Ejecutar en Supabase → SQL Editor (después de add-gmail.sql)
--
-- 1) Tokens Gmail: el rol authenticated solo puede leer columnas públicas.
--    Lectura/escritura de refresh_token y access_token solo vía service_role (servidor).
-- 2) Rate limiting: tabla interna accesible solo desde service_role.

-- ---------------------------------------------------------------------------
-- 1. gmail_connections — privilegios por columna
-- ---------------------------------------------------------------------------
REVOKE ALL ON public.gmail_connections FROM authenticated;

GRANT SELECT (
  user_id,
  google_email,
  connected_at,
  last_synced_at,
  backfill_from,
  last_history_id,
  token_expires_at,
  created_at,
  updated_at
) ON public.gmail_connections TO authenticated;

-- INSERT/UPDATE/DELETE de filas completas (incl. tokens) solo con service_role en el servidor.

-- ---------------------------------------------------------------------------
-- 2. rate_limits — contadores por usuario/acción/ventana
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.rate_limits (
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  action text NOT NULL,
  window_start timestamptz NOT NULL,
  request_count int NOT NULL DEFAULT 1,
  PRIMARY KEY (user_id, action, window_start)
);

COMMENT ON TABLE public.rate_limits IS
  'Contadores de rate limit; solo accesible con SUPABASE_SERVICE_ROLE_KEY en el servidor.';

ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Sin políticas para authenticated: acceso denegado por RLS.
-- service_role bypassa RLS.

CREATE INDEX IF NOT EXISTS rate_limits_window_start_idx
  ON public.rate_limits (window_start);
