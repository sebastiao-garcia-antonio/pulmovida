"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AgendaForm({ medicoId }: { medicoId: number }) {
  const [data, setData] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/medico/agenda", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ medicoId, data }),
      });

      if (!res.ok) throw new Error("Erro ao gerar agenda");

      setData("");
      alert("Agenda gerada com sucesso para o dia selecionado!");
      router.refresh();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-slate-800">Gerar Horários de Atendimento</h3>
        <p className="text-sm text-slate-500 mt-1">
          Selecione o dia disponível. O sistema criará automaticamente slots de 30 em 30 minutos, das 08:00 às 16:30 (intervalo para almoço das 12:00 às 13:00).
        </p>
      </div>

      <div className="group">
        <label className="block text-sm font-semibold text-slate-700 mb-1 transition-colors group-focus-within:text-blue-600">Data Disponível</label>
        <input 
          type="date" 
          required 
          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-transparent text-slate-900 transition-all duration-300" 
          value={data} 
          onChange={e => setData(e.target.value)} 
          min={new Date().toISOString().split("T")[0]}
        />
      </div>

      <button
        type="submit"
        disabled={loading || !data}
        className="w-full px-4 py-3.5 font-bold text-white bg-gradient-to-r from-blue-600 to-emerald-500 rounded-xl hover:from-blue-700 hover:to-emerald-600 focus:ring-4 focus:ring-blue-200 disabled:opacity-50 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
      >
        {loading ? "Gerando Horários..." : "Gerar Agenda do Dia"}
      </button>

      {/* Visual Indicator of Generated Slots */}
      <div className="mt-4 pt-4 border-t border-slate-100">
        <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">Horários que serão gerados:</p>
        <div className="flex flex-wrap gap-2">
          {["08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30"].map(h => (
            <span key={h} className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full border border-blue-100">
              {h}
            </span>
          ))}
        </div>
      </div>
    </form>
  );
}
