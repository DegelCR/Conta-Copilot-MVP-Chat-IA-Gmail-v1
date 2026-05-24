"use client";

import Link from "next/link";
import { useActionState } from "react";
import {
  signInAction,
  signUpAction,
  type AuthActionState,
} from "@/app/actions/auth";

type AuthMode = "login" | "signup";

type AuthFormProps = {
  mode: AuthMode;
};

const initialState: AuthActionState = {};

export function AuthForm({ mode }: AuthFormProps) {
  const isLogin = mode === "login";
  const action = isLogin ? signInAction : signUpAction;
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
      <h1 className="text-2xl font-semibold text-zinc-900">
        {isLogin ? "Iniciar sesión" : "Crear cuenta"}
      </h1>
      <p className="mt-2 text-sm text-zinc-600">
        {isLogin
          ? "Accede a tu copiloto contable."
          : "Empieza a organizar tus facturas con IA."}
      </p>

      <form action={formAction} className="mt-8 space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-zinc-700">
            Correo
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-zinc-700">
            Contraseña
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={6}
            autoComplete={isLogin ? "current-password" : "new-password"}
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
          />
        </div>

        {state.error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
        )}
        {state.message && (
          <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
            {state.message}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:opacity-60"
        >
          {pending ? "Procesando…" : isLogin ? "Entrar" : "Registrarme"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-zinc-600">
        {isLogin ? (
          <>
            ¿No tienes cuenta?{" "}
            <Link href="/signup" className="font-medium text-emerald-700 hover:underline">
              Regístrate
            </Link>
          </>
        ) : (
          <>
            ¿Ya tienes cuenta?{" "}
            <Link href="/login" className="font-medium text-emerald-700 hover:underline">
              Inicia sesión
            </Link>
          </>
        )}
      </p>

      <p className="mt-4 text-center text-xs text-zinc-500">
        Usa{" "}
        <a href="http://localhost:3000" className="underline">
          localhost:3000
        </a>{" "}
        (no la IP de red) si el navegador bloquea la conexión.
      </p>
    </div>
  );
}
