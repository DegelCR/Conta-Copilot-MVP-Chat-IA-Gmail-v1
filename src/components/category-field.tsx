"use client";

import { useRef } from "react";

type CategoryFieldProps = {
  categories: string[];
  id: string;
  name?: string;
  defaultValue?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  showHint?: boolean;
};

export function CategoryField({
  categories,
  id,
  name = "category",
  defaultValue = "Otros",
  disabled = false,
  required = false,
  className,
  showHint = true,
}: CategoryFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const selectId = `${id}-suggestions`;

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        id={id}
        name={name}
        type="text"
        defaultValue={defaultValue}
        disabled={disabled}
        required={required}
        placeholder="Escribe la categoría (ej. Agua)"
        autoComplete="off"
        className={
          className ??
          "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 disabled:bg-zinc-50"
        }
      />

      {!disabled && categories.length > 0 && (
        <div>
          <label htmlFor={selectId} className="text-xs font-medium text-zinc-600">
            O elige una sugerencia
          </label>
          <select
            id={selectId}
            defaultValue=""
            className="mt-1 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-800"
            onChange={(event) => {
              const picked = event.target.value;
              if (picked && inputRef.current) {
                inputRef.current.value = picked;
                inputRef.current.focus();
              }
              event.target.value = "";
            }}
          >
            <option value="">— Seleccionar —</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      )}

      {showHint && !disabled && (
        <p className="text-xs text-zinc-500">
          Puedes escribir cualquier nombre. Si no está en la lista (ej. Agua), se guardará la primera
          vez que confirmes la factura.
        </p>
      )}
    </div>
  );
}
