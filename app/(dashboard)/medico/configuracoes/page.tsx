import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import MedicoConfigClient from "./MedicoConfigClient";

export const dynamic = "force-dynamic";

export default async function MedicoConfiguracoesPage() {
  const session = await auth();

  if (!session?.user?.id || session.user.tipo !== "medico") {
    redirect("/login");
  }

  // Obter detalhes completos do Utilizador e Médico associado
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      medico: {
        include: { departamento: true }
      }
    }
  });

  if (!user || !user.medico) {
    return (
      <div className="p-10 max-w-7xl mx-auto">
        <div className="bg-red-50 text-red-600 p-6 rounded-xl border border-red-100 font-medium">
          ERRO: A sua conta não está corretamente configurada na base de dados.
        </div>
      </div>
    );
  }

  const initialPerfil = {
    nome: user.name || "Médico Anónimo",
    email: user.email || "",
    tipo: "Médico Especialista",
    image: user.image,
    departamento: user.medico.departamento?.nome || "Clínica Geral",
  };

  return <MedicoConfigClient initialPerfil={initialPerfil} />;
}
