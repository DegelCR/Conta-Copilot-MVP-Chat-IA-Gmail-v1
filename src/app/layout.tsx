import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SupabasePublicEnv } from "@/components/supabase-public-env";
import "./globals.css";

export const dynamic = "force-dynamic";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Conta Copilot — Copiloto contable con IA",
  description:
    "Organiza facturas, extrae datos con IA y consulta tus gastos. SaaS para contadores y pequeños negocios.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <SupabasePublicEnv />
        {children}
      </body>
    </html>
  );
}
