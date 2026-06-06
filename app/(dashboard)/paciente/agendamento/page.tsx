import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import AgendamentoClient from "./AgendamentoClient";

export const dynamic = "force-dynamic";

export default async function AgendamentoPage() {
  const session = await auth();

  if (!session?.user?.id || session.user.tipo !== "paciente") {
    redirect("/login");
  }

  // Obter todos os médicos disponíveis
  const medicosDb = await prisma.medico.findMany({
    include: {
      user: true,
      departamento: true,
      // Buscar apenas agendas a partir de amanhã que não tenham agendamentos válidos
      agendas: {
        where: {
          data: {
            gte: new Date(new Date().setHours(0,0,0,0) + 24 * 60 * 60 * 1000) // Amanhã
          },
          agendamentos: {
            none: {}
          }
        },
        orderBy: [
          { data: "asc" },
          { horario: "asc" }
        ]
      }
    }
  });

  const medicos = medicosDb.map(m => ({
    id: m.id,
    nome: m.user.name || "Médico",
    especialidade: m.departamento?.nome || "Especialidade Geral",
    image: m.user.image,
    agendasDisponiveis: m.agendas.map(a => ({
      id: a.id,
      data: a.data.toISOString().split("T")[0],
      hora: a.horario
    }))
  }));

  // Extrair especialidades únicas para o filtro
  const especialidades = [...new Set(medicos.map((m) => m.especialidade))].sort();

  return <AgendamentoClient medicos={medicos} especialidades={especialidades} />;
}
