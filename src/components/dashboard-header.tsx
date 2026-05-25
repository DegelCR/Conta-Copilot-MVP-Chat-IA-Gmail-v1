"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
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

function navLinkClass(active: boolean, mobile = false) {
  const base = mobile
    ? "block rounded-lg px-3 py-2.5 text-base"
    : "text-sm";
  if (active) {
    return `${base} font-medium text-emerald-700 ${mobile ? "bg-emerald-50" : ""}`;
  }
  return `${base} text-zinc-600 hover:text-zinc-900 ${mobile ? "hover:bg-zinc-50" : ""}`;
}

function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg
      className="h-6 w-6 text-zinc-700"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden
    >
      {open ? (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      ) : (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 6h16M4 12h16M4 18h16"
        />
      )}
    </svg>
  );
}

export function DashboardHeader({ active }: DashboardHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  return (
    <header className="border-b border-zinc-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4">
        <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-6">
          <Link
            href="/dashboard"
            className="truncate text-base font-semibold text-emerald-700 sm:text-lg"
          >
            Conta Copilot
          </Link>
          <nav className="hidden gap-4 sm:flex" aria-label="Principal">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                className={navLinkClass(active === item.key)}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            className="rounded-lg border border-zinc-300 p-2 sm:hidden"
            aria-expanded={menuOpen}
            aria-controls="dashboard-mobile-nav"
            aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <MenuIcon open={menuOpen} />
          </button>
          <div className="hidden sm:block">
            <SignOutButton />
          </div>
        </div>
      </div>

      {menuOpen && (
        <nav
          id="dashboard-mobile-nav"
          className="border-t border-zinc-200 px-4 py-3 sm:hidden"
          aria-label="Principal móvil"
        >
          <ul className="space-y-1">
            {NAV_ITEMS.map((item) => (
              <li key={item.key}>
                <Link
                  href={item.href}
                  className={navLinkClass(active === item.key, true)}
                  onClick={() => setMenuOpen(false)}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-3 border-t border-zinc-100 pt-3">
            <SignOutButton />
          </div>
        </nav>
      )}
    </header>
  );
}
