import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const perguntas_seed = [
  {
    categoria: "Fumante",
    texto: "Você fuma atualmente ou fumou recentemente?",
    tipo: "sim_nao",
    opcoes: [
      { texto: "Não", valor: 0 },
      { texto: "Sim", valor: 1 }
    ]
  },
  {
    categoria: "Convive_Fumantes",
    texto: "Você convive frequentemente com pessoas que fumam?",
    tipo: "sim_nao",
    opcoes: [
      { texto: "Não", valor: 0 },
      { texto: "Sim", valor: 1 }
    ]
  },
  {
    categoria: "Trabalha_Quimicos",
    texto: "O seu trabalho envolve exposição a produtos químicos, poeira ou gases?",
    tipo: "sim_nao",
    opcoes: [
      { texto: "Não", valor: 0 },
      { texto: "Sim", valor: 1 }
    ]
  },
  {
    categoria: "Doencas_Familia",
    texto: "Tem historial de doenças respiratórias na família (ex: Asma, DPOC)?",
    tipo: "sim_nao",
    opcoes: [
      { texto: "Não", valor: 0 },
      { texto: "Sim", valor: 1 }
    ]
  },
  {
    categoria: "Tosse",
    texto: "Sente tosse atualmente?",
    tipo: "sim_nao",
    opcoes: [
      { texto: "Não", valor: 0 },
      { texto: "Sim", valor: 1 }
    ]
  },
  {
    categoria: "Tosse_Dias",
    texto: "Se tem tosse, há quantos dias?",
    tipo: "multipla",
    opcoes: [
      { texto: "Não tenho tosse", valor: 0 },
      { texto: "Menos de 3 dias", valor: 2 },
      { texto: "Cerca de uma semana", valor: 7 },
      { texto: "Mais de 15 dias", valor: 20 },
      { texto: "Há mais de um mês crónico", valor: 45 }
    ]
  },
  {
    categoria: "Tosse_Catarro",
    texto: "A sua tosse é acompanhada de expetoração (catarro)?",
    tipo: "sim_nao",
    opcoes: [
      { texto: "Não", valor: 0 },
      { texto: "Sim", valor: 1 }
    ]
  },
  {
    categoria: "Tosse_Sangue",
    texto: "Notou a presença de sangue na tosse ou expetoração?",
    tipo: "sim_nao",
    opcoes: [
      { texto: "Não", valor: 0 },
      { texto: "Sim", valor: 1 }
    ]
  },
  {
    categoria: "Dificuldade_Respirar",
    texto: "Sente alguma dificuldade em respirar?",
    tipo: "sim_nao",
    opcoes: [
      { texto: "Não", valor: 0 },
      { texto: "Sim", valor: 1 }
    ]
  },
  {
    categoria: "Falta_Ar_Constante",
    texto: "Essa falta de ar é constante?",
    tipo: "sim_nao",
    opcoes: [
      { texto: "Não", valor: 0 },
      { texto: "Sim", valor: 1 }
    ]
  },
  {
    categoria: "Nivel_Falta_Ar",
    texto: "Como classificaria o seu nível de falta de ar?",
    tipo: "multipla",
    opcoes: [
      { texto: "Nenhuma", valor: 0 },
      { texto: "Leve (ao fazer esforço)", valor: 1 },
      { texto: "Moderada (ao andar rápido)", valor: 2 },
      { texto: "Grave (em repouso)", valor: 3 }
    ]
  },
  {
    categoria: "Chiado_Peito",
    texto: "Ouve algum ruído ou chiado (sibilo) no peito ao respirar?",
    tipo: "sim_nao",
    opcoes: [
      { texto: "Não", valor: 0 },
      { texto: "Sim", valor: 1 }
    ]
  },
  {
    categoria: "Febre",
    texto: "Tem tido febre recentemente?",
    tipo: "sim_nao",
    opcoes: [
      { texto: "Não", valor: 0 },
      { texto: "Sim", valor: 1 }
    ]
  },
  {
    categoria: "Cansaco_Frequente",
    texto: "Sente um cansaço frequente ou fora do normal?",
    tipo: "sim_nao",
    opcoes: [
      { texto: "Não", valor: 0 },
      { texto: "Sim", valor: 1 }
    ]
  },
  {
    categoria: "Perda_Peso_Recente",
    texto: "Teve uma perda de peso recente e inexplicada?",
    tipo: "sim_nao",
    opcoes: [
      { texto: "Não", valor: 0 },
      { texto: "Sim", valor: 1 }
    ]
  },
  {
    categoria: "Suor_Noturno",
    texto: "Costuma ter suores noturnos intensos?",
    tipo: "sim_nao",
    opcoes: [
      { texto: "Não", valor: 0 },
      { texto: "Sim", valor: 1 }
    ]
  },
  {
    categoria: "Pioram_Noite",
    texto: "Os seus sintomas pioram durante a noite?",
    tipo: "sim_nao",
    opcoes: [
      { texto: "Não", valor: 0 },
      { texto: "Sim", valor: 1 }
    ]
  },
  {
    categoria: "Saturacao_O2",
    texto: "Sabe a sua Saturação de Oxigénio (O2)? (Se não souber, escolha 'Normal')",
    tipo: "multipla",
    opcoes: [
      { texto: "Normal ou Não sei (~98%)", valor: 98 },
      { texto: "Levemente Baixa (90% a 95%)", valor: 93 },
      { texto: "Muito Baixa (< 90%)", valor: 85 }
    ]
  }
];

async function main() {
  console.log("A limpar perguntas e opções antigas...");
  await prisma.opcaoResposta.deleteMany({});
  await prisma.pergunta.deleteMany({});

  console.log("A inserir novas perguntas...");
  for (const q of perguntas_seed) {
    const pergunta = await prisma.pergunta.create({
      data: {
        texto: q.texto,
        // @ts-ignore - Forçando string para Enum se houver type mismatch no TS client
        tipo: q.tipo === "sim_nao" ? "booleano" : "multipla", 
        categoria: q.categoria,
        peso: 1,
        opcoes: {
          create: q.opcoes.map(op => ({
            texto: op.texto,
            valor: op.valor
          }))
        }
      }
    });
    console.log(`- Inserida: ${pergunta.categoria}`);
  }

  console.log("✅ Seeding concluído!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
