import { NextResponse } from "next/server";

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    return NextResponse.json({ id, message: "Horario eliminado com sucesso" }, { status: 200 });
  } catch (error: unknown) {
    return NextResponse.json(
      { message: "Erro", error: error instanceof Error ? error.message : "Erro desconhecido" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { data, horario } = await req.json();

    if (!data || !horario) {
      return NextResponse.json({ message: "Data e horario sao obrigatorios" }, { status: 400 });
    }

    return NextResponse.json({ id, data, horario, message: "Horario atualizado com sucesso" }, { status: 200 });
  } catch (error: unknown) {
    return NextResponse.json(
      { message: "Erro", error: error instanceof Error ? error.message : "Erro desconhecido" },
      { status: 500 }
    );
  }
}
