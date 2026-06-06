import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import PerguntasClient from "./PerguntasClient";

export const dynamic = "force-dynamic";

export default async function AdminPerguntasPage() {
  const session = await auth();

  if (!session?.user?.id || session.user.tipo !== "admin") {
    redirect("/login");
  }

  const perguntasDb = await prisma.pergunta.findMany({
    include: {
      opcoes: true,
    },
    orderBy: {
      texto: "asc"
    }
  });

  return <PerguntasClient initialPerguntas={perguntasDb} />;
}
