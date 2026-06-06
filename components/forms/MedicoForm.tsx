"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function MedicoForm({ pendentes, departamentos }: { pendentes: any[], departamentos: any[] }) {
  const [medicoId, setMedicoId] = useState("");
  const [especialidade, setEspecialidade] = useState("");
  const [departamentoId, setDepartamentoId] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/admin/medicos", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ medicoId, especialidade, departamentoId }),
      });

      if (!res.ok) throw new Error("Erro ao configurar médico");

      setMedicoId("");
      setEspecialidade("");
      setDepartamentoId("");
      router.refresh();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (pendentes.length === 0) {
    return (
      <div className="p-4 text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg">
        Nenhum médico pendente de validação. Peça para profissionais se cadastrarem.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Usuário Médico (Pendente)</label>
        <select required className="w-full px-3 py-2 mt-1 border rounded-lg focus:outline-none focus:ring focus:ring-blue-200 text-black shadow-sm" value={medicoId} onChange={e => setMedicoId(e.target.value)}>
          <option value="">Selecione um usuário...</option>
          {pendentes.map(p => (
            <option key={p.medico_id} value={p.medico_id}>{p.nome}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Especialidade</label>
        <input 
          type="text" 
          required 
          className="w-full px-3 py-2 mt-1 border rounded-lg focus:outline-none focus:ring focus:ring-blue-200 text-black shadow-sm" 
          value={especialidade} 
          onChange={e => setEspecialidade(e.target.value)} 
          placeholder="Ex: Pneumologista" 
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Departamento</label>
        <select required className="w-full px-3 py-2 mt-1 border rounded-lg focus:outline-none focus:ring focus:ring-blue-200 text-black shadow-sm" value={departamentoId} onChange={e => setDepartamentoId(e.target.value)}>
          <option value="">Selecione o departamento...</option>
          {departamentos.map(d => (
             <option key={d.id} value={d.id}>{d.nome}</option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full px-4 py-3 font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm mt-4"
      >
        {loading ? "Salvando..." : "Vincular Perfil"}
      </button>
    </form>
  );
}
