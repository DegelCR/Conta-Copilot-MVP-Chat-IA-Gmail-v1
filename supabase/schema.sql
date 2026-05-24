-- Conta Copilot — esquema inicial
-- Ejecutar en Supabase → SQL Editor → New query → Run

-- Perfiles (extiende auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  account_type text check (account_type in ('freelancer', 'business', 'accountant')) default 'freelancer',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Facturas (MVP)
create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  file_path text,
  file_name text,
  status text not null default 'pending_review'
    check (status in ('pending_review', 'confirmed', 'rejected')),
  vendor text,
  invoice_number text,
  invoice_date date,
  subtotal numeric(12, 2),
  tax_amount numeric(12, 2),
  retention_amount numeric(12, 2),
  total numeric(12, 2),
  currency text not null default 'CRC',
  category text,
  document_type text not null default 'expense'
    check (document_type in ('expense', 'income')),
  raw_ai_json jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists invoices_user_id_idx on public.invoices (user_id);
create index if not exists invoices_invoice_date_idx on public.invoices (invoice_date);

alter table public.invoices enable row level security;

create policy "Users can view own invoices"
  on public.invoices for select
  using (auth.uid() = user_id);

create policy "Users can insert own invoices"
  on public.invoices for insert
  with check (auth.uid() = user_id);

create policy "Users can update own invoices"
  on public.invoices for update
  using (auth.uid() = user_id);

create policy "Users can delete own invoices"
  on public.invoices for delete
  using (auth.uid() = user_id);

-- Perfil automático al registrarse
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Storage: ejecutar supabase/storage.sql (bucket invoices + políticas RLS)
