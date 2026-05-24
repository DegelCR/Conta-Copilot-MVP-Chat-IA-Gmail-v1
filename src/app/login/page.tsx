import Link from "next/link";
import { AuthForm } from "@/components/auth-form";

export default function LoginPage() {
  return (
    <div className="flex min-h-full flex-col bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white px-6 py-4">
        <Link href="/" className="text-lg font-semibold text-emerald-700">
          Conta Copilot
        </Link>
      </header>
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <AuthForm mode="login" />
      </main>
    </div>
  );
}
