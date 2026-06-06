import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import bcrypt from "bcryptjs";
import { sendDoctorCredentialsEmail } from "@/lib/email";

export async function GET() {
  try {
    const session = await auth();
    if (session?.user?.tipo !== "admin") return NextResponse.json({ message: "Não autorizado" }, { status: 403 });

    const medicos = await prisma.medico.findMany({
      include: {
        user: true,
        departamento: true,
      },
      orderBy: {
        user: { name: 'asc' }
      }
    });
    
    // Map data to match frontend expectations
    const mapped = medicos.map(m => ({
      id: m.id,
      userId: m.userId,
      nome: m.user.name,
      email: m.user.email,
      especialidade: m.especialidade,
      departamentoId: m.departamentoId,
      departamentoNome: m.departamento?.nome,
      senhaTemporaria: m.user.senhaTemporaria
    }));

    return NextResponse.json(mapped);
  } catch (error) {
    return NextResponse.json({ message: "Erro ao buscar médicos" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (session?.user?.tipo !== "admin") return NextResponse.json({ message: "Não autorizado" }, { status: 403 });

    const { nome, email, especialidade, departamentoId } = await req.json();
    if (!nome || !email || !especialidade || !departamentoId) {
      return NextResponse.json({ message: "Preencha todos os campos obrigatórios." }, { status: 400 });
    }

    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) return NextResponse.json({ message: "E-mail já está em uso no sistema." }, { status: 400 });

    // Generate random 8-char temp password
    const tempPassword = Math.random().toString(36).slice(-6).toUpperCase() + Math.floor(Math.random() * 100) + "!";
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    const user = await prisma.user.create({
      data: {
        name: nome,
        email,
        senha: hashedPassword,
        senhaTemporaria: true,
        senhaTemporariaExpira: new Date(Date.now() + 15 * 60 * 1000), // 15 minutos
        tipo: "medico",
        emailVerified: new Date(),
        medico: {
          create: {
            especialidade,
            departamentoId,
          }
        }
      },
      include: {
        medico: {
          include: { departamento: true }
        }
      }
    });

    // Send email to the doctor
    try {
      await sendDoctorCredentialsEmail(email, nome, tempPassword);
    } catch (emailError) {
      console.error("Failed to send email", emailError);
      // We don't fail the request, but we might want to alert the admin.
    }

    const createdMedico = {
      id: user.medico?.id,
      userId: user.id,
      nome: user.name,
      email: user.email,
      especialidade: user.medico?.especialidade,
      departamentoId: user.medico?.departamentoId,
      departamentoNome: user.medico?.departamento?.nome,
      senhaTemporaria: user.senhaTemporaria
    };

    return NextResponse.json(createdMedico, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "Erro ao criar médico" }, { status: 500 });
  }
}
