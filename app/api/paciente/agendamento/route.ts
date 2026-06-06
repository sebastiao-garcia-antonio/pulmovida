import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { pacienteId, medicoId, agendaId } = await req.json();

    if (!pacienteId || !medicoId || !agendaId) {
      return NextResponse.json({ message: "Dados incompletos" }, { status: 400 });
    }

    return NextResponse.json(
      {
        id: Date.now(),
        pacienteId,
        medicoId,
        agendaId,
        status: "pendente",
        message: "Agendamento criado",
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
