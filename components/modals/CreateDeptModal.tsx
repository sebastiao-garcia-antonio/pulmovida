"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface CreateDeptModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateDeptModal({ isOpen, onClose }: CreateDeptModalProps) {
  const [nome, setNome] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) return;
    
    setLoading(true);

    try {
      const res = await fetch("/api/admin/departamentos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome }),
      });

      if (!res.ok) throw new Error("Erro ao salvar departamento");

      setNome("");
      onClose();
      router.refresh();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#16201E]/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-fade-in-up">
        <div className="px-6 py-4 border-b border-[#BFDBFE] flex justify-between items-center">
          <h3 className="text-lg font-bold text-[#16201E]">Novo Departamento</h3>
          <button onClick={onClose} className="text-[#746F70] hover:text-[#16201E]">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-[#16201E] mb-1">Nome do Setor/Departamento</label>
            <input 
              type="text" 
              autoFocus
              required 
              className="saas-input w-full" 
              value={nome} 
              onChange={e => setNome(e.target.value)} 
              placeholder="Ex: Cardiologia"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !nome.trim()}
            className="w-full px-4 py-3 font-bold text-white bg-[#3B82F6] rounded-xl hover:bg-[#2563EB] disabled:opacity-50 transition-colors shadow-sm"
          >
            {loading ? "Cadastrando..." : "Cadastrar Setor"}
          </button>
        </form>
      </div>
    </div>
  );
}
