-- Categorías personalizadas por usuario (piloto / registro manual)
-- Ejecutar en Supabase → SQL Editor si la columna no existe.

alter table public.profiles
  add column if not exists custom_categories text[] not null default '{}';

comment on column public.profiles.custom_categories is
  'Categorías extra del usuario (además de las predeterminadas en la app).';
