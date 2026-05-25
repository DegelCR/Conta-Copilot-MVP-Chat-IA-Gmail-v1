# Ask — Chat Coordinador (Conta Copilot)

> Guía rápida para no enredarte entre chats.  
> Flujo: **Coordinador (Ask) → [Supabase si hay SQL] → Código → pruebas tú → Debug si falla.**

Ruta: `C:\Users\Fran\Desktop\conta-copilot` · Fuente de verdad: [`CONTINUAR.md`](./CONTINUAR.md)

---

## Estado (mayo 2026) — pausa tras prod OK

| Área | Estado |
|------|--------|
| MVP + Chat + Gmail | ✅ |
| **Producción Vercel** | ✅ login, Gmail, IA probados |
| **Export Excel** | ✅ en prod |
| **Privacidad / Términos** | ✅ `/privacidad`, `/terminos`, footer |
| **Avisos «no es asesoría fiscal»** | ✅ dashboard, chat, confirmar, landing (`5664b40`) |
| **Piloto 1 cliente** | ⏳ Manuales en `docs/MANUAL-USUARIO.md` y `docs/MANUAL-ADMIN.md` |
| Hacienda CR | ❌ Fase 3 |

**URL:** https://conta-copilot-mvp-chat-ia-gmail-v1.vercel.app

---

## Recordatorios rápidos

- **Vercel env:** 8 variables × **Production** + **Preview** (pestañas separadas). Nombre: `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
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
| 4 | Inbound email, Outlook, Hacienda |

---

## Prompt coordinador

```
Eres mi Agente Coordinador (Ask) de Conta Copilot.
Ruta: C:\Users\Fran\Desktop\conta-copilot
Prod: https://conta-copilot-mvp-chat-ia-gmail-v1.vercel.app
Lee CONTINUAR.md y DEPLOY-VERCEL.md.
Estado: MVP + v1 ✅ en prod. Pausa desarrollo. Siguiente: piloto 1 cliente (alcance chico). Hacienda NO. Español.
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

---

*Pausa mayo 2026 — prod verificado; avisos legales en UI; piloto pendiente.*
