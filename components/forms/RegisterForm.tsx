"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

export default function RegisterForm() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, email, senha }),
      });
      const data = await res.json();
      
      if (!res.ok) {
        MySwal.fire({
          icon: "error",
          title: "Erro no Cadastro",
          text: data.message || "Não foi possível criar sua conta.",
          confirmButtonColor: "#3B82F6",
        });
        return;
      }
      
      router.push("/login?registered=true");
    } catch (err: any) {
      MySwal.fire({
        icon: "error",
        title: "Erro de Conexão",
        text: "Não foi possível conectar ao servidor.",
        confirmButtonColor: "#3B82F6",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-semibold mb-1.5 text-[#16201E]">Nome Completo</label>
        <div className="relative">
          <input type="text" placeholder="Seu nome" required value={nome} onChange={(e) => setNome(e.target.value)}
            className="w-full px-4 py-3 text-sm border border-[#BFDBFE] rounded-xl bg-white focus:outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/10 transition text-[#16201E]" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-semibold mb-1.5 text-[#16201E]">Email</label>
        <div className="relative">
          <input type="email" placeholder="seu@email.com" required value={email} onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 text-sm border border-[#BFDBFE] rounded-xl bg-white focus:outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/10 transition text-[#16201E]" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-semibold text-[#16201E] mb-1.5">Senha</label>
        <div className="relative">
          <input type={showPassword ? "text" : "password"} placeholder="••••••••" required value={senha} onChange={(e) => setSenha(e.target.value)}
            className="w-full px-4 py-3 text-sm border border-[#BFDBFE] rounded-xl bg-white focus:outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/10 transition text-[#16201E]" />
          <button type="button" onClick={() => setShowPassword(!showPassword)} 
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#746F70] hover:text-[#3B82F6] transition cursor-pointer">
            {showPassword ? "Ocultar" : "Mostrar"}
          </button>
        </div>
      </div>
      <button type="submit" disabled={loading}
        className="w-full cursor-pointer flex items-center justify-center gap-2 py-3 rounded-xl text-white font-semibold text-sm transition disabled:opacity-60 disabled:cursor-not-allowed mt-2 bg-[#3B82F6] hover:bg-[#2563EB]">
        {loading ? "Criando conta..." : "Criar Conta"}
      </button>
    </form>
  );
}
