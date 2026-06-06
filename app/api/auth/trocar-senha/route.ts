import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ message: "Não autorizado" }, { status: 401 });

    const { novaSenha } = await req.json();
    if (!novaSenha || novaSenha.length < 6) return NextResponse.json({ message: "A senha deve ter no mínimo 6 caracteres." }, { status: 400 });

    const hashedPassword = await bcrypt.hash(novaSenha, 10);

    await prisma.user.update({
      where: { id: session.user.id },
      data: { 
        senha: hashedPassword,
        senhaTemporaria: false 
      }
    });

    return NextResponse.json({ message: "Senha atualizada com sucesso!" });
  } catch (error) {
    return NextResponse.json({ message: "Erro ao atualizar senha" }, { status: 500 });
  }
}
