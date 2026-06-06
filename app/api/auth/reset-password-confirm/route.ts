import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { email, code, password } = await req.json();

    if (!email || !code || !password) {
      return NextResponse.json({ message: "Dados incompletos" }, { status: 400 });
    }

    return NextResponse.json({ message: "Senha redefinida" });
  } catch (error: unknown) {
    return NextResponse.json(
      { message: "Erro", error: error instanceof Error ? error.message : "Erro desconhecido" },
      { status: 500 }
    );
  }
}
