import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import HistoricoClient from "./HistoricoClient";

export const dynamic = "force-dynamic";

export default async function HistoricoPage() {
  const session = await auth();

  if (!session?.user?.id || session.user.tipo !== "paciente") {
    redirect("/login");
  }

  const paciente = await prisma.paciente.findUnique({
    where: { userId: session.user.id }
  });

  if (!paciente) {
    redirect("/paciente");
  }

  // Obter Diagnósticos (Triagens IA)
  const diagnosticosDb = await prisma.diagnostico.findMany({
    where: { pacienteId: paciente.id },
    orderBy: { data: "desc" }
  });

  const diagnosticos = diagnosticosDb.map(d => ({
    id: d.id,
    data: d.data.toLocaleDateString("pt-BR", { day: '2-digit', month: '2-digit', year: 'numeric' }),
    resultado: d.resultadoIa || "Sem Resultado",
    probabilidade: d.probabilidade || 0
  }));

  // Obter Agendamentos (Consultas marcadas)
  const agendamentosDb = await prisma.agendamento.findMany({
    where: { pacienteId: paciente.id },
    include: {
      agenda: true,
      medico: {
        include: {
          user: true,
          departamento: true
        }
      }
    },
    orderBy: [
      { agenda: { data: "desc" } },
      { agenda: { horario: "desc" } }
    ]
  });

  const agendamentos = agendamentosDb.map(a => ({
    id: a.id,
    data: a.agenda.data.toLocaleDateString("pt-BR", { day: '2-digit', month: '2-digit', year: 'numeric' }),
    hora: a.agenda.horario,
    medico: a.medico.user.name || "Médico",
    especialidade: a.medico.departamento?.nome || "Geral",
    status: a.status
  }));

  return <HistoricoClient diagnosticos={diagnosticos} agendamentos={agendamentos} />;
}
