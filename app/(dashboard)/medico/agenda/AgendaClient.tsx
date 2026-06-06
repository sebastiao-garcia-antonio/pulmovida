"use client";

import { useState } from "react";
import { createAgenda, updateAgenda, deleteAgenda } from "./actions";

type Agenda = {
  id: string;
  data: string;
  horario: string;
  disponivel: boolean;
  status: string; // "disponivel", "ocupado", "confirmado", "cancelado"
};

export default function AgendaClient({ initialAgendas }: { initialAgendas: Agenda[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDisponivel, setFilterDisponivel] = useState("todos");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedAgenda, setSelectedAgenda] = useState<Agenda | null>(null);
  const [formData, setFormData] = useState({ data: "", horario: "" });
  const [loading, setLoading] = useState(false);

  const filtered = initialAgendas.filter((a) => {
    const matchSearch = a.data.includes(searchTerm);
    const matchFilter = filterDisponivel === "todos" ||
      (filterDisponivel === "disponivel" && a.status === "disponivel") ||
      (filterDisponivel === "ocupado" && a.status === "ocupado") ||
      (filterDisponivel === "confirmado" && a.status === "confirmado") ||
      (filterDisponivel === "cancelado" && a.status === "cancelado") ||
      (filterDisponivel === "realizado" && a.status === "realizado");
    return matchSearch && matchFilter;
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedList = filtered.slice(startIndex, startIndex + itemsPerPage);

  const handleNextPage = () => { if (currentPage < totalPages) setCurrentPage(currentPage + 1); };
  const handlePrevPage = () => { if (currentPage > 1) setCurrentPage(currentPage - 1); };

  const openCreateModal = () => { setFormData({ data: "", horario: "" }); setCreateModalOpen(true); };
  const closeCreateModal = () => { setCreateModalOpen(false); setFormData({ data: "", horario: "" }); };

  const openEditModal = (a: Agenda) => {
    setSelectedAgenda(a);
    setFormData({ data: a.data, horario: a.horario });
    setEditModalOpen(true);
  };
  const closeEditModal = () => { setEditModalOpen(false); setSelectedAgenda(null); setFormData({ data: "", horario: "" }); };

  const openDeleteModal = (a: Agenda) => { setSelectedAgenda(a); setDeleteModalOpen(true); };
  const closeDeleteModal = () => { setDeleteModalOpen(false); setSelectedAgenda(null); };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.data || !formData.horario) return;
    setLoading(true);
    try {
      await createAgenda(formData.data, formData.horario);
      closeCreateModal();
    } catch (error: any) {
      alert(error.message || "Erro ao criar horário");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAgenda || !formData.data || !formData.horario) return;
    setLoading(true);
    try {
      await updateAgenda(selectedAgenda.id, formData.data, formData.horario);
      closeEditModal();
    } catch (error: any) {
      alert(error.message || "Erro ao atualizar horário");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedAgenda) return;
    setLoading(true);
    try {
      await deleteAgenda(selectedAgenda.id);
      closeDeleteModal();
    } catch (error: any) {
      alert(error.message || "Erro ao eliminar horário");
    } finally {
      setLoading(false);
    }
  };

  // Impedir seleção de hoje ou dias anteriores
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split("T")[0];

  return (
    <div className="p-6 sm:p-10 max-w-7xl mx-auto space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-[#16201E] tracking-tight">Minha Agenda</h1>
          <p className="mt-1 text-[#746F70]">Defina os seus horários de disponibilidade para consultas.</p>
        </div>
      </div>

      <div className="saas-card overflow-hidden border border-blue-100">
        <div className="px-6 py-5 border-b border-[#BFDBFE] bg-[#EFF6FF]/50 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <h2 className="text-lg font-bold text-[#16201E]">Horários Configurados</h2>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <input
              type="date"
              className="px-4 py-2 bg-white border border-[#BFDBFE] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6] text-[#16201E] w-full sm:w-48 shadow-sm"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            />
            <select
              className="px-4 py-2 bg-white border border-[#BFDBFE] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6] text-[#16201E] shadow-sm font-medium"
              value={filterDisponivel}
              onChange={(e) => { setFilterDisponivel(e.target.value); setCurrentPage(1); }}
            >
              <option value="todos">Todos</option>
              <option value="disponivel">Disponíveis</option>
              <option value="ocupado">Marcados</option>
            </select>
            <button
              onClick={openCreateModal}
              className="px-4 py-2 bg-[#3B82F6] text-white font-bold rounded-lg hover:bg-[#2563EB] transition-colors whitespace-nowrap shadow-sm"
            >
              <span className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                Novo Horário
              </span>
            </button>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="p-12 text-[#746F70] text-center flex flex-col items-center">
            <svg className="w-12 h-12 mb-3 text-blue-200" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            <p className="font-medium text-lg">Nenhum horário encontrado.</p>
            <p className="text-sm mt-1">Crie um novo horário para permitir marcações.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#EFF6FF]/50 border-b border-[#BFDBFE]">
                  <th className="px-6 py-3 text-xs font-bold text-[#3B82F6] uppercase tracking-wider">Data</th>
                  <th className="px-6 py-3 text-xs font-bold text-[#3B82F6] uppercase tracking-wider">Horário</th>
                  <th className="px-6 py-3 text-xs font-bold text-[#3B82F6] uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-xs font-bold text-[#3B82F6] uppercase tracking-wider text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {paginatedList.map((a) => (
                  <tr key={a.id} className="hover:bg-blue-50/50 transition-colors group">
                    <td className="px-6 py-4 text-sm font-bold text-[#16201E]">
                      {new Date(a.data).toLocaleDateString("pt-BR", { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 text-sm font-mono font-bold text-blue-600 bg-blue-50/30 rounded inline-block my-2 mx-6 px-2">{a.horario}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide border ${
                          a.status === "disponivel" ? "bg-green-50 text-green-700 border-green-200" :
                          a.status === "pendente" ? "bg-yellow-50 text-yellow-700 border-yellow-200" :
                          a.status === "confirmado" ? "bg-blue-50 text-blue-700 border-blue-200" :
                          a.status === "realizado" ? "bg-gray-50 text-gray-700 border-gray-200" :
                          "bg-red-50 text-red-700 border-red-200"
                        }`}
                      >
                        {a.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-right">
                      <button
                        onClick={() => openEditModal(a)}
                        disabled={a.status !== "disponivel"}
                        className="text-[#3B82F6] hover:text-[#2563EB] p-2 rounded-lg hover:bg-[#EFF6FF] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        title={a.status !== "disponivel" ? "Não pode editar horário com marcação" : "Editar"}
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                      </button>
                      <button
                        onClick={() => openDeleteModal(a)}
                        disabled={a.status !== "disponivel"}
                        className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed ml-1"
                        title={a.status !== "disponivel" ? "Não pode eliminar horário com marcação" : "Eliminar"}
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
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

      {/* Modal Criar */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#16201E]/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-fade-in-up">
            <div className="px-6 py-4 border-b border-[#BFDBFE] flex justify-between items-center bg-blue-50/50">
              <h3 className="text-lg font-bold text-[#16201E]">Novo Horário</h3>
              <button onClick={closeCreateModal} className="text-[#746F70] hover:text-[#16201E]"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-bold text-[#16201E] mb-1.5">Data</label>
                <input type="date" min={minDate} autoFocus required className="saas-input w-full shadow-sm" value={formData.data} onChange={(e) => setFormData({ ...formData, data: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-bold text-[#16201E] mb-1.5">Horário</label>
                <input type="time" required className="saas-input w-full shadow-sm" value={formData.horario} onChange={(e) => setFormData({ ...formData, horario: e.target.value })} />
              </div>
              <button type="submit" disabled={loading} className="w-full px-4 py-3.5 font-bold text-white bg-[#3B82F6] rounded-xl hover:bg-[#2563EB] disabled:opacity-50 transition-colors shadow-sm">{loading ? "Salvando..." : "Criar Horário"}</button>
            </form>
          </div>
        </div>
      )}

      {/* Modal Editar */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#16201E]/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-fade-in-up">
            <div className="px-6 py-4 border-b border-[#BFDBFE] flex justify-between items-center bg-blue-50/50">
              <h3 className="text-lg font-bold text-[#16201E]">Editar Horário</h3>
              <button onClick={closeEditModal} className="text-[#746F70] hover:text-[#16201E]"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
            <form onSubmit={handleEdit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-bold text-[#16201E] mb-1.5">Data</label>
                <input type="date" min={minDate} autoFocus required className="saas-input w-full shadow-sm" value={formData.data} onChange={(e) => setFormData({ ...formData, data: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-bold text-[#16201E] mb-1.5">Horário</label>
                <input type="time" required className="saas-input w-full shadow-sm" value={formData.horario} onChange={(e) => setFormData({ ...formData, horario: e.target.value })} />
              </div>
              <button type="submit" disabled={loading} className="w-full px-4 py-3.5 font-bold text-white bg-[#3B82F6] rounded-xl hover:bg-[#2563EB] disabled:opacity-50 transition-colors shadow-sm">{loading ? "Salvando..." : "Salvar Alterações"}</button>
            </form>
          </div>
        </div>
      )}

      {/* Modal Eliminar */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#16201E]/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-fade-in-up border border-red-100">
            <div className="px-6 py-4 border-b border-red-100 flex justify-between items-center bg-red-50">
              <h3 className="text-lg font-bold text-red-700">Eliminar Horário</h3>
              <button onClick={closeDeleteModal} className="text-red-400 hover:text-red-600"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
            <div className="p-6 space-y-6">
              <p className="text-[#746F70]">Tem certeza absoluta que deseja eliminar o horário de <strong className="text-[#16201E] bg-gray-100 px-2 py-1 rounded">{new Date(selectedAgenda?.data || "").toLocaleDateString("pt-BR")} às {selectedAgenda?.horario}</strong>?</p>
              <div className="flex gap-3">
                <button onClick={closeDeleteModal} className="flex-1 px-4 py-3 font-bold text-[#746F70] bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">Cancelar</button>
                <button onClick={handleDelete} disabled={loading} className="flex-1 px-4 py-3 font-bold text-white bg-red-600 rounded-xl hover:bg-red-700 disabled:opacity-50 transition-colors shadow-sm">{loading ? "Eliminando..." : "Sim, Eliminar"}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
