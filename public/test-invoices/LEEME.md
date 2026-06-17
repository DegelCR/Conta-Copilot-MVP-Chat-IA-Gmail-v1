# Facturas de prueba — Conta Copilot

## URL en producción

https://conta-copilot-mvp-chat-ia-gmail-v1.vercel.app/test-invoices/factura-prueba-gmail.html

## Probar Gmail (sync desde correo)

1. Abre `factura-prueba-gmail.html` en el navegador.
2. **Ctrl+P** → **Guardar como PDF**.
3. En Gmail: redacta un correo a tu bandeja (ej. `franciscojavier.gonzalez5@gmail.com`) con asunto `Factura prueba Conta Copilot` y adjunta el PDF.
4. En la app (prod o local): **Gmail** → **Sincronizar** → **Facturas** → pendiente → **Procesar con IA** → **Confirmar**.

## Probar subida manual

1. Dashboard → **Subir factura**.
2. Elegí **Tipo: Gasto** o **Ingreso**.
3. Arrastrá **un** archivo a la zona punteada o hacé clic para elegirlo (PDF o `ejemplo-fe-cr-minimal.xml`).
4. **Subir factura** → en revisión, ver **Resumen de montos** arriba del formulario.

## Probar XML electrónico CR (sin OpenAI)

1. Subí `ejemplo-fe-cr-minimal.xml` desde el dashboard.
2. La app intenta leer el XML directamente (sin gastar crédito OpenAI).
3. En la revisión: **Resumen de montos** (total ₡113 000 en el ejemplo) + **Datos fiscales (Costa Rica)**; podés **Consultar emisor** (cédula de ejemplo: `3101123456`).

**No uses** `FacturaElectronica_V4.4.xsd.xml` — es el esquema XSD, no una factura electrónica.

## Datos de la factura de prueba (IA)

- Proveedor: Distribuidora El Roble S.A.
- Total: ₡438 450 (subtotal, IVA 13 %, retención 2 %)
- Documento ficticio — no válido fiscalmente
