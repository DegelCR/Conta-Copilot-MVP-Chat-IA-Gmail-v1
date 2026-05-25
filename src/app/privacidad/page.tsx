import type { Metadata } from "next";
import { LegalPageShell } from "@/components/legal-page-shell";
import { getLegalContactLine } from "@/lib/legal/contact";

export const metadata: Metadata = {
  title: "Política de privacidad — Conta Copilot",
  description: "Cómo Conta Copilot trata sus datos personales y de facturación.",
};

const UPDATED = "24 de mayo de 2026";

export default function PrivacidadPage() {
  const contact = getLegalContactLine();

  return (
    <LegalPageShell title="Política de privacidad" updatedAt={UPDATED}>
      <p>
        Conta Copilot («la aplicación», «nosotros») es un servicio web en fase <strong>beta</strong>{" "}
        para organizar facturas y apoyar tareas contables simples. Esta política describe qué datos
        tratamos, con qué fines y qué proveedores intervienen.
      </p>
      <p>
        Al crear una cuenta o usar la aplicación, usted declara haber leído esta política. Si no
        está de acuerdo, no utilice el servicio.
      </p>

      <section>
        <h2 className="text-lg font-semibold text-zinc-900">1. Responsable del tratamiento</h2>
        <p className="mt-2">
          El responsable del tratamiento es el titular del proyecto Conta Copilot (operador del
          servicio en beta). {contact}
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-zinc-900">2. Datos que recopilamos</h2>
        <ul className="mt-2 list-disc space-y-2 pl-5">
          <li>
            <strong>Cuenta:</strong> correo electrónico y credenciales de acceso (gestionadas por
            Supabase Auth).
          </li>
          <li>
            <strong>Facturas:</strong> archivos que usted sube (PDF, imágenes, XML) y metadatos que
            ingresa o que la IA sugiere (proveedor, montos, fechas, categoría, etc.).
          </li>
          <li>
            <strong>Gmail (opcional):</strong> si conecta su cuenta, importamos adjuntos de correos
            que parezcan facturas, con permiso de solo lectura. No leemos ni almacenamos su bandeja
            completa fuera de ese flujo.
          </li>
          <li>
            <strong>Uso técnico:</strong> registros básicos del servidor (errores, seguridad) en la
            medida necesaria para operar el servicio.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-zinc-900">3. Para qué usamos sus datos</h2>
        <ul className="mt-2 list-disc space-y-2 pl-5">
          <li>Autenticarle y mantener su sesión.</li>
          <li>Almacenar y mostrar sus facturas en el panel de revisión y dashboard.</li>
          <li>Extraer datos con IA cuando usted lo solicite (botón «Procesar con IA» o subida).</li>
          <li>Responder preguntas en el chat contable sobre facturas ya confirmadas.</li>
          <li>Generar exportaciones (CSV / Excel) que usted descargue.</li>
          <li>Mejorar estabilidad y seguridad del servicio.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-zinc-900">4. Proveedores que procesan datos</h2>
        <p className="mt-2">
          Para operar la aplicación usamos servicios de terceros que pueden tratar datos en nuestro
          nombre:
        </p>
        <ul className="mt-2 list-disc space-y-2 pl-5">
          <li>
            <strong>Supabase</strong> — base de datos, autenticación y almacenamiento de archivos.
          </li>
          <li>
            <strong>Vercel</strong> — hospedaje de la aplicación web.
          </li>
          <li>
            <strong>OpenAI</strong> — extracción de datos de facturas y chat, solo cuando usted usa
            esas funciones.
          </li>
          <li>
            <strong>Google</strong> — conexión OAuth a Gmail (solo si usted la autoriza).
          </li>
        </ul>
        <p className="mt-2">
          Estos proveedores tienen sus propias políticas de privacidad. Le recomendamos revisarlas si
          desea más detalle.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-zinc-900">5. Conservación</h2>
        <p className="mt-2">
          Conservamos sus datos mientras mantenga una cuenta activa y sea necesario para prestar el
          servicio. Si solicita eliminar su cuenta, procederemos a borrar o anonimizar sus datos en
          un plazo razonable, salvo obligación legal de conservarlos.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-zinc-900">6. Seguridad</h2>
        <p className="mt-2">
          Aplicamos medidas técnicas razonables (cifrado en tránsito HTTPS, aislamiento por usuario
          en base de datos, tokens de Gmail cifrados). Ningún sistema es 100 % seguro; use una
          contraseña fuerte y no comparta su acceso.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-zinc-900">7. Sus derechos</h2>
        <p className="mt-2">
          Usted puede solicitar acceso, rectificación o eliminación de sus datos, y retirar el
          consentimiento de Gmail desconectando la cuenta en la aplicación. {contact}
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-zinc-900">8. Menores de edad</h2>
        <p className="mt-2">
          El servicio no está dirigido a menores de 18 años. No recopilamos datos de menores de forma
          intencional.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-zinc-900">9. Cambios a esta política</h2>
        <p className="mt-2">
          Podemos actualizar este texto. Publicaremos la fecha de revisión en esta página. El uso
          continuado del servicio tras un cambio implica su conocimiento de la versión vigente.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-zinc-900">10. Contacto</h2>
        <p className="mt-2">{contact}</p>
      </section>
    </LegalPageShell>
  );
}
