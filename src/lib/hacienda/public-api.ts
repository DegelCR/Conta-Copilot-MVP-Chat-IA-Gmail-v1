const HACIENDA_API = "https://api.hacienda.go.cr";
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

type CacheEntry<T> = { at: number; data: T };

const taxpayerCache = new Map<string, CacheEntry<TaxpayerLookupResult>>();

export type TaxpayerLookupResult = {
  identificacion: string;
  nombre: string | null;
  tipoIdentificacion: string | null;
  situacion: string | null;
  regimen: string | null;
  actividades: string[];
  raw?: unknown;
};

function normalizeId(value: string): string {
  return value.replace(/\D/g, "");
}

function pickString(obj: Record<string, unknown>, keys: string[]): string | null {
  for (const key of keys) {
    const value = obj[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return null;
}

function pickObject(obj: Record<string, unknown>, key: string): Record<string, unknown> | null {
  const value = obj[key];
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return null;
}

export async function lookupTaxpayer(identificacion: string): Promise<TaxpayerLookupResult> {
  const id = normalizeId(identificacion);
  if (id.length < 9 || id.length > 12) {
    throw new Error("La identificación debe tener entre 9 y 12 dígitos.");
  }

  const cached = taxpayerCache.get(id);
  if (cached && Date.now() - cached.at < CACHE_TTL_MS) {
    return cached.data;
  }

  const url = `${HACIENDA_API}/fe/ae?identificacion=${encodeURIComponent(id)}`;
  const res = await fetch(url, {
    headers: { Accept: "application/json" },
    next: { revalidate: 86400 },
  });

  if (res.status === 429) {
    throw new Error(
      "Hacienda limitó las consultas (429). Espera unos minutos antes de volver a intentar.",
    );
  }

  if (!res.ok) {
    throw new Error(`Consulta a Hacienda falló (${res.status}).`);
  }

  const raw = (await res.json()) as Record<string, unknown>;
  const nombre = pickString(raw, ["nombre", "Nombre"]);

  const regimenObj = pickObject(raw, "regimen");
  const situacionObj = pickObject(raw, "situacion");

  const regimen =
    pickString(raw, ["regimen", "regimen_tributario"]) ??
    (regimenObj ? pickString(regimenObj, ["descripcion", "Descripción"]) : null);

  const situacionDirect = pickString(raw, ["situacion", "situacion_tributaria"]);
  let situacion: string | null = null;
  if (situacionDirect) {
    situacion = situacionDirect;
  } else if (situacionObj) {
    const estado = pickString(situacionObj, ["estado", "Estado"]);
    const admin = pickString(situacionObj, [
      "administracionTributaria",
      "administracion_tributaria",
    ]);
    const moroso = pickString(situacionObj, ["moroso"]);
    const omiso = pickString(situacionObj, ["omiso"]);
    situacion = [estado, admin, moroso && `moroso:${moroso}`, omiso && `omiso:${omiso}`]
      .filter(Boolean)
      .join(" · ");
    if (!situacion) situacion = null;
  }

  const actividadesRaw = raw.actividades ?? raw.Actividades;
  const actividades = Array.isArray(actividadesRaw)
    ? actividadesRaw
        .map((a) => {
          if (typeof a === "string") return a;
          if (a && typeof a === "object" && "descripcion" in a) {
            return String((a as { descripcion?: string }).descripcion ?? "");
          }
          return "";
        })
        .filter(Boolean)
    : [];

  const result: TaxpayerLookupResult = {
    identificacion: id,
    nombre,
    tipoIdentificacion:
      (typeof raw.tipoIdentificacion === "string" && raw.tipoIdentificacion) ||
      (typeof raw.tipo_identificacion === "string" && raw.tipo_identificacion) ||
      null,
    situacion,
    regimen,
    actividades,
    raw,
  };

  taxpayerCache.set(id, { at: Date.now(), data: result });
  return result;
}
