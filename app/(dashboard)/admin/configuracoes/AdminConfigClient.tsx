"use client";

import { useState, useEffect } from "react";
import { updateProfile, updateAvatar } from "./actions";
import Image from "next/image";

type AdminUser = {
  nome: string;
  email: string;
  tipo: string;
  image?: string | null;
};

export default function AdminConfigClient({ user }: { user: AdminUser }) {
  const [activeTab, setActiveTab] = useState<"perfil" | "preferencias" | "dados">("perfil");
  const [salvando, setSalvando] = useState(false);
  const [salvo, setSalvo] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [lastBackup, setLastBackup] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("pulmovida_last_backup");
    if (saved) setLastBackup(saved);
  }, []);

  const [perfil, setPerfil] = useState(user);
  const [preferencias, setPreferencias] = useState({ notificarEmail: true, notificarSMS: false, notificarWhatsApp: true, lembreteConsulta: true, lembreteAntesHoras: 24, compartilharDados: true });

  const showSaved = () => { setSalvo(true); setTimeout(() => setSalvo(false), 3000); };
  
  const handleSalvarPerfil = async (e: React.FormEvent) => { 
    e.preventDefault(); 
    setSalvando(true); 
    try {
      await updateProfile(perfil.nome);
      showSaved();
    } catch (error) {
      alert("Erro ao salvar perfil.");
    } finally {
      setSalvando(false);
    }
  };

  const handleMudarFoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    setSalvando(true);
    try {
      const res = await updateAvatar(formData);
      if (res.success) {
        setPerfil({ ...perfil, image: res.imageUrl });
        showSaved();
      }
    } catch (error) {
      alert("Erro ao alterar foto.");
    } finally {
      setSalvando(false);
    }
  };

  const handleSalvarPreferencias = async (e: React.FormEvent) => { e.preventDefault(); setSalvando(true); await new Promise((r) => setTimeout(r, 800)); setSalvando(false); showSaved(); };

  const Toggle = ({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) => (
    <button type="button" onClick={() => onChange(!checked)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${checked ? "bg-[#3B82F6]" : "bg-gray-300"}`}>
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? "translate-x-6" : "translate-x-1"}`} />
    </button>
  );

  return (
    <div className="p-6 sm:p-10 max-w-5xl mx-auto space-y-8 animate-fade-in">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#BFDBFE]/50">
        <h1 className="text-3xl font-extrabold text-[#16201E] tracking-tight">Configurações do Sistema</h1>
        <p className="mt-1 text-[#746F70]">Gerencie o seu perfil de administrador e definições avançadas da plataforma.</p>
      </div>

      {salvo && (
        <div className="fixed top-6 right-6 z-50 bg-[#10B981] text-white px-5 py-3 rounded-xl shadow-lg font-bold flex items-center gap-2 animate-fade-in-up">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          Alterações guardadas!
        </div>
      )}

      <div className="flex gap-2 border-b border-gray-200 bg-white/50 px-2 pt-2 rounded-t-xl">
        {[
          { key: "perfil" as const, label: "Perfil de Administrador" }, 
          { key: "preferencias" as const, label: "Preferências Globais" }, 
          { key: "dados" as const, label: "Gestão de Backups" }
        ].map((tab) => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`px-5 py-3.5 text-sm font-bold border-b-2 transition-all ${activeTab === tab.key ? "border-[#3B82F6] text-[#3B82F6] bg-blue-50/50 rounded-t-lg" : "border-transparent text-[#746F70] hover:text-[#16201E] hover:bg-gray-50 rounded-t-lg"}`}>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="animate-fade-in">
        {activeTab === "perfil" && (
          <div className="max-w-2xl">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-[#16201E] mb-6 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                Dados Pessoais
              </h3>
              <form onSubmit={handleSalvarPerfil} className="space-y-5">
                <div className="flex items-center gap-5 mb-6">
                  <div className="relative group w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold text-white shadow-md cursor-pointer overflow-hidden bg-gradient-to-tr from-blue-600 to-blue-400 border-4 border-white hover:border-blue-100 transition-colors">
                    {perfil.image ? (
                      <Image src={perfil.image} alt="Perfil" fill className="object-cover" unoptimized />
                    ) : (
                      perfil.nome.charAt(0).toUpperCase()
                    )}
                    <label className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                      <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      <input type="file" className="hidden" accept="image/*" onChange={handleMudarFoto} disabled={salvando} />
                    </label>
                  </div>
                  <div>
                    <p className="font-bold text-[#16201E] text-lg">{perfil.nome}</p>
                    <p className="text-sm text-[#746F70]">{perfil.email}</p>
                    <span className="inline-block mt-2 px-3 py-1 text-xs font-bold uppercase tracking-wide text-blue-700 bg-blue-100 rounded-full border border-blue-200">
                      {perfil.tipo}
                    </span>
                  </div>
                </div>
                <div className="space-y-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <div>
                    <label className="block text-sm font-bold text-[#16201E] mb-1.5">Nome Completo</label>
                    <input type="text" className="saas-input w-full bg-white" value={perfil.nome} onChange={(e) => setPerfil({ ...perfil, nome: e.target.value })} required />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-[#16201E] mb-1.5">Email (Inalterável)</label>
                    <input type="email" className="saas-input w-full bg-gray-100 text-[#746F70] cursor-not-allowed" value={perfil.email} disabled />
                  </div>
                </div>
                <button type="submit" disabled={salvando} className="w-full px-6 py-3.5 font-bold text-white bg-[#3B82F6] rounded-xl hover:bg-[#2563EB] disabled:opacity-50 transition-colors shadow-sm">
                  {salvando ? "A guardar..." : "Guardar Alterações"}
                </button>
              </form>
            </div>
          </div>
        )}

        {activeTab === "preferencias" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-[#16201E] mb-6">Notificações do Sistema</h3>
              <div className="space-y-2 bg-gray-50 rounded-xl border border-gray-100 p-2">
                <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-100">
                  <div><p className="font-bold text-[#16201E]">Relatórios Semanais (Email)</p><p className="text-sm text-[#746F70]">Receber resumos de atividade</p></div>
                  <Toggle checked={preferencias.notificarEmail} onChange={(v) => setPreferencias({ ...preferencias, notificarEmail: v })} />
                </div>
                <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-100">
                  <div><p className="font-bold text-[#16201E]">Alertas Críticos (SMS)</p><p className="text-sm text-[#746F70]">Falhas no sistema ou urgências</p></div>
                  <Toggle checked={preferencias.notificarSMS} onChange={(v) => setPreferencias({ ...preferencias, notificarSMS: v })} />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-[#16201E] mb-6">Configurações Clínicas</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <div><p className="font-bold text-[#16201E]">Partilha de Dados com IA</p><p className="text-sm text-[#746F70]">Permitir que o modelo de IA analise diagnósticos anónimos para treino</p></div>
                  <Toggle checked={preferencias.compartilharDados} onChange={(v) => setPreferencias({ ...preferencias, compartilharDados: v })} />
                </div>
                <button onClick={handleSalvarPreferencias} disabled={salvando} className="w-full px-6 py-3.5 mt-4 font-bold text-white bg-[#3B82F6] rounded-xl hover:bg-[#2563EB] disabled:opacity-50 transition-colors shadow-sm">
                  {salvando ? "A guardar..." : "Guardar Preferências"}
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "dados" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 border-l-4 border-l-[#3B82F6]">
                <h3 className="text-lg font-bold text-[#16201E] mb-2 flex items-center gap-2">
                  <svg className="w-5 h-5 text-[#3B82F6]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
                  Backup do Sistema
                </h3>
                <p className="text-sm text-[#746F70] mb-6">Gere uma cópia de segurança encriptada da base de dados do Pulmo Vida.</p>
                
                <div className="bg-blue-50/50 rounded-xl p-4 mb-6 border border-blue-100">
                  <p className="text-sm text-[#16201E] font-bold mb-1">Último backup gerado:</p>
                  <p className="text-xs text-blue-600 font-medium">
                    {lastBackup ? lastBackup : "Nenhum histórico recente"}
                  </p>
                </div>

                <button 
                  onClick={() => {
                    const now = new Date().toLocaleString("pt-PT");
                    localStorage.setItem("pulmovida_last_backup", now);
                    setLastBackup(now);
                    window.open("/api/admin/backup", "_blank");
                  }} 
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#3B82F6] text-white rounded-xl hover:bg-[#2563EB] transition-colors shadow-sm font-bold"
                >
                  Gerar e Descarregar Backup Agora
                </button>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 border-l-4 border-l-orange-500">
                <h3 className="text-lg font-bold text-[#16201E] mb-2 flex items-center gap-2">
                  <svg className="w-5 h-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                  Restaurar Sistema
                </h3>
                <p className="text-sm text-[#746F70] mb-6">Atenção: Restaurar um backup substituirá toda a base de dados atual de forma irreversível.</p>
                
                <label className={`border-2 border-dashed rounded-xl p-6 text-center mb-6 bg-gray-50 transition-colors cursor-pointer group block ${restoring ? 'opacity-50 cursor-not-allowed border-gray-300' : 'border-gray-300 hover:bg-gray-100 hover:border-blue-400'}`}>
                  {restoring ? (
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                      <p className="text-sm font-bold text-blue-600">A Restaurar Base de Dados...</p>
                      <p className="text-xs text-[#746F70]">Por favor não feche a janela.</p>
                    </div>
                  ) : (
                    <>
                      <svg className="w-8 h-8 text-gray-400 group-hover:text-blue-500 mx-auto mb-2 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                      <p className="text-sm font-bold text-[#16201E]">Clique para enviar ficheiro .SQL</p>
                      <p className="text-xs text-[#746F70] mt-1">Apenas administradores autorizados</p>
                    </>
                  )}
                  <input type="file" className="hidden" accept=".sql" disabled={restoring} onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;

                    if (!confirm("⚠️ ATENÇÃO: Tem a certeza absoluta? Todos os dados atuais da clínica serão APAGADOS e substituídos pelos dados deste ficheiro. Esta ação não pode ser desfeita.")) {
                      e.target.value = '';
                      return;
                    }

                    setRestoring(true);
                    const formData = new FormData();
                    formData.append("file", file);

                    try {
                      const response = await fetch("/api/admin/restore", { method: "POST", body: formData });
                      if (!response.ok) {
                        const errorText = await response.text();
                        throw new Error(errorText);
                      }
                      alert("Base de dados restaurada com sucesso! A página será recarregada.");
                      window.location.href = "/admin";
                    } catch (error: any) {
                      alert("Falha ao restaurar: " + error.message);
                    } finally {
                      setRestoring(false);
                      e.target.value = '';
                    }
                  }} />
                </label>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
