export function getLegalContactLine(): string {
  const email = process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim();
  if (email) {
    return `Puede escribirnos a ${email}.`;
  }
  return "Puede contactar al administrador del servicio que le facilitó el acceso a la aplicación.";
}
