# Agent Handoff — Conta Copilot

**Fuente de verdad:** [`CONTINUAR.md`](./CONTINUAR.md) · **Deploy:** [`DEPLOY-VERCEL.md`](./DEPLOY-VERCEL.md)

---

## Estado (mayo 2026) — pausa

| Área | Estado |
|------|--------|
| Producción | ✅ https://conta-copilot-mvp-chat-ia-gmail-v1.vercel.app |
| Login + Gmail + IA en prod | ✅ verificado por el usuario |
| Export Excel | ✅ en prod |
| Legal / avisos fiscales | ✅ `da70b09`, `5664b40` |
| Piloto comercial | ⏳ siguiente paso humano |
| Hacienda 3A (XML + API pública) | ✅ en prod (`898705a`) |
| Tipo Gasto/Ingreso al subir | ✅ (`e8d7aeb`) |
| Registro manual sin archivo (dashboard) | ✅ (`0826f6e`) |
| Categorías personalizadas (texto libre) | ✅ (`23ea271`) · SQL `add-custom-categories.sql` |
| Subida: drag-and-drop (1 archivo) + resumen montos en revisión | ✅ código local; deploy pendiente si prod no lo tiene |
| Hacienda sandbox | ❌ credenciales contribuyente |

**Git:** `master` · último `23ea271`

---

## Piloto (resumen)

- 1 negocio, mes actual, 2–4 semanas.
- Valor: ordenar correo + Excel; Hacienda no; no es asesoría fiscal (avisos en UI).
- IA opcional; demo sin IA = solo sync + revisión.
- Contacto con muchas facturas: acotar o solo importar sin IA masiva.

---

## Costos referencia

- OpenAI: USD 5 crédito inicial.
- Google Cloud: USD 10 (cuenta); Gmail API ~0 en piloto.

---

## Al retomar

1. Ofrecer piloto / feedback.
2. Ofrecer piloto; probar XML `ejemplo-fe-cr-minimal.xml`.
3. Sandbox Hacienda cuando haya credenciales de prueba (RUT contribuyente).
3. Código futuro: límites IA, **subida múltiple en lote**, inbound email (reenvío).

---

*Pausa tras prod OK — mayo 2026.*
