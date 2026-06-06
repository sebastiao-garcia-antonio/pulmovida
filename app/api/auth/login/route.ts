import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { email, senha } = await req.json();

    if (!email || !senha) {
      return NextResponse.json({ message: "Email e senha sao obrigatorios" }, { status: 400 });
    }

    const tipo = getUserType(String(email));

    return NextResponse.json({
      token: "mock-session-token",
      user: {
        id: 1,
        nome: getUserName(tipo),
        email,
        tipo,
      },
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { message: "Erro", error: error instanceof Error ? error.message : "Erro desconhecido" },
      { status: 500 }
    );
  }
}

function getUserType(email: string) {
  if (email.toLowerCase().includes("admin")) return "admin";
  if (email.toLowerCase().includes("medico") || email.toLowerCase().includes("doctor")) return "medico";
  return "paciente";
}

function getUserName(tipo: string) {
  if (tipo === "admin") return "Administrador";
  if (tipo === "medico") return "Medico Demo";
  return "Paciente Demo";
}
