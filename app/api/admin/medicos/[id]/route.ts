import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (session?.user?.tipo !== "admin") return NextResponse.json({ message: "Não autorizado" }, { status: 403 });

    const { id } = await context.params;
    const { especialidade, departamentoId } = await req.json();

    const medico = await prisma.medico.update({
      where: { id },
      data: { especialidade, departamentoId },
      include: { user: true, departamento: true }
    });

    return NextResponse.json({
      id: medico.id,
      userId: medico.userId,
      nome: medico.user.name,
      email: medico.user.email,
      especialidade: medico.especialidade,
      departamentoId: medico.departamentoId,
      departamentoNome: medico.departamento?.nome,
      senhaTemporaria: medico.user.senhaTemporaria
    });
  } catch (error) {
    return NextResponse.json({ message: "Erro ao atualizar médico" }, { status: 500 });
  }
}

export async function DELETE(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (session?.user?.tipo !== "admin") return NextResponse.json({ message: "Não autorizado" }, { status: 403 });

    const { id } = await context.params;
    const medico = await prisma.medico.findUnique({ where: { id } });

    if (!medico) return NextResponse.json({ message: "Não encontrado" }, { status: 404 });

    // Deleting the user automatically deletes the Medico due to Cascade
    await prisma.user.delete({ where: { id: medico.userId } });

    return NextResponse.json({ message: "Excluído com sucesso" });
  } catch (error) {
    return NextResponse.json({ message: "Erro ao excluir" }, { status: 500 });
  }
}
