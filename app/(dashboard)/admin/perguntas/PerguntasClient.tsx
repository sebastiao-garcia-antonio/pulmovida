"use client";

import { useState } from "react";
import { createPergunta, updatePergunta, deletePergunta } from "./actions";

type OpcaoResposta = {
  id?: string;
  texto: string;
  valor: number;
};

type Pergunta = {
  id: string;
  texto: string;
  tipo: string;
  categoria?: string | null;
  opcoes: OpcaoResposta[];
};

export default function PerguntasClient({ initialPerguntas }: { initialPerguntas: Pergunta[] }) {
  const [perguntas, setPerguntas] = useState<Pergunta[]>(initialPerguntas);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTipo, setFilterTipo] = useState("todos");

  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedPergunta, setSelectedPergunta] = useState<Pergunta | null>(null);
  
  const [formData, setFormData] = useState<{ texto: string; tipo: string; categoria: string; opcoes: OpcaoResposta[] }>({
    texto: "",
    tipo: "sim_nao",
    categoria: "nenhuma",
    opcoes: [],
  });
  
  const [loading, setLoading] = useState(false);

  const filtered = perguntas.filter((p) => {
    const matchSearch = p.texto.toLowerCase().includes(searchTerm.toLowerCase());
    const matchTipo = filterTipo === "todos" || p.tipo === filterTipo;
    return matchSearch && matchTipo;
  });

  const openCreateModal = () => {
    setFormData({ 
      texto: "", 
      tipo: "sim_nao", 
      categoria: "nenhuma",
      opcoes: [
        { texto: "Sim", valor: 10 },
        { texto: "Não", valor: 0 }
      ] 
    });
    setSelectedPergunta(null);
    setModalOpen(true);
  };

  const openEditModal = (p: Pergunta) => {
    setSelectedPergunta(p);
    setFormData({
      texto: p.texto,
      tipo: p.tipo,
      categoria: p.categoria || "nenhuma",
      opcoes: p.opcoes.map(o => ({ ...o }))
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedPergunta(null);
  };

  const openDeleteModal = (p: Pergunta) => {
    setSelectedPergunta(p);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setSelectedPergunta(null);
  };

  const handleTipoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const novoTipo = e.target.value;
    let novasOpcoes: OpcaoResposta[] = [];

    if (novoTipo === "sim_nao") {
      novasOpcoes = [
        { texto: "Sim", valor: 10 },
        { texto: "Não", valor: 0 }
      ];
    } else if (novoTipo === "escala") {
      novasOpcoes = [
        { texto: "Leve (1-3)", valor: 3 },
        { texto: "Moderada (4-7)", valor: 7 },
        { texto: "Grave (8-10)", valor: 10 }
      ];
    } else if (novoTipo === "numero") {
      novasOpcoes = [];
    } else {
      novasOpcoes = [
        { texto: "Opção 1", valor: 0 }
      ];
    }

    setFormData({ ...formData, tipo: novoTipo, opcoes: novasOpcoes });
  };

  const addOpcao = () => {
    setFormData({
      ...formData,
      opcoes: [...formData.opcoes, { texto: "Nova Opção", valor: 0 }]
    });
  };

  const removeOpcao = (index: number) => {
    if (formData.opcoes.length <= 2 && formData.tipo === "sim_nao") return;
    const newOpcoes = [...formData.opcoes];
    newOpcoes.splice(index, 1);
    setFormData({ ...formData, opcoes: newOpcoes });
  };

  const updateOpcao = (index: number, field: "texto" | "valor", val: any) => {
    const newOpcoes = [...formData.opcoes];
    if (field === "texto") newOpcoes[index].texto = val;
    if (field === "valor") newOpcoes[index].valor = Number(val);
    setFormData({ ...formData, opcoes: newOpcoes });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.texto || formData.opcoes.length === 0) return;
    
    setLoading(true);
    try {
      if (selectedPergunta) {
        await updatePergunta(selectedPergunta.id, formData);
        setPerguntas(prev => prev.map(p => p.id === selectedPergunta.id ? { ...p, ...formData } : p));
      } else {
        await createPergunta(formData);
        // Refresh local simplificado, num app real poderíamos usar router.refresh()
        // Mas como é dinâmico, vamos apenas recarregar a janela
        window.location.reload();
      }
      closeModal();
    } catch (error: any) {
      alert(error.message || "Erro ao guardar pergunta.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedPergunta) return;
    setLoading(true);
    try {
      await deletePergunta(selectedPergunta.id);
      setPerguntas(prev => prev.filter(p => p.id !== selectedPergunta.id));
      closeDeleteModal();
    } catch (error: any) {
      alert(error.message || "Erro ao eliminar pergunta.");
    } finally {
      setLoading(false);
    }
  };

  const formatTipo = (tipo: string) => {
    switch (tipo) {
      case "sim_nao": return "Sim / Não";
      case "escala": return "Escala de Gravidade";
      case "multipla_escolha": return "Múltipla Escolha";
      case "numero": return "Numérica";
      default: return tipo;
    }
  };

  return (
    <div className="p-6 sm:p-10 max-w-7xl mx-auto space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[#16201E] tracking-tight">Triagem Inteligente (IA)</h1>
          <p className="mt-1 text-[#746F70]">Configure as perguntas de anamnese que serão feitas aos pacientes.</p>
        </div>
        <button
          onClick={openCreateModal}
          className="px-5 py-3 bg-[#3B82F6] text-white font-bold rounded-xl hover:bg-[#2563EB] transition-colors flex items-center justify-center gap-2 shadow-sm"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Nova Pergunta
        </button>
      </div>

      <div className="saas-card overflow-hidden border border-blue-100">
        <div className="px-6 py-5 border-b border-[#BFDBFE] bg-[#EFF6FF]/50 flex flex-col sm:flex-row gap-4 justify-between">
          <input
            type="text"
            placeholder="Pesquisar pergunta..."
            className="px-4 py-2 bg-white border border-[#BFDBFE] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6] text-[#16201E] w-full sm:w-1/2 shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            className="px-4 py-2 bg-white border border-[#BFDBFE] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6] text-[#16201E] shadow-sm font-medium"
            value={filterTipo}
            onChange={(e) => setFilterTipo(e.target.value)}
          >
            <option value="todos">Todos os Tipos</option>
            <option value="sim_nao">Sim / Não</option>
            <option value="escala">Escala</option>
            <option value="multipla_escolha">Múltipla Escolha</option>
            <option value="numero">Numérica</option>
          </select>
        </div>

        {filtered.length === 0 ? (
          <div className="p-12 text-[#746F70] text-center flex flex-col items-center">
            <svg className="w-12 h-12 mb-3 text-blue-200" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            <p className="font-medium text-lg">Nenhuma pergunta configurada.</p>
            <p className="text-sm mt-1">Adicione perguntas para ensinar o sistema a classificar os sintomas.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 bg-white">
            {filtered.map((p) => (
              <div key={p.id} className="p-6 hover:bg-blue-50/30 transition-colors group flex flex-col sm:flex-row justify-between items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="inline-block px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide text-blue-700 bg-blue-100 rounded-full">
                      {formatTipo(p.tipo)}
                    </span>
                    {p.categoria && p.categoria !== "nenhuma" && (
                      <span className="inline-block px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide text-purple-700 bg-purple-100 rounded-full">
                        IA: {p.categoria}
                      </span>
                    )}
                    <h3 className="text-lg font-bold text-[#16201E]">{p.texto}</h3>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {p.opcoes.map((o, i) => (
                      <span key={i} className="text-xs font-medium text-[#746F70] bg-gray-100 px-2 py-1 rounded-md border border-gray-200 flex items-center gap-1.5">
                        {o.texto} <span className="text-[10px] bg-white border px-1 rounded text-gray-500">Peso: {o.valor}</span>
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => openEditModal(p)}
                    className="text-[#3B82F6] hover:text-[#2563EB] p-2 rounded-lg hover:bg-[#EFF6FF] transition-colors"
                    title="Editar"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                  </button>
                  <button
                    onClick={() => openDeleteModal(p)}
                    className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors"
                    title="Eliminar"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Criar/Editar */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#16201E]/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-fade-in-up my-auto">
            <div className="px-6 py-4 border-b border-[#BFDBFE] flex justify-between items-center bg-blue-50/50">
              <h3 className="text-lg font-bold text-[#16201E]">
                {selectedPergunta ? "Editar Pergunta de Triagem" : "Nova Pergunta de Triagem"}
              </h3>
              <button onClick={closeModal} className="text-[#746F70] hover:text-[#16201E]"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-bold text-[#16201E] mb-1.5">A Pergunta a Fazer (ex: Qual o nível da sua dor?)</label>
                <input 
                  type="text" 
                  autoFocus 
                  required 
                  className="saas-input w-full shadow-sm text-lg" 
                  value={formData.texto} 
                  onChange={(e) => setFormData({ ...formData, texto: e.target.value })} 
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-[#16201E] mb-1.5">Variável Clínica (Integração IA)</label>
                <select 
                  className="saas-input w-full shadow-sm text-purple-900 bg-purple-50 border-purple-200 focus:border-purple-500 focus:ring-purple-500" 
                  value={formData.categoria} 
                  onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                >
                  <option value="nenhuma">-- Nenhuma (Apenas Anamnese Padrão) --</option>
                  <option value="Fumante">Fumante (Sim/Não)</option>
                  <option value="Convive_Fumantes">Convive com Fumantes (Sim/Não)</option>
                  <option value="Trabalha_Quimicos">Trabalha com Químicos (Sim/Não)</option>
                  <option value="Doencas_Familia">Doenças na Família (Sim/Não)</option>
                  <option value="Tosse">Tosse (Sim/Não)</option>
                  <option value="Tosse_Dias">Tosse: Dias (Numérica)</option>
                  <option value="Tosse_Catarro">Tosse com Catarro (Sim/Não)</option>
                  <option value="Tosse_Sangue">Tosse com Sangue (Sim/Não)</option>
                  <option value="Dificuldade_Respirar">Dificuldade ao Respirar (Sim/Não)</option>
                  <option value="Falta_Ar_Constante">Falta de Ar Constante (Sim/Não)</option>
                  <option value="Nivel_Falta_Ar">Nível da Falta de Ar (Escala 0 a 3)</option>
                  <option value="Chiado_Peito">Chiado no Peito (Sim/Não)</option>
                  <option value="Febre">Febre (Sim/Não)</option>
                  <option value="Cansaco_Frequente">Cansaço Frequente (Sim/Não)</option>
                  <option value="Perda_Peso_Recente">Perda de Peso Recente (Sim/Não)</option>
                  <option value="Suor_Noturno">Suor Noturno (Sim/Não)</option>
                  <option value="Pioram_Noite">Piora à Noite (Sim/Não)</option>
                  <option value="Saturacao_O2">Saturação de O2 % (Numérica)</option>
                </select>
                <p className="text-xs text-[#746F70] mt-1 italic">
                  Associe esta pergunta a uma variável para que o modelo de IA a consiga interpretar.
                </p>
              </div>

              <div>
                <label className="block text-sm font-bold text-[#16201E] mb-1.5">Tipo de Resposta Esperada</label>
                <select 
                  className="saas-input w-full shadow-sm" 
                  value={formData.tipo} 
                  onChange={handleTipoChange}
                >
                  <option value="sim_nao">Sim ou Não (Binário)</option>
                  <option value="escala">Escala de Gravidade</option>
                  <option value="multipla_escolha">Múltipla Escolha</option>
                  <option value="numero">Resposta Numérica Livre</option>
                </select>
              </div>

              {formData.tipo !== "numero" && (
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-4">
                <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                  <h4 className="font-bold text-[#16201E] text-sm">Opções de Resposta e Pesos Clínicos</h4>
                  {formData.tipo === "multipla_escolha" && (
                    <button type="button" onClick={addOpcao} className="text-xs font-bold text-[#3B82F6] hover:underline flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg> Adicionar
                    </button>
                  )}
                </div>

                {formData.opcoes.map((opcao, index) => (
                  <div key={index} className="flex gap-3 items-end">
                    <div className="flex-1">
                      <label className="block text-xs font-semibold text-[#746F70] mb-1">Texto da Opção</label>
                      <input 
                        type="text" 
                        required 
                        className="saas-input w-full shadow-sm py-2" 
                        value={opcao.texto} 
                        onChange={(e) => updateOpcao(index, "texto", e.target.value)} 
                      />
                    </div>
                    <div className="w-24">
                      <label className="block text-xs font-semibold text-[#746F70] mb-1">Peso (0-100)</label>
                      <input 
                        type="number" 
                        required 
                        min="0"
                        max="100"
                        className="saas-input w-full shadow-sm py-2 font-mono text-center" 
                        value={opcao.valor} 
                        onChange={(e) => updateOpcao(index, "valor", e.target.value)} 
                      />
                    </div>
                    {formData.tipo === "multipla_escolha" && formData.opcoes.length > 1 && (
                      <button 
                        type="button" 
                        onClick={() => removeOpcao(index)}
                        className="p-2 mb-0.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    )}
                  </div>
                ))}
                
                <p className="text-xs text-[#746F70] mt-2 italic">
                  O "Peso" indica o grau de severidade ou prioridade dessa resposta. Valores maiores indicam sintomas mais críticos (ex: Dor no peito = 90).
                </p>
              </div>
              )}

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={closeModal} className="flex-1 px-4 py-3.5 font-bold text-[#746F70] bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">Cancelar</button>
                <button type="submit" disabled={loading} className="flex-1 px-4 py-3.5 font-bold text-white bg-[#3B82F6] rounded-xl hover:bg-[#2563EB] disabled:opacity-50 transition-colors shadow-sm">{loading ? "A Guardar..." : "Salvar Pergunta"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Eliminar */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#16201E]/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-fade-in-up border border-red-100">
            <div className="px-6 py-4 border-b border-red-100 flex justify-between items-center bg-red-50">
              <h3 className="text-lg font-bold text-red-700">Eliminar Pergunta</h3>
              <button onClick={closeDeleteModal} className="text-red-400 hover:text-red-600"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
            <div className="p-6 space-y-6">
              <p className="text-[#746F70]">Tem certeza que deseja eliminar a pergunta <strong className="text-[#16201E]">"{selectedPergunta?.texto}"</strong>? Esta ação apagará todas as opções de resposta associadas.</p>
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
