import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { email, code } = await req.json();

    if (!email || !code) {
      return NextResponse.json({ message: "Dados incompletos" }, { status: 400 });
    }

    if (String(code) !== "123456") {
      return NextResponse.json({ message: "Codigo invalido" }, { status: 400 });
    }

    return NextResponse.json({ message: "Codigo verificado" });
  } catch (error: unknown) {
    return NextResponse.json(
      { message: "Erro", error: error instanceof Error ? error.message : "Erro desconhecido" },
      { status: 500 }
    );
  }
}
