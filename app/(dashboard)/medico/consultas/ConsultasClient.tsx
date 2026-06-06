"use client";

import { useState } from "react";
import { registrarConsulta } from "./actions";

type Consulta = {
  id: string; // id do agendamento
  paciente: string;
  data: string;
  hora: string;
  status: string;
  diagnostico: string | null;
  prescricao: string | null;
};

export default function ConsultasClient({ initialConsultas }: { initialConsultas: Consulta[] }) {
  const [consultas, setConsultas] = useState<Consulta[]>(initialConsultas);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("todos");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedConsulta, setSelectedConsulta] = useState<Consulta | null>(null);
  const [formDiagnostico, setFormDiagnostico] = useState("");
  const [formPrescricao, setFormPrescricao] = useState("");
  const [loading, setLoading] = useState(false);

  const filtered = consultas.filter((c) => {
    const matchSearch = c.paciente.toLowerCase().includes(searchTerm.toLowerCase()) || c.data.includes(searchTerm);
    const matchStatus = filterStatus === "todos" || c.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedList = filtered.slice(startIndex, startIndex + itemsPerPage);

  const handleNextPage = () => { if (currentPage < totalPages) setCurrentPage(currentPage + 1); };
  const handlePrevPage = () => { if (currentPage > 1) setCurrentPage(currentPage - 1); };

  const openEditModal = (c: Consulta) => {
    setSelectedConsulta(c);
    setFormDiagnostico(c.diagnostico || "");
    setFormPrescricao(c.prescricao || "");
    setEditModalOpen(true);
  };

  const closeEditModal = () => {
    setEditModalOpen(false);
    setSelectedConsulta(null);
    setFormDiagnostico("");
    setFormPrescricao("");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedConsulta) return;
    setLoading(true);
    try {
      await registrarConsulta(selectedConsulta.id, formDiagnostico, formPrescricao);
      
      setConsultas((prev) =>
        prev.map((c) =>
          c.id === selectedConsulta.id
            ? { ...c, diagnostico: formDiagnostico, prescricao: formPrescricao, status: "realizado" }
            : c
        )
      );
      closeEditModal();
    } catch (error: any) {
      alert(error.message || "Erro ao registrar consulta");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "realizado": return "bg-green-100 text-green-700 border border-green-200";
      case "pendente": return "bg-yellow-100 text-yellow-700 border border-yellow-200";
      case "confirmado": return "bg-blue-100 text-blue-700 border border-blue-200";
      case "cancelado": return "bg-red-100 text-red-700 border border-red-200";
      default: return "bg-gray-100 text-gray-700 border border-gray-200";
    }
  };

  return (
    <div className="p-6 sm:p-10 max-w-7xl mx-auto space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-[#16201E] tracking-tight">Atendimentos</h1>
          <p className="mt-1 text-[#746F70]">Gerencie e registre as suas consultas clínicas.</p>
        </div>
      </div>

      <div className="saas-card overflow-hidden border border-blue-100">
        <div className="px-6 py-5 border-b border-[#BFDBFE] bg-[#EFF6FF]/50 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <h2 className="text-lg font-bold text-[#16201E]">Lista de Agendamentos</h2>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <input
              type="text"
              placeholder="Pesquisar por paciente ou data..."
              className="px-4 py-2 bg-white border border-[#BFDBFE] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6] text-[#16201E] w-full sm:w-56 shadow-sm"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            />
            <select
              className="px-4 py-2 bg-white border border-[#BFDBFE] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6] text-[#16201E] shadow-sm font-medium"
              value={filterStatus}
              onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
            >
              <option value="todos">Todos os status</option>
              <option value="pendente">Pendente</option>
              <option value="confirmado">Confirmado</option>
              <option value="realizado">Realizado</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="p-12 text-[#746F70] text-center flex flex-col items-center">
            <svg className="w-12 h-12 mb-3 text-blue-200" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
            <p className="font-medium text-lg">Nenhum atendimento encontrado.</p>
            <p className="text-sm mt-1">Quando os pacientes marcarem consultas, elas aparecerão aqui.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#EFF6FF]/50 border-b border-[#BFDBFE]">
                  <th className="px-6 py-3 text-xs font-bold text-[#3B82F6] uppercase tracking-wider">Paciente</th>
                  <th className="px-6 py-3 text-xs font-bold text-[#3B82F6] uppercase tracking-wider">Data</th>
                  <th className="px-6 py-3 text-xs font-bold text-[#3B82F6] uppercase tracking-wider">Hora</th>
                  <th className="px-6 py-3 text-xs font-bold text-[#3B82F6] uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-xs font-bold text-[#3B82F6] uppercase tracking-wider text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {paginatedList.map((c) => (
                  <tr key={c.id} className="hover:bg-blue-50/50 transition-colors group">
                    <td className="px-6 py-4 text-sm font-bold text-[#16201E]">{c.paciente}</td>
                    <td className="px-6 py-4 text-sm text-[#746F70]">{c.data}</td>
                    <td className="px-6 py-4 text-sm text-blue-600 font-mono font-bold bg-blue-50/30 rounded inline-block my-2 mx-6 px-2">{c.hora}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide border ${getStatusColor(c.status)}`}>{c.status}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-right">
                      {c.status === "realizado" ? (
                        <button
                          onClick={() => openEditModal(c)}
                          className="text-green-600 hover:text-green-800 p-2 rounded-lg hover:bg-green-50 transition-colors font-medium text-xs"
                          title="Ver Registo"
                        >
                          Ver Registo
                        </button>
                      ) : (
                        <button
                          onClick={() => openEditModal(c)}
                          disabled={c.status === "cancelado"}
                          className="text-[#3B82F6] hover:text-[#2563EB] p-2 rounded-lg hover:bg-[#EFF6FF] transition-colors disabled:opacity-30 disabled:cursor-not-allowed font-medium text-xs"
                          title="Registrar Consulta"
                        >
                          Atender
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-[#BFDBFE] bg-[#EFF6FF]/50">
            <span className="text-sm text-[#746F70]">
              Página <span className="font-semibold text-[#16201E]">{currentPage}</span> de <span className="font-semibold text-[#16201E]">{totalPages}</span> | {filtered.length} total
            </span>
            <div className="flex gap-2">
              <button onClick={handlePrevPage} disabled={currentPage === 1} className="px-3 py-1.5 text-sm font-medium text-[#16201E] bg-white border border-[#BFDBFE] rounded-md hover:bg-[#EFF6FF] shadow-sm disabled:opacity-50">Anterior</button>
              <button onClick={handleNextPage} disabled={currentPage === totalPages} className="px-3 py-1.5 text-sm font-medium text-[#16201E] bg-white border border-[#BFDBFE] rounded-md hover:bg-[#EFF6FF] shadow-sm disabled:opacity-50">Próxima</button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Registrar Consulta */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#16201E]/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-fade-in-up">
            <div className={`px-6 py-4 border-b flex justify-between items-center ${selectedConsulta?.status === "realizado" ? "bg-green-50/50 border-green-200" : "bg-blue-50/50 border-[#BFDBFE]"}`}>
              <h3 className="text-lg font-bold text-[#16201E]">
                {selectedConsulta?.status === "realizado" ? "Registo Clínico" : "Registrar Atendimento"}
              </h3>
              <button onClick={closeEditModal} className="text-[#746F70] hover:text-[#16201E]">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-5">
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-100 flex justify-between items-center">
                <div>
                  <p className="text-sm font-bold text-[#16201E]">{selectedConsulta?.paciente}</p>
                  <p className="text-xs text-[#746F70]">{selectedConsulta?.data} às {selectedConsulta?.hora}</p>
                </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide border ${getStatusColor(selectedConsulta?.status || "")}`}>
                  {selectedConsulta?.status}
                </span>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-[#16201E] mb-1.5">Diagnóstico Final</label>
                <textarea
                  autoFocus={selectedConsulta?.status !== "realizado"}
                  disabled={selectedConsulta?.status === "realizado"}
                  rows={3}
                  className="saas-input w-full resize-none shadow-sm disabled:bg-gray-50 disabled:text-gray-600"
                  value={formDiagnostico}
                  onChange={(e) => setFormDiagnostico(e.target.value)}
                  placeholder="Descreva o diagnóstico ou sintomas..."
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-[#16201E] mb-1.5">Prescrição / Observações</label>
                <textarea
                  disabled={selectedConsulta?.status === "realizado"}
                  rows={3}
                  className="saas-input w-full resize-none shadow-sm disabled:bg-gray-50 disabled:text-gray-600"
                  value={formPrescricao}
                  onChange={(e) => setFormPrescricao(e.target.value)}
                  placeholder="Medicamentos recomendados, exames e observações gerais..."
                />
              </div>
              
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="flex-1 px-4 py-3 font-bold text-[#746F70] bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                >
                  {selectedConsulta?.status === "realizado" ? "Fechar" : "Cancelar"}
                </button>
                {selectedConsulta?.status !== "realizado" && (
                  <button
                    type="submit"
                    disabled={loading || !formDiagnostico}
                    className="flex-1 px-4 py-3 font-bold text-white bg-[#3B82F6] rounded-xl hover:bg-[#2563EB] disabled:opacity-50 transition-colors shadow-sm"
                  >
                    {loading ? "A Guardar..." : "Finalizar Consulta"}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
