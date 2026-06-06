"use client";

import { useState } from "react";

type Diagnostico = {
  id: number;
  data: string;
  resultado_ia: string;
  probabilidade: number;
  recomendacao: string;
};

type Agendamento = {
  id: number;
  medico_id: number;
  data: string;
  horario: string;
  status: string;
  especialidade: string | null;
};

interface PacienteHistoricoViewProps {
  diagnosticos: Diagnostico[];
  agendamentos: Agendamento[];
}

export default function PacienteHistoricoView({ diagnosticos, agendamentos }: PacienteHistoricoViewProps) {
  const [pageDiag, setPageDiag] = useState(1);
  const [pageAgend, setPageAgend] = useState(1);
  const itemsPerPage = 5;

  const totalDiagPages = Math.ceil(diagnosticos.length / itemsPerPage) || 1;
  const diagList = diagnosticos.slice((pageDiag - 1) * itemsPerPage, pageDiag * itemsPerPage);

  const totalAgendPages = Math.ceil(agendamentos.length / itemsPerPage) || 1;
  const agendList = agendamentos.slice((pageAgend - 1) * itemsPerPage, pageAgend * itemsPerPage);

  return (
    <div className="grid md:grid-cols-2 gap-8">
      {/* Avaliações da IA */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-blue-800">Avaliações da IA</h2>
        </div>
        <div className="p-6 flex-grow">
          {diagnosticos.length === 0 ? (
            <p className="text-gray-500 text-sm">Nenhum diagnóstico realizado.</p>
          ) : (
            <div className="space-y-4">
              {diagList.map(d => (
                <div key={d.id} className="p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between font-semibold mb-2">
                    <span className={d.probabilidade >= 50 ? "text-red-600" : "text-emerald-600"}>{d.resultado_ia}</span>
                    <span className="text-gray-500 text-sm">{new Date(d.data).toLocaleDateString()}</span>
                  </div>
                  <p className="text-sm text-gray-700 font-medium">Probabilidade IA: {Number(d.probabilidade).toFixed(1)}%</p>
                  <p className="text-xs text-gray-600 mt-2 line-clamp-3">{d.recomendacao}</p>
                </div>
              ))}
            </div>
          )}
        </div>
        {totalDiagPages > 1 && (
          <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex justify-between items-center rounded-b-2xl">
             <span className="text-xs font-semibold text-gray-500">Pág {pageDiag} de {totalDiagPages}</span>
             <div className="flex gap-2">
                <button disabled={pageDiag === 1} onClick={() => setPageDiag(p => p - 1)} className="px-3 py-1 bg-white border border-gray-200 rounded text-xs font-medium text-gray-700 disabled:opacity-50">Ant</button>
                <button disabled={pageDiag === totalDiagPages} onClick={() => setPageDiag(p => p + 1)} className="px-3 py-1 bg-white border border-gray-200 rounded text-xs font-medium text-gray-700 disabled:opacity-50">Seg</button>
             </div>
          </div>
        )}
      </div>

      {/* Meus Agendamentos */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-emerald-800">Meus Agendamentos</h2>
        </div>
        <div className="p-6 flex-grow">
          {agendamentos.length === 0 ? (
            <p className="text-gray-500 text-sm">Nenhum agendamento encontrado.</p>
          ) : (
             <div className="space-y-4">
              {agendList.map(a => (
                <div key={a.id} className="p-4 border border-gray-100 rounded-xl flex justify-between items-center bg-gray-50 hover:bg-white transition-colors">
                   <div>
                      <p className="font-bold text-gray-800">{a.especialidade || "Médico Especialista"}</p>
                      <div className="flex items-center gap-2 mt-1">
                         <span className="text-xs font-semibold text-gray-500">{new Date(a.data).toLocaleDateString()} às {a.horario}</span>
                      </div>
                   </div>
                   <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-100 px-2.5 py-1 rounded-lg border border-blue-200">{a.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        {totalAgendPages > 1 && (
          <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex justify-between items-center rounded-b-2xl">
             <span className="text-xs font-semibold text-gray-500">Pág {pageAgend} de {totalAgendPages}</span>
             <div className="flex gap-2">
                <button disabled={pageAgend === 1} onClick={() => setPageAgend(p => p - 1)} className="px-3 py-1 bg-white border border-gray-200 rounded text-xs font-medium text-gray-700 disabled:opacity-50">Ant</button>
                <button disabled={pageAgend === totalAgendPages} onClick={() => setPageAgend(p => p + 1)} className="px-3 py-1 bg-white border border-gray-200 rounded text-xs font-medium text-gray-700 disabled:opacity-50">Seg</button>
             </div>
          </div>
        )}
      </div>
    </div>
  );
}
