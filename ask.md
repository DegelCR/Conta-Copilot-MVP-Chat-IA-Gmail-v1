# Ask — Chat Coordinador (Conta Copilot)

> Guía rápida para no enredarte entre chats.  
> Flujo: **Coordinador (Ask) → [Supabase si hay SQL] → Código → pruebas tú → Debug si falla.**

Ruta: `C:\Users\Fran\Desktop\conta-copilot` · Fuente de verdad: [`CONTINUAR.md`](./CONTINUAR.md)

---

## Estado (junio 2026) — listo para piloto

| Área | Estado |
|------|--------|
| MVP + Chat + Gmail | ✅ |
| **Producción Vercel** | ✅ login, Gmail, IA probados |
| **Seguridad (código)** | ✅ tokens Gmail, rate limits, headers — **push + SQL pendiente** |
| **Export Excel** | ✅ en prod |
| **Privacidad / Términos** | ✅ `/privacidad`, `/terminos`, footer |
| **Avisos «no es asesoría fiscal»** | ✅ dashboard, chat, confirmar, landing |
| **Piloto 1 cliente** | ⏳ Checklist *Antes del piloto* en CONTINUAR |
| **Hacienda sin RUT** | ✅ Parser XML CR + consulta emisor API pública |
| **Hacienda sandbox** | ❌ Post-piloto (credenciales contribuyente) |

**URL:** https://conta-copilot-mvp-chat-ia-gmail-v1.vercel.app

---

## Recordatorios rápidos

- **Piloto:** checklist en [`CONTINUAR.md`](./CONTINUAR.md) → *Antes del piloto*; admin en [`docs/MANUAL-ADMIN.md`](./docs/MANUAL-ADMIN.md)
- **Vercel env:** **9 variables** × Production + Preview (incluye `SUPABASE_SERVICE_ROLE_KEY`)
- **Seguridad jun 2026:** push pendiente + `harden-security.sql` en Supabase prod
- **Demo sin OpenAI:** Gmail sync + revisar + Excel; no «Procesar con IA» masivo ni Chat.
- **Alto volumen:** 1 negocio, mes actual, tope ~30–50 IA/mes en piloto.
- **Correo → app hoy:** Gmail OAuth (no reenvío a `facturas@...` — eso es futuro).

---

## Roadmap

| # | Tarea |
|---|--------|
| 1 | Piloto comercial acotado |
| 2 | Revisión legal opcional (abogada) sobre términos |
| 3 | Límites IA por plan / pulido pro |
| 4 | Sandbox Hacienda (credenciales contribuyente) |
| 5 | Subida múltiple en lote (opcional v1.1) |
| 6 | Inbound email, Outlook |

---

## Prompt coordinador

```
Eres mi Agente Coordinador (Ask) de Conta Copilot.
Ruta: C:\Users\Fran\Desktop\conta-copilot
Prod: https://conta-copilot-mvp-chat-ia-gmail-v1.vercel.app
Lee CONTINUAR.md y DEPLOY-VERCEL.md.
Estado: MVP + v1 ✅ en prod. Hacienda 3A (XML + consulta pública) en código. Sandbox Hacienda pendiente RUT. Piloto humano pendiente. Español.
```

---

## Documentación

| Archivo | Uso |
|---------|-----|
| `CONTINUAR.md` | Handoff completo + piloto + límites |
| `DEPLOY-VERCEL.md` | Prod, env vars, errores |
| `docs/MANUAL-USUARIO.md` | Compartir al piloto |
| `docs/MANUAL-ADMIN.md` | Tu checklist activación |
| `public/test-invoices/LEEME.md` | Factura prueba Gmail |
| `docs/HACIENDA-FASE3.md` | Investigación Hacienda: sandbox, APIs, roadmap 3A–3D |
| `src/lib/hacienda/` | Parser XML + API pública `/fe/ae` |
| `public/test-invoices/ejemplo-fe-cr-minimal.xml` | Probar XML sin OpenAI |

---

*Mayo 2026 — prod OK; UX subida/revisión (drag-drop + resumen montos). Piloto y sandbox pendientes.*
