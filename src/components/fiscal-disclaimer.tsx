import {
  FISCAL_DISCLAIMER_BANNER,
  FISCAL_DISCLAIMER_CHAT,
  FISCAL_DISCLAIMER_COMPACT,
} from "@/lib/legal/disclaimer";

type FiscalDisclaimerProps = {
  variant?: "compact" | "banner" | "chat";
  className?: string;
};

export function FiscalDisclaimer({ variant = "banner", className = "" }: FiscalDisclaimerProps) {
  if (variant === "compact") {
    return (
      <p className={`text-xs leading-relaxed text-zinc-500 ${className}`}>
        {FISCAL_DISCLAIMER_COMPACT}
      </p>
    );
  }

  if (variant === "chat") {
    return (
      <p
        className={`rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-950 ${className}`}
        role="note"
      >
        {FISCAL_DISCLAIMER_CHAT}
      </p>
    );
  }

  return (
    <div
      className={`border-b border-amber-200 bg-amber-50 px-4 py-3 sm:px-6 ${className}`}
      role="note"
      aria-label="Aviso legal"
    >
      <p className="mx-auto max-w-6xl text-xs leading-relaxed text-amber-950 sm:text-sm">
        <span className="font-semibold">Aviso:</span> {FISCAL_DISCLAIMER_BANNER}
      </p>
    </div>
  );
}
