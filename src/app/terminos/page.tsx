import type { Metadata } from "next";
import { LegalPageShell } from "@/components/legal-page-shell";
import { getLegalContactLine } from "@/lib/legal/contact";

export const metadata: Metadata = {
  title: "Términos de uso — Conta Copilot",
  description: "Condiciones de uso del servicio Conta Copilot en fase beta.",
};

const UPDATED = "24 de mayo de 2026";

export default function TerminosPage() {
  const contact = getLegalContactLine();

  return (
    <LegalPageShell title="Términos de uso" updatedAt={UPDATED}>
      <p>
        Estos términos regulan el acceso y uso de Conta Copilot («el servicio»), una aplicación web
        en <strong>beta</strong> para organizar facturas. Al registrarse o usar el servicio, usted
        acepta estos términos.
      </p>

      <section>
        <h2 className="text-lg font-semibold text-zinc-900">1. Naturaleza del servicio</h2>
        <ul className="mt-2 list-disc space-y-2 pl-5">
          <li>
            El servicio ayuda a <strong>organizar facturas</strong>, extraer datos con IA bajo su
            revisión y generar resúmenes o exportaciones.
          </li>
          <li>
            <strong>No</strong> es un sistema oficial de facturación electrónica ni está integrado
            con el Ministerio de Hacienda de Costa Rica.
          </li>
          <li>
            <strong>No</strong> sustituye asesoría contable, fiscal o legal profesional.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-zinc-900">2. Cuenta y uso aceptable</h2>
        <p className="mt-2">Usted se compromete a:</p>
        <ul className="mt-2 list-disc space-y-2 pl-5">
          <li>Proporcionar información veraz en el registro.</li>
          <li>Mantener la confidencialidad de su contraseña.</li>
          <li>Usar el servicio solo con facturas y datos que tenga derecho a tratar.</li>
          <li>No intentar acceder a datos de otros usuarios ni vulnerar la seguridad del sistema.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-zinc-900">3. Inteligencia artificial</h2>
        <p className="mt-2">
          La IA puede equivocarse al leer facturas. Usted debe <strong>revisar y confirmar</strong>{" "}
          cada documento antes de confiar en los totales del dashboard o exportaciones. Usted es
          responsable de los datos que confirma.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-zinc-900">4. Conexión con Gmail</h2>
        <p className="mt-2">
          Si conecta Gmail, autoriza un acceso de solo lectura para importar adjuntos relevantes.
          Puede desconectar en cualquier momento desde la aplicación. El servicio puede dejar de
          sincronizar si Google revoca permisos o cambian las políticas de su cuenta.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-zinc-900">5. Beta y disponibilidad</h2>
        <p className="mt-2">
          El servicio se ofrece «tal cual», sin garantía de disponibilidad ininterrumpida. Podemos
          modificar funciones, suspender el acceso o terminar la beta con aviso razonable cuando sea
          posible.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-zinc-900">6. Limitación de responsabilidad</h2>
        <p className="mt-2">
          En la máxima medida permitida por la ley, no seremos responsables por daños indirectos,
          pérdida de beneficios o decisiones tomadas solo con base en datos extraídos por IA sin
          revisión humana. El uso del servicio es bajo su propio riesgo en esta fase beta.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-zinc-900">7. Privacidad</h2>
        <p className="mt-2">
          El tratamiento de datos personales se describe en nuestra{" "}
          <a href="/privacidad" className="font-medium text-emerald-700 hover:underline">
            Política de privacidad
          </a>
          .
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-zinc-900">8. Contacto</h2>
        <p className="mt-2">{contact}</p>
      </section>
    </LegalPageShell>
  );
}
