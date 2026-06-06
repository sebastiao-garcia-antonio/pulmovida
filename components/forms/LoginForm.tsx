"use client";

import { useState, Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

function LoginFormContent() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const registered = searchParams.get("registered");
  const activated = searchParams.get("activated");
  const urlError = searchParams.get("error");

  useEffect(() => {
    if (registered) {
      MySwal.fire({
        icon: "success",
        title: "Conta criada com sucesso!",
        text: "Um link de ativação foi enviado para o seu e-mail. Por favor, verifique sua caixa de entrada.",
        confirmButtonColor: "#3B82F6",
      }).then(() => router.replace("/login"));
    }
    
    if (activated) {
      MySwal.fire({
        icon: "success",
        title: "E-mail verificado!",
        text: "Sua conta foi ativada com sucesso. Você já pode fazer login.",
        confirmButtonColor: "#3B82F6",
      }).then(() => router.replace("/login"));
    }

    if (urlError) {
      MySwal.fire({
        icon: "error",
        title: "Atenção",
        text: urlError === "TokenInvalido" ? "O link de ativação é inválido ou já expirou." : "Houve um problema de autenticação.",
        confirmButtonColor: "#3B82F6",
      }).then(() => router.replace("/login"));
    }
  }, [registered, activated, urlError, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        senha,
      });

      if (res?.error) {
        MySwal.fire({
          icon: "error",
          title: "Acesso Negado",
          text: res.error.includes("ativada") ? "Sua conta não está ativada. Verifique seu e-mail." : "Credenciais inválidas ou e-mail incorreto.",
          confirmButtonColor: "#3B82F6",
        });
        setLoading(false);
        return;
      }

      window.location.href = "/admin"; // Middleware will redirect to the correct role dashboard
    } catch (err: any) {
      MySwal.fire({
        icon: "error",
        title: "Erro",
        text: "Ocorreu um erro inesperado de conexão.",
        confirmButtonColor: "#3B82F6",
      });
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-semibold mb-1.5 text-[#16201E]">Email</label>
        <div className="relative">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#746F70] pointer-events-none" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 01-2.06 0L2 7" />
          </svg>
          <input type="email" placeholder="seu@email.com" required value={email} onChange={(e) => setEmail(e.target.value)}
            className="w-full pl-10 pr-4 py-3 text-sm border border-[#BFDBFE] rounded-xl bg-white focus:outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/10 transition text-[#16201E]" />
        </div>
      </div>
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="block text-sm font-semibold text-[#16201E]">Senha</label>
          <Link href="/reset-password" className="text-xs font-medium text-[#3B82F6] hover:text-[#2563EB] transition hover:underline">Esqueceu a senha?</Link>
        </div>
        <div className="relative">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#746F70] pointer-events-none" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0110 0v4" />
          </svg>
          <input type={showPassword ? "text" : "password"} placeholder="••••••••" required value={senha} onChange={(e) => setSenha(e.target.value)}
            className="w-full pl-10 pr-11 py-3 text-sm border border-[#BFDBFE] rounded-xl bg-white focus:outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/10 transition text-[#16201E]" />
          <button type="button" onClick={() => setShowPassword(!showPassword)} 
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#746F70] hover:text-[#3B82F6] transition cursor-pointer"
            aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}>
            {showPassword ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243-4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.59 6.59m7.532 7.532 3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M2.062 12.348a1 1 0 010-.696 10.75 10.75 0 0119.876 0 1 1 0 010 .696 10.75 10.75 0 01-19.876 0z" /><circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        </div>
        <label className="flex items-center gap-2 cursor-pointer mt-2">
          <input type="checkbox" checked={showPassword} onChange={(e) => setShowPassword(e.target.checked)} className="w-4 h-4 text-[#3B82F6] border-[#BFDBFE] rounded focus:ring-[#3B82F6]" />
          <span className="text-sm text-[#746F70]">Mostrar senha</span>
        </label>
      </div>
      <button type="submit" disabled={loading}
        className="w-full cursor-pointer flex items-center justify-center gap-2 py-3 rounded-xl text-white font-semibold text-sm transition disabled:opacity-60 disabled:cursor-not-allowed mt-2 bg-[#3B82F6] hover:bg-[#2563EB]">
        {loading ? "Autenticando..." : "Entrar"}
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
      </button>
    </form>
  );
}

export default function LoginForm() {
  return (
    <Suspense fallback={<div className="p-4 text-center text-sm text-[#746F70]">Carregando...</div>}>
      <LoginFormContent />
    </Suspense>
  );
}
