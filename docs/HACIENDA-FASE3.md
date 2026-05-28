# Hacienda CR — investigación fase 3 (borrador)

> **Estado:** investigación previa al piloto. No implementar hasta validar alcance con un contador (p. ej. Don Adriel) y, si aplica, revisión legal.
>
> **Última revisión:** mayo 2026 · esquema vigente **v4.4**

---

## Resumen en una frase

Hacienda expone **dos mundos distintos**: una API pública de **consulta** (`api.hacienda.go.cr`) y otra de **comprobantes electrónicos** con **sandbox** (`api.comprobanteselectronicos.go.cr`). Conta Copilot encaja primero como **organizador/receptor** (leer XML y validar); **emitir** facturas es otro proyecto mucho más pesado (certificado digital, firma, consecutivos).

---

## 1. Dos APIs — no confundirlas

| API | URL base | Para qué sirve | ¿Sandbox? |
|-----|----------|----------------|-----------|
| **API pública Hacienda** | `https://api.hacienda.go.cr` | Consultar contribuyente (`/fe/ae`), **CABYS**, tipo de cambio, exoneraciones | No — datos reales con **límites** (429 si abusás) |
| **API comprobantes electrónicos** | `https://api.comprobanteselectronicos.go.cr` | **Enviar** XML firmado, **consultar estado** de una clave de 50 dígitos, aceptación/rechazo (Mensaje Receptor) | **Sí** — ver tabla abajo |

Documentación consulta: [api.hacienda.go.cr/docs](https://api.hacienda.go.cr/docs)  
Soporte técnico (según esa doc): `facturati@hacienda.go.cr`

Esquemas XML v4.4: [ATV — Anexos y Estructuras](https://atv.hacienda.go.cr/ATV/ComprobanteElectronico/frmAnexosyEstructuras.aspx)  
PDF anexos v4.4 (referencia en repo): enlace en `CONTINUAR.md` sección *Facturación Costa Rica*.

---

## 2. Sandbox de comprobantes electrónicos

Fuente comunitaria alineada con integradores CR ([CRLibre — URLs API](https://crlibre.org/preguntas/url-de-api-de-comprobantes-electronicos/)):

| Concepto | Pruebas (staging) | Producción |
|----------|-------------------|------------|
| Recepción REST | `https://api.comprobanteselectronicos.go.cr/recepcion-sandbox/v1/` | `https://api.comprobanteselectronicos.go.cr/recepcion/v1/` |
| Token OAuth2 | `https://idp.comprobanteselectronicos.go.cr/auth/realms/rut-stag/protocol/openid-connect/token` | `.../realms/rut/protocol/openid-connect/token` |
| Client ID | `api-stag` | `api-prod` |
| Realm | `rut-stag` | `rut` |

**Credenciales:** usuario/contraseña del **ATV** asociados a la identificación del contribuyente de prueba (cédula jurídica o física). En sandbox se usan contribuyentes habilitados para staging — no es “API key” como OpenAI.

**Firma:** los XML deben ir firmados **XAdES-EPES** con certificado **.p12** (emitido por un proveedor autorizado en CR). Sin .p12 no hay envío real ni a sandbox ni a producción.

---

## 3. Qué pide Hacienda para facturación electrónica (checklist)

### Registro (persona / empresa)

1. Cuenta en **ATV**: https://atv.hacienda.go.cr  
2. En **RUT**, método de facturación: **Factura Electrónica (Emisor-Receptor Electrónico)** si van a emitir y recibir electrónicamente.  
   - Solo **Receptor** aplica a casos específicos (p. ej. extranjeros que compran en CR pero no venden).
3. Certificado de firma digital (.p12) vigente.
4. Definir **sucursales / puntos de venta / consecutivos** según resoluciones (DGT).

### Técnico (por cada comprobante)

- XML según **v4.4** (FE, TE, NC, ND, FEE, REP, etc.).
- **Clave** de 50 dígitos (generada con reglas de Hacienda).
- **NumeroConsecutivo** (20 dígitos).
- Emisor/receptor: identificación, nombre, actividad económica, ubicación.
- Líneas con **CABYS**, impuestos, totales en `ResumenFactura`.
- Firma XAdES → envío → polling de estado (`aceptado`, `rechazado`, etc.).

Para **solo organizar facturas que ya recibís** (PDF/XML del proveedor), el mínimo es distinto: parsear XML entrante y opcionalmente consultar estado por clave — **no** hace falta emitir al inicio.

---

## 4. Encaje con Conta Copilot (recomendado)

Hoy la app: Gmail/manual → revisión → confirmar → dashboard / Excel. **No** sustituye asesoría ni Hacienda.

### Fase 3A — Lectura XML (sin sandbox de envío) — **parcial en app**

**Objetivo:** si el adjunto es XML v4.4, llenar automáticamente `vendor`, `invoice_number`, clave, cédulas, montos, tipo comprobante.

| Tarea | Estado |
|-------|--------|
| Parser XML v4.x → campos `invoices` (`src/lib/hacienda/parse-cr-xml.ts`) | ✅ |
| Metadatos en `raw_ai_json.hacienda` (clave, tipo, cédula emisor) | ✅ |
| XML de prueba `public/test-invoices/ejemplo-fe-cr-minimal.xml` | ✅ |
| Consulta emisor API pública `/fe/ae` en revisión de factura | ✅ |
| Subida XML + fallback OpenAI si no reconoce el XML | ✅ |

**Prueba:** subir `ejemplo-fe-cr-minimal.xml` en dashboard (sin credenciales RUT).

### Fase 3B — Consultas API pública (sin .p12)

**Objetivo:** enriquecer revisión — validar cédula del emisor, buscar CABYS, tipo de cambio.

| Endpoint | Uso en Copilot |
|----------|----------------|
| `GET /fe/ae?identificacion=` | Nombre y situación tributaria del proveedor |
| `GET /fe/cabys?codigo=` o `?q=` | Validar líneas si parseamos detalle |
| `GET /indicadores/tc/dolar` | Si moneda USD |

**Cuidado:** cache local y pocos requests (límites 429 documentados).

### Fase 3C — Sandbox comprobantes (receptor / estado)

**Objetivo:** dado una **clave** de 50 dígitos, consultar estado en sandbox; a futuro **Mensaje Receptor** (aceptar/rechazar compras).

| Tarea | Esfuerzo | Dependencias |
|-------|----------|--------------|
| OAuth contra `rut-stag` | Medio | Credenciales ATV staging |
| Consulta estado por clave | Medio | Token + REST |
| Mensaje Receptor | Alto | Flujo contable con contador |

### Fase 3D — Emisión (solo si el producto lo pide)

Emitir FE/TE desde Conta Copilot implica: generación XML, clave, consecutivos, firma .p12, envío, errores Hacienda, notas de crédito, etc. **Es un producto aparte** o módulo premium. Para el piloto actual **no** es necesario.

---

## 5. Herramientas de referencia (no oficial del MH)

| Recurso | Notas |
|---------|--------|
| [CRLibre/API_Hacienda](https://github.com/CRLibre/API_Hacienda) | PHP, v4.4, self-hosted; muchos integradores CR lo usan de puente |
| [@hacienda-cr/sdk](https://www.npmjs.com/package/@hacienda-cr/sdk) / [hacienda-cr](https://github.com/DojoCodingLabs/hacienda-cr) | TypeScript, sandbox + prod, firma, CLI — útil si seguís en Node |
| Esquemas ATV v4.4 | Fuente de verdad para campos |

**Estrategia sugerida para este repo (Next.js):**  
- 3A–3B en código propio o parser XML + `fetch` a `api.hacienda.go.cr`.  
- 3C evaluar **SDK TS** o microservicio CRLibre si el sandbox OAuth se complica.

---

## 6. Plan sugerido “en unas semanas”

| Semana | Actividad | Entregable |
|--------|-----------|------------|
| 0 | **3A en app** (hecho): parser XML, panel fiscal, `/fe/ae` | `src/lib/hacienda/`, `ejemplo-fe-cr-minimal.xml` |
| 1 | Probar en prod tras deploy; XML reales del piloto (con permiso) | Feedback parser |
| 1 | Conseguir credenciales **pruebas** (contribuyente con RUT, ej. familiar) | Usuario/clave + .p12 pruebas |
| 2 | Token sandbox + consulta estado por clave (**3C**) | Integración o CRLibre/SDK |
| 3+ | Emisión (**3D**) o Mensaje Receptor | Solo si hay demanda |

**No bloquear el piloto actual:** el valor del piloto sigue siendo Gmail + revisión + Excel **sin** Hacienda.

---

## 7. Riesgos y expectativas

| Tema | Detalle |
|------|---------|
| Legal | Emisión y aceptación electrónica tienen efectos tributarios; coordinar con CPA colegiado |
| Certificados | .p12 vence; renovación y custodia segura (nunca en Git) |
| Alcance | “Integración Hacienda” para usuarios suele significar **recibir y validar**, no emitir |
| API pública | Abuso → bloqueo IP; cache obligatorio |
| v4.4 | Mantener ojo en ATV por nuevas versiones |

---

## 8. Variables de entorno (futuro, no añadir aún)

```env
# Solo cuando implementes fase 3C+
HACIENDA_ENV=sandbox
HACIENDA_ID_TYPE=02
HACIENDA_ID_NUMBER=
HACIENDA_ATV_PASSWORD=
HACIENDA_P12_PATH=
HACIENDA_P12_PIN=
```

Nunca commitear `.p12` ni contraseñas ATV.

---

## 9. Enlaces rápidos

| Recurso | URL |
|---------|-----|
| API consulta MH | https://api.hacienda.go.cr/docs/ |
| ATV login | https://atv.hacienda.go.cr/ATV/Login.aspx |
| Anexos / XML | https://atv.hacienda.go.cr/ATV/ComprobanteElectronico/frmAnexosyEstructuras.aspx |
| Sandbox recepción | https://api.comprobanteselectronicos.go.cr/recepcion-sandbox/v1/ |
| URLs staging/prod (CRLibre) | https://crlibre.org/preguntas/url-de-api-de-comprobantes-electronicos/ |
| Conta Copilot prod | https://conta-copilot-mvp-chat-ia-gmail-v1.vercel.app |

---

*Documento de planificación. Actualizar cuando empiece implementación o tras feedback del piloto / abogada / contador.*
