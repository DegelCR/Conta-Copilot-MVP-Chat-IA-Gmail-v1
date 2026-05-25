/** Inyecta Supabase en el navegador cuando NEXT_PUBLIC_* no se embebió en el bundle. */
export function SupabasePublicEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? "";

  if (!url || !anonKey) {
    return null;
  }

  const payload = JSON.stringify({ url, anonKey });

  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `window.__CONTA_SUPABASE_ENV=${payload};`,
      }}
    />
  );
}
