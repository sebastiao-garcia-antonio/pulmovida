"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { updateProfile, updateAvatar, savePreferencias } from "./actions";

type Perfil = {
  nome: string;
  email: string;
  tipo: string;
  image: string | null;
  dataNascimento?: string;
  genero?: string;
};

type Preferencias = {
  notificarEmail: boolean;
  notificarSMS: boolean;
  notificarWhatsApp: boolean;
  lembreteConsulta: boolean;
  lembreteAntesHoras: number;
  compartilharDados: boolean;
};

export default function PacienteConfigClient({ 
  initialPerfil, 
  initialPreferencias 
}: { 
  initialPerfil: Perfil;
  initialPreferencias: Preferencias;
}) {
  const [activeTab, setActiveTab] = useState<"perfil" | "preferencias">("perfil");
  const [salvando, setSalvando] = useState(false);
  const [salvo, setSalvo] = useState(false);

  const [perfil, setPerfil] = useState(initialPerfil);
  const [preferencias, setPreferencias] = useState<Preferencias>(initialPreferencias);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showSaved = () => { setSalvo(true); setTimeout(() => setSalvo(false), 3000); };

  const handleSalvarPerfil = async (e: React.FormEvent) => { 
    e.preventDefault(); 
    if (!perfil.nome) return;
    setSalvando(true); 
    try {
      await updateProfile(perfil.nome, perfil.dataNascimento, perfil.genero);
      showSaved();
    } catch (err: any) {
      alert("Erro ao salvar: " + err.message);
    } finally {
      setSalvando(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const result = await updateAvatar(formData);
      if (result.success && result.imageUrl) {
        setPerfil(prev => ({ ...prev, image: result.imageUrl }));
        showSaved();
      }
    } catch (err: any) {
      alert("Erro ao enviar foto: " + err.message);
    }
  };

  const handleSalvarPreferencias = async (e: React.FormEvent) => { 
    e.preventDefault(); 
    setSalvando(true); 
    try {
      await savePreferencias(preferencias);
      showSaved();
    } catch (err: any) {
      alert("Erro ao salvar preferências: " + err.message);
    } finally {
      setSalvando(false);
    }
  };

  const Toggle = ({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) => (
    <button type="button" onClick={() => onChange(!checked)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${checked ? "bg-[#3B82F6]" : "bg-gray-300"}`}>
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? "translate-x-6" : "translate-x-1"}`} />
    </button>
  );

  return (
    <div className="p-6 sm:p-10 max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-extrabold text-[#16201E] tracking-tight">Configurações</h1>
        <p className="mt-1 text-[#746F70]">Gerencie seu perfil e preferências de contacto.</p>
      </div>
      
      {salvo && (
        <div className="fixed top-6 right-6 z-50 bg-[#10B981] text-white px-5 py-3 rounded-xl shadow-lg font-bold flex items-center gap-2 animate-fade-in-up">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          Salvo com sucesso!
        </div>
      )}

      <div className="flex gap-2 border-b border-[#BFDBFE]">
        {[
          { key: "perfil" as const, label: "Meu Perfil" }, 
          { key: "preferencias" as const, label: "Preferências" }
        ].map((tab) => (
          <button 
            key={tab.key} 
            onClick={() => setActiveTab(tab.key)} 
            className={`px-5 py-3 text-sm font-bold border-b-2 transition-colors uppercase tracking-wider ${
              activeTab === tab.key ? "border-[#3B82F6] text-[#3B82F6]" : "border-transparent text-[#746F70] hover:text-[#16201E]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "perfil" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="saas-card p-8 border border-blue-100">
            <h3 className="text-lg font-bold text-[#16201E] mb-6 border-b border-gray-100 pb-3">Dados Pessoais</h3>
            <form onSubmit={handleSalvarPerfil} className="space-y-6">
              <div className="flex items-center gap-5 mb-8">
                <div 
                  className="w-24 h-24 rounded-full bg-blue-50 flex items-center justify-center text-3xl font-black text-[#3B82F6] border-4 border-white shadow-md relative group cursor-pointer overflow-hidden shrink-0"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {perfil.image ? (
                    <img src={perfil.image} alt={perfil.nome} className="w-full h-full object-cover" />
                  ) : (
                    perfil.nome.charAt(0).toUpperCase()
                  )}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept="image/*" 
                  className="hidden" 
                />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-[#16201E] text-lg truncate">{perfil.nome}</p>
                  <p className="text-sm font-medium text-[#746F70] truncate">{perfil.email}</p>
                  <span className="inline-block mt-2 px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#3B82F6] bg-blue-50 border border-blue-100 rounded-full">
                    {perfil.tipo}
                  </span>
                </div>
              </div>
              
              <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-bold text-[#16201E] mb-1.5">Nome Completo</label>
                    <input type="text" required className="saas-input w-full shadow-sm" value={perfil.nome} onChange={(e) => setPerfil({ ...perfil, nome: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-[#16201E] mb-1.5">Data de Nascimento</label>
                    <input type="date" className="saas-input w-full shadow-sm" value={perfil.dataNascimento} onChange={(e) => setPerfil({ ...perfil, dataNascimento: e.target.value })} />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-[#16201E] mb-1.5">Género</label>
                  <select className="saas-input w-full shadow-sm" value={perfil.genero} onChange={(e) => setPerfil({ ...perfil, genero: e.target.value })}>
                    <option value="">Selecione...</option>
                    <option value="Feminino">Feminino</option>
                    <option value="Masculino">Masculino</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-[#16201E] mb-1.5">Email de Acesso</label>
                  <input type="email" className="saas-input w-full bg-gray-50 text-[#746F70] cursor-not-allowed border-gray-200 shadow-sm" value={perfil.email} disabled />
                  <p className="text-xs text-[#746F70] mt-1.5 font-medium">O email de acesso não pode ser alterado por segurança.</p>
                </div>
              </div>
              
              <button type="submit" disabled={salvando} className="w-full px-6 py-3.5 font-bold text-white bg-[#3B82F6] rounded-xl hover:bg-[#2563EB] disabled:opacity-50 transition-colors shadow-sm">
                {salvando ? "A Guardar..." : "Salvar Alterações"}
              </button>
            </form>
          </div>
          
          <div className="saas-card p-8 border border-gray-100 bg-gray-50 flex flex-col justify-center text-center">
            <div className="w-20 h-20 bg-blue-100 text-[#3B82F6] rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-[#16201E] mb-3">Segurança da Conta</h3>
            <p className="text-sm font-medium text-[#746F70] mb-8 leading-relaxed max-w-sm mx-auto">
              A política da clínica exige que redefinições de senha sejam feitas na página inicial de Login usando o seu email.
            </p>
            <Link href="/login" className="px-6 py-3.5 font-bold text-[#3B82F6] bg-white border border-[#3B82F6] rounded-xl hover:bg-blue-50 transition-colors shadow-sm w-full max-w-xs mx-auto">
              Ir para Tela de Login
            </Link>
          </div>
        </div>
      )}

      {activeTab === "preferencias" && (
        <div className="space-y-6">
          <div className="saas-card p-8 border border-gray-100">
            <h3 className="text-lg font-bold text-[#16201E] mb-6 border-b border-gray-100 pb-3">Comunicações</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="font-bold text-[#16201E]">Notificações por Email</p>
                  <p className="text-sm font-medium text-[#746F70] mt-0.5">Receber alertas de marcações e resultados</p>
                </div>
                <Toggle checked={preferencias.notificarEmail} onChange={(v) => setPreferencias({ ...preferencias, notificarEmail: v })} />
              </div>
              <div className="flex items-center justify-between py-3 border-t border-gray-100">
                <div>
                  <p className="font-bold text-[#16201E]">Notificações por SMS</p>
                  <p className="text-sm font-medium text-[#746F70] mt-0.5">Receber SMS em emergências</p>
                </div>
                <Toggle checked={preferencias.notificarSMS} onChange={(v) => setPreferencias({ ...preferencias, notificarSMS: v })} />
              </div>
              <div className="flex items-center justify-between py-3 border-t border-gray-100">
                <div>
                  <p className="font-bold text-[#16201E]">Notificações por WhatsApp</p>
                  <p className="text-sm font-medium text-[#746F70] mt-0.5">Receber lembretes via WhatsApp</p>
                </div>
                <Toggle checked={preferencias.notificarWhatsApp} onChange={(v) => setPreferencias({ ...preferencias, notificarWhatsApp: v })} />
              </div>
            </div>
          </div>
          
          <div className="saas-card p-8 border border-gray-100">
            <h3 className="text-lg font-bold text-[#16201E] mb-6 border-b border-gray-100 pb-3">Lembretes Automáticos</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="font-bold text-[#16201E]">Lembrete de Consulta</p>
                  <p className="text-sm font-medium text-[#746F70] mt-0.5">Lembrar-me atempadamente antes da hora marcada</p>
                </div>
                <Toggle checked={preferencias.lembreteConsulta} onChange={(v) => setPreferencias({ ...preferencias, lembreteConsulta: v })} />
              </div>
              
              {preferencias.lembreteConsulta && (
                <div className="pl-4 py-3 border-t border-gray-100 bg-gray-50/50 rounded-xl px-4 mt-2 border border-gray-100 shadow-inner">
                  <label className="block text-sm font-bold text-[#16201E] mb-2">Enviar lembrete com antecedência de:</label>
                  <select 
                    className="saas-input w-full max-w-xs font-medium shadow-sm bg-white" 
                    value={preferencias.lembreteAntesHoras} 
                    onChange={(e) => setPreferencias({ ...preferencias, lembreteAntesHoras: parseInt(e.target.value) })}
                  >
                    <option value={1}>1 hora</option>
                    <option value={3}>3 horas</option>
                    <option value={6}>6 horas</option>
                    <option value={12}>12 horas</option>
                    <option value={24}>1 dia inteiro (24h)</option>
                  </select>
                </div>
              )}
            </div>
          </div>
          
          <div className="saas-card p-8 border border-gray-100 bg-blue-50/30">
            <h3 className="text-lg font-bold text-[#16201E] mb-6 border-b border-blue-100 pb-3">Privacidade & IA</h3>
            <div className="flex items-center justify-between py-3">
              <div className="max-w-xl">
                <p className="font-bold text-[#16201E]">Partilhar Dados com a IA Clínica</p>
                <p className="text-sm font-medium text-[#746F70] mt-1 leading-relaxed">
                  Permitir que a Inteligência Artificial analise o seu histórico anónimo para melhorar as avaliações de risco e contribuir para a monografia do sistema Saúde Inteligente.
                </p>
              </div>
              <Toggle checked={preferencias.compartilharDados} onChange={(v) => setPreferencias({ ...preferencias, compartilharDados: v })} />
            </div>
          </div>
          
          <div className="flex justify-end pt-4">
            <button 
              onClick={handleSalvarPreferencias} 
              disabled={salvando} 
              className="px-8 py-4 font-bold text-white bg-[#3B82F6] rounded-xl hover:bg-[#2563EB] disabled:opacity-50 transition-colors shadow-md text-lg"
            >
              {salvando ? "A Guardar..." : "Guardar Preferências"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
