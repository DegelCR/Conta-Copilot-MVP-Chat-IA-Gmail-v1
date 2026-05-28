# Facturas de prueba — Conta Copilot

## URL en producción

https://conta-copilot-mvp-chat-ia-gmail-v1.vercel.app/test-invoices/factura-prueba-gmail.html

## Probar Gmail (sync desde correo)

1. Abre `factura-prueba-gmail.html` en el navegador.
2. **Ctrl+P** → **Guardar como PDF**.
3. En Gmail: redacta un correo a tu bandeja (ej. `franciscojavier.gonzalez5@gmail.com`) con asunto `Factura prueba Conta Copilot` y adjunta el PDF.
4. En la app (prod o local): **Gmail** → **Sincronizar** → **Facturas** → pendiente → **Procesar con IA** → **Confirmar**.

## Probar subida manual

Dashboard → **Subir factura** → selecciona el PDF.

## Probar XML electrónico CR (sin OpenAI)

1. Subí `ejemplo-fe-cr-minimal.xml` desde el dashboard.
2. La app intenta leer el XML directamente (sin gastar crédito OpenAI).
3. En la revisión verás **Datos fiscales (Costa Rica)** y podés **Consultar emisor** en la API pública de Hacienda.

## Datos de la factura de prueba (IA)

- Proveedor: Distribuidora El Roble S.A.
- Total: ₡438 450 (subtotal, IVA 13 %, retención 2 %)
- Documento ficticio — no válido fiscalmente
