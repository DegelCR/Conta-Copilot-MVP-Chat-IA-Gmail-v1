import OpenAI from "openai";
import { formatOpenAIError } from "@/lib/invoices/extract";

const CHAT_MODEL = "gpt-4o-mini";

const SYSTEM_PROMPT = `Eres el copiloto contable de Conta Copilot para usuarios en Costa Rica.

Reglas:
- Responde SOLO en español, de forma concisa y clara.
- Usa ÚNICAMENTE los datos de facturas confirmadas que aparecen en el contexto. No inventes montos, proveedores ni fechas.
- Si la pregunta no puede responderse con esos datos, dilo explícitamente y sugiere qué falta (p. ej. confirmar facturas o subir más).
- Monedas: CRC y USD pueden mezclarse; los totales del resumen mensual suman montos sin conversión de cambio — menciónalo si es relevante.
- Gasto vs ingreso: respeta document_type (Gasto / Ingreso).
- IVA del mes en el resumen corresponde a tax_amount de gastos confirmados del mes actual.
- No des asesoría fiscal oficial ni sustituyas a un contador certificado.`;

export type ChatTurn = {
  role: "user" | "assistant";
  content: string;
};

export async function answerInvoiceChat(
  question: string,
  context: string,
  history: ChatTurn[] = [],
): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "OPENAI_API_KEY no está configurada en .env.local. Añádela y reinicia npm run dev.",
    );
  }

  const openai = new OpenAI({ apiKey });
  const trimmedHistory = history
    .filter(
      (turn) =>
        (turn.role === "user" || turn.role === "assistant") &&
        typeof turn.content === "string" &&
        turn.content.trim().length > 0,
    )
    .slice(-8);

  try {
    const response = await openai.chat.completions.create({
      model: CHAT_MODEL,
      temperature: 0.2,
      messages: [
        {
          role: "system",
          content: `${SYSTEM_PROMPT}\n\n--- DATOS DEL USUARIO ---\n${context}`,
        },
        ...trimmedHistory.map((turn) => ({
          role: turn.role,
          content: turn.content.trim(),
        })),
        { role: "user", content: question.trim() },
      ],
    });

    const reply = response.choices[0]?.message?.content?.trim();
    if (!reply) {
      throw new Error("OpenAI no devolvió una respuesta. Intenta de nuevo.");
    }

    return reply;
  } catch (error) {
    throw new Error(formatOpenAIError(error));
  }
}
