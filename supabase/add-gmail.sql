-- Conta Copilot — Gmail OAuth + deduplicación de imports (v1)
-- Ejecutar en Supabase → SQL Editor (después de schema.sql, storage.sql y migraciones previas)
--
-- SEGURIDAD (tokens OAuth):
--   refresh_token y access_token son secretos de aplicación.
--   El Agente Código debe:
--     1) Cifrar valores antes de INSERT/UPDATE (capa app, p. ej. AES-256-GCM + GMAIL_TOKEN_ENCRYPTION_KEY).
--     2) Leer/escribir gmail_connections solo en Server Actions / rutas API server (nunca Supabase browser client).
--     3) Nunca incluir refresh_token ni access_token en respuestas al cliente (UI: google_email, fechas, estado sync).
--   RLS evita acceso cross-user; no sustituye cifrado en reposo ni filtrado en respuestas API.

-- ---------------------------------------------------------------------------
-- 1. Conexión Gmail (1 fila por usuario)
-- ---------------------------------------------------------------------------
create table if not exists public.gmail_connections (
  user_id uuid primary key references auth.users (id) on delete cascade,
  google_email text not null,
  refresh_token text not null,
  access_token text,
  token_expires_at timestamptz,
  connected_at timestamptz not null default now(),
  last_synced_at timestamptz,
  backfill_from timestamptz,
  last_history_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.gmail_connections is
  'OAuth Gmail por usuario; tokens solo server-side (cifrar en app antes de persistir).';
comment on column public.gmail_connections.refresh_token is
  'Secreto: cifrado en app; nunca exponer al cliente.';
comment on column public.gmail_connections.access_token is
  'Secreto opcional en caché; cifrado en app; renovar con refresh_token.';

-- ---------------------------------------------------------------------------
-- 2. Registro de adjuntos importados (deduplicación)
-- ---------------------------------------------------------------------------
create table if not exists public.gmail_imports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  gmail_message_id text not null,
  gmail_attachment_id text not null,
  invoice_id uuid references public.invoices (id) on delete set null,
  status text not null default 'pending'
    check (status in ('pending', 'imported', 'failed')),
  error_message text,
  imported_at timestamptz not null default now(),
  constraint gmail_imports_user_message_attachment_key
    unique (user_id, gmail_message_id, gmail_attachment_id)
);

comment on table public.gmail_imports is
  'Evita re-importar el mismo adjunto Gmail; gmail_attachment_id = id API o hash estable.';
comment on column public.gmail_imports.gmail_attachment_id is
  'Identificador estable del adjunto (Gmail attachmentId o hash filename+size+partId).';

-- ---------------------------------------------------------------------------
-- 3. Origen de factura en invoices
-- ---------------------------------------------------------------------------
alter table public.invoices
  add column if not exists source text,
  add column if not exists source_meta jsonb;

alter table public.invoices
  alter column source set default 'manual';

update public.invoices
set source = 'manual'
where source is null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'invoices_source_check'
      and conrelid = 'public.invoices'::regclass
  ) then
    alter table public.invoices
      add constraint invoices_source_check
      check (source in ('manual', 'gmail'));
  end if;
end $$;

alter table public.invoices
  alter column source set not null;

comment on column public.invoices.source is
  'manual = subida UI; gmail = import automático.';
comment on column public.invoices.source_meta is
  'Metadatos Gmail: message_id, subject, from, thread_id, etc. (sin tokens).';

-- ---------------------------------------------------------------------------
-- 4. Índices
-- ---------------------------------------------------------------------------
-- user_id en gmail_connections ya es PK (índice único implícito)
create index if not exists gmail_imports_user_id_idx
  on public.gmail_imports (user_id);

create index if not exists gmail_imports_invoice_id_idx
  on public.gmail_imports (invoice_id);

-- ---------------------------------------------------------------------------
-- 5. RLS
-- ---------------------------------------------------------------------------
alter table public.gmail_connections enable row level security;
alter table public.gmail_imports enable row level security;

-- gmail_connections
drop policy if exists "Users can view own gmail connection" on public.gmail_connections;
create policy "Users can view own gmail connection"
  on public.gmail_connections for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own gmail connection" on public.gmail_connections;
create policy "Users can insert own gmail connection"
  on public.gmail_connections for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own gmail connection" on public.gmail_connections;
create policy "Users can update own gmail connection"
  on public.gmail_connections for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete own gmail connection" on public.gmail_connections;
create policy "Users can delete own gmail connection"
  on public.gmail_connections for delete
  using (auth.uid() = user_id);

-- gmail_imports
drop policy if exists "Users can view own gmail imports" on public.gmail_imports;
create policy "Users can view own gmail imports"
  on public.gmail_imports for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own gmail imports" on public.gmail_imports;
create policy "Users can insert own gmail imports"
  on public.gmail_imports for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own gmail imports" on public.gmail_imports;
create policy "Users can update own gmail imports"
  on public.gmail_imports for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete own gmail imports" on public.gmail_imports;
create policy "Users can delete own gmail imports"
  on public.gmail_imports for delete
  using (auth.uid() = user_id);
