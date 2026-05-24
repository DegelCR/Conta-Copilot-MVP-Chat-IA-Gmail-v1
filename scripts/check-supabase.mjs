import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const envPath = path.join(__dirname, "..", ".env.local");
const env = Object.fromEntries(
  fs
    .readFileSync(envPath, "utf8")
    .split(/\r?\n/)
    .filter((line) => line && !line.startsWith("#"))
    .map((line) => {
      const index = line.indexOf("=");
      return [line.slice(0, index).trim(), line.slice(index + 1).trim()];
    }),
);

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log("URL:", url);
console.log("Key length:", key?.length ?? 0);
console.log("Key prefix:", key ? `${key.slice(0, 24)}...` : "(missing)");
console.log("Wrapped in quotes:", /^["']/.test(key ?? ""));

async function main() {
  const health = await fetch(`${url}/auth/v1/health`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
  });
  console.log("health", health.status, await health.text());

  const signup = await fetch(`${url}/auth/v1/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: key,
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      email: `test-diagnostic-${Date.now()}@example.com`,
      password: "Test123456!",
    }),
  });
  console.log("signup", signup.status, (await signup.text()).slice(0, 400));
}

main().catch((error) => {
  console.error("ERR", error.message);
  if (error.cause) console.error("CAUSE", error.cause);
});
