"use client";

import { useState } from "react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { signOut } from "next-auth/react";

const MySwal = withReactContent(Swal);

export default function TrocarSenhaForm() {
  const [senha, setSenha] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (senha !== confirmar) {
      MySwal.fire({ icon: "error", title: "Oops!", text: "As senhas não coincidem.", confirmButtonColor: "#3B82F6" });
      return;
    }
    if (senha.length < 6) {
      MySwal.fire({ icon: "error", title: "Atenção", text: "A senha deve ter no mínimo 6 caracteres.", confirmButtonColor: "#3B82F6" });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/trocar-senha", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ novaSenha: senha })
      });
      const data = await res.json();

      if (res.ok) {
        MySwal.fire({ icon: "success", title: "Sucesso!", text: "Senha atualizada! Por favor, faça login novamente.", showConfirmButton: false, timer: 2000 });
        setTimeout(() => {
          signOut({ callbackUrl: "/login" });
        }, 2000);
      } else {
        MySwal.fire({ icon: "error", title: "Erro", text: data.message, confirmButtonColor: "#3B82F6" });
      }
    } catch {
      MySwal.fire({ icon: "error", title: "Erro", text: "Erro de conexão.", confirmButtonColor: "#3B82F6" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-semibold text-[#16201E] mb-1">Nova Senha</label>
        <input type="password" required className="saas-input w-full" value={senha} onChange={e => setSenha(e.target.value)} />
      </div>
      <div>
        <label className="block text-sm font-semibold text-[#16201E] mb-1">Confirmar Nova Senha</label>
        <input type="password" required className="saas-input w-full" value={confirmar} onChange={e => setConfirmar(e.target.value)} />
      </div>
      <button type="submit" disabled={loading} className="w-full saas-button mt-2">
        {loading ? "A atualizar..." : "Atualizar Senha"}
      </button>
    </form>
  );
}
