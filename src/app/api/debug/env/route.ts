import { NextResponse } from "next/server";

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  return NextResponse.json({
    supabaseUrlConfigured: Boolean(url),
    supabaseAnonConfigured: Boolean(anon),
    anonKeyLength: anon?.length ?? 0,
    anonLooksValid: Boolean(anon && anon.length > 100 && anon.startsWith("eyJ")),
  });
}
