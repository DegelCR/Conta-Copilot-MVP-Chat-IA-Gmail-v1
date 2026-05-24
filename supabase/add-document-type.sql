-- Tipo de documento: gasto vs ingreso
-- Ejecutar en Supabase → SQL Editor si la tabla ya existía

alter table public.invoices
  add column if not exists document_type text not null default 'expense'
    check (document_type in ('expense', 'income'));
