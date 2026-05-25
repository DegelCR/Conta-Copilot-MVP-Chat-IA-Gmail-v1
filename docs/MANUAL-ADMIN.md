# Manual de administrador — Activar piloto y soporte

Pasos para **Francisco** (o quien administre Conta Copilot) antes y durante un piloto con un usuario como Don Adriel.

**App en producción:** https://conta-copilot-mvp-chat-ia-gmail-v1.vercel.app

Documentación técnica extra: [`DEPLOY-VERCEL.md`](../DEPLOY-VERCEL.md) · [`CONTINUAR.md`](../CONTINUAR.md)

---

## Resumen: qué debés tener listo

| # | Tarea | Dónde |
|---|--------|--------|
| 1 | App desplegada y en **Ready** | Vercel |
| 2 | 8 variables en **Production** y **Preview** | Vercel → Environment Variables |
| 3 | URLs de auth en Supabase | Supabase Dashboard |
| 4 | Redirect Gmail en Google + **Test users** | Google Cloud Console |
| 5 | Correo del piloto en Test users | Google Cloud |
| 6 | Enviar link + manual de usuario | WhatsApp / correo |
| 7 | Sesión 20–30 min de onboarding | Llamada o presencial |
| 8 | Avisos legales visibles en la app | Franja dashboard, chat, confirmar factura, footer |

---

## 1. Verificar que la app está viva

1. Abrí: https://conta-copilot-mvp-chat-ia-gmail-v1.vercel.app  
2. Debe cargar la página principal.
3. Probá login con tu usuario de prueba.
4. Diagnóstico (opcional):

   ```text
   https://conta-copilot-mvp-chat-ia-gmail-v1.vercel.app/api/debug/env
   ```

   Debe mostrar `supabaseUrlConfigured: true`, `supabaseAnonConfigured: true`, `anonLooksValid: true`.

Si falla → sección **Problemas** al final.

---

## 2. Variables en Vercel (si cambiás algo)

**Proyecto:** https://vercel.com/degel-cr-s-projects/conta-copilot-mvp-chat-ia-gmail-v1  
**Settings → Environment Variables**

Repetí las **8 variables** en pestaña **Production** y otra vez en **Preview** (mismo valor).

| Variable | Valor producción |
|----------|------------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://gufhkxexvqxhnmubmhuq.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clave anon completa (`eyJ...`) — **no** `NEXT_PUBLIC_SUPABASE_ANON` |
| `OPENAI_API_KEY` | Tu clave OpenAI |
| `NEXT_PUBLIC_APP_URL` | `https://conta-copilot-mvp-chat-ia-gmail-v1.vercel.app` |
| `GOOGLE_CLIENT_ID` | Google Cloud OAuth |
| `GOOGLE_CLIENT_SECRET` | Google Cloud OAuth |
| `GOOGLE_REDIRECT_URI` | `https://conta-copilot-mvp-chat-ia-gmail-v1.vercel.app/api/gmail/callback` |
| `GMAIL_TOKEN_ENCRYPTION_KEY` | **La misma** de tu `.env.local` (no generar una nueva si ya hay tokens guardados) |

Después de cambiar → **Deployments → ⋮ → Redeploy**.

---

## 3. Supabase (login del piloto)

1. https://supabase.com/dashboard → proyecto `gufhkxexvqxhnmubmhuq`
2. **Authentication → URL Configuration**

| Campo | Valor |
|-------|--------|
| **Site URL** | `https://conta-copilot-mvp-chat-ia-gmail-v1.vercel.app` |
| **Redirect URLs** | `https://conta-copilot-mvp-chat-ia-gmail-v1.vercel.app/auth/callback` |

3. (Opcional) Si querés crearle cuenta vos: **Authentication → Users → Add user** con su correo.  
   Si no, el piloto usa **Crear cuenta** en la app.

---

## 4. Google Cloud (Gmail del piloto) — **paso crítico**

Sin esto, Gmail dirá “access blocked” o similar.

1. https://console.cloud.google.com/
2. Mismo proyecto donde creaste OAuth para Conta Copilot.
3. **APIs & Services → OAuth consent screen**
   - Modo **Testing** (normal en beta).
   - **Test users → Add users** → correo Gmail del piloto (el que usará para conectar).
4. **APIs & Services → Credentials →** tu cliente OAuth (Web)
   - **Authorized redirect URIs** debe incluir:

     ```text
     https://conta-copilot-mvp-chat-ia-gmail-v1.vercel.app/api/gmail/callback
     ```

5. Confirmá en Vercel que `GOOGLE_REDIRECT_URI` es **exactamente** esa URL.

---

## 5. Antes de escribirle al piloto

- [ ] App abre y vos podés entrar.
- [ ] Correo del piloto está en **Google Test users**.
- [ ] Tenés el link copiado.
- [ ] Enviás (opcional) [`MANUAL-USUARIO.md`](./MANUAL-USUARIO.md) o un PDF/resumen.
- [ ] Acordás: **1 negocio**, **mes actual**, **3 semanas**, feedback honesto.

### Mensaje sugerido (WhatsApp)

Adaptá el tono (usted/vos). Incluí:

- Link de la app.
- Beta, sin Hacienda, **no es asesoría fiscal** (organiza facturas; el contador valida).
- IA opcional; él/ella revisa todo.
- Ofrecé 20–30 min para conectar Gmail.
- Enlaces legales: `/terminos` y `/privacidad`.

---

## 6. Sesión de onboarding (20–30 min) — guion

### A. Cuenta (5 min)

1. Piloto abre el link en celular o PC.
2. **Crear cuenta** con su correo (o login si ya la creaste en Supabase); acepta términos en el registro.
3. Entra al **Dashboard** — mostrá la **franja amarilla** de aviso legal (normal en beta).

### B. Menú móvil (2 min si es celular)

1. Mostrá el botón **☰**.
2. Recorrido: Dashboard → Facturas → Gmail → Chat.

### C. Gmail (10 min)

1. **Gmail → Conectar Gmail**.
2. Cuenta donde llegan facturas de **ese negocio** (piloto).
3. Autorizar.
4. **Sincronizar** una vez.
5. **Facturas →** abrir una pendiente.
6. Mostrar **Ampliar vista** en un PDF.
7. (Opcional) **Procesar con IA** en **1–2** facturas solamente — no en todas si hay muchas.
8. **Confirmar** una factura.
9. Volver al **Dashboard** → ver que cambió un total.

### D. Excel (3 min)

1. **Facturas → Descargar Excel**.
2. Abrir el archivo y validar que los datos confirmados aparecen.

### E. Cierre (5 min)

Preguntas para anotar:

- ¿Le ahorró tiempo vs solo correo?
- ¿Confiaría en los montos de la IA o siempre revisaría?
- ¿Qué negocio usaría en el piloto?
- ¿Qué le faltó?

---

## 7. Durante el piloto — tu rol

| Hacé | Evitá |
|------|--------|
| Responder dudas en WhatsApp | Prometer Hacienda, XML oficial o “asesoría fiscal” del producto |
| Agregar Test users si cambia de correo Gmail | Que procesen 200+ facturas con IA el día 1 |
| Revisar uso OpenAI (platform.openai.com → Usage) | Compartir tu `.env.local` o claves |
| Pedir feedback a la semana 2 | Cambiar `GMAIL_TOKEN_ENCRYPTION_KEY` en Vercel sin avisar |

### Demo sin gastar mucho OpenAI

- Gmail **Sincronizar** + revisar + **Confirmar** manual (sin IA).
- IA solo en pocas facturas de ejemplo.
- No abrir **Chat** en masa.

### Si tiene muchísimas facturas

- Acotá: **un negocio**, **mes actual**.
- Varias **Sincronizar** (50 correos por vez).
- IA solo donde realmente ahorre tiempo.

---

## 8. Costos que vos llevás (referencia)

| Servicio | Nota |
|----------|------|
| OpenAI | Crédito inicial ~USD 5; cada IA consume según facturas |
| Google Cloud | ~USD 10 cuenta; Gmail API suele USD 0 en piloto |
| Vercel / Supabase | USD 0 en uso bajo |

Precio piloto sugerido (opcional): gratis 1.er mes a cambio de feedback, o USD 10–18/mes simbólico.

---

## 9. Actualizar la app (nuevo código)

Cuando subís cambios a GitHub (`master`), Vercel despliega solo.

```powershell
cd C:\Users\Fran\Desktop\conta-copilot
git add .
git commit -m "Descripción del cambio"
git push origin master
```

Esperá deploy **Ready** antes de decirle al piloto que “ya está arreglado”.

---

## 10. Problemas frecuentes (soporte)

| Síntoma | Causa probable | Qué hacer vos |
|---------|----------------|---------------|
| No puede entrar | Site URL Supabase | Revisar paso 3 |
| Login / pantalla en blanco | Variable `ANON_KEY` mal en Vercel | Corregir nombre y redeploy |
| Gmail bloqueado | Correo no en Test users | Agregar en Google paso 4 |
| Gmail redirect error | URI distinta Google vs Vercel | Alinear URIs exactas |
| Build falló en Vercel | Env vars faltantes | 8 variables + redeploy |
| IA no hace nada | Sin crédito OpenAI | Recargar en OpenAI |
| No ve menú en celular | No conoce ☰ | Enviar manual usuario §1 |

---

## 11. Enlaces útiles

| Qué | URL |
|-----|-----|
| App | https://conta-copilot-mvp-chat-ia-gmail-v1.vercel.app |
| Vercel | https://vercel.com/degel-cr-s-projects/conta-copilot-mvp-chat-ia-gmail-v1 |
| Supabase | https://supabase.com/dashboard/project/gufhkxexvqxhnmubmhuq |
| Google Cloud | https://console.cloud.google.com/ |
| OpenAI usage | https://platform.openai.com/usage |
| Manual usuario (compartir) | `docs/MANUAL-USUARIO.md` |
| Términos de uso | https://conta-copilot-mvp-chat-ia-gmail-v1.vercel.app/terminos |
| Privacidad | https://conta-copilot-mvp-chat-ia-gmail-v1.vercel.app/privacidad |
| Factura prueba HTML | https://conta-copilot-mvp-chat-ia-gmail-v1.vercel.app/test-invoices/factura-prueba-gmail.html |

---

## 12. Aviso legal en la app (beta básica)

Textos centralizados en código: `src/lib/legal/disclaimer.ts` · componente `FiscalDisclaimer`.

| Dónde | Qué ve el usuario |
|-------|-------------------|
| Dashboard (layout) | Franja ámbar arriba |
| Chat | Aviso dentro del panel |
| Confirmar factura | Línea antes de los botones |
| Landing + footer | Texto compacto |
| Términos (`/terminos`) | Naturaleza del servicio ampliada |

**Revisión profesional (opcional):** un abogado puede revisar términos y textos antes de escalar comercialmente; para el piloto esto deja claro que es herramienta de organización, no despacho virtual.

Variable opcional en Vercel: `NEXT_PUBLIC_CONTACT_EMAIL` (correo en páginas legales).

---

*Última actualización: mayo 2026 — commits `da70b09` (privacidad/términos), `5664b40` (avisos fiscales en UI).*
