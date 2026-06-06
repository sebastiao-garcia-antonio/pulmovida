"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function submitQuiz(respostas: Record<string, string>) {
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

  // 2. Obter o Sexo (0 = Feminino, 1 = Masculino, ou dependendo de como treinou)
  // Assume-se que 'genero' guarda "Masculino" ou "Feminino"
  let sexo = 0;
  if (paciente.genero && paciente.genero.toLowerCase() === "masculino") {
    sexo = 1;
  }

  // 3. Obter as Opções Escolhidas e mapeá-las para as categorias
  const opcaoIds = Object.values(respostas);
  const opcoesEscolhidas = await prisma.opcaoResposta.findMany({
    where: { id: { in: opcaoIds } },
    include: { pergunta: true }
  });

  // Criar um dicionário { 'Categoria_Pergunta': valor_escolhido }
  const valoresPorCategoria: Record<string, number> = {};
  for (const op of opcoesEscolhidas) {
    if (op.pergunta.categoria) {
      valoresPorCategoria[op.pergunta.categoria] = op.valor;
    }
  }

  // 4. Montar o Array de Features na Ordem Exata
  // ['Fumante', 'Idade', 'Sexo', 'Convive_Fumantes', 'Trabalha_Quimicos', 'Doencas_Familia', 'Tosse', 'Tosse_Dias', 'Tosse_Catarro', 'Tosse_Sangue', 'Dificuldade_Respirar', 'Falta_Ar_Constante', 'Nivel_Falta_Ar', 'Chiado_Peito', 'Febre', 'Cansaco_Frequente', 'Perda_Peso_Recente', 'Suor_Noturno', 'Pioram_Noite', 'Saturacao_O2']
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
    // Retorna o valor escolhido, ou 0 se por acaso não foi respondido/encontrado
    return valoresPorCategoria[coluna] ?? 0;
  });

  // 5. Enviar para a API Python (FastAPI)
  let resultadoIa = "Erro na Comunicação com a IA";
  let probabilidade = 0;

  try {
    const apiUrl = process.env.IA_API_URL || "http://127.0.0.1:8000";
    const apiResponse = await fetch(`${apiUrl}/prever`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ respostas: featuresData }),
      // Timeout de 10s
      signal: AbortSignal.timeout(10000)
    });

    if (apiResponse.ok) {
      const data = await apiResponse.json();
      resultadoIa = data.diagnostico;
      // Guardamos como percentagem 0-100 para o frontend
      probabilidade = Math.round(data.probabilidade * 100);
    } else {
      console.error("Erro da API Python:", await apiResponse.text());
      resultadoIa = "Serviço IA Indisponível";
    }
  } catch (error) {
    console.error("Falha ao conectar ao Microserviço IA:", error);
    // Fallback: Manter um mock só para que o sistema não rebente se a API estiver offline
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
        create: Object.entries(respostas).map(([perguntaId, opcaoId]) => {
          const op = opcoesEscolhidas.find(o => o.id === opcaoId);
          return {
            pacienteId: paciente.id,
            perguntaId,
            opcaoId,
            valor: op ? op.valor : 0
          };
        })
      }
    }
  });

  return { success: true, diagnosticoId: diagnostico.id };
}
