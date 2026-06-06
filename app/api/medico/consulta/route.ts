import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { medicoId, pacienteId, agendaId, agendamentoId, observacoes, diagnosticoFinal } = await req.json();

    if (!medicoId || !pacienteId || !observacoes || !diagnosticoFinal) {
      return NextResponse.json({ message: "Dados incompletos" }, { status: 400 });
    }

    return NextResponse.json(
      {
        id: Date.now(),
        medicoId,
        pacienteId,
        agendaId: agendaId ?? agendamentoId,
        observacoes,
        diagnosticoFinal,
        status: "realizado",
        message: "Consulta finalizada com sucesso",
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    return NextResponse.json(
      { message: "Erro", error: error instanceof Error ? error.message : "Erro desconhecido" },
      { status: 500 }
    );
  }
}
