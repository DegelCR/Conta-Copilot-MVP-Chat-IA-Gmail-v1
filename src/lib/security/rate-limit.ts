import { createAdminClient } from "@/lib/supabase/admin";

export type RateLimitConfig = {
  /** Identificador de la acción (p. ej. "chat", "gmail_sync"). */
  action: string;
  /** Máximo de peticiones permitidas en la ventana. */
  maxRequests: number;
  /** Duración de la ventana en milisegundos. */
  windowMs: number;
};

export type RateLimitResult =
  | { allowed: true; remaining: number }
  | { allowed: false; retryAfterSeconds: number };

function floorWindowStart(nowMs: number, windowMs: number): string {
  const bucket = Math.floor(nowMs / windowMs) * windowMs;
  return new Date(bucket).toISOString();
}

/**
 * Comprueba e incrementa el contador de rate limit para un usuario.
 * Usa service_role; si la tabla no existe aún, permite la petición (fail-open).
 */
export async function checkRateLimit(
  userId: string,
  config: RateLimitConfig,
): Promise<RateLimitResult> {
  let admin;
  try {
    admin = createAdminClient();
  } catch (error) {
    console.warn(
      "rate_limits: SUPABASE_SERVICE_ROLE_KEY no configurada; omitiendo límite.",
      error instanceof Error ? error.message : error,
    );
    return { allowed: true, remaining: config.maxRequests };
  }

  const windowStart = floorWindowStart(Date.now(), config.windowMs);

  const { data: existing, error: selectError } = await admin
    .from("rate_limits")
    .select("request_count")
    .eq("user_id", userId)
    .eq("action", config.action)
    .eq("window_start", windowStart)
    .maybeSingle();

  if (selectError) {
    if (selectError.code === "42P01") {
      console.warn("rate_limits: tabla no encontrada; ejecuta supabase/harden-security.sql");
      return { allowed: true, remaining: config.maxRequests };
    }
    console.error("rate_limits select:", selectError.message);
    return { allowed: true, remaining: config.maxRequests };
  }

  const currentCount = existing?.request_count ?? 0;

  if (currentCount >= config.maxRequests) {
    const windowEndMs =
      new Date(windowStart).getTime() + config.windowMs;
    const retryAfterSeconds = Math.max(
      1,
      Math.ceil((windowEndMs - Date.now()) / 1000),
    );
    return { allowed: false, retryAfterSeconds };
  }

  const nextCount = currentCount + 1;

  const { error: upsertError } = await admin.from("rate_limits").upsert(
    {
      user_id: userId,
      action: config.action,
      window_start: windowStart,
      request_count: nextCount,
    },
    { onConflict: "user_id,action,window_start" },
  );

  if (upsertError) {
    if (upsertError.code === "42P01") {
      return { allowed: true, remaining: config.maxRequests };
    }
    console.error("rate_limits upsert:", upsertError.message);
    return { allowed: true, remaining: config.maxRequests };
  }

  return {
    allowed: true,
    remaining: Math.max(0, config.maxRequests - nextCount),
  };
}

export function rateLimitErrorMessage(retryAfterSeconds: number): string {
  if (retryAfterSeconds >= 60) {
    const minutes = Math.ceil(retryAfterSeconds / 60);
    return `Demasiadas solicitudes. Espera ${minutes} minuto${minutes === 1 ? "" : "s"} e intenta de nuevo.`;
  }
  return `Demasiadas solicitudes. Espera ${retryAfterSeconds} segundos e intenta de nuevo.`;
}

/** Límites por defecto de la aplicación. */
export const RATE_LIMITS = {
  chat: { action: "chat", maxRequests: 20, windowMs: 10 * 60 * 1000 },
  gmailSync: { action: "gmail_sync", maxRequests: 5, windowMs: 10 * 60 * 1000 },
  upload: { action: "invoice_upload", maxRequests: 30, windowMs: 60 * 60 * 1000 },
  processAi: { action: "invoice_process_ai", maxRequests: 20, windowMs: 60 * 60 * 1000 },
} as const satisfies Record<string, RateLimitConfig>;
