import { LegalFooter } from "@/components/legal-footer";
import { FiscalDisclaimer } from "@/components/fiscal-disclaimer";

export const dynamic = "force-dynamic";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full flex-col">
      <div className="flex-1">
        <FiscalDisclaimer variant="banner" />
        {children}
      </div>
      <LegalFooter />
    </div>
  );
}
