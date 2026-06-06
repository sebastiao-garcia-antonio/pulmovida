"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AgendamentoForm({ pacienteId, medicos, agendas }: { pacienteId: number, medicos: any[], agendas: any[] }) {
  const [medicoId, setMedicoId] = useState("");
  const [agendaId, setAgendaId] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/paciente/agendamento", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pacienteId, medicoId, agendaId }),
      });

      if (!res.ok) throw new Error("Erro ao agendar consulta");

      router.push("/paciente/historico");
    } catch (err: any) {
      alert(err.message);
      setLoading(false);
    }
  };

  const filteredAgendas = agendas.filter(a => a.medico_id.toString() === medicoId);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700">Médico Especialista</label>
        <select required className="w-full px-4 py-3 mt-1 border rounded-xl focus:outline-none focus:ring focus:ring-blue-200 text-black border-gray-300" value={medicoId} onChange={e => { setMedicoId(e.target.value); setAgendaId(""); }}>
          <option value="">Selecione...</option>
          {medicos.map(m => (
            <option key={m.id} value={m.id}>Dr(a). {m.nome} ({m.especialidade})</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Horário Disponível</label>
        <select required disabled={!medicoId || filteredAgendas.length === 0} className="w-full px-4 py-3 mt-1 border rounded-xl focus:outline-none focus:ring focus:ring-blue-200 text-black border-gray-300 disabled:bg-gray-100" value={agendaId} onChange={e => setAgendaId(e.target.value)}>
          <option value="">{filteredAgendas.length === 0 && medicoId ? "Sem horários disponíveis" : "Selecione o horário..."}</option>
          {filteredAgendas.map(a => (
            <option key={a.id} value={a.id}>{new Date(a.data).toLocaleDateString()} às {a.horario}</option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        disabled={loading || !medicoId || !agendaId}
        className="w-full px-4 py-4 font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-md mt-4"
      >
        {loading ? "Confirmando..." : "Confirmar Agendamento"}
      </button>
    </form>
  );
}
