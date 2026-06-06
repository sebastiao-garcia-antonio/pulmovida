"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AgendaForm from "@/components/forms/AgendaForm";

type Agenda = {
  id: number;
  medico_id: number;
  data: string;
  horario: string;
};

interface MinhaAgendaTableProps {
  agendas: Agenda[];
  medicoId: number;
}

export default function MinhaAgendaTable({ agendas, medicoId }: MinhaAgendaTableProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedAgenda, setSelectedAgenda] = useState<Agenda | null>(null);
  const [editData, setEditData] = useState("");
  const [editHorario, setEditHorario] = useState("");
  const [saving, setSaving] = useState(false);

  // Filter
  const filtered = agendas.filter((a) => {
    const dStr = new Date(a.data).toLocaleDateString().toLowerCase();
    const hStr = a.horario.toLowerCase();
    const term = searchTerm.toLowerCase();
    return dStr.includes(term) || hStr.includes(term);
  });

  // Paginação
  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedList = filtered.slice(startIndex, startIndex + itemsPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Tem a certeza que deseja eliminar este horário?")) return;
    try {
      const res = await fetch(`/api/medico/agenda/${id}`, { method: "DELETE" });
      if (!res.ok) {
        let msg = "Erro ao eliminar horário";
        try {
          const data = await res.json();
          msg = data.message;
        } catch(e) {}
        throw new Error(msg);
      }
      alert("Horário eliminado com sucesso");
      router.refresh();
    } catch (err: any) {
      alert("Erro: " + err.message);
    }
  };

  const openEditModal = (agenda: Agenda) => {
    setSelectedAgenda(agenda);
    // Format YYYY-MM-DD
    const dateObj = new Date(agenda.data);
    const day = ("0" + dateObj.getDate()).slice(-2);
    const month = ("0" + (dateObj.getMonth() + 1)).slice(-2);
    const year = dateObj.getFullYear();
    setEditData(`${year}-${month}-${day}`);
    setEditHorario(agenda.horario);
    setEditModalOpen(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAgenda) return;
    setSaving(true);
    
    try {
      const res = await fetch(`/api/medico/agenda/${selectedAgenda.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: editData, horario: editHorario }),
      });
      
      if (!res.ok) throw new Error("Falha ao atualizar horário");
      
      setEditModalOpen(false);
      setSelectedAgenda(null);
      router.refresh();
    } catch (err: any) {
      alert("Erro: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-gray-800">Horários Cadastrados</h2>
        
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Filtrar por data ou hora..."
            className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-slate-900"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
          <button 
            onClick={() => setCreateModalOpen(true)}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-emerald-500 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-emerald-600 transition-colors shadow flex items-center gap-2"
          >
            <span>+</span> Novo Horário
          </button>
        </div>
      </div>

      <div className="p-0">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-100">
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Data</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Horário</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {paginatedList.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-6 py-8 text-center text-gray-500 text-sm">
                  Nenhum horário encontrado.
                </td>
              </tr>
            ) : (
              paginatedList.map(a => (
                <tr key={a.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-6 py-4">
                    <span className="font-semibold text-gray-700">{new Date(a.data).toLocaleDateString()}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-blue-600 font-bold bg-blue-50 px-3 py-1 rounded-lg border border-blue-100">{a.horario}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => openEditModal(a)}
                        className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                        title="Editar Horário"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                      <button 
                        onClick={() => handleDelete(a.id)}
                        className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors"
                        title="Eliminar Horário"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/50">
          <span className="text-sm text-gray-500">
            Página <span className="font-semibold text-gray-800">{currentPage}</span> de <span className="font-semibold text-gray-800">{totalPages}</span>
          </span>
          <div className="flex gap-2">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Próxima
            </button>
          </div>
        </div>
      )}

      {/* Modal Criar */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden relative animate-fade-in-up md:mt-24">
            <button onClick={() => setCreateModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
              <span className="sr-only">Fechar</span>✖
            </button>
            <div className="p-2">
              <AgendaForm medicoId={medicoId} />
            </div>
          </div>
        </div>
      )}

      {/* Modal Editar */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-fade-in-up">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-800">Editar Horário</h3>
              <button onClick={() => setEditModalOpen(false)} className="text-gray-400 hover:text-gray-600">✖</button>
            </div>
            
            <form onSubmit={handleSaveEdit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Data</label>
                <input 
                  type="date" 
                  required
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900" 
                  value={editData} 
                  onChange={(e) => setEditData(e.target.value)} 
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Horário</label>
                <input 
                  type="time" 
                  required
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900" 
                  value={editHorario} 
                  onChange={(e) => setEditHorario(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={saving || !editData || !editHorario}
                className="w-full px-4 py-3 mt-2 font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {saving ? "A guardar..." : "Guardar Alterações"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
