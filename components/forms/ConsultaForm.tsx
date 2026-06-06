"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface ConsultaProps {
  medicoId: number;
  pacienteId: number;
  agendamentoId: number;
}

export default function ConsultaForm({ medicoId, pacienteId, agendamentoId }: ConsultaProps) {
  const [observacoes, setObservacoes] = useState("");
  const [diagnosticoFinal, setDiagnosticoFinal] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/medico/consulta", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ medicoId, pacienteId, agendamentoId, observacoes, diagnosticoFinal }),
      });

      if (!res.ok) throw new Error("Erro ao salvar consulta");

      router.refresh();
    } catch (err: any) {
      alert(err.message);
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Observações Clínicas</label>
        <textarea 
          required 
          className="w-full px-3 py-2 mt-1 border rounded-md focus:outline-none focus:ring focus:ring-emerald-200 text-black h-20 resize-none" 
          value={observacoes} 
          onChange={e => setObservacoes(e.target.value)} 
          placeholder="Descreva o caso e os sintomas confirmados..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Diagnóstico Final</label>
        <input 
          type="text" 
          required 
          className="w-full px-3 py-2 mt-1 border rounded-md focus:outline-none focus:ring focus:ring-emerald-200 text-black" 
          value={diagnosticoFinal} 
          onChange={e => setDiagnosticoFinal(e.target.value)} 
          placeholder="Ex: Doença Crônica do tipo B"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full px-4 py-3 font-bold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors"
      >
        {loading ? "Registrando..." : "Finalizar Consulta"}
      </button>
    </form>
  );
}
