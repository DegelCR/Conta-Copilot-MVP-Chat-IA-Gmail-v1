# Deploy Conta Copilot en Vercel

> Guía de despliegue y producción. Actualizado tras endurecimiento de seguridad (junio 2026).

Ruta local: `C:\Users\Fran\Desktop\conta-copilot`

---

## Producción actual ✅

| Campo | Valor |
|-------|--------|
| **URL app** | https://conta-copilot-mvp-chat-ia-gmail-v1.vercel.app |
| **Panel Vercel** | https://vercel.com/degel-cr-s-projects/conta-copilot-mvp-chat-ia-gmail-v1 |
| **GitHub** | https://github.com/DegelCR/Conta-Copilot-MVP-Chat-IA-Gmail-v1 |
| **Rama** | `master` |
| **Último commit en GitHub** | `d8bb305` (piloto + categorías) |
| **Cambios locales sin push** | Endurecimiento seguridad jun 2026 — ver checklist abajo |
| **Supabase ref** | `gufhkxexvqxhnmubmhuq` |

**Verificado en producción (mayo 2026):**

- Landing y login (`frtest@gmail.com`)
- Gmail: sync + procesar IA en factura de prueba (correo propio)
- Variables: error común `NEXT_PUBLIC_SUPABASE_ANON` → corregir a `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**No confundir:** la URL del panel `vercel.com/degel-cr-s-projects/...` **no** va en Supabase ni Google — solo la URL `*.vercel.app`.

---

## Checklist de estado

- [x] Repo en GitHub
- [x] Proyecto importado en Vercel
- [x] Variables en **Production** y **Preview** (**9 variables**, ver abajo)
- [x] Build **Ready**
- [x] Login producción
- [x] Gmail sync + flujo factura en prod (usuario verificó)
- [x] Registro manual sin archivo + categorías custom en prod (mayo 2026, `0826f6e`–`23ea271`)
- [ ] Supabase prod: ejecutar `add-custom-categories.sql` si aún no (categorías en perfil)
- [ ] Supabase prod: ejecutar `harden-security.sql` (tokens Gmail + rate limiting) — **obligatorio** tras junio 2026
- [ ] `git push` cambios seguridad jun 2026 → Vercel redeploy automático
- [ ] Probar login piloto (`david@ejemplo.com` u otro)

### Usuarios de prueba (Supabase)

Contraseñas **no** en documentación — usar gestor local.

| Nombre | Correo | Notas |
|--------|--------|--------|
| (admin) | `frtest@gmail.com` | Pruebas originales |
| David | `david@ejemplo.com` | Piloto/demo adicional |
| Daniela | `daniela@ejemplo.com` | Piloto/demo adicional |

Crear usuarios confirmados (terminal local):

```powershell
node scripts/create-pilot-user.mjs --email piloto@ejemplo.com --password "TuClave123" --name "Nombre Piloto"
```

Requiere `SUPABASE_SERVICE_ROLE_KEY` en `.env.local`.

---

## Variables de entorno en Vercel

### UI de Vercel (importante)

Vercel muestra **3 pestañas**: **Production**, **Preview**, **Development**.

- Al entrar en una pestaña, solo añades variables **de ese entorno** (no hay casillas para marcar varias).
- Hay que **repetir las 9 variables** en **Production** y en **Preview** (mismo nombre y valor).
- **Development** se puede omitir (desarrollo local usa `.env.local`).

### Las 9 variables (nombres exactos)

| Variable | Valor en producción |
|----------|---------------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://gufhkxexvqxhnmubmhuq.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clave **anon public completa** (`eyJ...`) — ver nota abajo |
| `SUPABASE_SERVICE_ROLE_KEY` | Clave **service_role** de Supabase — **solo servidor** (Gmail + rate limits) |
| `OPENAI_API_KEY` | De `.env.local` |
| `NEXT_PUBLIC_APP_URL` | `https://conta-copilot-mvp-chat-ia-gmail-v1.vercel.app` |
| `GOOGLE_CLIENT_ID` | De `.env.local` |
| `GOOGLE_CLIENT_SECRET` | De `.env.local` |
| `GOOGLE_REDIRECT_URI` | `https://conta-copilot-mvp-chat-ia-gmail-v1.vercel.app/api/gmail/callback` |
| `GMAIL_TOKEN_ENCRYPTION_KEY` | **La misma** que en `.env.local` (generada con PowerShell u `openssl`) |
| `NEXT_PUBLIC_CONTACT_EMAIL` | *(opcional)* correo visible en Privacidad y Términos |

**Páginas legales:** `/privacidad` y `/terminos` (enlaces en footer de la app).

**Avisos fiscales (UI):** franja en dashboard, aviso en chat, texto al confirmar factura, landing y footer — textos en `src/lib/legal/disclaimer.ts` (commit `5664b40`). Beta básica; revisión por abogado opcional antes de escalar.

### ⚠️ Nombre correcto de la clave anon

| ❌ Incorrecto | ✅ Correcto |
|---------------|-------------|
| `NEXT_PUBLIC_SUPABASE_ANON` | `NEXT_PUBLIC_SUPABASE_ANON_KEY` |

Si el nombre está mal, el build o el login fallan con: *Your project's URL and API key are required*.

### Seguridad de claves

| Variable | ¿Va completa en Vercel? | ¿Es secreto? |
|----------|-------------------------|--------------|
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | **Sí, entera** | Pública por diseño (RLS protege datos) |
| `NEXT_PUBLIC_SUPABASE_URL` | Sí | No |
| `OPENAI_API_KEY` | Sí | **Sí** — solo servidor |
| `SUPABASE_SERVICE_ROLE_KEY` | Sí | **Sí** — solo servidor; nunca al cliente |
| `GOOGLE_CLIENT_SECRET` | Sí | **Sí** |
| `GMAIL_TOKEN_ENCRYPTION_KEY` | Sí | **Sí** — misma clave que local si ya conectaste Gmail |

No recortes la anon key “por seguridad” en Vercel. No subas `.env.local` a GitHub.

Tras cualquier cambio → **Deployments → Redeploy** (idealmente sin caché si el build sigue viejo).

---

## Supabase — SQL de seguridad (junio 2026)

Tras desplegar el código con endurecimiento de seguridad, ejecutá en **SQL Editor** (en orden, si aún no corrieron):

1. `supabase/add-custom-categories.sql` — categorías personalizadas (si falta)
2. **`supabase/harden-security.sql`** — obligatorio:
   - Revoca lectura de `refresh_token`/`access_token` de Gmail para usuarios autenticados (solo `service_role` en servidor).
   - Crea tabla `rate_limits` para límites de uso (chat, sync Gmail, subidas, IA).

Sin `harden-security.sql`, Gmail y rate limiting siguen funcionando pero con protección reducida.  
Sin `SUPABASE_SERVICE_ROLE_KEY` en Vercel, **fallan** conexión/sync Gmail y rate limits.

---

## Supabase Auth (producción)

**Authentication → URL Configuration:**

| Campo | Valor |
|-------|--------|
| **Site URL** | `https://conta-copilot-mvp-chat-ia-gmail-v1.vercel.app` |
| **Redirect URLs** | `https://conta-copilot-mvp-chat-ia-gmail-v1.vercel.app/auth/callback` |
| *(opcional local)* | `http://localhost:3000/auth/callback` |

---

## Google Cloud (Gmail en producción)

**Credentials → OAuth client → Authorized redirect URIs:**

```text
https://conta-copilot-mvp-chat-ia-gmail-v1.vercel.app/api/gmail/callback
http://localhost:3000/api/gmail/callback
```

**OAuth consent screen → Test users:** correos que probarán Gmail (modo Testing).

`GOOGLE_REDIRECT_URI` en Vercel debe coincidir **exacto** con la URI de Google.

---

## Diagnóstico rápido

**Local (terminal):**

```powershell
npm run check:supabase
```

Debe mostrar `health 200` y respuesta de signup (200 o 422 si el correo ya existe).

**Producción (navegador):**

1. https://conta-copilot-mvp-chat-ia-gmail-v1.vercel.app/login — debe cargar sin errores en consola de Supabase.
2. Login con usuario de prueba → dashboard visible.

> **Nota:** la ruta `/api/debug/env` fue **eliminada** (junio 2026) por seguridad. No usarla como diagnóstico.

Si login falla con *Your project's URL and API key are required* → revisar nombres y valores en pestaña **Production** → Redeploy.

---

## Probar en producción

1. Login: https://conta-copilot-mvp-chat-ia-gmail-v1.vercel.app/login  
   Usuario de prueba: `frtest@gmail.com` (contraseña en gestor local, no en docs).
2. Dashboard → **Subir factura** (arrastrar un PDF/XML o clic) → revisar **Resumen de montos** → confirmar; o usar factura de prueba Gmail.
3. Gmail → conectar → sincronizar (requiere Google configurado).
4. Chat → pregunta sobre facturas confirmadas.

### Facturas de prueba (sin enviar email desde el agente)

Archivos en `public/test-invoices/`:

- `factura-prueba-gmail.html` → abrir → Imprimir → PDF → enviarte por Gmail como adjunto.
- URL: https://conta-copilot-mvp-chat-ia-gmail-v1.vercel.app/test-invoices/factura-prueba-gmail.html  
- Instrucciones: `public/test-invoices/LEEME.md`

Correo típico de prueba Gmail: `franciscojavier.gonzalez5@gmail.com`.

---

## Errores frecuentes (resueltos en conversación)

| Síntoma | Causa | Fix |
|---------|--------|-----|
| Build falla en `/dashboard/chat` o `/signup` — Supabase URL/key required | Env vars faltantes en build o pre-render | Commits `8355ed7`, `bebaa11`; vars + Redeploy |
| Login se queda cargando; consola: Supabase URL and API key required | `NEXT_PUBLIC_SUPABASE_ANON` mal nombrada o key recortada | Renombrar a `NEXT_PUBLIC_SUPABASE_ANON_KEY` (completa); commit `db9df67` |
| "This page couldn't load" tras login | Bucle cookies / server action sin sesión | Login cliente en `auth-form.tsx` (`4b1df54`) + Supabase Site URL |
| Redirect en Supabase mal | URL del panel Vercel en lugar de `*.vercel.app` | Usar URL **Visit** del deploy |
| Gmail redirect error | URI distinta Google vs Vercel | Alinear Paso Google + `GOOGLE_REDIRECT_URI` |
| Gmail tokens inválidos | Otra `GMAIL_TOKEN_ENCRYPTION_KEY` en prod | Misma clave que `.env.local` o reconectar Gmail |
| Gmail sync falla tras deploy seguridad | Falta `SUPABASE_SERVICE_ROLE_KEY` en Vercel | Añadir clave service_role + Redeploy |
| "Faltan … SUPABASE_SERVICE_ROLE_KEY" | Variable no configurada en servidor | Copiar de Supabase → Settings → API → service_role |
| Rate limits no aplican | No se ejecutó `harden-security.sql` | SQL Editor → `supabase/harden-security.sql` |

---

## Endurecimiento de seguridad (junio 2026)

Cambios incluidos en el código:

| Área | Qué hace |
|------|----------|
| **Tokens Gmail** | Lectura/escritura solo con `SUPABASE_SERVICE_ROLE_KEY` en servidor (`src/lib/supabase/admin.ts`) |
| **RLS columnas** | `harden-security.sql` — usuarios no pueden leer tokens cifrados desde el navegador |
| **Rate limiting** | Chat (20/10 min), sync Gmail (5/10 min), subidas (30/h), IA (20/h) — `src/lib/security/rate-limit.ts` |
| **Cabeceras HTTP** | HSTS, `X-Frame-Options`, `X-Content-Type-Options`, etc. — `next.config.ts` |
| **Redirect auth** | Parámetro `next` sanitizado en `/auth/callback` |
| **Subida archivos** | Validación de magic bytes (PDF, imágenes, XML) |
| **Debug** | Eliminado `/api/debug/env` |

**Checklist post-deploy seguridad:**

- [ ] `SUPABASE_SERVICE_ROLE_KEY` en Vercel (Production + Preview)
- [ ] Ejecutar `supabase/harden-security.sql` en Supabase prod
- [ ] Redeploy
- [ ] Probar login + conectar Gmail + sync + chat

---

## Fixes de código incluidos en repo

| Commit | Qué hace |
|--------|----------|
| `8355ed7` | Dashboard dinámico; SignOut lazy |
| `4b1df54` | Login/registro con Supabase en el navegador |
| `bebaa11` | Auth form sin crear cliente en SSR |
| `db9df67` | Inyección `window.__CONTA_SUPABASE_ENV` + `next.config` env |

---

## GitHub — push de cambios

```powershell
cd C:\Users\Fran\Desktop\conta-copilot
git add .
git commit -m "Descripción"
git push origin master
```

Vercel despliega automático en push a `master`.

---

## Comandos útiles

```powershell
npm run build
npm run check:supabase
npm run dev
```

---

## Siguiente después del deploy

- [x] Probar login y Gmail en prod
- [ ] **Push + redeploy** cambios seguridad (jun 2026)
- [ ] Ejecutar `harden-security.sql` en Supabase prod + `SUPABASE_SERVICE_ROLE_KEY` en Vercel
- [ ] Checklist **Antes del piloto** en [`CONTINUAR.md`](./CONTINUAR.md)
- [ ] Ofrecer **piloto beta** (2–4 semanas, 1 negocio, mes actual)

**Pausar desarrollo** hasta feedback del piloto, salvo bugs críticos en prod.

Opcional / post-piloto:

- Dominio propio
- Salir de modo *Testing* en Google cuando haya más usuarios
- Outlook, inbound email, IA en lote
- Hacienda sandbox (credenciales contribuyente)

---

*Última actualización: junio 2026 — Seguridad + usuarios piloto + checklist pre-beta.*
