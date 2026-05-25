# Conta Copilot

Copiloto contable con IA para contadores, freelancers y pequeños negocios. Organiza facturas, extrae datos automáticamente y muestra un dashboard simple — sin intentar ser un ERP completo.

**Stack:** Next.js 16 · TypeScript · Tailwind CSS · Supabase (Auth, PostgreSQL, Storage) · OpenAI (gpt-4o-mini)

---

## Requisitos

- Node.js 20+ (tienes v22 ✓)
- Cuenta en [Supabase](https://supabase.com)
- (Próximo paso) API key de [OpenAI](https://platform.openai.com)

---

## Inicio rápido

### 1. Clonar / abrir el proyecto

```powershell
cd C:\Users\Fran\Desktop\conta-copilot
```

### 2. Variables de entorno

Copia la plantilla y rellena tus valores **en tu PC** (no subas secretos a Git):

```powershell
copy .env.local.example .env.local
```

Edita `.env.local` con un editor de texto. Ver sección [Configurar Supabase](#configurar-supabase) abajo.

### 3. Instalar y arrancar

```powershell
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

---

## Configurar Supabase

### Paso 1 — Crear proyecto

1. Entra a [supabase.com/dashboard](https://supabase.com/dashboard).
2. **New project** → nombre: `conta-copilot`.
3. Elige región cercana (ej. South America si está disponible).
4. Guarda la contraseña de la base de datos.

### Paso 2 — Obtener API keys

1. **Project Settings** (engranaje abajo a la izquierda) → **API** o **API Keys**.
2. Copia en `.env.local`:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** (Legacy) o **Publishable key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** (Legacy) o **Secret key** → `SUPABASE_SERVICE_ROLE_KEY` (solo servidor)

**Importante:** la clave `anon` es un texto **muy largo** (cientos de caracteres). Suele empezar con `eyJ` (JWT) o `sb_publishable_`.  
**No uses:** la contraseña de la base de datos, el Project ID corto, ni un fragmento de la key.

3. Guarda `.env.local` y **reinicia** el servidor (`Ctrl+C` → `npm run dev`).

### Paso 3 — Ejecutar el esquema SQL

1. **SQL Editor** → **New query**.
2. Pega el contenido de `supabase/schema.sql`.
3. **Run**.

Esto crea tablas `profiles` e `invoices` con **Row Level Security** (cada usuario solo ve sus datos).

### Paso 4 — Auth (email/contraseña)

1. **Authentication** → **Providers** → **Email** → activado.
2. Para desarrollo local, puedes desactivar **Confirm email** en *Email* settings (así entras sin confirmar correo).
3. **Authentication** → **URL Configuration**:
   - **Site URL:** `http://localhost:3000`
   - **Redirect URLs:** añade `http://localhost:3000/auth/callback`

### Paso 5 — Storage (subida de facturas)

1. Ejecuta **`supabase/storage.sql`** en el SQL Editor (crea bucket `invoices` + políticas).
   - Alternativa manual: **Storage** → **New bucket** → nombre `invoices`, **privado**, límite 10 MB.
2. Asegúrate de haber ejecutado **`supabase/schema.sql`** (tabla `invoices`).
3. En el dashboard, usa **Subir factura** (PDF, imagen o XML).

---

## Estructura del proyecto

```
conta-copilot/
├── src/
│   ├── app/
│   │   ├── auth/callback/   # OAuth / confirmación email
│   │   ├── dashboard/       # Panel (protegido)
│   │   ├── login/
│   │   └── signup/
│   ├── components/
│   └── lib/supabase/        # Cliente browser, server, middleware
├── supabase/schema.sql
├── .env.local.example
├── AGENT_HANDOFF.md         # Contexto para continuar con otro agente
└── README.md
```

---

## Rutas

| Ruta | Descripción |
|------|-------------|
| `/` | Landing |
| `/login` | Iniciar sesión |
| `/signup` | Registro |
| `/dashboard` | Panel + subida + stats del mes |
| `/dashboard/invoices` | Tabla + filtros + export CSV |
| `/dashboard/invoices/[id]` | Revisar / confirmar factura |
| `/dashboard/chat` | Chat IA sobre facturas confirmadas |
| `/dashboard/gmail` | Conectar / sincronizar Gmail |

---

## Roadmap

### MVP ✅
- [x] Proyecto Next.js + Tailwind + Supabase Auth
- [x] Subida PDF/imagen/XML → Storage + `invoices`
- [x] Extracción OpenAI Vision (gpt-4o-mini)
- [x] Revisión: confirmar / rechazar + campos editables
- [x] Dashboard: ingresos, gastos e IVA del mes (confirmadas)
- [x] Tabla de facturas con filtros + export CSV
- [x] Número de factura, retención, gasto/ingreso (`document_type`)

### Post-MVP v1 ✅
- [x] Chat IA (`/dashboard/chat`)
- [x] Gmail v1 (`/dashboard/gmail`) — **conectado y verificado**

### Siguiente
- [ ] Deploy Vercel (prioridad)
- [ ] Export Excel (opcional)
- [ ] Hacienda CR (fase 3)

---

## Facturación Costa Rica

Conta Copilot está pensado para **organizar facturas en Costa Rica** (CRC, IVA ~13 %). La app guarda hoy: proveedor, número, fecha, subtotal, IVA, retención (opcional), total, moneda y categoría.

El **estándar fiscal completo** (Factura Electrónica v4.4 de Hacienda: clave de 50 dígitos, consecutivo, cédulas, CABYS, XML) no está integrado en el MVP; va en fases posteriores (export → Hacienda).

Para probar el flujo, usa facturas **locales en colones** o XML CR. Una factura europea en EUR sirve para probar la IA, pero no refleja el formato costarricense.

Detalle completo: [`CONTINUAR.md`](./CONTINUAR.md) → sección *Facturación Costa Rica — MVP vs estándar Hacienda*.

---

## Despliegue (Vercel) ✅

**Producción:** https://conta-copilot-mvp-chat-ia-gmail-v1.vercel.app — login y Gmail verificados.

Guía: [`DEPLOY-VERCEL.md`](./DEPLOY-VERCEL.md) · Piloto y límites: [`CONTINUAR.md`](./CONTINUAR.md)

**Export:** Excel (principal) + CSV en `/dashboard/invoices` (cambio local; confirmar en GitHub).

**Estado:** pausa desarrollo mayo 2026; siguiente paso = piloto comercial acotado.

**Manuales:** [`docs/MANUAL-USUARIO.md`](./docs/MANUAL-USUARIO.md) (compartir al piloto) · [`docs/MANUAL-ADMIN.md`](./docs/MANUAL-ADMIN.md) (activación y onboarding).

---

## Seguridad

- Nunca commitees `.env.local`.
- No expongas `SUPABASE_SERVICE_ROLE_KEY` en el cliente.
- Revoca y rota API keys si se filtran en chats o capturas.

---

## Continuar con otro agente

Lee **`CONTINUAR.md`** (handoff actualizado), **`ask.md`** (coordinador) o `AGENT_HANDOFF.md`.
