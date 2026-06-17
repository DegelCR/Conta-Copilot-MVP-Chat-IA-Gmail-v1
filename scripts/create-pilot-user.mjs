/**
 * Crea un usuario piloto en Supabase (email confirmado, sin correo de verificación).
 *
 * Uso:
 *   node scripts/create-pilot-user.mjs --email piloto@ejemplo.com --password "MiClave123"
 *   node scripts/create-pilot-user.mjs --email piloto@ejemplo.com --password "MiClave123" --name "María Pérez"
 *
 * Requiere SUPABASE_SERVICE_ROLE_KEY y NEXT_PUBLIC_SUPABASE_URL en .env.local
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function loadEnv() {
  const envPath = path.join(__dirname, "..", ".env.local");
  if (!fs.existsSync(envPath)) {
    throw new Error("No existe .env.local. Copiá .env.local.example y completá las claves.");
  }

  return Object.fromEntries(
    fs
      .readFileSync(envPath, "utf8")
      .split(/\r?\n/)
      .filter((line) => line && !line.startsWith("#"))
      .map((line) => {
        const index = line.indexOf("=");
        return [line.slice(0, index).trim(), line.slice(index + 1).trim()];
      }),
  );
}

function parseArgs(argv) {
  const args = { email: "", password: "", name: "" };
  for (let i = 2; i < argv.length; i += 1) {
    const key = argv[i];
    const value = argv[i + 1];
    if (key === "--email" && value) {
      args.email = value.trim();
      i += 1;
    } else if (key === "--password" && value) {
      args.password = value;
      i += 1;
    } else if (key === "--name" && value) {
      args.name = value.trim();
      i += 1;
    }
  }
  return args;
}

async function main() {
  const { email, password, name } = parseArgs(process.argv);

  if (!email || !password) {
    console.error(
      "Uso: node scripts/create-pilot-user.mjs --email CORREO --password CLAVE [--name \"Nombre\"]",
    );
    process.exit(1);
  }

  if (password.length < 6) {
    console.error("La contraseña debe tener al menos 6 caracteres.");
    process.exit(1);
  }

  const env = loadEnv();
  const url = env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      "Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local",
    );
  }

  const body = {
    email,
    password,
    email_confirm: true,
  };

  if (name) {
    body.user_metadata = { full_name: name };
  }

  const response = await fetch(`${url}/auth/v1/admin/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
    },
    body: JSON.stringify(body),
  });

  const text = await response.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = { raw: text };
  }

  if (!response.ok) {
    console.error("Error al crear usuario:", response.status);
    console.error(data.msg ?? data.message ?? data.error_description ?? data);
    process.exit(1);
  }

  console.log("Usuario creado correctamente.");
  console.log("  id:", data.id);
  console.log("  email:", data.email);
  console.log("  confirmado:", data.email_confirmed_at ? "sí" : "no");
  console.log("");
  console.log("Siguiente:");
  console.log("  1. Login: https://conta-copilot-mvp-chat-ia-gmail-v1.vercel.app/login");
  console.log("  2. Google Cloud → OAuth → Test users → agregar:", email);
  console.log("     (solo si conectará Gmail y la app OAuth sigue en modo Testing)");
}

main().catch((error) => {
  console.error("ERR:", error.message);
  process.exit(1);
});
