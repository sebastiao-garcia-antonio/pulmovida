"use client";

import { useState } from "react";
import Link from "next/link";
import { cancelarAgendamento } from "./actions";

type Diagnostico = {
  id: string;
  data: string;
  resultado: string;
  probabilidade: number;
};

type Agendamento = {
  id: string;
  data: string;
  hora: string;
  medico: string;
  especialidade: string;
  status: string;
};

const diagnosticoStatusClass = (probabilidade: number) =>
  probabilidade < 30
    ? "bg-[#3B82F6]/10 text-[#3B82F6]"
    : probabilidade < 70
      ? "bg-yellow-100 text-yellow-700"
      : "bg-red-100 text-red-700";

const consultaStatusClass = (status: string) =>
  status === "realizado"
    ? "bg-[#3B82F6]/10 text-[#3B82F6]"
    : status === "confirmado"
      ? "bg-emerald-100 text-emerald-700"
      : status === "pendente"
        ? "bg-yellow-100 text-yellow-700"
        : "bg-gray-100 text-gray-700";

export default function HistoricoClient({
  diagnosticos,
  agendamentos,
}: {
  diagnosticos: Diagnostico[];
  agendamentos: Agendamento[];
}) {
  const [activeTab, setActiveTab] = useState<"diagnosticos" | "consultas">("diagnosticos");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [cancelModal, setCancelModal] = useState<string | null>(null);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [localAgendamentos, setLocalAgendamentos] = useState(agendamentos);
  const itemsPerPage = 5;

  const filteredDiagnosticos = diagnosticos.filter((d) =>
    d.resultado.toLowerCase().includes(searchTerm.toLowerCase()) || d.data.includes(searchTerm)
  );

  const filteredAgendamentos = localAgendamentos.filter((a) =>
    a.medico.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.especialidade.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const data = activeTab === "diagnosticos" ? filteredDiagnosticos : filteredAgendamentos;
  const totalPages = Math.ceil(data.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedList = data.slice(startIndex, startIndex + itemsPerPage);

  const handleCancel = async () => {
    if (!cancelModal) return;
    setCancelLoading(true);
    try {
      await cancelarAgendamento(cancelModal);
      setLocalAgendamentos((prev) => prev.filter((a) => a.id !== cancelModal));
      setCancelModal(null);
    } catch (err) {
      alert("Erro ao cancelar consulta.");
    } finally {
      setCancelLoading(false);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  return (
    <div className="p-4 sm:p-10 max-w-7xl mx-auto space-y-6 animate-fade-in">
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-[#16201E] tracking-tight">Meu Histórico</h1>
          <p className="mt-1 text-[#746F70]">Consulte o resultado das suas triagens (IA) e o seu histórico de consultas.</p>
        </div>
        <Link href="/paciente" className="text-sm font-bold text-[#746F70] hover:text-[#3B82F6] transition-colors bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100">&larr; Voltar ao Início</Link>
      </div>

      <div className="flex gap-2 border-b border-[#BFDBFE] overflow-x-auto">
        {[
          { key: "diagnosticos" as const, label: "Resultados Triagem IA" },
          { key: "consultas" as const, label: "Agendamentos" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => {
              setActiveTab(tab.key);
              setCurrentPage(1);
              setSearchTerm("");
            }}
            className={`px-5 py-3 text-sm font-bold border-b-2 transition-colors whitespace-nowrap uppercase tracking-wider ${
              activeTab === tab.key
                ? "border-[#3B82F6] text-[#3B82F6]"
                : "border-transparent text-[#746F70] hover:text-[#16201E]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="saas-card overflow-hidden shadow-sm border border-blue-100">
        <div className="px-4 sm:px-6 py-5 border-b border-[#BFDBFE] bg-blue-50/50 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <h2 className="text-lg font-bold text-[#16201E]">
            {activeTab === "diagnosticos" ? "Avaliações Efetuadas" : "Marcações de Consultas"}
          </h2>
          <input
            type="text"
            placeholder={
              activeTab === "diagnosticos"
                ? "Pesquisar por resultado..."
                : "Pesquisar por médico, status..."
            }
            className="px-4 py-2.5 bg-white border border-[#BFDBFE] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3B82F6] text-[#16201E] w-full sm:w-72 shadow-sm"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        {paginatedList.length === 0 ? (
          <div className="p-16 text-[#746F70] flex flex-col items-center text-center bg-white">
            <svg className="w-12 h-12 text-blue-200 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <p className="font-medium text-lg">Nenhum registo encontrado.</p>
            <p className="text-sm mt-1">Ainda não tem histórico nesta secção.</p>
          </div>
        ) : activeTab === "diagnosticos" ? (
          <>
            <div className="md:hidden divide-y divide-[#BFDBFE] bg-white">
              {(paginatedList as Diagnostico[]).map((d) => (
                <article key={d.id} className="p-5 space-y-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide text-[#746F70]">Data da Avaliação</p>
                      <p className="mt-1 text-sm font-bold text-[#16201E]">{d.data}</p>
                    </div>
                    <span
                      className={`shrink-0 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${diagnosticoStatusClass(d.probabilidade)}`}
                    >
                      {d.resultado.split(" - ")[0]}
                    </span>
                  </div>

                  <div className="rounded-xl bg-[#EFF6FF]/50 p-4 border border-blue-100">
                    <p className="text-xs font-bold uppercase tracking-wide text-[#746F70] mb-1">Risco Detectado</p>
                    <p className="text-2xl font-black text-[#16201E]">{d.probabilidade}%</p>
                  </div>

                  <Link
                    href={`/paciente/diagnostico/${d.id}`}
                    className="inline-flex w-full items-center justify-center rounded-xl bg-[#3B82F6] px-4 py-3 font-bold text-white hover:bg-[#2563EB] transition-colors shadow-sm"
                  >
                    Ver Relatório Completo
                  </Link>
                </article>
              ))}
            </div>

            <div className="hidden md:block overflow-x-auto bg-white">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#EFF6FF]/50 border-b border-[#BFDBFE]">
                    <th className="px-6 py-4 text-xs font-bold text-[#746F70] uppercase tracking-wider">Data</th>
                    <th className="px-6 py-4 text-xs font-bold text-[#746F70] uppercase tracking-wider">Resultado Preliminar</th>
                    <th className="px-6 py-4 text-xs font-bold text-[#746F70] uppercase tracking-wider text-right">Risco / Severidade</th>
                    <th className="px-6 py-4 text-xs font-bold text-[#746F70] uppercase tracking-wider text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {(paginatedList as Diagnostico[]).map((d) => (
                    <tr key={d.id} className="hover:bg-[#EFF6FF]/30 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-[#16201E]">{d.data}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1.5 rounded-full text-xs font-bold tracking-wide ${diagnosticoStatusClass(d.probabilidade)}`}>
                          {d.resultado}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-black text-[#16201E] text-right">{d.probabilidade}%</td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/paciente/diagnostico/${d.id}`}
                          className="inline-flex items-center gap-1.5 text-[#3B82F6] hover:text-[#2563EB] text-sm font-bold bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
                        >
                          Ver &rarr;
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <>
            <div className="md:hidden divide-y divide-[#BFDBFE] bg-white">
              {(paginatedList as Agendamento[]).map((a) => (
                <article key={a.id} className="p-5 space-y-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide text-[#746F70]">Corpo Clínico</p>
                      <p className="mt-1 text-base font-bold text-[#16201E]">{a.medico}</p>
                      <p className="text-xs font-medium text-[#3B82F6] mt-0.5">{a.especialidade}</p>
                    </div>
                    <span
                      className={`shrink-0 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${consultaStatusClass(a.status)}`}
                    >
                      {a.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-[#EFF6FF]/50 p-3 border border-blue-50">
                      <p className="text-[10px] font-bold uppercase tracking-wide text-[#746F70]">Data</p>
                      <p className="mt-1 text-sm font-bold text-[#16201E]">{a.data}</p>
                    </div>
                    <div className="rounded-xl bg-[#EFF6FF]/50 p-3 border border-blue-50">
                      <p className="text-[10px] font-bold uppercase tracking-wide text-[#746F70]">Horário</p>
                      <p className="mt-1 text-sm font-mono font-bold text-[#16201E]">{a.hora}</p>
                    </div>
                  </div>

                  {a.status !== "realizado" && (
                    <button
                      onClick={() => setCancelModal(a.id)}
                      className="w-full py-3 mt-2 text-sm font-bold text-red-600 bg-red-50 rounded-xl hover:bg-red-100 transition-colors shadow-sm"
                    >
                      Cancelar Agendamento
                    </button>
                  )}
                </article>
              ))}
            </div>

            <div className="hidden md:block overflow-x-auto bg-white">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#EFF6FF]/50 border-b border-[#BFDBFE]">
                    <th className="px-6 py-4 text-xs font-bold text-[#746F70] uppercase tracking-wider">Data & Horário</th>
                    <th className="px-6 py-4 text-xs font-bold text-[#746F70] uppercase tracking-wider">Corpo Clínico</th>
                    <th className="px-6 py-4 text-xs font-bold text-[#746F70] uppercase tracking-wider">Estado</th>
                    <th className="px-6 py-4 text-xs font-bold text-[#746F70] uppercase tracking-wider text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {(paginatedList as Agendamento[]).map((a) => (
                    <tr key={a.id} className="hover:bg-[#EFF6FF]/30 transition-colors">
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-[#16201E]">{a.data}</p>
                        <p className="text-xs font-mono font-medium text-[#746F70]">{a.hora}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-[#16201E]">{a.medico}</p>
                        <p className="text-xs text-[#3B82F6] font-medium">{a.especialidade}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${consultaStatusClass(a.status)}`}>
                          {a.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {a.status !== "realizado" && (
                          <button
                            onClick={() => setCancelModal(a.id)}
                            className="text-sm font-bold text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors"
                          >
                            Cancelar
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {totalPages > 1 && (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-6 py-4 border-t border-[#BFDBFE] bg-white">
            <span className="text-sm font-medium text-[#746F70]">Página <span className="font-bold text-[#16201E]">{currentPage}</span> de <span className="font-bold text-[#16201E]">{totalPages}</span> | {data.length} total</span>
            <div className="grid grid-cols-2 gap-2 sm:flex">
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className="px-4 py-2 text-sm font-bold text-[#16201E] bg-white border border-[#BFDBFE] rounded-xl hover:bg-[#EFF6FF] disabled:opacity-50 shadow-sm transition-colors"
              >
                Anterior
              </button>
              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className="px-4 py-2 text-sm font-bold text-[#16201E] bg-white border border-[#BFDBFE] rounded-xl hover:bg-[#EFF6FF] disabled:opacity-50 shadow-sm transition-colors"
              >
                Próxima
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Cancelar */}
      {cancelModal !== null && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-[#16201E]/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-fade-in-up border border-red-100">
            <div className="px-6 py-5 border-b border-red-100 bg-red-50 flex justify-between items-center shrink-0">
              <h3 className="text-lg font-bold text-red-700">Cancelar Agendamento</h3>
              <button onClick={() => setCancelModal(null)} className="text-red-400 hover:text-red-700 bg-white p-1.5 rounded-full shadow-sm">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 text-center space-y-6">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto text-red-500">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              </div>
              <p className="text-sm font-medium text-[#16201E] leading-relaxed">
                Tem a certeza que deseja cancelar esta consulta? Esta ação irá disponibilizar o horário para outro paciente.
              </p>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setCancelModal(null)}
                  className="flex-1 px-4 py-3.5 font-bold text-[#746F70] bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Voltar
                </button>
                <button
                  onClick={handleCancel}
                  disabled={cancelLoading}
                  className="flex-1 px-4 py-3.5 font-bold text-white bg-red-600 rounded-xl hover:bg-red-700 disabled:opacity-50 transition-colors shadow-md"
                >
                  {cancelLoading ? "A Cancelar..." : "Sim, Cancelar"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
