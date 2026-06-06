import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET() {
  try {
    const session = await auth();
    if (session?.user?.tipo !== "admin") return NextResponse.json({ message: "Não autorizado" }, { status: 403 });

    const departamentos = await prisma.departamento.findMany({
      orderBy: { nome: 'asc' }
    });
    return NextResponse.json(departamentos);
  } catch (error) {
    return NextResponse.json({ message: "Erro ao buscar departamentos" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (session?.user?.tipo !== "admin") return NextResponse.json({ message: "Não autorizado" }, { status: 403 });

    const { nome, icone } = await req.json();
    if (!nome) return NextResponse.json({ message: "O nome é obrigatório" }, { status: 400 });

    const dep = await prisma.departamento.create({
      data: { nome, icone: icone || "Stethoscope" }
    });
    return NextResponse.json(dep, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "Erro ao criar departamento" }, { status: 500 });
  }
}
