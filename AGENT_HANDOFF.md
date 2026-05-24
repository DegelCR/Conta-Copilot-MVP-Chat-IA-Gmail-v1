# Agent Handoff — Conta Copilot

Documento breve para continuar con otro agente. **La fuente de verdad actualizada es [`CONTINUAR.md`](./CONTINUAR.md)** — léelo completo antes de codear.

---

## Estado rápido (Mayo 2026)

| Área | Estado |
|------|--------|
| MVP completo | ✅ |
| Chat IA (`/dashboard/chat`) | ✅ |
| Gmail v1 (`/dashboard/gmail`) | ✅ **Conectado y verificado** |
| Export CSV | ✅ |
| Deploy Vercel | ⏳ **Siguiente** |
| Export Excel | ⏳ Opcional |
| Hacienda CR | ❌ Fase 3 |

**Supabase ref:** `gufhkxexvqxhnmubmhuq`  
**Ruta:** `C:\Users\Fran\Desktop\conta-copilot`

---

## Flujo Gmail (operativo)

Sincronizar → Facturas pendientes → Procesar con IA → Confirmar → Dashboard / Chat

---

## Siguiente tarea (prioridad)

1. **Deploy Vercel** — prod, env vars, Supabase Site URL, Google OAuth redirect producción
2. Export Excel (opcional)
3. Outlook / cron (v1.1)

Detalle: `CONTINUAR.md` → secciones **Deploy Vercel** y **Flujo operativo Gmail**.

---

## Workflow agentes

Coordinador (Ask) → Código / Supabase / Debug · Ver [`ask.md`](./ask.md)

---

## Reglas

- Español en UI · No pedir API keys en chat · No Hacienda en MVP
- Tras editar `.env.local` → reiniciar `npm run dev`
- Disco lleno → Internal Server Error; liberar espacio + borrar `.next`

---

*Ver CONTINUAR.md para detalle completo.*
