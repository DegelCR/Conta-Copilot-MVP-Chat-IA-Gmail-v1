-- Conta Copilot — Storage para facturas
-- Ejecutar en Supabase → SQL Editor (después de schema.sql)

insert into storage.buckets (id, name, public, file_size_limit)
values ('invoices', 'invoices', false, 10485760)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit;

-- Políticas: cada usuario solo accede a su carpeta {user_id}/...

drop policy if exists "Users can upload own invoice files" on storage.objects;
create policy "Users can upload own invoice files"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'invoices'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "Users can read own invoice files" on storage.objects;
create policy "Users can read own invoice files"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'invoices'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "Users can delete own invoice files" on storage.objects;
create policy "Users can delete own invoice files"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'invoices'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
