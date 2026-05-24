import Link from "next/link";
import { ChatPanel } from "@/components/chat-panel";
import { DashboardHeader } from "@/components/dashboard-header";

export default function ChatPage() {
  return (
    <div className="min-h-full bg-zinc-50">
      <DashboardHeader active="chat" />

      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="text-sm font-medium text-emerald-700 hover:underline"
          >
            ← Volver al dashboard
          </Link>
          <h1 className="mt-2 text-3xl font-semibold text-zinc-900">Chat contable</h1>
          <p className="mt-1 text-zinc-600">
            Preguntas en lenguaje natural sobre tus facturas{" "}
            <span className="font-medium">confirmadas</span>. Respuestas basadas solo en tus datos.
          </p>
        </div>

        <ChatPanel />
      </main>
    </div>
  );
}
