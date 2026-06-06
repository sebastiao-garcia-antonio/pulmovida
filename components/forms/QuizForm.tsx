"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function QuizForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  // Lista expandida com todos os sintomas para um diagnóstico preciso
  const perguntas = [
    { id: 1, texto: "Você tem febre?" },
    { id: 2, texto: "Tem tosse seca (sem catarro) persistente?" },
    { id: 3, texto: "Tem tosse produtiva (com catarro) há bastante tempo?" },
    { id: 4, texto: "Saiu sangue ao tossir recentemente?" },
    { id: 5, texto: "Sente dor, aperto ou desconforto no peito ao respirar?" },
    { id: 6, texto: "Sente falta de ar intensa ou frequente?" },
    { id: 7, texto: "A sua falta de ar aparece em crises (vai e volta) ou de repente?" },
    { id: 8, texto: "Sente cansaço fácil ou fadiga extrema no dia a dia?" },
    { id: 9, texto: "Notou perda de peso inexplicável (sem fazer dieta)?" },
    { id: 10, texto: "Acorda de madrugada com suor noturno intenso?" },
    { id: 11, texto: "Tem sentido calafrios acompanhados com os outros sintomas?" },
    { id: 12, texto: "Ouve ou sente um 'chiado' no peito ao respirar?" },
    { id: 13, texto: "Tem notado inchaço nas pernas e pés?" },
    { id: 14, texto: "Sente tonturas repentinas?" },
    { id: 15, texto: "Sente o seu tórax 'inchado' (peito aumentado ou sensação de estar cheio de ar)?" },
    { id: 16, texto: "Perdeu o olfato (cheiro) ou paladar (sabor) subitamente?" },
    { id: 17, texto: "É fumador(a) ou esteve frequentemente exposto(a) a fumo intenso/poluição?" },
    { id: 18, texto: "Costuma ter infecções respiratórias muito frequentemente ao longo do ano?" }
  ];

  const [step, setStep] = useState(0);
  const [respostas, setRespostas] = useState<Record<number, boolean>>({});
  const [showResultModal, setShowResultModal] = useState(false);

  const isLasteStep = step === perguntas.length - 1;
  const currentQ = perguntas[step];

  const handleAnswer = (answer: boolean) => {
    setRespostas(prev => ({ ...prev, [currentQ.id]: answer }));
    if (!isLasteStep) {
      setStep(prev => prev + 1);
    } else {
      setShowResultModal(true);
    }
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

    // Garantir que envia do 1 ao N (as não respondidas explicitamente assumem-se false pelo state default, mas vamos obrigar o flow)
    const respostasArray = perguntas.map(p => ({
      pergunta_id: p.id,
      valor: respostas[p.id] ? 1 : 0
    }));

    try {
      const res = await fetch("/api/diagnostico", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ respostas: respostasArray }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Erro ao processar diagnóstico");
      }

      router.push(`/paciente/diagnostico/${data.diagnosticoId}`);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const progressPercentage = ((step + 1) / perguntas.length) * 100;
  const isCurrentAnswered = respostas[currentQ.id] !== undefined;

  return (
    <div className="w-full max-w-2xl mx-auto glass-panel p-8 md:p-12 rounded-3xl animate-fade-in-up bg-white shadow-xl border border-slate-100">
      {error && <div className="mb-6 p-4 text-red-600 bg-red-50 rounded-xl text-sm border border-red-200">{error}</div>}

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between items-end mb-2">
          <span className="text-sm font-semibold text-slate-500">Passo {step + 1} de {perguntas.length}</span>
          <span className="text-sm font-bold text-blue-600">{Math.round(progressPercentage)}%</span>
        </div>
        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-emerald-400 transition-all duration-500 ease-out"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>

      {/* Question Card */}
      <div className="flex flex-col items-center justify-center py-6 min-h-[150px]">
        <div key={step} className="animate-fade-in flex flex-col items-center text-center w-full">
          <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-6 shadow-sm">
             <span className="text-2xl font-black">Q{currentQ.id}</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-800 leading-tight mb-8 max-w-lg">
            {currentQ.texto}
          </h2>

          <div className="flex w-full sm:w-2/3 flex-col sm:flex-row gap-4">
            <button
              type="button"
              onClick={() => handleAnswer(true)}
              className={`flex-1 px-4 py-3 rounded-xl font-bold text-lg transition-all duration-200 border-2 ${respostas[currentQ.id] === true ? 'bg-emerald-500 text-white border-emerald-500 scale-105 shadow-md' : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'}`}
            >
              Sim
            </button>
            <button
              type="button"
              onClick={() => handleAnswer(false)}
              className={`flex-1 px-4 py-3 rounded-xl font-bold text-lg transition-all duration-200 border-2 ${respostas[currentQ.id] === false ? 'bg-slate-700 text-white border-slate-700 scale-105 shadow-md' : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'}`}
            >
              Não
            </button>
          </div>
        </div>
      </div>

      {/* Footer Controls */}
      <div className="mt-8 pt-6 border-t border-slate-100 flex justify-between items-center">
        {step === 0 ? (
          <button
            type="button"
            onClick={handleCancel}
            disabled={loading}
            className="px-5 py-2.5 text-slate-500 font-semibold hover:text-red-600 disabled:opacity-30 transition-colors disabled:cursor-not-allowed"
          >
            Cancelar
          </button>
        ) : (
          <button
            type="button"
            onClick={handleBack}
            disabled={loading}
            className="px-5 py-2.5 text-slate-500 font-semibold hover:text-blue-600 disabled:opacity-30 transition-colors disabled:cursor-not-allowed"
          >
            &larr; Voltar
          </button>
        )}
        
        {isLasteStep && isCurrentAnswered && (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:opacity-50"
          >
            {loading ? "Avaliando..." : "Descobrir o Diagnóstico \u2713"}
          </button>
        )}
      </div>
      {/* Modal Resultado */}
      {showResultModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#16201E]/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-fade-in">
            <div className="p-6 space-y-5 text-center">
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-lg font-bold text-[#16201E]">Deseja continuar e ver o resultado da análise?</p>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowResultModal(false)}
                  className="flex-1 px-4 py-3 font-medium text-[#746F70] bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Não
                </button>
                <button
                  onClick={handleSubmit}
                  className="flex-1 px-4 py-3 font-bold text-white bg-[#3B82F6] rounded-xl hover:bg-[#2563EB] transition-colors"
                >
                  Sim
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
