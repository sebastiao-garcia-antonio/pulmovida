"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { agendarConsulta } from "./actions";
import { useRouter } from "next/navigation";

type Agenda = {
  id: string;
  data: string; // YYYY-MM-DD
  hora: string;
};

type Medico = {
  id: string;
  nome: string;
  especialidade: string;
  image: string | null;
  agendasDisponiveis: Agenda[];
};

export default function AgendamentoClient({ medicos, especialidades }: { medicos: Medico[], especialidades: string[] }) {
  const [selectedEspecialidade, setSelectedEspecialidade] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [modalMedico, setModalMedico] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedHoraId, setSelectedHoraId] = useState<string | null>(null);
  const [agendando, setAgendando] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [error, setError] = useState("");
  const itemsPerPage = 6;
  const router = useRouter();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    
    const medicoId = params.get("medicoId");
    if (medicoId && medicos.some((m) => m.id === medicoId)) {
      setModalMedico(medicoId);
    }

    const urlEspecialidade = params.get("especialidade");
    if (urlEspecialidade && especialidades.includes(urlEspecialidade)) {
      setSelectedEspecialidade(urlEspecialidade);
    }
  }, [medicos, especialidades]);

  const filteredMedicos = medicos.filter((m) =>
    (!selectedEspecialidade || m.especialidade === selectedEspecialidade) &&
    (m.nome.toLowerCase().includes(searchTerm.toLowerCase()) || m.especialidade.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalPages = Math.ceil(filteredMedicos.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedMedicos = filteredMedicos.slice(startIndex, startIndex + itemsPerPage);

  const handleNextPage = () => { if (currentPage < totalPages) setCurrentPage(currentPage + 1); };
  const handlePrevPage = () => { if (currentPage > 1) setCurrentPage(currentPage - 1); };

  const openModal = (id: string) => {
    setModalMedico(id);
    setSelectedDate("");
    setSelectedHoraId(null);
    setError("");
  };

  const closeModal = () => {
    setModalMedico(null);
    setSelectedDate("");
    setSelectedHoraId(null);
    setError("");
  };

  const medicoAtual = medicos.find((m) => m.id === modalMedico);
  const agendasDoMedico = medicoAtual?.agendasDisponiveis || [];
  
  // Agrupar datas disponíveis
  const datasDisponiveis = [...new Set(agendasDoMedico.map((a) => a.data))].sort();
  const horariosDaData = agendasDoMedico.filter((a) => a.data === selectedDate).sort((a,b) => a.hora.localeCompare(b.hora));

  const handleAgendar = async () => {
    if (!selectedHoraId) return;
    setAgendando(true);
    setError("");
    try {
      await agendarConsulta(selectedHoraId);
      setSucesso(true);
      closeModal();
    } catch (err: any) {
      setError(err.message || "Erro ao agendar consulta. O horário pode já não estar disponível.");
    } finally {
      setAgendando(false);
    }
  };

  const handleReset = () => {
    setSucesso(false);
    setSelectedEspecialidade("");
    setSearchTerm("");
    setCurrentPage(1);
    // Para recarregar os dados do servidor (agendas disponiveis atualizadas)
    router.refresh();
  };

  return (
    <div className="p-6 sm:p-10 max-w-7xl mx-auto space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[#16201E] tracking-tight">Agendar Consulta</h1>
          <p className="mt-1 text-[#746F70]">Selecione o especialista e o horário mais conveniente para si.</p>
        </div>
        <Link href="/paciente" className="text-sm font-bold text-[#746F70] hover:text-[#3B82F6] transition-colors bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100">&larr; Voltar ao Início</Link>
      </div>

      <div className="saas-card overflow-hidden border border-blue-100 shadow-sm">
        <div className="px-6 py-5 border-b border-[#BFDBFE] bg-blue-50/50 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <h2 className="text-lg font-bold text-[#16201E]">Corpo Clínico Disponível</h2>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <input
              type="text"
              placeholder="Pesquisar médico..."
              className="px-4 py-2.5 bg-white border border-[#BFDBFE] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3B82F6] text-[#16201E] w-full sm:w-56 shadow-sm"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            />
            <select
              className="px-4 py-2.5 bg-white border border-[#BFDBFE] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3B82F6] text-[#16201E] shadow-sm font-medium"
              value={selectedEspecialidade}
              onChange={(e) => { setSelectedEspecialidade(e.target.value); setCurrentPage(1); }}
            >
              <option value="">Todas Especialidades</option>
              {especialidades.map((esp) => (<option key={esp} value={esp}>{esp}</option>))}
            </select>
          </div>
        </div>

        {paginatedMedicos.length === 0 ? (
          <div className="p-16 text-[#746F70] flex flex-col items-center text-center bg-white">
            <svg className="w-12 h-12 text-blue-200 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            <p className="font-medium text-lg">Nenhum médico encontrado.</p>
            <p className="text-sm mt-1">Tente alterar os seus filtros de pesquisa.</p>
          </div>
        ) : (
          <div className="p-6 bg-gray-50/30">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {paginatedMedicos.map((m) => (
                <div
                  key={m.id}
                  onClick={() => openModal(m.id)}
                  className="saas-card p-6 cursor-pointer hover:shadow-lg hover:-translate-y-1 hover:border-[#3B82F6]/50 transition-all duration-300 group bg-white border border-gray-200"
                >
                  <div className="flex items-center gap-5">
                    <div className="w-16 h-16 rounded-full bg-blue-50 border-2 border-blue-100 flex items-center justify-center text-[#3B82F6] font-black text-xl group-hover:border-[#3B82F6] transition-colors overflow-hidden shrink-0">
                      {m.image ? (
                        <img src={m.image} alt={m.nome} className="w-full h-full object-cover" />
                      ) : (
                        m.nome.charAt(0)
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-[#16201E] text-lg truncate group-hover:text-[#3B82F6] transition-colors">{m.nome}</h3>
                      <span className="inline-block mt-1.5 px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#3B82F6] bg-blue-50 border border-blue-100 rounded-full">
                        {m.especialidade}
                      </span>
                    </div>
                  </div>
                  <div className="mt-5 pt-4 border-t border-gray-100 flex justify-between items-center text-sm">
                    <span className="text-[#746F70] font-medium flex items-center gap-1.5">
                      <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      {m.agendasDisponiveis.length} horários livres
                    </span>
                    <span className="text-[#3B82F6] font-bold group-hover:translate-x-1 transition-transform">Ver &rarr;</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-[#BFDBFE] bg-white">
            <span className="text-sm font-medium text-[#746F70]">Página <span className="font-bold text-[#16201E]">{currentPage}</span> de <span className="font-bold text-[#16201E]">{totalPages}</span></span>
            <div className="flex gap-2">
              <button onClick={handlePrevPage} disabled={currentPage === 1} className="px-4 py-2 text-sm font-bold text-[#16201E] bg-white border border-[#BFDBFE] rounded-xl hover:bg-[#EFF6FF] disabled:opacity-50 transition-colors shadow-sm">Anterior</button>
              <button onClick={handleNextPage} disabled={currentPage === totalPages} className="px-4 py-2 text-sm font-bold text-[#16201E] bg-white border border-[#BFDBFE] rounded-xl hover:bg-[#EFF6FF] disabled:opacity-50 transition-colors shadow-sm">Próxima</button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Agendamento */}
      {modalMedico !== null && medicoAtual && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#16201E]/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in-up flex flex-col max-h-[90vh]">
            <div className="px-6 py-5 border-b border-[#BFDBFE] bg-blue-50/50 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-white border-2 border-[#3B82F6] flex items-center justify-center text-[#3B82F6] font-black text-xl overflow-hidden shadow-sm shrink-0">
                  {medicoAtual.image ? (
                    <img src={medicoAtual.image} alt={medicoAtual.nome} className="w-full h-full object-cover" />
                  ) : (
                    medicoAtual.nome.charAt(0)
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-lg text-[#16201E]">{medicoAtual.nome}</h3>
                  <p className="text-xs font-bold text-[#3B82F6] uppercase tracking-wider">{medicoAtual.especialidade}</p>
                </div>
              </div>
              <button onClick={closeModal} className="text-[#746F70] hover:text-[#16201E] bg-white p-2 rounded-full shadow-sm">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto bg-gray-50/30">
              {error && <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100">{error}</div>}

              {datasDisponiveis.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  </div>
                  <p className="font-bold text-[#16201E] text-lg">Agenda Indisponível</p>
                  <p className="text-sm text-[#746F70] mt-1">Este médico não tem horários livres no momento.</p>
                </div>
              ) : (
                <>
                  <div>
                    <p className="text-sm font-bold text-[#16201E] uppercase tracking-wider mb-3">1. Escolha a Data</p>
                    <div className="flex flex-wrap gap-2">
                      {datasDisponiveis.map((data) => (
                        <button
                          key={data}
                          onClick={() => { setSelectedDate(data); setSelectedHoraId(null); setError(""); }}
                          className={`px-4 py-2.5 rounded-xl border text-sm font-bold transition-all duration-200 ${
                            selectedDate === data
                              ? "border-[#3B82F6] bg-[#3B82F6] text-white shadow-md scale-105"
                              : "border-gray-200 bg-white text-[#746F70] hover:border-[#3B82F6] hover:text-[#3B82F6] shadow-sm"
                          }`}
                        >
                          {new Date(data).toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "short" }).replace('.', '')}
                        </button>
                      ))}
                    </div>
                  </div>

                  {selectedDate && (
                    <div className="animate-fade-in">
                      <p className="text-sm font-bold text-[#16201E] uppercase tracking-wider mb-3 mt-6 border-t border-gray-100 pt-6">2. Escolha o Horário</p>
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                        {horariosDaData.map((a) => (
                          <button
                            key={a.id}
                            onClick={() => { setSelectedHoraId(a.id); setError(""); }}
                            className={`px-3 py-3 rounded-xl border text-sm font-bold transition-all duration-200 ${
                              selectedHoraId === a.id
                                ? "border-[#3B82F6] bg-[#3B82F6] text-white shadow-md scale-105"
                                : "border-gray-200 bg-white text-[#746F70] hover:border-[#3B82F6] hover:text-[#3B82F6] shadow-sm"
                            }`}
                          >
                            {a.hora}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="px-6 py-5 border-t border-[#BFDBFE] flex gap-3 shrink-0 bg-white">
              <button
                onClick={closeModal}
                className="w-1/3 px-4 py-3.5 font-bold text-[#746F70] bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleAgendar}
                disabled={!selectedHoraId || agendando}
                className="w-2/3 px-4 py-3.5 font-bold text-white bg-[#3B82F6] rounded-xl hover:bg-[#2563EB] disabled:opacity-50 transition-colors shadow-md flex justify-center items-center gap-2"
              >
                {agendando ? "A Processar..." : "Confirmar Agendamento"}
                {!agendando && <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Sucesso */}
      {sucesso && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-[#16201E]/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-fade-in-up border border-green-100">
            <div className="p-8 text-center space-y-6">
              <div className="w-24 h-24 rounded-full bg-green-50 flex items-center justify-center mx-auto border-4 border-white shadow-sm relative">
                <svg className="w-12 h-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                <span className="absolute inset-0 rounded-full border-4 border-green-400 animate-ping opacity-20"></span>
              </div>
              <div>
                <p className="text-2xl font-black text-[#16201E] mb-2">Consulta Agendada!</p>
                <p className="text-sm font-medium text-[#746F70] leading-relaxed">
                  A sua consulta ficou pendente de confirmação pelo médico. Pode acompanhar o estado no seu painel.
                </p>
              </div>
              <button onClick={handleReset} className="w-full px-4 py-4 font-bold text-white bg-green-500 rounded-xl hover:bg-green-600 transition-colors shadow-md">
                Concluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
