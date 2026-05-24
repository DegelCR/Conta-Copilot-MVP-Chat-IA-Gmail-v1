"use client";

import { startTransition, useActionState, useEffect, useRef, useState } from "react";
import {
  sendChatMessageAction,
  type ChatActionState,
} from "@/app/actions/chat";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

const initialState: ChatActionState = {};

const EXAMPLE_QUESTIONS = [
  "¿Cuánto gasté este mes?",
  "¿Cuánto ingresé este mes?",
  "¿Cuánto IVA tengo este mes?",
  "¿Cuáles son mis top proveedores?",
  "¿Cuánto gasté en Combustible?",
];

export function ChatPanel() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [state, formAction, pending] = useActionState(sendChatMessageAction, initialState);
  const lastReplyRef = useRef<string | undefined>(undefined);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, pending]);

  useEffect(() => {
    if (state.reply && state.reply !== lastReplyRef.current) {
      lastReplyRef.current = state.reply;
      setMessages((prev) => [...prev, { role: "assistant", content: state.reply! }]);
    }
  }, [state.reply]);

  function submitMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || pending) return;

    setMessages((prev) => [...prev, { role: "user", content: trimmed }]);
    setDraft("");

    const formData = new FormData();
    formData.set("message", trimmed);
    formData.set("history", JSON.stringify(messages.slice(-8)));

    startTransition(() => {
      formAction(formData);
    });
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    submitMessage(draft);
  }

  return (
    <div className="flex min-h-[32rem] flex-col rounded-xl border border-zinc-200 bg-white">
      <div className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-6">
        {messages.length === 0 && (
          <div className="rounded-lg bg-zinc-50 px-4 py-6 text-sm text-zinc-600">
            <p className="font-medium text-zinc-800">Pregunta sobre tus facturas confirmadas</p>
            <p className="mt-2">
              El asistente usa tus totales del mes y hasta 100 facturas confirmadas. No inventa
              datos si no hay suficiente información.
            </p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {EXAMPLE_QUESTIONS.map((question) => (
                <li key={question}>
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => submitMessage(question)}
                    className="rounded-full border border-zinc-300 bg-white px-3 py-1.5 text-xs text-zinc-700 hover:bg-zinc-100 disabled:opacity-60"
                  >
                    {question}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {messages.map((message, index) => (
          <div
            key={`${message.role}-${index}-${message.content.slice(0, 24)}`}
            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap ${
                message.role === "user"
                  ? "bg-emerald-600 text-white"
                  : "bg-zinc-100 text-zinc-900"
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}

        {pending && (
          <div className="flex justify-start">
            <div className="rounded-2xl bg-zinc-100 px-4 py-2.5 text-sm text-zinc-600">
              Pensando…
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {state.error && (
        <p className="mx-4 mb-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 sm:mx-6">
          {state.error}
        </p>
      )}

      <form
        onSubmit={handleSubmit}
        className="border-t border-zinc-200 p-4 sm:p-6"
      >
        <label htmlFor="chat-message" className="sr-only">
          Tu pregunta
        </label>
        <div className="flex gap-2">
          <input
            id="chat-message"
            name="message"
            type="text"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Ej. ¿Cuánto gasté este mes?"
            disabled={pending}
            autoComplete="off"
            className="min-w-0 flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={pending || !draft.trim()}
            className="shrink-0 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
          >
            {pending ? "Enviando…" : "Enviar"}
          </button>
        </div>
      </form>
    </div>
  );
}
