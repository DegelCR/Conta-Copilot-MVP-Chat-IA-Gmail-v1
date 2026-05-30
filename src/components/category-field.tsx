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
  const listId = `${id}-datalist`;

  return (
    <>
      <input
        id={id}
        name={name}
        type="text"
        list={listId}
        defaultValue={defaultValue}
        disabled={disabled}
        required={required}
        placeholder="Escribe o elige una categoría"
        autoComplete="off"
        className={
          className ??
          "mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 disabled:bg-zinc-50"
        }
      />
      <datalist id={listId}>
        {categories.map((cat) => (
          <option key={cat} value={cat} />
        ))}
      </datalist>
      {showHint && (
        <p className="mt-1 text-xs text-zinc-500">
          Si escribes una categoría nueva (ej. Agua), se guardará para la próxima vez.
        </p>
      )}
    </>
  );
}
