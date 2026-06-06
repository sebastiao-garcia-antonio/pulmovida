"use client";

import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

type Medico = {
  id: string;
  userId: string;
  nome: string;
  email: string;
  especialidade: string | null;
  departamentoId: string | null;
  departamentoNome: string | null;
  senhaTemporaria?: boolean;
};

type Departamento = {
  id: string;
  nome: string;
};

export default function MedicosTable() {
  const [medicos, setMedicos] = useState<Medico[]>([]);
  const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"todos" | "ativo" | "incompleto">("todos");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedMedico, setSelectedMedico] = useState<Medico | null>(null);
  const [formNome, setFormNome] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formEspecialidade, setFormEspecialidade] = useState("");
  const [formDepartamento, setFormDepartamento] = useState("");
  const [loading, setLoading] = useState(false);

  const filtered = medicos.filter((m) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      m.nome.toLowerCase().includes(term) ||
      m.email.toLowerCase().includes(term) ||
      (m.especialidade || "").toLowerCase().includes(term) ||
      (m.departamentoNome || "").toLowerCase().includes(term);
    const isComplete = m.especialidade && m.departamentoId;
    const matchesStatus =
      filterStatus === "todos" ||
      (filterStatus === "ativo" && isComplete) ||
      (filterStatus === "incompleto" && !isComplete);
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedList = filtered.slice(startIndex, startIndex + itemsPerPage);

  const handleNextPage = () => { if (currentPage < totalPages) setCurrentPage(currentPage + 1); };
  const handlePrevPage = () => { if (currentPage > 1) setCurrentPage(currentPage - 1); };

  const openCreateModal = () => {
    setFormNome(""); setFormEmail("");
    setFormEspecialidade(""); setFormDepartamento("");
    setCreateModalOpen(true);
  };

  const closeCreateModal = () => {
    setCreateModalOpen(false);
    setFormNome(""); setFormEmail("");
    setFormEspecialidade(""); setFormDepartamento("");
  };

  const openEditModal = (m: Medico) => {
    setSelectedMedico(m);
    setFormEspecialidade(m.especialidade || "");
    setFormDepartamento(m.departamentoId || "");
    setEditModalOpen(true);
  };

  const closeEditModal = () => {
    setEditModalOpen(false);
    setSelectedMedico(null);
    setFormEspecialidade(""); setFormDepartamento("");
  };

  const openDeleteModal = (m: Medico) => {
    setSelectedMedico(m);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setSelectedMedico(null);
  };

  const fetchData = async () => {
    try {
      const [resMedicos, resDepartamentos] = await Promise.all([
        fetch("/api/admin/medicos"),
        fetch("/api/admin/departamentos")
      ]);
      if (resMedicos.ok) {
        setMedicos(await resMedicos.json());
      }
      if (resDepartamentos.ok) {
        setDepartamentos(await resDepartamentos.json());
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNome || !formEmail) return;
    setLoading(true);

    try {
      const res = await fetch("/api/admin/medicos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome: formNome, email: formEmail, especialidade: formEspecialidade || null, departamentoId: formDepartamento || null }),
      });
      const data = await res.json();

      if (res.ok) {
        setMedicos([...medicos, data]);
        closeCreateModal();
        MySwal.fire({ title: "Sucesso!", text: "Médico registrado e senha enviada.", icon: "success", confirmButtonColor: "#3B82F6" });
      } else {
        MySwal.fire({ title: "Erro!", text: data.message || "Erro ao registrar.", icon: "error", confirmButtonColor: "#3B82F6" });
      }
    } catch (error) {
      MySwal.fire({ title: "Erro!", text: "Erro de conexão.", icon: "error", confirmButtonColor: "#3B82F6" });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMedico) return;
    setLoading(true);

    try {
      const res = await fetch(`/api/admin/medicos/${selectedMedico.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ especialidade: formEspecialidade || null, departamentoId: formDepartamento || null }),
      });
      const data = await res.json();

      if (res.ok) {
        setMedicos(medicos.map((m) => (m.id === selectedMedico.id ? data : m)));
        closeEditModal();
        MySwal.fire({ title: "Sucesso!", text: "Detalhes atualizados.", icon: "success", confirmButtonColor: "#3B82F6" });
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
    if (!selectedMedico) return;
    setLoading(true);

    try {
      const res = await fetch(`/api/admin/medicos/${selectedMedico.id}`, { method: "DELETE" });
      const data = await res.json();

      if (res.ok) {
        setMedicos(medicos.filter((m) => m.id !== selectedMedico.id));
        closeDeleteModal();
        MySwal.fire({ title: "Excluído!", text: "Médico removido com sucesso.", icon: "success", confirmButtonColor: "#3B82F6" });
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

  const handleResend = async (id: string) => {
    MySwal.fire({ title: "A enviar...", allowOutsideClick: false, didOpen: () => MySwal.showLoading() });
    try {
      const res = await fetch(`/api/admin/medicos/${id}/resend`, { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        MySwal.fire({ title: "Enviado!", text: "Nova senha enviada para o e-mail.", icon: "success", confirmButtonColor: "#3B82F6" });
      } else {
        MySwal.fire({ title: "Atenção!", text: data.message, icon: "warning", confirmButtonColor: "#3B82F6" });
      }
    } catch (error) {
      MySwal.fire({ title: "Erro!", text: "Erro de conexão.", icon: "error", confirmButtonColor: "#3B82F6" });
    }
  };

  return (
    <>
      <div className="saas-card overflow-hidden">
        <div className="px-6 py-5 border-b border-[#BFDBFE] bg-[#EFF6FF]/50 flex flex-col gap-4">
          <h2 className="text-lg font-bold text-[#16201E]">Quadro de Profissionais</h2>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <input
              type="text"
              placeholder="Pesquisar por nome, email ou especialidade..."
              className="px-4 py-2 bg-white border border-[#BFDBFE] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6] text-[#16201E] w-full w-64"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            />
            <select
              value={filterStatus}
              onChange={(e) => { setFilterStatus(e.target.value as "todos" | "ativo" | "incompleto"); setCurrentPage(1); }}
              className="px-3 py-2 bg-white border border-[#BFDBFE] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6] text-[#16201E] text-sm"
            >
              <option value="todos">Todos os status</option>
              <option value="ativo">Ativo</option>
              <option value="incompleto">Incompleto</option>
            </select>
            <button
              onClick={openCreateModal}
              className="px-4 py-2 bg-[#3B82F6] text-white font-medium rounded-lg hover:bg-[#2563EB] transition-colors whitespace-nowrap"
            >
              <span className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="hidden lg:block">Novo Médico</span>
              </span>
            </button>
          </div>
        </div>

        {loadingData ? (
          <div className="p-8 text-[#746F70] text-sm text-center">A carregar profissionais...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-[#746F70] text-sm text-center">Nenhum médico encontrado.</div>
        ) : (
          <>
            <div className="md:hidden divide-y divide-[#BFDBFE]">
              {paginatedList.map((m) => {
                const isComplete = m.especialidade && m.departamentoId;
                return (
                  <div key={m.id} className="px-4 py-4 space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-bold text-[#16201E]">{m.nome}</p>
                        <p className="text-xs text-[#746F70]">{m.email}</p>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => openEditModal(m)}
                          className="text-[#3B82F6] hover:text-[#2563EB] p-1.5 rounded-lg hover:bg-[#EFF6FF] transition-colors"
                          title="Editar Detalhes"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => openDeleteModal(m)}
                          className="text-red-500 hover:text-red-700 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                          title="Eliminar Médico"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-semibold text-[#16201E]">{m.especialidade || "—"}</p>
                        <p className="text-xs text-[#746F70]">{m.departamentoNome || "—"}</p>
                      </div>
                      {isComplete ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[#3B82F6]/10 text-[#3B82F6] border border-[#3B82F6]/20">Ativo</span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">Incompleto</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#EFF6FF]/50 border-b border-[#BFDBFE]">
                    <th className="px-6 py-4 text-xs font-semibold text-[#746F70] uppercase tracking-wider">Profissional</th>
                    <th className="px-6 py-4 text-xs font-semibold text-[#746F70] uppercase tracking-wider">Contato</th>
                    <th className="px-6 py-4 text-xs font-semibold text-[#746F70] uppercase tracking-wider">Especialidade / Dept</th>
                    <th className="px-6 py-4 text-xs font-semibold text-[#746F70] uppercase tracking-wider text-center">Status</th>
                    <th className="px-6 py-4 text-xs font-semibold text-[#746F70] uppercase tracking-wider text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#BFDBFE] bg-white">
                  {paginatedList.map((m) => {
                    const isComplete = m.especialidade && m.departamentoId;
                    return (
                      <tr key={m.id} className="hover:bg-[#EFF6FF]/30 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="text-sm font-bold text-[#16201E]">{m.nome}</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-[#746F70] font-medium">{m.email}</td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-semibold text-[#16201E]">{m.especialidade || "—"}</div>
                          <div className="text-xs text-[#746F70] mt-0.5">{m.departamentoNome || "—"}</div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          {isComplete ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#3B82F6]/10 text-[#3B82F6] border border-[#3B82F6]/20 shadow-sm">Ativo</span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200 shadow-sm">Incompleto</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          {m.senhaTemporaria && (
                            <button
                              onClick={() => handleResend(m.id)}
                              className="text-amber-500 hover:text-amber-700 p-2 rounded-lg hover:bg-amber-50 transition-colors opacity-0 group-hover:opacity-100"
                              title="Reenviar Senha Temporária"
                            >
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M22 6l-10 7L2 6" />
                              </svg>
                            </button>
                          )}
                          <button
                            onClick={() => openEditModal(m)}
                            className="text-[#3B82F6] hover:text-[#2563EB] p-2 rounded-lg hover:bg-[#EFF6FF] transition-colors opacity-0 group-hover:opacity-100"
                            title="Editar Detalhes"
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => openDeleteModal(m)}
                            className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100 ml-1"
                            title="Eliminar Médico"
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
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
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-fade-in-up">
            <div className="px-6 py-4 border-b border-[#BFDBFE] flex justify-between items-center">
              <h3 className="text-lg font-bold text-[#16201E]">Registrar Novo Médico</h3>
              <button onClick={closeCreateModal} className="text-[#746F70] hover:text-[#16201E]">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-[#16201E] mb-1">Nome Completo</label>
                <input type="text" autoFocus required className="saas-input w-full" value={formNome} onChange={(e) => setFormNome(e.target.value)} placeholder="Dr. João Silva" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#16201E] mb-1">Email</label>
                <input type="email" required className="saas-input w-full" value={formEmail} onChange={(e) => setFormEmail(e.target.value)} placeholder="medico@saude.com" />
              </div>
              <p className="text-xs text-[#746F70] bg-[#EFF6FF]/50 px-3 py-2 rounded-lg -mt-2">
                Uma senha provisória será gerada automaticamente e enviada para o email do médico.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[#16201E] mb-1">Especialidade</label>
                  <input type="text" className="saas-input w-full" value={formEspecialidade} onChange={(e) => setFormEspecialidade(e.target.value)} placeholder="Ex: Cardiologista" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#16201E] mb-1">Departamento</label>
                  <select className="saas-input w-full" value={formDepartamento} onChange={(e) => setFormDepartamento(e.target.value)}>
                    <option value="">Selecione...</option>
                    {departamentos.map((d) => (
                      <option key={d.id} value={d.id}>{d.nome}</option>
                    ))}
                  </select>
                </div>
              </div>
              <button
                type="submit"
                disabled={loading || !formNome || !formEmail}
                className="w-full px-4 py-3 font-bold text-white bg-[#3B82F6] rounded-xl hover:bg-[#2563EB] disabled:opacity-50 transition-colors"
              >
                {loading ? "Registrando..." : "Confirmar Registro"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal Editar */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#16201E]/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-fade-in-up">
            <div className="px-6 py-4 border-b border-[#BFDBFE] flex justify-between items-center">
              <h3 className="text-lg font-bold text-[#16201E]">Editar Detalhes Profissionais</h3>
              <button onClick={closeEditModal} className="text-[#746F70] hover:text-[#16201E]">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleEdit} className="p-6 space-y-5">
              <div className="flex gap-4 mb-2">
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-[#746F70] uppercase tracking-wider mb-1">Profissional</label>
                  <input type="text" readOnly disabled value={selectedMedico?.nome || ""} className="w-full px-4 py-2 bg-[#EFF6FF] border border-[#BFDBFE] rounded-lg text-[#746F70] cursor-not-allowed" />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-[#746F70] uppercase tracking-wider mb-1">Email</label>
                  <input type="text" readOnly disabled value={selectedMedico?.email || ""} className="w-full px-4 py-2 bg-[#EFF6FF] border border-[#BFDBFE] rounded-lg text-[#746F70] cursor-not-allowed" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#16201E] mb-1">Especialidade</label>
                <input type="text" autoFocus className="w-full px-4 py-2 border border-[#BFDBFE] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6] text-[#16201E]" value={formEspecialidade} onChange={(e) => setFormEspecialidade(e.target.value)} placeholder="Ex: Cardiologia" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#16201E] mb-1">Departamento</label>
                <select className="w-full px-4 py-2 border border-[#BFDBFE] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#3B82F6] text-[#16201E]" value={formDepartamento} onChange={(e) => setFormDepartamento(e.target.value)}>
                  <option value="" disabled>Selecione o departamento...</option>
                  {departamentos.map((d) => (
                    <option key={d.id} value={d.id}>{d.nome}</option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                disabled={loading || !formEspecialidade || !formDepartamento}
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
              <h3 className="text-lg font-bold text-red-700">Eliminar Médico</h3>
              <button onClick={closeDeleteModal} className="text-red-400 hover:text-red-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-[#746F70]">
                Tem certeza que deseja eliminar <strong className="text-[#16201E]">{selectedMedico?.nome}</strong>? Esta ação não pode ser desfeita.
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
