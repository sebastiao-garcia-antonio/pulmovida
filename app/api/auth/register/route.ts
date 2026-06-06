import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";
import { sendActivationEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const { nome, email, senha } = await req.json();

    if (!nome || !email || !senha) {
      return NextResponse.json({ message: "Preencha todos os campos." }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json({ message: "Email já cadastrado." }, { status: 400 });
    }

    const userCount = await prisma.user.count();
    const tipo = userCount === 0 ? "admin" : "paciente";

    const hashedPassword = await bcrypt.hash(senha, 10);

    const user = await prisma.user.create({
      data: {
        name: nome,
        email,
        senha: hashedPassword,
        tipo,
        paciente: tipo === "paciente" ? {
          create: {}
        } : undefined
      }
    });

    const secret = new TextEncoder().encode(process.env.JWT_SECRET || "pulmo-vida-secret-key-1234");
    const token = await new SignJWT({ email: user.email })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("15m")
      .sign(secret);

    await sendActivationEmail(user.email!, user.name!, token);

    return NextResponse.json({ message: "Conta criada! Verifique seu e-mail para ativar.", tipo }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: "Erro no servidor", error: error.message }, { status: 500 });
  }
}
