"use server";

import { createClient } from "@/lib/supabase/server";
import { lookupTaxpayer, type TaxpayerLookupResult } from "@/lib/hacienda/public-api";

export type LookupTaxpayerState = {
  error?: string;
  data?: TaxpayerLookupResult;
};

export async function lookupTaxpayerAction(
  _prev: LookupTaxpayerState,
  formData: FormData,
): Promise<LookupTaxpayerState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Debes iniciar sesión." };
  }

  const identificacion = String(formData.get("identificacion") ?? "").trim();
  if (!identificacion) {
    return { error: "Indica la cédula del emisor." };
  }

  try {
    const data = await lookupTaxpayer(identificacion);
    return { data };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "No se pudo consultar Hacienda.",
    };
  }
}
