import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function DiagnosticoPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();

  if (!session?.user?.id || session.user.tipo !== "paciente") {
    redirect("/login");
  }

  const paciente = await prisma.paciente.findUnique({
    where: { userId: session.user.id }
  });

  if (!paciente) {
    redirect("/paciente");
  }

  const { id: diagnosticoId } = await params;

  const diagnostico = await prisma.diagnostico.findUnique({
    where: { id: diagnosticoId },
    include: {
      respostas: {
        include: {
          opcao: {
            include: { pergunta: true }
          }
        }
      }
    }
  });

  if (!diagnostico || diagnostico.pacienteId !== paciente.id) {
    return (
      <div className="p-10 text-center max-w-lg mx-auto mt-20">
        <h2 className="text-2xl font-bold text-red-600 mb-2">Diagnóstico não encontrado</h2>
        <p className="text-[#746F70] mb-6">O resultado que procura não existe ou não tem permissões para o ver.</p>
        <Link href="/paciente" className="saas-button bg-[#3B82F6] text-white">Voltar ao Painel</Link>
      </div>
    );
  }

  // Lógica simples para escolher uma cor baseada no risco
  const isHighRisk = diagnostico.probabilidade && diagnostico.probabilidade >= 70;
  const isMedRisk = diagnostico.probabilidade && diagnostico.probabilidade >= 30 && diagnostico.probabilidade < 70;
  
  let corCard = "bg-[#3B82F6]/5 border-[#3B82F6]/20 text-[#3B82F6]";
  let textRisk = "Baixo Risco";
  if (isMedRisk) {
    corCard = "bg-yellow-50 border-yellow-200 text-yellow-700";
    textRisk = "Risco Moderado";
  }
  if (isHighRisk) {
    corCard = "bg-red-50 border-red-200 text-red-700";
    textRisk = "Alto Risco";
  }

  return (
    <div className="p-6 sm:p-10 max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-[#16201E] tracking-tight">Resultado da Triagem IA</h1>
          <p className="mt-1 text-[#746F70]">Avaliação realizada a {diagnostico.data.toLocaleDateString("pt-BR", { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
        </div>
        <Link href="/paciente/historico" className="text-sm font-bold text-[#746F70] hover:text-[#3B82F6] transition-colors">&larr; Ver Histórico</Link>
      </div>

      <div className="saas-card p-8 border border-blue-100">
        <div className={`p-6 rounded-2xl border mb-8 ${corCard} shadow-sm`}>
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-bold uppercase tracking-wider">Grau de Severidade Calculado</span>
            <span className="text-4xl font-black">{diagnostico.probabilidade}%</span>
          </div>
          <p className="font-bold text-xl">{diagnostico.resultadoIa}</p>
        </div>

        <div className="mb-8">
          <h2 className="text-lg font-bold text-[#16201E] mb-3">Recomendação do Sistema:</h2>
          <div className="bg-[#EFF6FF]/50 p-6 rounded-xl border border-[#BFDBFE]">
            {isHighRisk ? (
              <p className="text-[#16201E] font-medium leading-relaxed">
                Os sintomas reportados indicam uma forte suspeita de uma <strong>doença respiratória grave</strong> (como pneumonia ou tuberculose). 
                Recomendamos que <strong>agende uma consulta imediatamente com um Pneumologista</strong> no botão abaixo.
              </p>
            ) : isMedRisk ? (
              <p className="text-[#16201E] font-medium leading-relaxed">
                A sua avaliação indica um <strong>risco moderado</strong>. Recomendamos que se dirija ao hospital ou centro de saúde mais próximo para uma avaliação médica imediata. <strong>Não é necessário efetuar um agendamento prévio</strong> pela plataforma.
              </p>
            ) : (
              <p className="text-[#16201E] font-medium leading-relaxed">
                Não foram detetados sinais de alarme graves. Mantenha hábitos saudáveis e continue a monitorizar os seus sintomas. Caso não melhorem, considere marcar uma consulta de rotina.
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-gray-100">
          <Link href="/paciente" className="px-6 py-4 text-center font-bold text-[#746F70] bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors shadow-sm sm:w-1/3">
            Voltar ao Início
          </Link>
          
          {/* Ocultar o botão de agendamento se for Risco Moderado, conforme solicitado */}
          {!isMedRisk && (
            <Link 
              href={isHighRisk ? `/paciente/agendamento?especialidade=Pneumologia` : `/paciente/agendamento`} 
              className="px-6 py-4 text-center font-bold text-white bg-[#3B82F6] rounded-xl hover:bg-[#2563EB] transition-colors shadow-md flex-1 flex justify-center items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              Prosseguir para Agendamento {isHighRisk && "(Pneumologia)"}
            </Link>
          )}
        </div>
      </div>

      <div className="saas-card p-6 border border-gray-100 mt-6 bg-gray-50/50">
        <h3 className="text-sm font-bold text-[#746F70] uppercase tracking-wider mb-4">Resumo das Suas Respostas</h3>
        <div className="space-y-3">
          {diagnostico.respostas.map((resp, i) => (
             <div key={i} className="flex flex-col sm:flex-row sm:justify-between py-2 border-b border-gray-200 last:border-0">
               <span className="text-[#16201E] font-medium">{resp.opcao?.pergunta.texto || "Pergunta apagada"}</span>
               <span className="text-[#3B82F6] font-bold sm:ml-4">{resp.opcao?.texto || "Opção apagada"}</span>
             </div>
          ))}
        </div>
      </div>
    </div>
  );
}
