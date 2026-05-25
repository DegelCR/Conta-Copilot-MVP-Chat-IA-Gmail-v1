export type PublicSupabaseEnv = {
  url: string;
  anonKey: string;
};

declare global {
  interface Window {
    __CONTA_SUPABASE_ENV?: PublicSupabaseEnv;
  }
}

export function getPublicSupabaseEnv(): PublicSupabaseEnv {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (url && anonKey) {
    return { url, anonKey };
  }

  if (typeof window !== "undefined" && window.__CONTA_SUPABASE_ENV) {
    const injected = window.__CONTA_SUPABASE_ENV;
    if (injected.url && injected.anonKey) {
      return injected;
    }
  }

  throw new Error(
    "Supabase no está configurado en el cliente. En Vercel, revisa NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY (Production + Preview) y haz Redeploy.",
  );
}
