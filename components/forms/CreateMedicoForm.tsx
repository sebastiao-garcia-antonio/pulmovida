"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateMedicoForm({ departamentos }: { departamentos: any[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [especialidade, setEspecialidade] = useState("");
  const [departamentoId, setDepartamentoId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          nome, email, tipo: "medico", especialidade, departamento_id: parseInt(departamentoId)
        }),
      });

      if (res.ok) {
        setNome(""); setEmail("");
        setEspecialidade(""); setDepartamentoId("");
        setIsOpen(false);
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.message || "Erro ao registrar médico");
      }
    } catch (err) {
      setError("Falha de rede ao tentar registrar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)} 
        className="px-4 py-2 bg-[#3B82F6] text-white text-sm font-semibold rounded-lg hover:bg-[#2563EB] transition-colors shadow-sm"
      >
        + Registrar Médico
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#16201E]/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] animate-fade-in-up">
            <div className="px-6 py-4 border-b border-[#BFDBFE] flex justify-between items-center bg-[#EFF6FF]/50">
              <h2 className="text-xl font-bold text-[#16201E]">Registrar Novo Médico</h2>
              <button type="button" onClick={() => setIsOpen(false)} className="text-[#746F70] hover:text-[#16201E] transition-colors p-1 rounded-md hover:bg-[#EFF6FF]">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <form onSubmit={handleSubmit} className="space-y-5">
                {error && <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100 font-medium">{error}</div>}
                
                <div>
                  <label className="block text-xs font-semibold text-[#746F70] uppercase tracking-wide mb-1.5">Nome Completo</label>
                  <input type="text" value={nome} onChange={e => setNome(e.target.value)} className="saas-input w-full" required placeholder="Dr. João Silva" />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#746F70] uppercase tracking-wide mb-1.5">Email</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="saas-input w-full" required placeholder="medico@saude.com" />
                </div>

                <p className="text-xs text-[#746F70] bg-[#EFF6FF]/50 px-3 py-2 rounded-lg -mt-2">
                  Uma senha provisória será gerada automaticamente e enviada para o email do médico.
                </p>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#746F70] uppercase tracking-wide mb-1.5">Especialidade</label>
                    <input type="text" value={especialidade} onChange={e => setEspecialidade(e.target.value)} className="saas-input w-full" required placeholder="Ex: Cardiologista" />
                  </div>

                  <div>
                     <label className="block text-xs font-semibold text-[#746F70] uppercase tracking-wide mb-1.5">Departamento</label>
                     <select value={departamentoId} onChange={e => setDepartamentoId(e.target.value)} className="saas-input w-full" required>
                       <option value="">Selecione...</option>
                       {departamentos.map(d => (
                         <option key={d.id} value={d.id}>{d.nome}</option>
                       ))}
                     </select>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#BFDBFE] flex justify-end gap-3">
                  <button type="button" onClick={() => setIsOpen(false)} className="px-4 py-2 bg-white border border-[#BFDBFE] text-[#746F70] font-medium rounded-lg hover:bg-[#EFF6FF] transition-colors">
                    Cancelar
                  </button>
                  <button type="submit" disabled={loading} className="px-5 py-2 bg-[#3B82F6] text-white font-medium rounded-lg hover:bg-[#2563EB] transition-colors disabled:opacity-50">
                    {loading ? "Registrando..." : "Confirmar Registro"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
