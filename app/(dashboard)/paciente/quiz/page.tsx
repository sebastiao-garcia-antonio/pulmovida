import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import QuizClient from "./QuizClient";

export const dynamic = "force-dynamic";

export default async function QuizPage() {
  const session = await auth();

  if (!session?.user?.id || session.user.tipo !== "paciente") {
    redirect("/login");
  }

  // Obter paciente para verificar perfil completo
  const paciente = await prisma.paciente.findUnique({
    where: { userId: session.user.id }
  });

  if (!paciente || !paciente.dataNascimento || !paciente.genero) {
    return (
      <div className="p-6 sm:p-10 max-w-3xl mx-auto mt-10">
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8 text-center shadow-sm">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-amber-800 mb-2">Perfil Incompleto</h2>
          <p className="text-amber-700 mb-6 max-w-lg mx-auto">
            Para que a nossa IA consiga analisar corretamente os seus sintomas, precisamos de saber a sua <strong>Data de Nascimento</strong> e o seu <strong>Género</strong>.
          </p>
          <a href="/paciente/configuracoes" className="inline-block bg-amber-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-amber-700 transition shadow-sm">
            Completar Perfil Agora
          </a>
        </div>
      </div>
    );
  }

  // Obter as perguntas ativas configuradas pelo Administrador
  const perguntasDb = await prisma.pergunta.findMany({
    include: {
      opcoes: true,
    },
    orderBy: {
      texto: "asc" // Pode mudar para uma ordem específica se adicionado o campo "ordem"
    }
  });

  return (
    <div className="p-6 sm:p-10 max-w-5xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-extrabold text-[#16201E] tracking-tight">Triagem Inteligente (IA)</h1>
        <p className="mt-2 text-[#746F70] text-lg">
          Responda com sinceridade. O nosso assistente de IA vai cruzar as suas respostas com diretrizes clínicas para calcular a probabilidade de risco e sugerir a especialidade certa.
        </p>
      </div>
      
      <QuizClient perguntas={perguntasDb} />
    </div>
  );
}
