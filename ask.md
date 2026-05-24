# Ask — Chat Coordinador (Conta Copilot)

> Guía rápida para no enredarte entre chats.  
> Flujo: **Coordinador (Ask) → [Supabase si hay SQL] → Código → pruebas tú → Debug si falla.**

Ruta: `C:\Users\Fran\Desktop\conta-copilot` · Fuente de verdad: [`CONTINUAR.md`](./CONTINUAR.md)

---

## Estado del producto (Mayo 2026)

| Área | Estado |
|------|--------|
| MVP (auth, facturas, IA, dashboard, CSV) | ✅ |
| Chat IA `/dashboard/chat` | ✅ |
| Gmail v1 `/dashboard/gmail` | ✅ **Conectado y verificado** |
| SQL Supabase (incl. `add-gmail.sql`) | ✅ |
| `.env.local` Google + `GMAIL_TOKEN_ENCRYPTION_KEY` | ✅ |
| **Deploy Vercel** | ⏳ **En curso** — ver [`DEPLOY-VERCEL.md`](./DEPLOY-VERCEL.md) |
| Export Excel | ⏳ Opcional |
| Outlook / cron sync | ⏳ v1.1 |
| Hacienda CR v2 | ❌ Fuera de scope |

---

## Después de conectar Gmail (flujo diario)

1. **Sincronizar** en `/dashboard/gmail`
2. **Facturas** → pendiente de revisión (origen Gmail)
3. **Procesar con IA** → **Confirmar** / Rechazar
4. **Dashboard** → ver totales del mes
5. **Chat** → preguntas sobre confirmadas

---

## Roles de cada chat

| Chat | Regla Cursor | Modo | Cuándo |
|------|--------------|------|--------|
| **Coordinador** | `agente-preguntas` | **Ask** | Fijo — planificar aquí |
| **Código** | `agente-codigo` | Agent | 1 chat por feature |
| **Supabase** | `agente-supabase` | Agent | 1 chat por migración SQL |
| **Debug** | `agente-debug` | Agent | Errores / build / OAuth |

---

## Errores frecuentes (referencia)

| Error | Solución |
|-------|----------|
| `GMAIL_TOKEN_ENCRYPTION_KEY` | Generar clave → `.env.local` → reiniciar dev |
| Internal Server Error / login colgado | Disco lleno → liberar espacio → borrar `.next` → reiniciar dev |
| OAuth redirect mismatch | URI exacta en Google Cloud |
| 0 facturas importadas | ¿Adjuntos PDF/XML **este mes**? |

Generar clave (PowerShell):

```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

---

## Siguiente paso (roadmap)

| # | Tarea | Agente |
|---|--------|--------|
| **1** | **Deploy Vercel** — ver [`DEPLOY-VERCEL.md`](./DEPLOY-VERCEL.md) | Tú + Vercel |
| 2 | Export Excel (opcional) | Código |
| 3 | Outlook / cron | Código v1.1 |
| 4 | Hacienda CR | — (fase 3) |

Checklist deploy: ver [`DEPLOY-VERCEL.md`](./DEPLOY-VERCEL.md) (guía paso a paso).

---

## Prompt coordinador (chat nuevo Ask)

```
Eres mi Agente Coordinador (Ask) de Conta Copilot.
Ruta: C:\Users\Fran\Desktop\conta-copilot
Lee CONTINUAR.md y AGENTES.md.
MVP ✅ + Post-MVP v1 ✅ (Gmail verificado). Siguiente: deploy Vercel → Excel opcional. Hacienda v2 fuera de scope. Español.
```

Prompts completos: [`PROMPTS-AGENTES.md`](./PROMPTS-AGENTES.md)

---

## Archivos de documentación

| Archivo | Uso |
|---------|-----|
| `CONTINUAR.md` | Estado técnico completo |
| `ask.md` | Esta guía (coordinador) |
| `AGENTES.md` | Mapa de agentes + prompts |
| `PROMPTS-AGENTES.md` | Copy-paste para ejecutores |
| `AGENT_HANDOFF.md` | Resumen ultra corto |

---

*Última actualización: Gmail conectado y verificado. Siguiente: deploy Vercel.*
