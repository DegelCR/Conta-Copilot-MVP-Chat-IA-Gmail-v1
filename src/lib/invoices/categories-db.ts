import { createClient } from "@/lib/supabase/server";
import {
  isDefaultCategory,
  mergeInvoiceCategories,
  normalizeCategoryName,
} from "@/lib/invoices/categories";
import { INVOICE_CATEGORIES } from "@/lib/invoices/schema";

export async function getInvoiceCategoriesForUser(): Promise<string[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [...INVOICE_CATEGORIES];

  let custom: string[] = [];
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("custom_categories")
    .eq("id", user.id)
    .single();

  if (!profileError && profile?.custom_categories) {
    custom = profile.custom_categories;
  }

  const { data: invoiceRows } = await supabase
    .from("invoices")
    .select("category")
    .eq("user_id", user.id)
    .not("category", "is", null);

  const usedInInvoices =
    invoiceRows?.map((row) => row.category).filter((c): c is string => Boolean(c)) ?? [];

  return mergeInvoiceCategories(custom, usedInInvoices);
}

/** Guarda categoría nueva en el perfil si no es una predeterminada. */
export async function ensureUserCategory(category: string): Promise<void> {
  const normalized = normalizeCategoryName(category);
  if (isDefaultCategory(normalized)) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  const { data: profile, error: fetchError } = await supabase
    .from("profiles")
    .select("custom_categories")
    .eq("id", user.id)
    .single();

  if (fetchError) {
    if (fetchError.message.includes("custom_categories")) return;
    console.error("ensureUserCategory fetch:", fetchError.message);
    return;
  }

  const current: string[] = profile?.custom_categories ?? [];
  const exists = current.some(
    (c: string) => c.trim().toLowerCase() === normalized.toLowerCase(),
  );
  if (exists) return;

  const { error: updateError } = await supabase
    .from("profiles")
    .update({
      custom_categories: [...current, normalized],
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (updateError) {
    console.error("ensureUserCategory update:", updateError.message);
  }
}
