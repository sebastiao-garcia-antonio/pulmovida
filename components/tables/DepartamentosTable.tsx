"use client";

import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import * as LucideIcons from "lucide-react";

const MySwal = withReactContent(Swal);

type Departamento = {
  id: string;
  nome: string;
  icone: string;
};

const iconOptions = [
  "Stethoscope", "HeartPulse", "Brain", "Eye", "Baby", "Activity", 
  "Pill", "Syringe", "Microscope", "Dna", "Thermometer", "Bandage",
  "Ear", "Bone", "Droplets", "Accessibility"
];

export default function DepartamentosTable() {
  const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedDept, setSelectedDept] = useState<Departamento | null>(null);
  const [formNome, setFormNome] = useState("");
  const [formIcone, setFormIcone] = useState("Stethoscope");
  const [loading, setLoading] = useState(false);

  const filtered = departamentos.filter((d) =>
    d.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedList = filtered.slice(startIndex, startIndex + itemsPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const openCreateModal = () => {
    setFormNome("");
    setFormIcone("Stethoscope");
    setCreateModalOpen(true);
  };

  const closeCreateModal = () => {
    setCreateModalOpen(false);
    setFormNome("");
  };

  const openEditModal = (d: Departamento) => {
    setSelectedDept(d);
    setFormNome(d.nome);
    setFormIcone(d.icone || "Stethoscope");
    setEditModalOpen(true);
  };

  const closeEditModal = () => {
    setEditModalOpen(false);
    setSelectedDept(null);
    setFormNome("");
  };

  const openDeleteModal = (d: Departamento) => {
    setSelectedDept(d);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setSelectedDept(null);
  };

  const fetchDepartamentos = async () => {
    try {
      const res = await fetch("/api/admin/departamentos");
      if (res.ok) {
        const data = await res.json();
        setDepartamentos(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    fetchDepartamentos();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNome.trim()) return;
    setLoading(true);

    try {
      const res = await fetch("/api/admin/departamentos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome: formNome.trim(), icone: formIcone }),
      });
      const data = await res.json();

      if (res.ok) {
        setDepartamentos([...departamentos, data]);
        closeCreateModal();
        MySwal.fire({ title: "Sucesso!", text: "Departamento criado com sucesso.", icon: "success", confirmButtonColor: "#3B82F6" });
      } else {
        MySwal.fire({ title: "Erro!", text: data.message || "Erro ao criar.", icon: "error", confirmButtonColor: "#3B82F6" });
      }
    } catch (error) {
      MySwal.fire({ title: "Erro!", text: "Erro de conexão.", icon: "error", confirmButtonColor: "#3B82F6" });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDept || !formNome.trim()) return;
    setLoading(true);

    try {
      const res = await fetch(`/api/admin/departamentos/${selectedDept.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome: formNome.trim(), icone: formIcone }),
      });
      const data = await res.json();

      if (res.ok) {
        setDepartamentos(departamentos.map((d) => (d.id === selectedDept.id ? data : d)));
        closeEditModal();
        MySwal.fire({ title: "Sucesso!", text: "Departamento atualizado.", icon: "success", confirmButtonColor: "#3B82F6" });
      } else {
        MySwal.fire({ title: "Erro!", text: data.message || "Erro ao atualizar.", icon: "error", confirmButtonColor: "#3B82F6" });
      }
    } catch (error) {
      MySwal.fire({ title: "Erro!", text: "Erro de conexão.", icon: "error", confirmButtonColor: "#3B82F6" });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedDept) return;
    setLoading(true);

    try {
      const res = await fetch(`/api/admin/departamentos/${selectedDept.id}`, { method: "DELETE" });
      const data = await res.json();

      if (res.ok) {
        setDepartamentos(departamentos.filter((d) => d.id !== selectedDept.id));
        closeDeleteModal();
        MySwal.fire({ title: "Excluído!", text: "O departamento foi removido.", icon: "success", confirmButtonColor: "#3B82F6" });
      } else {
        MySwal.fire({ title: "Atenção!", text: data.message || "Erro ao excluir.", icon: "warning", confirmButtonColor: "#3B82F6" });
      }
    } catch (error) {
      MySwal.fire({ title: "Erro!", text: "Erro de conexão.", icon: "error", confirmButtonColor: "#3B82F6" });
    } finally {
      closeDeleteModal();
      setLoading(false);
    }
  };

  return (
    <>
      <div className="saas-card overflow-hidden">
        <div className="px-6 py-5 order-b border-[#BFDBFE] bg-[#EFF6FF]/50 flex flex-col gap-4">
          <h2 className="font-bold text-[#16201E]">Lista Estruturada</h2>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <input
              type="text"
              placeholder="Pesquisar departamento..."
              className="px-4 py-2 bg-white border border-[#BFDBFE] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6] text-[#16201E] w-full sm:w-64"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
            <button
              onClick={openCreateModal}
              className="px-4 py-2 bg-[#3B82F6] text-white font-medium rounded-lg hover:bg-[#2563EB] transition-colors whitespace-nowrap"
            >
              <span className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="hidden lg:block">Novo Departamento</span>
              </span>
            </button>
          </div>
        </div>

        {loadingData ? (
          <div className="p-8 text-[#746F70] text-sm text-center">A carregar departamentos...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-[#746F70] text-sm text-center">Nenhum departamento encontrado.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#EFF6FF]/50 border-b border-[#BFDBFE]">
                  <th className="px-6 py-3 text-xs font-semibold text-[#746F70] uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-xs font-semibold text-[#746F70] uppercase tracking-wider">Nome do Departamento</th>
                  <th className="px-6 py-3 text-xs font-semibold text-[#746F70] uppercase tracking-wider text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#BFDBFE] bg-white">
                {paginatedList.map((d) => {
                  // @ts-ignore
                  const Icon = LucideIcons[d.icone || "Stethoscope"] || LucideIcons.Stethoscope;
                  return (
                  <tr key={d.id} className="hover:bg-[#EFF6FF]/30 transition-colors group">
                    <td className="px-6 py-4 text-sm font-medium text-[#746F70]">#{d.id.substring(0, 8)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#EFF6FF] rounded-lg text-[#3B82F6]">
                          <Icon size={20} />
                        </div>
                        <span className="text-sm font-semibold text-[#16201E]">{d.nome}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-right">
                      <button
                        onClick={() => openEditModal(d)}
                        className="text-[#3B82F6] hover:text-[#2563EB] p-2 rounded-lg hover:bg-[#EFF6FF] transition-colors opacity-100 md:opacity-0 md:group-hover:opacity-100"
                        title="Editar Departamento"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => openDeleteModal(d)}
                        className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors opacity-100 md:opacity-0 md:group-hover:opacity-100 ml-1"
                        title="Eliminar Departamento"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                )})}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-[#BFDBFE] bg-[#EFF6FF]/50">
            <span className="text-sm text-[#746F70]">
              Página <span className="font-semibold text-[#16201E]">{currentPage}</span> de <span className="font-semibold text-[#16201E]">{totalPages}</span>
              {" "}| {filtered.length} total
            </span>
            <div className="flex gap-2">
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className="px-3 py-1.5 text-sm font-medium text-[#16201E] bg-white border border-[#BFDBFE] rounded-md hover:bg-[#EFF6FF] disabled:opacity-50"
              >
                Anterior
              </button>
              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 text-sm font-medium text-[#16201E] bg-white border border-[#BFDBFE] rounded-md hover:bg-[#EFF6FF] disabled:opacity-50"
              >
                Próxima
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Criar */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#16201E]/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-fade-in-up">
            <div className="px-6 py-4 border-b border-[#BFDBFE] flex justify-between items-center">
              <h3 className="text-lg font-bold text-[#16201E]">Novo Departamento</h3>
              <button onClick={closeCreateModal} className="text-[#746F70] hover:text-[#16201E]">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-[#16201E] mb-1">Nome do Departamento</label>
                <input
                  type="text"
                  autoFocus
                  required
                  className="saas-input w-full"
                  value={formNome}
                  onChange={(e) => setFormNome(e.target.value)}
                  placeholder="Ex: Cardiologia"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#16201E] mb-2">Ícone do Departamento</label>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-40 overflow-y-auto p-2 border border-[#BFDBFE] rounded-lg bg-[#EFF6FF]/20">
                  {iconOptions.map((iconName) => {
                    // @ts-ignore
                    const Icon = LucideIcons[iconName] || LucideIcons.HelpCircle;
                    return (
                      <button
                        key={iconName}
                        type="button"
                        onClick={() => setFormIcone(iconName)}
                        className={`p-2 flex justify-center items-center rounded-lg transition-colors border ${
                          formIcone === iconName ? "bg-[#3B82F6] text-white border-[#3B82F6]" : "bg-white text-[#64748B] border-[#E2E8F0] hover:border-[#3B82F6] hover:text-[#3B82F6]"
                        }`}
                        title={iconName}
                      >
                        <Icon size={24} />
                      </button>
                    );
                  })}
                </div>
              </div>
              <button
                type="submit"
                disabled={loading || !formNome.trim()}
                className="w-full px-4 py-3 font-bold text-white bg-[#3B82F6] rounded-xl hover:bg-[#2563EB] disabled:opacity-50 transition-colors"
              >
                {loading ? "Cadastrando..." : "Cadastrar"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal Editar */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#16201E]/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-fade-in-up">
            <div className="px-6 py-4 border-b border-[#BFDBFE] flex justify-between items-center">
              <h3 className="text-lg font-bold text-[#16201E]">Editar Departamento</h3>
              <button onClick={closeEditModal} className="text-[#746F70] hover:text-[#16201E]">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleEdit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-[#16201E] mb-1">Nome do Departamento</label>
                <input
                  type="text"
                  autoFocus
                  required
                  className="saas-input w-full"
                  value={formNome}
                  onChange={(e) => setFormNome(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#16201E] mb-2">Ícone do Departamento</label>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-40 overflow-y-auto p-2 border border-[#BFDBFE] rounded-lg bg-[#EFF6FF]/20">
                  {iconOptions.map((iconName) => {
                    // @ts-ignore
                    const Icon = LucideIcons[iconName] || LucideIcons.HelpCircle;
                    return (
                      <button
                        key={iconName}
                        type="button"
                        onClick={() => setFormIcone(iconName)}
                        className={`p-2 flex justify-center items-center rounded-lg transition-colors border ${
                          formIcone === iconName ? "bg-[#3B82F6] text-white border-[#3B82F6]" : "bg-white text-[#64748B] border-[#E2E8F0] hover:border-[#3B82F6] hover:text-[#3B82F6]"
                        }`}
                        title={iconName}
                      >
                        <Icon size={24} />
                      </button>
                    );
                  })}
                </div>
              </div>
              <button
                type="submit"
                disabled={loading || !formNome.trim()}
                className="w-full px-4 py-3 font-bold text-white bg-[#3B82F6] rounded-xl hover:bg-[#2563EB] disabled:opacity-50 transition-colors"
              >
                {loading ? "A guardar..." : "Guardar Alterações"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal Eliminar */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#16201E]/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-fade-in-up">
            <div className="px-6 py-4 border-b border-red-100 flex justify-between items-center bg-red-50">
              <h3 className="text-lg font-bold text-red-700">Eliminar Departamento</h3>
              <button onClick={closeDeleteModal} className="text-red-400 hover:text-red-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-[#746F70]">
                Tem certeza que deseja eliminar <strong className="text-[#16201E]">{selectedDept?.nome}</strong>? Esta ação não pode ser desfeita.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={closeDeleteModal}
                  className="flex-1 px-4 py-3 font-medium text-[#746F70] bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDelete}
                  disabled={loading}
                  className="flex-1 px-4 py-3 font-bold text-white bg-red-600 rounded-xl hover:bg-red-700 disabled:opacity-50 transition-colors"
                >
                  {loading ? "A eliminar..." : "Eliminar"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
