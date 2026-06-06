"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { submitQuiz } from "./actions";

type OpcaoResposta = {
  id: string;
  texto: string;
  valor: number;
};

type Pergunta = {
  id: string;
  texto: string;
  tipo: string;
  opcoes: OpcaoResposta[];
};

export default function QuizClient({ perguntas }: { perguntas: Pergunta[] }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const [step, setStep] = useState(0);
  
  // Guardamos o id da OpcaoResposta escolhida para a pergunta atual
  const [respostas, setRespostas] = useState<Record<string, string>>({});
  const [showResultModal, setShowResultModal] = useState(false);

  if (!perguntas || perguntas.length === 0) {
    return (
      <div className="w-full max-w-2xl mx-auto glass-panel p-12 text-center rounded-3xl bg-white shadow-sm border border-slate-100 mt-10">
        <svg className="w-16 h-16 mx-auto text-blue-200 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
        <h2 className="text-xl font-bold text-slate-800 mb-2">Triagem Indisponível</h2>
        <p className="text-slate-500 mb-6">A administração da clínica ainda não configurou as perguntas para a Triagem Inteligente.</p>
        <button onClick={() => router.push("/paciente")} className="saas-button bg-blue-600 text-white">Voltar ao Painel</button>
      </div>
    );
  }

  const isLasteStep = step === perguntas.length - 1;
  const currentQ = perguntas[step];

  const handleAnswer = (opcaoId: string) => {
    setRespostas(prev => ({ ...prev, [currentQ.id]: opcaoId }));
    
    // Auto-advance after a small delay for better UX
    setTimeout(() => {
      if (!isLasteStep) {
        setStep(prev => prev + 1);
      } else {
        setShowResultModal(true);
      }
    }, 300);
  };

  const handleBack = () => {
    if (step > 0) setStep(prev => prev - 1);
  };

  const handleCancel = () => {
    router.push("/paciente");
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await submitQuiz(respostas);
      if (res.success && res.diagnosticoId) {
        router.push(`/paciente/diagnostico/${res.diagnosticoId}`);
      } else {
        throw new Error("Falha ao gerar diagnóstico.");
      }
    } catch (err: any) {
      setError(err.message || "Ocorreu um erro ao processar o seu questionário.");
      setLoading(false);
      setShowResultModal(false);
    }
  };

  const progressPercentage = ((step + 1) / perguntas.length) * 100;
  const currentAnswer = respostas[currentQ.id];

  return (
    <div className="w-full max-w-2xl mx-auto glass-panel p-8 md:p-12 rounded-3xl animate-fade-in-up bg-white shadow-xl border border-slate-100">
      {error && <div className="mb-6 p-4 text-red-600 bg-red-50 rounded-xl text-sm border border-red-200 font-medium">{error}</div>}

      {/* Progress Bar */}
      <div className="mb-10">
        <div className="flex justify-between items-end mb-2">
          <span className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Passo {step + 1} de {perguntas.length}</span>
          <span className="text-sm font-bold text-blue-600">{Math.round(progressPercentage)}%</span>
        </div>
        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-emerald-400 transition-all duration-500 ease-out"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>

      {/* Question Card */}
      <div className="flex flex-col items-center justify-center min-h-[220px]">
        <div key={currentQ.id} className="animate-fade-in flex flex-col items-center text-center w-full">
          <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-6 shadow-sm ring-4 ring-white">
             <span className="text-2xl font-black">Q{step + 1}</span>
          </div>
          <h2 className="text-2xl font-bold text-[#16201E] leading-snug mb-8 max-w-lg">
            {currentQ.texto}
          </h2>

          <div className="flex w-full flex-col sm:flex-row flex-wrap justify-center gap-3">
            {currentQ.opcoes.map((opcao) => {
              const isSelected = currentAnswer === opcao.id;
              
              // Se for sim/nao com apenas 2 opcoes, dar cores diferentes
              const isBinary = currentQ.tipo === "sim_nao" && currentQ.opcoes.length === 2;
              const isPositiveBinary = isBinary && opcao.valor > 0;
              
              let btnClass = "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100";
              if (isSelected) {
                if (isPositiveBinary) {
                  btnClass = "bg-emerald-500 text-white border-emerald-500 shadow-md ring-2 ring-offset-2 ring-emerald-500";
                } else if (isBinary) {
                  btnClass = "bg-slate-700 text-white border-slate-700 shadow-md ring-2 ring-offset-2 ring-slate-700";
                } else {
                  btnClass = "bg-blue-600 text-white border-blue-600 shadow-md ring-2 ring-offset-2 ring-blue-600";
                }
              }

              return (
                <button
                  key={opcao.id}
                  type="button"
                  onClick={() => handleAnswer(opcao.id)}
                  className={`flex-1 min-w-[140px] px-4 py-4 rounded-xl font-bold text-lg transition-all duration-200 border-2 ${btnClass}`}
                >
                  {opcao.texto}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer Controls */}
      <div className="mt-12 pt-6 border-t border-slate-100 flex justify-between items-center">
        {step === 0 ? (
          <button
            type="button"
            onClick={handleCancel}
            disabled={loading}
            className="px-5 py-2.5 text-slate-500 font-bold hover:text-red-600 disabled:opacity-30 transition-colors"
          >
            Cancelar
          </button>
        ) : (
          <button
            type="button"
            onClick={handleBack}
            disabled={loading}
            className="px-5 py-2.5 text-slate-500 font-bold hover:text-blue-600 disabled:opacity-30 transition-colors"
          >
            &larr; Voltar
          </button>
        )}
        
        {isLasteStep && currentAnswer && (
          <button
            type="button"
            onClick={() => setShowResultModal(true)}
            disabled={loading}
            className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50"
          >
            {loading ? "A processar..." : "Finalizar Triagem"}
          </button>
        )}
      </div>

      {/* Modal Resultado */}
      {showResultModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-[#16201E]/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-fade-in-up border border-blue-100">
            <div className="p-8 text-center space-y-6">
              <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center mx-auto border-4 border-white shadow-sm">
                <svg className="w-10 h-10 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-xl font-bold text-[#16201E] mb-2">Questionário Concluído</p>
                <p className="text-sm text-[#746F70]">A Inteligência Artificial vai agora analisar as suas respostas para lhe sugerir o melhor caminho clínico.</p>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowResultModal(false)}
                  disabled={loading}
                  className="flex-1 px-4 py-3.5 font-bold text-[#746F70] bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Rever
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1 px-4 py-3.5 font-bold text-white bg-[#3B82F6] rounded-xl hover:bg-[#2563EB] transition-colors shadow-md"
                >
                  {loading ? "A processar..." : "Ver Resultado"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
