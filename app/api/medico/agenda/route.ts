import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { medicoId, data } = await req.json();

    if (!medicoId || !data) {
      return NextResponse.json({ message: "Medico e data sao obrigatorios" }, { status: 400 });
    }

    const horarios = [
      "08:00",
      "08:30",
      "09:00",
      "09:30",
      "10:00",
      "10:30",
      "11:00",
      "11:30",
      "13:00",
      "13:30",
      "14:00",
      "14:30",
      "15:00",
      "15:30",
      "16:00",
      "16:30",
    ];

    const agendas = horarios.map((horario, index) => ({
      id: Date.now() + index,
      medicoId,
      data,
      horario,
      disponivel: true,
    }));

    return NextResponse.json(
      { agendas, message: "Agenda gerada com sucesso para o dia " + data },
      { status: 201 }
    );
  } catch (error: unknown) {
    return NextResponse.json(
      { message: "Erro", error: error instanceof Error ? error.message : "Erro desconhecido" },
      { status: 500 }
    );
  }
}
