import { LegalFooter } from "@/components/legal-footer";

export const dynamic = "force-dynamic";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full flex-col">
      <div className="flex-1">{children}</div>
      <LegalFooter />
    </div>
  );
}
