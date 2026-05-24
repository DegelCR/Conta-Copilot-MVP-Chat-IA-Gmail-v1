-- Campos adicionales para facturas CR (número, retención)
-- Ejecutar en Supabase → SQL Editor si ya creaste la tabla antes

alter table public.invoices
  add column if not exists invoice_number text,
  add column if not exists retention_amount numeric(12, 2);
