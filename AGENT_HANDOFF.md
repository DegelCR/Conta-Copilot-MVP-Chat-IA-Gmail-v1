# Agent Handoff — Conta Copilot

**Fuente de verdad:** [`CONTINUAR.md`](./CONTINUAR.md) · **Deploy:** [`DEPLOY-VERCEL.md`](./DEPLOY-VERCEL.md)

---

## Estado (mayo 2026) — pausa

| Área | Estado |
|------|--------|
| Producción | ✅ https://conta-copilot-mvp-chat-ia-gmail-v1.vercel.app |
| Login + Gmail + IA en prod | ✅ verificado por el usuario |
| Export Excel | ✅ código local; verificar push a `master` |
| Piloto comercial | ⏳ siguiente paso humano |
| Hacienda | ❌ fase 3 |

**Git:** `master` · deploy `db9df67` · cambios locales sin commit (docs, Excel, test-invoices)

---

## Piloto (resumen)

- 1 negocio, mes actual, 2–4 semanas.
- Valor: ordenar correo + Excel; Hacienda no.
- IA opcional; demo sin IA = solo sync + revisión.
- Contacto con muchas facturas: acotar o solo importar sin IA masiva.

---

## Costos referencia

- OpenAI: USD 5 crédito inicial.
- Google Cloud: USD 10 (cuenta); Gmail API ~0 en piloto.

---

## Al retomar

1. Ofrecer piloto / feedback.
2. `git status` → push Excel + markdown + `public/test-invoices/`.
3. Código futuro: límites IA, IA en lote, inbound email (reenvío).

---

*Pausa tras prod OK — mayo 2026.*
