import { NextResponse } from "next/server";

type Resposta = {
  pergunta_id: number;
  valor: number;
};

export async function POST(req: Request) {
  try {
    const { respostas } = await req.json();

    if (!Array.isArray(respostas)) {
      return NextResponse.json({ message: "Respostas invalidas" }, { status: 400 });
    }

    const ans = (id: number) => respostas.find((r: Resposta) => r.pergunta_id === id)?.valor === 1;

    const scores = [
      {
        doenca: "Asma",
        score: (ans(2) ? 1 : 0) + (ans(6) ? 1 : 0) + (ans(7) ? 3 : 0) + (ans(12) ? 3 : 0) + (ans(5) ? 1 : 0),
        max: 9,
        rec: "Alerta de crise asmatica. Se tiver medicacao de alivio rapido, utilize. Procure um pneumologista.",
      },
      {
        doenca: "DPOC",
        score: (ans(3) ? 2 : 0) + (ans(6) ? 2 : 0) + (ans(8) ? 2 : 0) + (ans(12) ? 1 : 0) + (ans(17) ? 3 : 0),
        max: 10,
        rec: "Risco de DPOC, associado a fumadores. Recomenda-se espirometria e acompanhamento medico.",
      },
      {
        doenca: "Bronquite Cronica",
        score: (ans(3) ? 3 : 0) + (ans(6) ? 1 : 0) + (ans(18) ? 3 : 0) + (ans(5) ? 1 : 0),
        max: 8,
        rec: "Probabilidade de inflamacao continua nos bronquios. Procure atendimento especializado.",
      },
      {
        doenca: "Enfisema Pulmonar",
        score: (ans(6) ? 3 : 0) + (ans(9) ? 2 : 0) + (ans(15) ? 3 : 0) + (ans(17) ? 2 : 0),
        max: 10,
        rec: "Elevado risco de danos cronicos nos alveolos pulmonares. Acompanhamento com especialista e recomendado.",
      },
      {
        doenca: "Fibrose Pulmonar",
        score: (ans(6) ? 3 : 0) + (ans(2) ? 2 : 0) + (ans(8) ? 3 : 0) + (ans(9) ? 2 : 0),
        max: 10,
        rec: "Risco de doenca restritiva. Recomenda-se avaliacao clinica e exames complementares.",
      },
      {
        doenca: "Tuberculose",
        score: (ans(4) ? 4 : 0) + (ans(1) ? 2 : 0) + (ans(10) ? 3 : 0) + (ans(9) ? 2 : 0) + (ans(2) || ans(3) ? 1 : 0),
        max: 12,
        rec: "Suspeita de tuberculose. Procure um centro de saude com urgencia e use mascara para proteger outras pessoas.",
      },
      {
        doenca: "Pneumonia",
        score: (ans(1) ? 3 : 0) + (ans(3) ? 2 : 0) + (ans(5) ? 2 : 0) + (ans(11) ? 2 : 0) + (ans(6) ? 2 : 0),
        max: 11,
        rec: "Sintomas indicativos de infeccao pulmonar. Procure avaliacao medica e exames adequados.",
      },
      {
        doenca: "COVID-19",
        score: (ans(1) ? 2 : 0) + (ans(2) ? 2 : 0) + (ans(8) ? 2 : 0) + (ans(16) ? 5 : 0) + (ans(6) ? 2 : 0),
        max: 13,
        rec: "Suspeita de infeccao respiratoria viral. Considere isolamento, teste e acompanhamento medico.",
      },
      {
        doenca: "Embolia Pulmonar",
        score: (ans(7) ? 3 : 0) + (ans(5) ? 3 : 0) + (ans(4) ? 2 : 0) + (ans(14) ? 2 : 0),
        max: 10,
        rec: "Possivel urgencia vascular. Procure atendimento medico imediato.",
      },
      {
        doenca: "Hipertensao Pulmonar",
        score: (ans(6) ? 2 : 0) + (ans(8) ? 2 : 0) + (ans(14) ? 3 : 0) + (ans(13) ? 3 : 0) + (ans(5) ? 1 : 0),
        max: 11,
        rec: "Alerta para possivel hipertensao pulmonar. Consulte um especialista para avaliacao.",
      },
    ];

    const doencaFinal = scores.reduce((best, current) => {
      return current.score / current.max > best.score / best.max ? current : best;
    }, scores[0]);

    let probabilidade = Math.round((doencaFinal.score / doencaFinal.max) * 100);
    let resultadoIaText = doencaFinal.doenca;
    let recomendacao = doencaFinal.rec;

    if (probabilidade < 25) {
      probabilidade = Math.max(probabilidade, 0);
      resultadoIaText = "Sem doenca significativa identificada";
      recomendacao = "Os sintomas informados sao reduzidos. Mantenha acompanhamento medico de rotina se houver desconforto.";
    }

    return NextResponse.json(
      { diagnosticoId: Date.now(), probabilidade, recomendacao, resultadoIaText },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("Erro no diagnostico:", error);
    return NextResponse.json(
      { message: "Erro interno", error: error instanceof Error ? error.message : "Erro desconhecido" },
      { status: 500 }
    );
  }
}
