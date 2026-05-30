# Deploy Conta Copilot en Vercel

> Guía de despliegue y producción. Actualizado tras deploy exitoso (mayo 2026).

Ruta local: `C:\Users\Fran\Desktop\conta-copilot`

---

## Producción actual ✅

| Campo | Valor |
|-------|--------|
| **URL app** | https://conta-copilot-mvp-chat-ia-gmail-v1.vercel.app |
| **Panel Vercel** | https://vercel.com/degel-cr-s-projects/conta-copilot-mvp-chat-ia-gmail-v1 |
| **GitHub** | https://github.com/DegelCR/Conta-Copilot-MVP-Chat-IA-Gmail-v1 |
| **Rama** | `master` |
| **Último commit** | `23ea271` (categorías texto libre; registro manual `0826f6e`) |
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
- [x] Variables en **Production** y **Preview** (8 variables, ver abajo)
- [x] Build **Ready**
- [x] Login producción
- [x] Gmail sync + flujo factura en prod (usuario verificó)
- [x] Registro manual sin archivo + categorías custom en prod (mayo 2026, `0826f6e`–`23ea271`)
- [ ] Supabase prod: ejecutar `add-custom-categories.sql` si aún no (categorías en perfil)

---

## Variables de entorno en Vercel

### UI de Vercel (importante)

Vercel muestra **3 pestañas**: **Production**, **Preview**, **Development**.

- Al entrar en una pestaña, solo añades variables **de ese entorno** (no hay casillas para marcar varias).
- Hay que **repetir las 8 variables** en **Production** y en **Preview** (mismo nombre y valor).
- **Development** se puede omitir (desarrollo local usa `.env.local`).

### Las 8 variables (nombres exactos)

| Variable | Valor en producción |
|----------|---------------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://gufhkxexvqxhnmubmhuq.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clave **anon public completa** (`eyJ...`) — ver nota abajo |
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
| `GOOGLE_CLIENT_SECRET` | Sí | **Sí** |
| `GMAIL_TOKEN_ENCRYPTION_KEY` | Sí | **Sí** — misma clave que local si ya conectaste Gmail |

No recortes la anon key “por seguridad” en Vercel. No subas `.env.local` a GitHub.

Tras cualquier cambio → **Deployments → Redeploy** (idealmente sin caché si el build sigue viejo).

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

```text
https://conta-copilot-mvp-chat-ia-gmail-v1.vercel.app/api/debug/env
```

Respuesta esperada:

```json
{
  "supabaseUrlConfigured": true,
  "supabaseAnonConfigured": true,
  "anonLooksValid": true
}
```

Si `false` → revisar nombres y valores en pestaña **Production** → Redeploy.

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
- [ ] Ofrecer **piloto beta** (ver `CONTINUAR.md` → Piloto beta)
- [ ] `git push` cambios locales (Excel, docs, facturas prueba) si aplica
- Dominio propio (opcional)
- Salir de modo *Testing* en Google cuando haya más usuarios
- Outlook, inbound email, IA en lote
- Hacienda sandbox (credenciales contribuyente) — 3A XML + consulta pública + selector Gasto/Ingreso al subir en prod

---

*Última actualización: mayo 2026 — Prod OK. Pausa desarrollo. Piloto comercial siguiente paso.*
