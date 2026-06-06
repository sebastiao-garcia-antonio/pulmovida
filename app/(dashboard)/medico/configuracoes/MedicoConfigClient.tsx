"use client";

import { useState, useRef } from "react";
import { updateProfile, updateAvatar } from "./actions";

type PerfilData = {
  nome: string;
  email: string;
  tipo: string;
  image: string | null;
  departamento: string;
};

export default function MedicoConfigClient({ initialPerfil }: { initialPerfil: PerfilData }) {
  const [activeTab, setActiveTab] = useState<"perfil" | "preferencias">("perfil");
  const [salvando, setSalvando] = useState(false);
  const [salvo, setSalvo] = useState(false);

  const [perfil, setPerfil] = useState(initialPerfil);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(initialPerfil.image);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [preferencias, setPreferencias] = useState({ 
    notificarEmail: true, 
    notificarSMS: false, 
    notificarWhatsApp: true, 
    lembreteConsulta: true, 
    lembreteAntesHoras: 24, 
    compartilharDados: true 
  });

  const showSaved = () => { setSalvo(true); setTimeout(() => setSalvo(false), 3000); };

  const handleSalvarPerfil = async (e: React.FormEvent) => {
    e.preventDefault();
    setSalvando(true);
    try {
      await updateProfile(perfil.nome);
      showSaved();
    } catch (error: any) {
      alert(error.message || "Erro ao salvar perfil");
    } finally {
      setSalvando(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("A imagem não deve exceder 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => setAvatarPreview(event.target?.result as string);
    reader.readAsDataURL(file);

    const formData = new FormData();
    formData.append("file", file);

    setSalvando(true);
    try {
      const res = await updateAvatar(formData);
      if (res.imageUrl) {
        setPerfil(prev => ({ ...prev, image: res.imageUrl }));
        showSaved();
      }
    } catch (error: any) {
      alert(error.message || "Erro ao atualizar avatar");
      setAvatarPreview(perfil.image);
    } finally {
      setSalvando(false);
    }
  };

  const handleSalvarPreferencias = async (e: React.FormEvent) => { 
    e.preventDefault(); 
    setSalvando(true); 
    await new Promise((r) => setTimeout(r, 800)); 
    setSalvando(false); 
    showSaved(); 
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
        <p className="mt-1 text-[#746F70]">Gerencie as definições da sua conta profissional.</p>
      </div>
      
      {salvo && (
        <div className="fixed top-6 right-6 z-50 bg-green-500 text-white px-5 py-3 rounded-xl shadow-lg font-bold animate-fade-in-up flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          Alterações guardadas!
        </div>
      )}

      <div className="flex gap-2 border-b border-[#BFDBFE]">
        {[{ key: "perfil" as const, label: "Perfil Público" }, { key: "preferencias" as const, label: "Notificações & Privacidade" }].map((tab) => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`px-5 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === tab.key ? "border-[#3B82F6] text-[#3B82F6]" : "border-transparent text-[#746F70] hover:text-[#16201E]"}`}>{tab.label}</button>
        ))}
      </div>

      {activeTab === "perfil" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="saas-card p-6 border border-blue-100">
            <h3 className="text-lg font-bold text-[#16201E] mb-6">Identidade Profissional</h3>
            <form onSubmit={handleSalvarPerfil} className="space-y-6">
              
              <div className="flex items-center gap-5 bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                <div 
                  className="w-20 h-20 rounded-full bg-[#3B82F6]/20 flex items-center justify-center text-2xl font-bold text-[#3B82F6] overflow-hidden cursor-pointer relative group"
                  onClick={() => fileInputRef.current?.click()}
                  title="Alterar fotografia"
                >
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Perfil" className="w-full h-full object-cover" />
                  ) : (
                    perfil.nome.charAt(0)
                  )}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  </div>
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/jpeg,image/png,image/webp" 
                  onChange={handleFileChange}
                />
                
                <div>
                  <p className="font-bold text-[#16201E] text-lg">Dr(a). {perfil.nome}</p>
                  <p className="text-sm text-[#746F70]">{perfil.email}</p>
                  <div className="flex gap-2 mt-2">
                    <span className="inline-block px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide text-[#3B82F6] bg-blue-100 rounded-full">{perfil.tipo}</span>
                    <span className="inline-block px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide text-green-700 bg-green-100 rounded-full">{perfil.departamento}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-[#16201E] mb-1.5">Nome Completo</label>
                  <input type="text" className="saas-input w-full shadow-sm" value={perfil.nome} onChange={(e) => setPerfil({ ...perfil, nome: e.target.value })} required />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#16201E] mb-1.5">Email Profissional</label>
                  <input type="email" className="saas-input w-full bg-gray-50 text-gray-500 cursor-not-allowed shadow-sm" value={perfil.email} disabled title="Contacte o administrador para alterar o email" />
                  <p className="text-xs text-[#746F70] mt-1">O email é a sua chave de acesso. Não pode ser alterado diretamente.</p>
                </div>
              </div>
              
              <button type="submit" disabled={salvando} className="w-full px-6 py-3.5 font-bold text-white bg-[#3B82F6] rounded-xl hover:bg-[#2563EB] disabled:opacity-50 transition-colors shadow-sm">
                {salvando ? "A Guardar..." : "Salvar Identidade"}
              </button>
            </form>
          </div>
          
          <div className="saas-card p-6 border border-gray-100 flex flex-col justify-center items-center text-center bg-gray-50/50">
            <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-4">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            </div>
            <h3 className="text-lg font-bold text-[#16201E] mb-2">Segurança da Conta</h3>
            <p className="text-sm text-[#746F70] mb-6 max-w-xs mx-auto">
              A política de segurança da clínica centralizou a alteração de senhas. Se desconfia que a sua senha foi comprometida, proceda à sua alteração no ecrã de Autenticação inicial.
            </p>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              Opção de senha desativada
            </p>
          </div>
        </div>
      )}

      {activeTab === "preferencias" && (
        <div className="space-y-6">
          <div className="saas-card p-6 border border-blue-100">
            <h3 className="text-lg font-bold text-[#16201E] mb-6">Notificações Automáticas</h3>
            <div className="space-y-5">
              <div className="flex items-center justify-between py-3 border-b border-[#BFDBFE]">
                <div>
                  <p className="font-bold text-[#16201E]">Notificações por Email</p>
                  <p className="text-sm text-[#746F70]">Receber alertas sempre que um paciente agendar uma consulta consigo</p>
                </div>
                <Toggle checked={preferencias.notificarEmail} onChange={(v) => setPreferencias({ ...preferencias, notificarEmail: v })} />
              </div>
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="font-bold text-[#16201E]">Notificações por WhatsApp</p>
                  <p className="text-sm text-[#746F70]">Receber resumo matinal diário no WhatsApp com as consultas do dia</p>
                </div>
                <Toggle checked={preferencias.notificarWhatsApp} onChange={(v) => setPreferencias({ ...preferencias, notificarWhatsApp: v })} />
              </div>
            </div>
          </div>
          
          <div className="saas-card p-6 border border-blue-100">
            <h3 className="text-lg font-bold text-[#16201E] mb-6">Privacidade</h3>
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="font-bold text-[#16201E]">Sincronização com Assistente IA</p>
                <p className="text-sm text-[#746F70]">Permitir que a IA clínica pré-analise os diagnósticos e forneça sugestões no ecrã de Atendimentos</p>
              </div>
              <Toggle checked={preferencias.compartilharDados} onChange={(v) => setPreferencias({ ...preferencias, compartilharDados: v })} />
            </div>
          </div>
          
          <button onClick={handleSalvarPreferencias} disabled={salvando} className="px-6 py-3.5 font-bold text-white bg-[#3B82F6] rounded-xl hover:bg-[#2563EB] disabled:opacity-50 transition-colors shadow-sm">
            {salvando ? "A Guardar..." : "Salvar Preferências"}
          </button>
        </div>
      )}
    </div>
  );
}
