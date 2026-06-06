import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (session?.user?.tipo !== "admin") return NextResponse.json({ message: "Não autorizado" }, { status: 403 });

    const { id } = await context.params;
    const { nome, icone } = await req.json();
    
    if (!nome) return NextResponse.json({ message: "O nome é obrigatório" }, { status: 400 });

    const dep = await prisma.departamento.update({
      where: { id },
      data: { nome, icone: icone || "Stethoscope" }
    });
    
    return NextResponse.json(dep);
  } catch (error) {
    return NextResponse.json({ message: "Erro ao atualizar" }, { status: 500 });
  }
}

export async function DELETE(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (session?.user?.tipo !== "admin") return NextResponse.json({ message: "Não autorizado" }, { status: 403 });

    const { id } = await context.params;
    
    const count = await prisma.medico.count({ where: { departamentoId: id } });
    if (count > 0) {
      return NextResponse.json({ message: "Não é possível excluir um departamento que possui médicos." }, { status: 400 });
    }

    await prisma.departamento.delete({
      where: { id }
    });
    
    return NextResponse.json({ message: "Excluído com sucesso" });
  } catch (error) {
    return NextResponse.json({ message: "Erro ao excluir" }, { status: 500 });
  }
}
