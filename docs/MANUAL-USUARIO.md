# Manual de usuario — Conta Copilot (beta)

Guía simple para quien usa la aplicación en el piloto.  
**Versión web:** https://conta-copilot-mvp-chat-ia-gmail-v1.vercel.app

---

## ¿Qué hace esta herramienta?

- Trae facturas desde su **correo Gmail** (adjuntos PDF o imágenes).
- Las deja en una **lista** para revisar.
- Puede usar **IA** para llenar proveedor y montos (opcional; usted revisa antes de confirmar).
- Muestra un **resumen del mes** (gastos, ingresos, IVA) en el dashboard.
- Permite descargar **Excel** con sus facturas.

## ¿Qué NO hace? (importante)

- **No** es asesoría fiscal, legal ni contable; **no** reemplaza a su contador o abogado.
- **No** envía nada al Ministerio de Hacienda.
- **No** reemplaza su criterio contable: usted **confirma** cada factura.
- **No** procesa miles de facturas solas: la IA va **factura por factura** si la usa.

### Avisos en la app

Verá mensajes en **franja amarilla** (arriba en el dashboard), en el **chat**, al **confirmar** una factura y al pie de la página. Son recordatorios de que la herramienta **organiza facturas** y muestra **estimaciones**; usted debe validar los datos.

Más detalle legal: [Términos de uso](https://conta-copilot-mvp-chat-ia-gmail-v1.vercel.app/terminos) · [Política de privacidad](https://conta-copilot-mvp-chat-ia-gmail-v1.vercel.app/privacidad) (enlaces también en el pie de la app).

---

## 1. Entrar a la aplicación

1. Abra el link en el celular o en la computadora (Chrome o Safari recomendados).
2. Pulse **Crear cuenta** o **Iniciar sesión**.
3. Use su correo y una contraseña (mínimo 6 caracteres).
4. Si el correo pide confirmación, revise la bandeja de entrada.

### Menú en el celular

En pantalla chica verá el logo **Conta Copilot** y un botón **☰** (tres líneas).

- Toque **☰** para ver: **Dashboard**, **Facturas**, **Chat**, **Gmail**.
- Toque la sección que necesite.
- **Cerrar sesión** está al final del menú móvil.

En computadora el menú aparece arriba sin el botón ☰.

---

## 2. Conectar Gmail (recomendado)

1. Menú → **Gmail**.
2. Pulse **Conectar Gmail**.
3. Elija la cuenta de Google donde llegan las facturas.
4. Acepte los permisos (solo lectura del correo).
5. Si Google dice “aplicación en prueba”, es normal en beta: el administrador debe tener su correo autorizado.

### Sincronizar facturas

1. En **Gmail**, pulse **Sincronizar**.
2. La primera vez trae facturas del **mes en curso** (máximo 50 correos por sincronización).
3. Si tiene muchas facturas, puede sincronizar **varias veces** en días distintos.
4. Vaya a **Facturas** → verá ítems en **Pendiente de revisión** (origen Gmail).

**Nota:** Al sincronizar **no** se usa IA automáticamente. Solo se importan los archivos.

---

## 3. Revisar y confirmar una factura

1. Menú → **Facturas**.
2. Abra una factura **Pendiente**.
3. A la izquierda (o arriba en el celular) ve el **documento** (PDF o imagen).
   - **Ampliar vista** → pantalla grande para leer el PDF.
   - **Abrir en pestaña nueva** → si prefiere el visor del navegador.
4. A la derecha están los **datos** (proveedor, fecha, montos, tipo gasto/ingreso, categoría).

### Si quiere usar la IA en esa factura

1. Pulse **Procesar con IA** (si los campos están vacíos o quiere volver a extraer).
2. Espere unos segundos.
3. **Revise** que proveedor, montos y fecha estén correctos.
4. Corrija lo que haga falta.

### Confirmar o rechazar

Antes de confirmar verá un recordatorio: la app **no es asesoría fiscal**.

- **Confirmar factura** → entra al resumen del mes y al Excel.
- **Rechazar** → no suma en totales (factura descartada).

Puede marcar la factura como **Gasto** o **Ingreso** antes de confirmar.

---

## 4. Subir una factura a mano (sin Gmail)

1. Menú → **Dashboard**.
2. En **Subir factura**, elija PDF o imagen (JPG, PNG).
3. La app intentará extraer datos con IA al subir.
4. Vaya a **Facturas** → abra la factura → revise → **Confirmar**.

---

## 5. Ver totales del mes

1. Menú → **Dashboard**.
2. Tarjetas **Ingresos (mes)**, **Gastos (mes)** e **IVA estimado**.
3. Solo cuentan facturas **confirmadas** del mes (según fecha del documento).

---

## 6. Descargar Excel

1. Menú → **Facturas**.
2. (Opcional) Use filtros: estado, tipo, búsqueda por proveedor.
3. Pulse **Descargar Excel** (archivo con columnas ordenadas).
4. **CSV** es alternativa si lo prefiere para otro programa.

---

## 7. Chat (opcional)

1. Menú → **Chat**.
2. Lea el aviso arriba del cuadro de chat (no es asesoría fiscal).
3. Haga preguntas sobre facturas **ya confirmadas** (ej. “¿Cuánto gasté este mes?”).
4. Las respuestas usan solo sus datos confirmados; para **qué declarar ante Hacienda** consulte a su contador.

---

## Consejos para el piloto (3 semanas)

| Recomendación | Por qué |
|---------------|---------|
| Empezar con **un negocio** | Más fácil de validar |
| Solo facturas del **mes actual** | Lo que la app prioriza al conectar Gmail |
| Revisar siempre antes de **Confirmar** | La IA puede equivocarse |
| Usar IA solo donde ahorre tiempo | No hace falta en todas |
| En celular use **☰** para navegar | El menú completo está ahí |

---

## Problemas frecuentes

| Problema | Qué hacer |
|----------|-----------|
| No puedo entrar | Revise correo/contraseña; pruebe “Crear cuenta” si es primera vez |
| Gmail “acceso bloqueado” | Avise al administrador: debe agregar su correo en Google Cloud (usuarios de prueba) |
| No veo facturas tras sincronizar | Espere a que termine; revise **Facturas** → Pendiente; sincronice de nuevo |
| PDF muy pequeño | Use **Ampliar vista** en la revisión de factura |
| No veo menú en el celular | Toque **☰** arriba a la derecha |
| Montos no cuadran | Corrija subtotal, IVA, retención y total en el formulario |

---

## Soporte en el piloto

Contacte a quien le dio el acceso (Francisco / administrador del piloto) con:

- Captura de pantalla del error.
- Qué estaba haciendo (ej. “Sincronizar Gmail”, “Confirmar factura”).
- Correo con el que entró a la app.

---

*Conta Copilot — beta. No es asesoría fiscal ni legal. Sin vínculo con Hacienda. Mayo 2026.*
