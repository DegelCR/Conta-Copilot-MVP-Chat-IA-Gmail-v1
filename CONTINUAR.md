# Continuar Conta Copilot — Handoff para otro agente

> **Fuente de verdad del proyecto.** Léelo antes de codear o planificar.
>
> Ruta del proyecto: `C:\Users\Fran\Desktop\conta-copilot`
>
> **Workflow agentes:** chat fijo **Coordinador (Ask)** → prompts en [`AGENTES.md`](AGENTES.md) / [`PROMPTS-AGENTES.md`](PROMPTS-AGENTES.md) → ejecutores Código / Supabase / Debug (Agent, chat nuevo).

---

## Resumen en una línea

SaaS contable con IA para Costa Rica: **subir → IA extrae → usuario revisa y confirma → dashboard con totales**. No es un ERP. Hacienda CR queda para fases posteriores.

---

## Stack

| Capa | Tecnología |
|------|------------|
| Frontend | Next.js 16, React 19, TypeScript, Tailwind v4 |
| Backend | Server Actions (`src/app/actions/`) |
| Auth + DB + Storage | Supabase (`@supabase/ssr`) |
| IA | OpenAI **gpt-4o-mini** + Zod structured output (`openai`, `zod`) |
| Deploy | **Vercel** | ✅ Producción — ver abajo |

**Dependencias clave:** `next`, `@supabase/ssr`, `openai`, `zod`, `googleapis`

---

## Flujo completo (implementado)

```
Landing → Login/Signup
    ↓
Dashboard (/dashboard)
    ↓
Subir factura (manual)  —  o  Gmail (/dashboard/gmail) → sync adjuntos
    ↓
Storage (bucket invoices) + fila DB status: pending_review
    ↓
OpenAI Vision extrae campos automáticamente
    ↓
Revisar (/dashboard/invoices/[id]) — editar, Confirmar o Rechazar
    ↓
status: confirmed → Dashboard suma Gastos + IVA + Ingresos del mes
    ↓
Chat IA (/dashboard/chat) — preguntas sobre facturas confirmadas
```

---

## Lo que YA funciona (verificado por el usuario)

- [x] Login / registro — local y **producción Vercel** (formulario cliente + Supabase browser; ver commits `4b1df54`, `db9df67`)
- [x] Dashboard protegido `/dashboard`
- [x] Supabase: `schema.sql`, `storage.sql`, RLS, bucket `invoices`
- [x] Subida de facturas + lista **Facturas recientes**
- [x] Extracción OpenAI al subir + botón **Procesar con IA** (facturas sin datos)
- [x] Revisión: `/dashboard/invoices/[id]` — vista previa PDF/imagen, formulario editable
- [x] **Confirmar** / **Rechazar** factura (redirect al dashboard)
- [x] Dashboard: **Gastos (mes)** e **IVA estimado** desde facturas **confirmadas**
- [x] **Tabla de facturas** `/dashboard/invoices` con filtros y búsqueda
- [x] **Export CSV** y **Excel (.xlsx)** en `/dashboard/invoices` — columnas autoajustadas en Excel; CSV con `;` para Excel CR *(en repo local; pendiente push si no está en GitHub)*
- [x] **Ingresos (mes)** y tipo gasto/ingreso (`document_type`)
- [x] Editar facturas **confirmadas** y reprocesar con IA
- [x] Campos **número de factura** y **retención** (IA + formulario revisión)
- [x] Validación montos: `subtotal + IVA − retención ≈ total`
- [x] OpenAI con créditos activos (~$5 depósito de prueba)
- [x] **Chat IA** `/dashboard/chat` — preguntas sobre facturas confirmadas (sin historial en DB)
- [x] **Gmail v1** — OAuth, sync adjuntos **verificado en local y producción** (mayo 2026)

**Usuario de prueba (prod):** `frtest@gmail.com` — no documentar contraseña en el repo.

**Producción Vercel:** https://conta-copilot-mvp-chat-ia-gmail-v1.vercel.app  
**Diagnóstico:** `/api/debug/env` → `anonLooksValid: true`

**GitHub:** https://github.com/DegelCR/Conta-Copilot-MVP-Chat-IA-Gmail-v1 (rama `master`, último fix deploy `db9df67`)

**Deploy:** ✅ Producción operativa — ver [`DEPLOY-VERCEL.md`](./DEPLOY-VERCEL.md)

**Pausa (mayo 2026):** desarrollo detenido tras deploy + pruebas prod OK. Siguiente paso humano: **ofrecer piloto** a contacto contable (1 negocio, mes actual). Ver sección **Piloto beta** abajo.

---

## Lo que falta (prioridad)

### MVP — completado ✅
- Tabla `/dashboard/invoices` con filtros, búsqueda y export CSV
- `document_type` gasto/ingreso, editar confirmadas, reprocesar IA
- Campos número de factura y retención

### Post-MVP v1 — completado ✅
- [x] **Chat IA** (`/dashboard/chat`)
- [x] **Gmail automático v1** (`/dashboard/gmail`, `add-gmail.sql`, OAuth local verificado)

### Siguiente fase (prioridad)

| # | Tarea | Estado |
|---|--------|--------|
| 0 | **GitHub** | Tú | ✅ |
| 1 | **Deploy Vercel** + login prod | Tú | ✅ |
| 2 | **Gmail en producción** | Tú | ✅ Probado (sync + IA en factura de prueba) |
| 3 | **Export Excel** | Código | ✅ Local (`exceljs`); push a GitHub si falta |
| 4 | **Piloto 1 cliente** | Tú | ⏳ — `docs/MANUAL-USUARIO.md` + `docs/MANUAL-ADMIN.md` |
| 5 | Outlook / sync cron (v1.1) | ⏳ Futuro |
| 6 | Reenvío correo → buzón de la app (inbound email) | ⏳ Futuro — hoy es Gmail OAuth |
| 7 | Integración Hacienda CR | ❌ Fase 3 — no tocar |

---

## Flujo operativo Gmail (después de conectar)

1. `/dashboard/gmail` → **Sincronizar** (backfill mes actual; luego incremental).
2. `/dashboard/invoices` → facturas **pendiente de revisión** (`source=gmail`).
3. Abrir cada una → **Procesar con IA** (si hace falta) → **Confirmar** o **Rechazar**.
4. Dashboard → totales del mes actualizados.
5. `/dashboard/chat` → preguntas sobre facturas **confirmadas**.

**Nota:** sync importa adjuntos; la IA no corre automáticamente en cada adjunto Gmail (usar «Procesar con IA» en revisión).

---

## Deploy Vercel ✅

**URL:** https://conta-copilot-mvp-chat-ia-gmail-v1.vercel.app  
**Guía:** [`DEPLOY-VERCEL.md`](./DEPLOY-VERCEL.md)

Resumen post-deploy:

1. Variables: **8** en pestañas **Production** y **Preview** (mismos valores).
2. Nombre crítico: `NEXT_PUBLIC_SUPABASE_ANON_KEY` (no `..._ANON`).
3. Supabase Site URL + `/auth/callback` con dominio `*.vercel.app`.
4. Google: `/api/gmail/callback` en prod.
5. Facturas prueba: `public/test-invoices/` o URL `/test-invoices/factura-prueba-gmail.html`.
6. Manuales piloto: [`docs/MANUAL-USUARIO.md`](./docs/MANUAL-USUARIO.md) · administrador: [`docs/MANUAL-ADMIN.md`](./docs/MANUAL-ADMIN.md).

---

## Piloto beta (plan acordado)

**Perfil:** persona con muchos negocios / alto volumen de facturas — validar solo si el alcance es **acotado**.

| Tema | Regla del piloto |
|------|------------------|
| Duración | 2–4 semanas |
| Alcance | **1 negocio**, facturas del **mes en curso** |
| Valor sin Hacienda | Recibir, ordenar, revisar, **Excel** — suficiente para validar |
| IA | **Opcional** — Gmail sync **no** dispara IA; botón «Procesar con IA» factura a factura |
| Demo sin gastar OpenAI | Solo **Sincronizar** + revisar + export; no subir masivo ni Chat |
| Límite sugerido | ~30–50 facturas con IA el primer mes (proteger crédito OpenAI) |
| Precio beta orientativo | Gratis 1.er mes a cambio de feedback, o **USD 10–18/mes** (₡5 000–9 000) |

**Mensaje clave al cliente:** beta, sin Hacienda, IA opcional, empezar con un negocio.

---

## Costos de arranque (referencia)

| Servicio | Pagado inicial | Notas |
|----------|----------------|--------|
| OpenAI | USD 5 (crédito) | Variable; cada «Procesar con IA» y subida manual consumen |
| Google Cloud | USD 10 (mínimo cuenta) | Gmail API suele ser ~USD 0 en uso piloto |
| Vercel + Supabase | USD 0 en beta chica | Pro/Supabase Pro si crece tráfico |

**Modo sin IA:** mismo producto para organizar facturas (Gmail + revisión manual + Excel); la IA es capa opcional, no obligatoria.

---

## Límites técnicos (volumen alto)

| Límite | Valor |
|--------|--------|
| Gmail por sync | 50 mensajes |
| Backfill inicial | Mes actual (CR) |
| Lista facturas | 200 filas |
| IA en sync Gmail | No automática |
| IA en subida manual | Sí automática (cuidado en demo) |

**Futuro si piloto exige volumen:** IA en lote, más mensajes/sync, paginación, tope por plan, inbound email (reenvío a `facturas@...`).

---

## Rutas de la app

| Ruta | Descripción |
|------|-------------|
| `/` | Landing |
| `/login`, `/signup` | Auth |
| `/dashboard` | Tarjetas mes + subida + lista recientes |
| `/dashboard/invoices` | Tabla de facturas con filtros y búsqueda |
| `/dashboard/invoices/[id]` | Revisar / ver factura |
| `/dashboard/chat` | Chat IA sobre facturas confirmadas |
| `/dashboard/gmail` | Conectar / sincronizar Gmail |
| `/api/gmail/connect` | Inicia OAuth Google (redirect) |
| `/api/gmail/callback` | Callback OAuth + 1.ª sync |
| `/api/debug/env` | Comprobar env vars (sin secretos) |
| `/api/invoices/export` | Excel por defecto; `?format=csv` para CSV |

---

## Estructura de archivos

```
conta-copilot/
├── src/
│   ├── app/
│   │   ├── actions/
│   │   │   ├── auth.ts              # login, signup
│   │   │   ├── invoices.ts          # upload, process, review
│   │   │   ├── chat.ts              # sendChatMessageAction
│   │   │   └── gmail.ts             # sync / desconectar
│   │   ├── dashboard/
│   │   │   ├── page.tsx             # dashboard + stats mensuales
│   │   │   ├── chat/page.tsx        # chat IA
│   │   │   ├── gmail/page.tsx       # conexión Gmail
│   │   │   └── invoices/
│   │   │       ├── page.tsx         # tabla + filtros + export CSV
│   │   │       └── [id]/
│   │   │           ├── page.tsx     # pantalla revisión
│   │   │           └── not-found.tsx
│   │   ├── api/invoices/export/     # GET CSV con filtros
│   │   ├── api/gmail/connect/       # OAuth inicio
│   │   ├── api/gmail/callback/      # OAuth callback
│   │   ├── login/ signup/ auth/callback/
│   │   └── api/debug/env/
│   ├── components/
│   │   ├── auth-form.tsx
│   │   ├── invoice-upload.tsx
│   │   ├── invoice-filters.tsx      # filtros GET en /dashboard/invoices
│   │   ├── invoice-export-link.tsx  # enlace descarga CSV (filtros actuales)
│   │   ├── invoices-table.tsx       # tabla de facturas
│   │   ├── invoice-review-form.tsx  # preview + form confirmar
│   │   ├── recent-invoices.tsx
│   │   ├── process-invoice-button.tsx
│   │   ├── chat-panel.tsx           # UI mensajes + enviar
│   │   ├── gmail-panel.tsx          # conectar / sync Gmail
│   │   ├── dashboard-header.tsx     # nav dashboard
│   │   └── sign-out-button.tsx
│   └── lib/
│       ├── crypto/token-encryption.ts
│       ├── gmail/                   # OAuth, connection, sync
│       ├── supabase/                # client, server, middleware
│       └── invoices/
│           ├── ingest.ts            # Storage + insert + IA (manual/gmail)
│           ├── constants.ts         # tipos, MIME, formatCurrency
│           ├── schema.ts            # Zod extracción + categorías
│           ├── extract.ts           # OpenAI Vision
│           ├── process.ts           # download Storage → IA → DB
│           ├── queries.ts           # getInvoiceForUser, listInvoicesForUser
│           ├── filter-params.ts     # parse filtros URL (tabla + export)
│           ├── export-csv.ts        # generación CSV
│           ├── chat-context.ts      # contexto para OpenAI chat
│           ├── chat.ts              # answerInvoiceChat (gpt-4o-mini)
│           └── stats.ts             # computeMonthlyStats
├── supabase/
│   ├── schema.sql                   # profiles, invoices (+ invoice_number, retention)
│   ├── storage.sql                  # bucket invoices
│   ├── add-invoice-fields.sql       # migración si DB ya existía
│   ├── add-document-type.sql        # migración gasto/ingreso
│   └── add-gmail.sql                # Gmail OAuth + dedup imports + source en invoices
├── scripts/check-supabase.mjs
├── .env.local.example
├── README.md
├── AGENTES.md                       # mapa de agentes + flujo
├── PROMPTS-AGENTES.md               # prompts listos Código / Supabase / Debug
├── ask.md                           # guía chat coordinador
├── AGENT_HANDOFF.md                 # resumen corto → apunta aquí
└── CONTINUAR.md                     # este archivo (fuente de verdad)
```

---

## Variables de entorno (`.env.local`)

Ver plantilla completa en `.env.local.example`. Mínimo:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
OPENAI_API_KEY=sk-proj-...
GOOGLE_CLIENT_ID=....apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=...
GOOGLE_REDIRECT_URI=http://localhost:3000/api/gmail/callback
GMAIL_TOKEN_ENCRYPTION_KEY=   # openssl rand -base64 32
NEXT_PUBLIC_APP_URL=http://localhost:3000   # opcional
```

**Reglas:** nunca pedir keys en el chat. Tras editar `.env.local` → reiniciar `npm run dev`.

### Google Cloud — Gmail OAuth (prueba local)

1. [Google Cloud Console](https://console.cloud.google.com/) → proyecto (o crear uno).
2. **APIs & Services → Library** → habilitar **Gmail API**.
3. **APIs & Services → OAuth consent screen** → External (o Internal si Workspace) → añadir scope `https://www.googleapis.com/auth/gmail.readonly` → usuarios de prueba: tu correo Gmail.
4. **Credentials → Create credentials → OAuth client ID** → tipo **Web application**.
5. **Authorized redirect URIs:** `http://localhost:3000/api/gmail/callback` (debe coincidir con `GOOGLE_REDIRECT_URI`).
6. Copiar Client ID y Client Secret a `.env.local`.
7. Generar `GMAIL_TOKEN_ENCRYPTION_KEY` (PowerShell):  
   `[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))`  
   o `openssl rand -base64 32`.
8. `npm run dev` → `/dashboard/gmail` → **Conectar Gmail** → autorizar → revisar facturas importadas en **Facturas** (pendientes de revisión).

---

## Modelo `invoices`

| Campo | Tipo / uso |
|-------|------------|
| `file_path`, `file_name` | Storage + nombre original |
| `status` | `pending_review` \| `confirmed` \| `rejected` |
| `document_type` | `expense` \| `income` — gasto o ingreso |
| `vendor` | Proveedor |
| `invoice_number` | Consecutivo / clave (CR) |
| `invoice_date` | Fecha YYYY-MM-DD |
| `subtotal`, `tax_amount`, `retention_amount`, `total` | Montos |
| `currency` | Default `CRC` ( también `USD`) |
| `category` | Combustible, Servicios, Otros, etc. |
| `raw_ai_json` | JSON IA + `math_valid` |
| `source` | `manual` \| `gmail` (default `manual`) |
| `source_meta` | JSON opcional (Gmail: `message_id`, `subject`, `from`, etc.; sin tokens) |

**RLS:** `auth.uid() = user_id` en todas las operaciones.

**Stats dashboard:** solo `confirmed`; mes según `invoice_date` o `created_at`.

### Gmail (v1 — `add-gmail.sql`)

| Tabla | Uso |
|-------|-----|
| `gmail_connections` | 1 fila por usuario: OAuth (`google_email`, tokens), `backfill_from` (1.º del mes CR al conectar), `last_history_id` (sync incremental), `last_synced_at` |
| `gmail_imports` | Dedup: `UNIQUE (user_id, gmail_message_id, gmail_attachment_id)` → `invoice_id`, `status` pending/imported/failed |

**Tokens:** `refresh_token` / `access_token` en DB; **cifrar en capa app** antes de guardar; leer solo en Server Actions; **nunca** devolver al cliente.

**Flujo producto:** backfill desde `backfill_from` al conectar; después solo correos nuevos (`last_history_id`). Outlook = v1.1.

---

## Facturación Costa Rica — MVP vs estándar Hacienda

> **Nota de pruebas:** Una factura descargada de internet en **EUR** (u otro país) sirve para probar subida e IA, pero **no representa** el formato costarricense. Moneda, IVA 13 % y estructura del documento serán distintos. Para validar lógica CR conviene usar facturas locales en **CRC** (o XML de factura electrónica CR).

Conta Copilot en esta fase es un **copiloto de organización**, no emisor ni validador de comprobantes ante Hacienda. Hay dos niveles de campos:

### Nivel 1 — Campos del MVP (lo que guarda la app hoy)

| Campo en app | Uso |
|--------------|-----|
| `vendor` | Proveedor / emisor |
| `invoice_number` | Consecutivo o referencia del documento |
| `invoice_date` | Fecha de emisión |
| `subtotal` | Base imponible |
| `tax_amount` | IVA u otro impuesto (en CR suele ser 13 %) |
| `retention_amount` | Retención si aparece en el documento (opcional) |
| `total` | Monto final |
| `currency` | Default `CRC`; también `USD` (EUR posible pero no típico en CR) |
| `document_type` | `expense` \| `income` — gasto o ingreso |
| `category` | Clasificación interna (Combustible, Servicios, Otros, etc.) |

Validación: `subtotal + IVA − retención ≈ total`.

Estos campos bastan para **organizar, revisar y sumar gastos/IVA** en el dashboard. No sustituyen el XML fiscal.

### Nivel 2 — Estándar oficial CR (Factura Electrónica v4.4 — Hacienda)

Referencia: [Anexos y Estructuras v4.4 (ATV Hacienda)](https://atv.hacienda.go.cr/ATV/ComprobanteElectronico/docs/esquemas/2024/v4.4/ANEXOS%20Y%20ESTRUCTURAS_V4.4.pdf)

Los comprobantes son **XML** (FE, TE, NC, ND, REP, etc.). Campos principales por bloque:

**Encabezado**

| Campo oficial | Descripción |
|---------------|-------------|
| `Clave` | Identificador único de 50 dígitos ante Hacienda |
| `NumeroConsecutivo` | Consecutivo del emisor (20 dígitos) |
| `FechaEmision` | Fecha/hora del comprobante |
| `CodigoMoneda` | Casi siempre **CRC**; a veces **USD** |
| `CondicionVenta` | Contado, crédito, etc. |
| `PlazoCredito` | Si aplica |

**Emisor y receptor**

| Campo | Descripción |
|-------|-------------|
| Identificación | Cédula física/jurídica o NITE |
| Nombre / razón social | |
| Código actividad económica (CIIU) | Emisor y, según caso, receptor |
| Ubicación | Provincia, cantón, distrito, señas |

**Detalle (líneas)**

| Campo | Descripción |
|-------|-------------|
| Código **CABYS** | Catálogo de bienes y servicios (por línea) |
| Cantidad, unidad, detalle | |
| Precio unitario, monto línea | |
| Impuesto por línea | Tarifa IVA (13 %, 4 %, exento, etc.) |
| Descuentos | Si aplican |

**Resumen (`ResumenFactura`)**

| Campo | Descripción |
|-------|-------------|
| Total venta / venta neta | |
| Total descuentos | Si hay |
| `TotalImpuesto` | Suma del IVA y otros impuestos |
| `TotalComprobante` | Total final |
| Medio de pago | Efectivo, tarjeta, SINPE, etc. |

En la **representación gráfica (PDF)** Hacienda exige, entre otros: tipo de documento, **Clave** y **numeración consecutiva**.

**Retención en CR:** no siempre va como un campo simple en el mismo XML. A menudo son retenciones de IVA o renta que el receptor aplica al pagar (certificados aparte). Por eso en el MVP `retention_amount` es **opcional** y editable cuando el PDF lo trae.

### Campos CR sugeridos para fases futuras (sin Hacienda aún)

| Prioridad | Campo | Motivo |
|-----------|--------|--------|
| Alta | Cédula emisor | Identificación fiscal |
| Alta | Clave (50 dígitos) o consecutivo completo | Trazabilidad única |
| Alta | Tipo comprobante (FE, TE, NC, ND) | Clasificación fiscal |
| Media | Cédula receptor | Cuando el usuario es el comprador |
| Media | Tipo de cambio | Si moneda ≠ CRC |
| Media | Medio / condición de pago | Contado vs crédito |
| Baja (fase Hacienda) | CABYS por línea | Requiere parseo XML completo |
| Baja | Exoneraciones | Casos especiales |

**Roadmap producto:** organización (MVP actual) → export CSV/Excel → integración XML Hacienda (fase 3). No prometer integración Hacienda en v1.

---

## Supabase — scripts SQL (orden)

1. `schema.sql` — tablas + RLS + trigger perfil  
2. `storage.sql` — bucket `invoices` + políticas  
3. `add-invoice-fields.sql` — **si la DB ya existía** antes de número/retención  
4. `add-document-type.sql` — **si la DB ya existía** antes de gasto/ingreso  
5. `add-gmail.sql` — Gmail OAuth, dedup `gmail_imports`, columnas `source` / `source_meta` en `invoices`

Auth: Email activo; Site URL `http://localhost:3000`; redirect `/auth/callback`.  
Gmail: ejecutar `add-gmail.sql` + variables Google en `.env.local` (ver sección Google Cloud arriba).

---

## Comandos

```powershell
cd C:\Users\Fran\Desktop\conta-copilot
npm install
npm run dev              # http://localhost:3000
npm run build
npm run check:supabase   # health API Supabase
```

Diagnóstico local: `http://localhost:3000/api/debug/env`  
Diagnóstico prod: `https://conta-copilot-mvp-chat-ia-gmail-v1.vercel.app/api/debug/env`

---

## Convenciones de código

- UI y mensajes en **español**
- Auth login/signup: **cliente** (`auth-form.tsx` + `@/lib/supabase/client`); inyección runtime `SupabasePublicEnv` en `layout.tsx`
- Subida, revisión vía **Server Actions**
- `await createClient()` desde `@/lib/supabase/server`
- `supabase.auth.getUser()` para autorizar (no `getSession` en server)
- IA **propone**, humano **confirma**
- Errores OpenAI 429 → mensaje amigable (cuota / billing)
- Minimizar scope; no over-engineering

---

## Problemas ya resueltos

| Problema | Solución |
|----------|----------|
| Failed to fetch en signup | Server Actions en `auth.ts` |
| Invalid API key Supabase | Anon key JWT completa en `.env.local` |
| OpenAI 429 quota | Usuario añadió créditos (~$5) en platform.openai.com |
| Montos no cuadran | Validación con retención; campos editables en revisión |
| Dashboard en "—" | `stats.ts` suma confirmadas del mes |
| Falta nº factura / retención | Campos + `add-invoice-fields.sql` + prompt IA |
| `GMAIL_TOKEN_ENCRYPTION_KEY` missing | Generar clave → `.env.local` → reiniciar `npm run dev` |
| Internal Server Error / login colgado | Disco C: lleno (ENOSPC) → liberar espacio → borrar `.next` → reiniciar dev |
| Vercel build falla Supabase en prerender | Env vars + commits `8355ed7`/`bebaa11`; dashboard/login dinámicos |
| Login prod: `NEXT_PUBLIC_SUPABASE_ANON` mal nombrado | Usar `NEXT_PUBLIC_SUPABASE_ANON_KEY` completa |
| Login prod: "page couldn't load" | Supabase Site URL + fix auth cliente `4b1df54` |

---

## Limitaciones actuales (conocidas)

- **Ingresos (mes)** suma facturas confirmadas con `document_type = income`
- Facturas **rechazadas** no se editan ni reprocesan
- Facturas confirmadas **antes** de `add-invoice-fields.sql` no tienen número/retención en DB
- Moneda mixta CRC/USD en stats: se suman sin conversión (MVP)
- Facturas de prueba HTML/PDF: `public/test-invoices/` (ver `LEEME.md`)
- Facturas en **EUR** u otros países no reflejan formato CR típico
- Sin parseo de XML v4.4 ni campos fiscales completos (clave 50 dígitos, CABYS, cédulas)
- Sin paginación en tabla de facturas (máx. 200 resultados)
- Gmail sync: máx. 50 mensajes por ejecución; adjuntos válidos según `constants.ts`; sin historial de chat en DB
- Gmail: si Google no devuelve `refresh_token`, revocar acceso en cuenta Google y reconectar con `prompt=consent`

---

## Prompts para chats nuevos

### Coordinador (Ask — chat fijo de planificación)

Ver prompt completo en [`PROMPTS-AGENTES.md`](PROMPTS-AGENTES.md) §0 o [`AGENTES.md`](AGENTES.md).

```
Eres mi Agente Coordinador (Ask) de Conta Copilot.
Ruta: C:\Users\Fran\Desktop\conta-copilot
Lee CONTINUAR.md y AGENTES.md. Planifica y prepara prompts para Código/Supabase/Debug.
MVP ✅ + Post-MVP v1 ✅. Producción Vercel ✅ (login OK). Siguiente: Gmail prod, Excel opcional. Hacienda v2 fuera de scope. Español.
```

### Ejecutor (Agent — chat nuevo por tarea)

```
Continúa Conta Copilot en C:\Users\Fran\Desktop\conta-copilot.
Lee CONTINUAR.md (handoff completo).

Estado: MVP + Post-MVP v1 ✅. Producción: https://conta-copilot-mvp-chat-ia-gmail-v1.vercel.app

Siguiente: Gmail en prod, Excel opcional. Hacienda = v2 (no tocar).
UI en español. No pedir API keys en el chat.
```

---

## Decisiones de producto

- SaaS web únicamente
- Mercado: Costa Rica (CRC, IVA ~13%, retenciones en facturas B2B)
- Hacienda: organización → export → integración (no prometer v1)
- Copiloto contable, no ERP

---

## Idioma

El usuario prefiere comunicación en **español**.

---

*Última actualización: mayo 2026 — Pausa tras prod OK (login, Gmail, IA). Piloto pendiente. Commit deploy: `db9df67`. Excel export en local sin push.*
