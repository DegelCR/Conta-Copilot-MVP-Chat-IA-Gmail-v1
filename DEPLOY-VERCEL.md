# Deploy Conta Copilot en Vercel

> Para que amigos/familiares prueben la app en internet (no solo `localhost`).

Ruta local: `C:\Users\Fran\Desktop\conta-copilot`

---

## Antes de empezar

- [ ] `npm run build` pasa en local
- [ ] Tienes cuenta en [GitHub](https://github.com) y [Vercel](https://vercel.com)
- [ ] Supabase project: `gufhkxexvqxhnmubmhuq`
- [ ] Google Cloud OAuth configurado (Gmail)

---

## Paso 1 — Subir código a GitHub

El repo **no tiene remote** todavía. En PowerShell:

```powershell
cd C:\Users\Fran\Desktop\conta-copilot
git add .
git commit -m "Conta Copilot MVP + Chat IA + Gmail v1"
```

Crea repo en GitHub (web: **New repository**, sin README) y luego:

```powershell
git remote add origin https://github.com/TU_USUARIO/conta-copilot.git
git push -u origin master
```

*(Si tu rama se llama `main`, usa `main` en lugar de `master`.)*

**No subas** `.env.local` — ya está en `.gitignore`.

---

## Paso 2 — Importar en Vercel

1. [vercel.com](https://vercel.com) → **Add New** → **Project**
2. Importa el repo `conta-copilot`
3. Framework: **Next.js** (auto-detectado)
4. **Deploy** (primera vez puede fallar sin env vars — normal)

Anota tu URL, ej: `https://conta-copilot.vercel.app`

---

## Paso 3 — Variables de entorno en Vercel

**Settings → Environment Variables** → añade todas (Production + Preview):

| Variable | Valor |
|----------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://gufhkxexvqxhnmubmhuq.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | *(copiar de `.env.local`)* |
| `OPENAI_API_KEY` | *(copiar de `.env.local`)* |
| `NEXT_PUBLIC_APP_URL` | `https://TU-DOMINIO.vercel.app` |
| `GOOGLE_CLIENT_ID` | *(copiar de `.env.local`)* |
| `GOOGLE_CLIENT_SECRET` | *(copiar de `.env.local`)* |
| `GOOGLE_REDIRECT_URI` | `https://TU-DOMINIO.vercel.app/api/gmail/callback` |
| `GMAIL_TOKEN_ENCRYPTION_KEY` | *(misma clave que en local — no cambiar si ya conectaste Gmail en dev)* |

**Importante:** `GOOGLE_REDIRECT_URI` debe ser la URL **de producción**, no `localhost`.

`SUPABASE_SERVICE_ROLE_KEY` — opcional en Vercel (solo se usa en scripts locales).

Tras guardar → **Redeploy** (Deployments → ⋮ → Redeploy).

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

*Última actualización: mayo 2026 — Post-MVP v1 listo para deploy.*
