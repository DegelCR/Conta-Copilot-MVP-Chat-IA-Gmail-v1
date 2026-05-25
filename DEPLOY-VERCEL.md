# Deploy Conta Copilot en Vercel

> Para que amigos/familiares prueben la app en internet (no solo `localhost`).

Ruta local: `C:\Users\Fran\Desktop\conta-copilot`

---

## Antes de empezar

- [x] `npm run build` pasa en local
- [x] Código en GitHub
- [ ] Proyecto importado en Vercel + env vars + redeploy
- [ ] Supabase Site URL y Google OAuth con URL de producción
- [x] Supabase project: `gufhkxexvqxhnmubmhuq`
- [x] Google Cloud OAuth configurado (Gmail local)

---

## Repositorio GitHub ✅

| Campo | Valor |
|-------|--------|
| **URL** | https://github.com/DegelCR/Conta-Copilot-MVP-Chat-IA-Gmail-v1 |
| **Rama** | `master` |
| **Último commit** | `c2370e8` — *Conta Copilot MVP + Chat IA + Gmail v1* |
| **Remote local** | `origin` → mismo repo |

**No está en GitHub:** `.env.local` (secretos — correcto).

---

## Paso 1 — GitHub ✅ (hecho)

```powershell
cd C:\Users\Fran\Desktop\conta-copilot
git remote -v
# origin → https://github.com/DegelCR/Conta-Copilot-MVP-Chat-IA-Gmail-v1.git
```

Para futuros cambios:

```powershell
git add .
git commit -m "Descripción del cambio"
git push origin master
```

---

## Paso 2 — Importar en Vercel

1. [vercel.com](https://vercel.com) → **Add New** → **Project**
2. Importa **`DegelCR/Conta-Copilot-MVP-Chat-IA-Gmail-v1`**
3. Framework: **Next.js** (auto-detectado)
4. **Antes del deploy que quieras que pase:** añade variables del **Paso 3** (mínimo Supabase + OpenAI). Si el primer deploy falla en build, es normal — completa Paso 3 y **Redeploy**.

Anota tu URL, ej: `https://conta-copilot-mvp-chat-ia-gmail-v1.vercel.app`

---

## Paso 3 — Variables de entorno en Vercel (obligatorio para el build)

**Settings → Environment Variables** → marca **Production** y **Preview** en cada una:

| Variable | Valor |
|----------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://gufhkxexvqxhnmubmhuq.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | *(copiar de `.env.local`)* |
| `OPENAI_API_KEY` | *(copiar de `.env.local`)* |
| `NEXT_PUBLIC_APP_URL` | `https://TU-DOMINIO.vercel.app` *(tu URL real de Vercel)* |
| `GOOGLE_CLIENT_ID` | *(copiar de `.env.local`)* |
| `GOOGLE_CLIENT_SECRET` | *(copiar de `.env.local`)* |
| `GOOGLE_REDIRECT_URI` | `https://TU-DOMINIO.vercel.app/api/gmail/callback` |
| `GMAIL_TOKEN_ENCRYPTION_KEY` | *(misma clave que en local)* |

**Crítico:** Sin `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` el build falla con:

```text
Error: @supabase/ssr: Your project's URL and API key are required...
prerendering page "/dashboard/chat"
```

Tras guardar → **Deployments** → último deploy → **⋮** → **Redeploy** (no basta con guardar vars; hay que redeployar).

---

## Paso 4 — Supabase Auth

Supabase Dashboard → **Authentication** → **URL Configuration**:

| Campo | Valor |
|-------|--------|
| **Site URL** | `https://TU-DOMINIO.vercel.app` |
| **Redirect URLs** | `https://TU-DOMINIO.vercel.app/auth/callback` |
| | `http://localhost:3000/auth/callback` *(opcional, para seguir en local)* |

---

## Paso 5 — Google Cloud (Gmail OAuth)

[Google Cloud Console](https://console.cloud.google.com/) → **APIs & Services** → **Credentials** → tu OAuth client:

**Authorized redirect URIs** — añadir (mantener localhost si desarrollas local):

```
https://TU-DOMINIO.vercel.app/api/gmail/callback
http://localhost:3000/api/gmail/callback
```

**OAuth consent screen** → **Test users**: añade el Gmail de cada persona que probará (mientras la app esté en modo *Testing*).

---

## Paso 6 — Probar en producción

1. Abre `https://TU-DOMINIO.vercel.app`
2. **Registro** o login (correo de prueba)
3. Subir factura → revisar → confirmar
4. **Gmail** → conectar → sincronizar
5. **Chat** → pregunta sobre facturas confirmadas

Comparte la URL con tu amigo/familiar. Cada uno necesita **su propia cuenta** (signup).

---

## Errores frecuentes en producción

| Síntoma | Causa | Fix |
|---------|--------|-----|
| Build falla en `/dashboard/chat` — Supabase URL and API key required | Faltan env vars en Vercel (o no redeployaste) | Paso 3: `NEXT_PUBLIC_SUPABASE_*` + **Redeploy** |
| Login no funciona | Site URL Supabase incorrecta | Paso 4 |
| Gmail redirect error | URI distinta en Google vs Vercel | Pasos 3 y 5 deben coincidir exacto |
| Access blocked Google | Usuario no en Test users | OAuth consent screen |
| Gmail tokens inválidos | Cambiaste `GMAIL_TOKEN_ENCRYPTION_KEY` | Usar la misma clave o desconectar/reconectar Gmail |
| 500 al subir factura | Falta `OPENAI_API_KEY` en Vercel | Paso 3 |

---

## Comandos útiles

```powershell
cd C:\Users\Fran\Desktop\conta-copilot
npm run build          # verificar antes de deploy
npm run check:supabase # health Supabase (local)
```

Deploy alternativo sin GitHub (CLI):

```powershell
npm i -g vercel
vercel login
vercel --prod
```

---

## Siguiente después del deploy

- Dominio propio en Vercel (opcional)
- Publicar app OAuth en Google (salir de *Testing*) cuando tengas más usuarios
- Excel export, Outlook v1.1, Hacienda fase 3

---

*Última actualización: mayo 2026 — GitHub ✅ · Siguiente: importar en Vercel.*
