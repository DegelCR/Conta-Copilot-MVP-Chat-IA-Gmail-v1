import Link from "next/link";
import { SignOutButton } from "@/components/sign-out-button";

export type DashboardNavKey = "dashboard" | "invoices" | "chat" | "gmail";

type DashboardHeaderProps = {
  active: DashboardNavKey;
};

const NAV_ITEMS: { key: DashboardNavKey; href: string; label: string }[] = [
  { key: "dashboard", href: "/dashboard", label: "Dashboard" },
  { key: "invoices", href: "/dashboard/invoices", label: "Facturas" },
  { key: "chat", href: "/dashboard/chat", label: "Chat" },
  { key: "gmail", href: "/dashboard/gmail", label: "Gmail" },
];

export function DashboardHeader({ active }: DashboardHeaderProps) {
  return (
    <header className="border-b border-zinc-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="text-lg font-semibold text-emerald-700">
            Conta Copilot
          </Link>
          <nav className="hidden gap-4 text-sm sm:flex">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                className={
                  active === item.key
                    ? "font-medium text-emerald-700"
                    : "text-zinc-600 hover:text-zinc-900"
                }
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <SignOutButton />
      </div>
    </header>
  );
}
