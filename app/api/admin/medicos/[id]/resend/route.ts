import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import bcrypt from "bcryptjs";
import { sendDoctorCredentialsEmail } from "@/lib/email";

export async function POST(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (session?.user?.tipo !== "admin") return NextResponse.json({ message: "Não autorizado" }, { status: 403 });

    const { id } = await context.params;

    const medico = await prisma.medico.findUnique({
      where: { id },
      include: { user: true }
    });

    if (!medico || !medico.user) {
      return NextResponse.json({ message: "Médico não encontrado." }, { status: 404 });
    }

    if (!medico.user.senhaTemporaria) {
      return NextResponse.json({ message: "Este médico já alterou a senha e não está mais com senha temporária." }, { status: 400 });
    }

    const tempPassword = Math.random().toString(36).slice(-6).toUpperCase() + Math.floor(Math.random() * 100) + "!";
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    await prisma.user.update({
      where: { id: medico.userId },
      data: {
        senha: hashedPassword,
        senhaTemporariaExpira: new Date(Date.now() + 15 * 60 * 1000)
      }
    });

    await sendDoctorCredentialsEmail(medico.user.email!, medico.user.name!, tempPassword);

    return NextResponse.json({ message: "Senha reenviada com sucesso!" });
  } catch (error) {
    return NextResponse.json({ message: "Erro ao reenviar senha" }, { status: 500 });
  }
}
