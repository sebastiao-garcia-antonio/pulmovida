"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function submitQuiz(respostas: Record<string, { opcaoId?: string; valorNum?: number }>) {
  const session = await auth();
  if (!session?.user?.id || session.user.tipo !== "paciente") {
    throw new Error("Não autorizado");
  }

  const paciente = await prisma.paciente.findUnique({
    where: { userId: session.user.id }
  });

  if (!paciente) {
    throw new Error("Paciente não encontrado na base de dados.");
  }

  // 1. Calcular a Idade
  let idade = 30; // Valor por defeito
  if (paciente.dataNascimento) {
    const ageDifMs = Date.now() - new Date(paciente.dataNascimento).getTime();
    const ageDate = new Date(ageDifMs);
    idade = Math.abs(ageDate.getUTCFullYear() - 1970);
  }

  // 2. Obter o Sexo (0 = Feminino, 1 = Masculino)
  let sexo = 0;
  if (paciente.genero && paciente.genero.toLowerCase() === "masculino") {
    sexo = 1;
  }

  // 3. Processar as respostas
  const opcaoIds = Object.values(respostas).map(r => r.opcaoId).filter(Boolean) as string[];
  const opcoesEscolhidas = await prisma.opcaoResposta.findMany({
    where: { id: { in: opcaoIds } },
    include: { pergunta: true }
  });

  const perguntaIds = Object.keys(respostas);
  const perguntasRespondidas = await prisma.pergunta.findMany({
    where: { id: { in: perguntaIds } }
  });

  const valoresPorCategoria: Record<string, number> = {};
  
  // Mapear valores das opções normais
  for (const op of opcoesEscolhidas) {
    if (op.pergunta.categoria) {
      valoresPorCategoria[op.pergunta.categoria] = op.valor;
    }
  }

  // Mapear valores numéricos puros (tipo="numero")
  for (const p of perguntasRespondidas) {
    if (p.categoria && respostas[p.id]?.valorNum !== undefined) {
      valoresPorCategoria[p.categoria] = respostas[p.id].valorNum as number;
    }
  }

  // 4. Montar o Array de Features na Ordem Exata
  const colunasRequeridas = [
    'Fumante', 'Idade', 'Sexo', 'Convive_Fumantes', 'Trabalha_Quimicos', 
    'Doencas_Familia', 'Tosse', 'Tosse_Dias', 'Tosse_Catarro', 'Tosse_Sangue', 
    'Dificuldade_Respirar', 'Falta_Ar_Constante', 'Nivel_Falta_Ar', 'Chiado_Peito', 
    'Febre', 'Cansaco_Frequente', 'Perda_Peso_Recente', 'Suor_Noturno', 
    'Pioram_Noite', 'Saturacao_O2'
  ];

  const featuresData = colunasRequeridas.map(coluna => {
    if (coluna === 'Idade') return idade;
    if (coluna === 'Sexo') return sexo;
    return valoresPorCategoria[coluna] ?? 0;
  });

  // 5. Enviar para a API Python (FastAPI)
  let resultadoIa = "Erro na Comunicação com a IA";
  let probabilidade = 0;
  let classeIa = 0;

  try {
    const apiUrl = process.env.IA_API_URL || "http://127.0.0.1:8000";
    const apiResponse = await fetch(`${apiUrl}/prever`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ respostas: featuresData }),
      signal: AbortSignal.timeout(10000)
    });

    if (apiResponse.ok) {
      const data = await apiResponse.json();
      resultadoIa = data.diagnostico;
      probabilidade = Math.round(data.probabilidade * 100);
      classeIa = data.classe;
    } else {
      console.error("Erro da API Python:", await apiResponse.text());
      resultadoIa = "Serviço IA Indisponível";
    }
  } catch (error) {
    console.error("Falha ao conectar ao Microserviço IA:", error);
    resultadoIa = "Risco Moderado (Fallback/IA Indisponível)";
    probabilidade = 50;
  }

  // 6. Guardar o Diagnóstico
  const diagnostico = await prisma.diagnostico.create({
    data: {
      pacienteId: paciente.id,
      resultadoIa,
      probabilidade,
      respostas: {
        create: Object.entries(respostas).map(([perguntaId, res]) => {
          const op = res.opcaoId ? opcoesEscolhidas.find(o => o.id === res.opcaoId) : null;
          return {
            pacienteId: paciente.id,
            perguntaId,
            opcaoId: res.opcaoId || null,
            valor: res.valorNum !== undefined ? res.valorNum : (op ? op.valor : 0)
          };
        })
      }
    }
  });

  return { success: true, diagnosticoId: diagnostico.id };
}
