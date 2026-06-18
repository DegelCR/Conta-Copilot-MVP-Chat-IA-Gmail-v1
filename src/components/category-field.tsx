"use client";

import { useMemo, useState } from "react";

type CategoryFieldProps = {
  categories: string[];
  id: string;
  name?: string;
  defaultValue?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  showHint?: boolean;
  /** En filtros: permite valor vacío (= todas las categorías). */
  allowEmpty?: boolean;
};

function sameCategory(a: string, b: string): boolean {
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}

function findInList(value: string, categories: string[]): string | null {
  const match = categories.find((cat) => sameCategory(cat, value));
  return match ?? null;
}

export function CategoryField({
  categories,
  id,
  name = "category",
  defaultValue = "Otros",
  disabled = false,
  required = false,
  className,
  showHint = true,
  allowEmpty = false,
}: CategoryFieldProps) {
  const customInputId = `${id}-custom`;

  const initial = useMemo(() => {
    const raw = (defaultValue ?? "").trim();
    if (!raw) {
      return { select: allowEmpty ? "" : "Otros", custom: "" };
    }
    const inList = findInList(raw, categories);
    if (inList) {
      return { select: inList, custom: "" };
    }
    return { select: allowEmpty ? "" : "Otros", custom: raw };
  }, [allowEmpty, categories, defaultValue]);

  const [selected, setSelected] = useState(initial.select);
  const [customText, setCustomText] = useState(initial.custom);

  const effectiveValue = customText.trim() || selected;

  const selectClassName =
    className ??
    "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 disabled:bg-zinc-50";

  if (disabled) {
    const display = defaultValue?.trim() || "Otros";
    return (
      <input
        id={id}
        name={name}
        type="text"
        value={display}
        readOnly
        disabled
        className={selectClassName}
      />
    );
  }

  return (
    <div className="space-y-2">
      <select
        id={id}
        value={selected}
        required={required && !customText.trim()}
        onChange={(event) => setSelected(event.target.value)}
        className={selectClassName}
      >
        {allowEmpty && <option value="">Todas</option>}
        {categories.map((cat) => (
          <option key={cat} value={cat}>
            {cat}
          </option>
        ))}
      </select>

      <div>
        <label htmlFor={customInputId} className="text-xs font-medium text-zinc-600">
          O escribe otra categoría
        </label>
        <input
          id={customInputId}
          type="text"
          value={customText}
          onChange={(event) => setCustomText(event.target.value)}
          placeholder="Ej. Agua, Internet, Alquiler…"
          autoComplete="off"
          className="mt-1 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400"
        />
      </div>

      <input type="hidden" name={name} value={effectiveValue} />

      {showHint && (
        <p className="text-xs text-zinc-500">
          Elige en la lista o escribe abajo una categoría nueva. Al confirmar la factura, las
          personalizadas quedan guardadas como sugerencias.
        </p>
      )}
    </div>
  );
}
