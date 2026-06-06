"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeptForm() {
  const [nome, setNome] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/admin/departamentos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome }),
      });

      if (!res.ok) throw new Error("Erro ao salvar departamento");

      setNome("");
      router.refresh();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-[#16201E]">Nome do Setor/Departamento</label>
        <input 
          type="text" 
          required 
          className="saas-input w-full" 
          value={nome} 
          onChange={e => setNome(e.target.value)} 
          placeholder="Ex: Cardiologia"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full px-4 py-3 font-bold text-white bg-[#3B82F6] rounded-lg hover:bg-[#2563EB] disabled:opacity-50 transition-colors shadow-sm"
      >
        {loading ? "Cadastrando..." : "Cadastrar Setor"}
      </button>
    </form>
  );
}
