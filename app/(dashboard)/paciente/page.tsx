import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import PacienteDashboardClient from "./PacienteDashboardClient";

export const dynamic = "force-dynamic";

export default async function PacienteDashboardPage() {
  const session = await auth();

  if (!session?.user?.id || session.user.tipo !== "paciente") {
    redirect("/login");
  }

  // 1. Fetch paciente info
  const paciente = await prisma.paciente.findUnique({
    where: { userId: session.user.id },
  });

  if (!paciente) {
    // A conta não existe mais na DB, mas o cookie ainda existe.
    // Vamos forçar o logout para limpar o cookie e redirecionar para o login
    const { signOut } = await import("@/auth");
    await signOut({ redirectTo: "/login" });
    return null;
  }

  // 2. Fetch Próximas Consultas (pendentes ou confirmadas a partir de hoje)
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const proximasAgendamentosDb = await prisma.agendamento.findMany({
    where: {
      pacienteId: paciente.id,
      status: { in: ["pendente", "confirmado"] },
      agenda: {
        data: { gte: hoje }
      }
    },
    include: {
      medico: {
        include: {
          user: true,
          departamento: true
        }
      },
      agenda: true
    },
    orderBy: [
      { agenda: { data: "asc" } },
      { agenda: { horario: "asc" } }
    ],
    take: 5 // Mostrar apenas as próximas 5
  });

  const proximas = proximasAgendamentosDb.map(ag => ({
    id: ag.id,
    data: ag.agenda.data.toLocaleDateString("pt-BR", { day: '2-digit', month: '2-digit', year: 'numeric' }),
    hora: ag.agenda.horario,
    medico: ag.medico.user.name || "Médico",
    especialidade: ag.medico.departamento?.nome || "Clínica Geral",
    status: ag.status
  }));

  // 3. Fetch Total de Consultas (todas)
  const consultasTotal = await prisma.agendamento.count({
    where: { pacienteId: paciente.id }
  });

  // 4. Fetch Quiz/Triagens Realizadas (Diagnostico)
  const quizRealizados = await prisma.diagnostico.count({
    where: { pacienteId: paciente.id }
  });

  // 5. Histórico por Mês do ano atual
  const agendamentosAnoDb = await prisma.agendamento.findMany({
    where: {
      pacienteId: paciente.id,
      agenda: {
        data: {
          gte: new Date(new Date().getFullYear(), 0, 1) // 1 Jan do ano atual
        }
      }
    },
    include: { agenda: true }
  });

  const mesesNomes = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  const historicoMap: Record<number, number> = {};

  // Inicializar com zero até o mês atual
  const mesAtual = new Date().getMonth();
  for (let i = 0; i <= mesAtual; i++) {
    historicoMap[i] = 0;
  }

  agendamentosAnoDb.forEach(ag => {
    const m = ag.agenda.data.getMonth();
    if (historicoMap[m] !== undefined) {
      historicoMap[m]++;
    } else {
      historicoMap[m] = 1;
    }
  });

  const historicoConsultas = Object.keys(historicoMap).sort((a,b) => Number(a) - Number(b)).map(k => ({
    mes: mesesNomes[Number(k)],
    count: historicoMap[Number(k)]
  }));

  const stats = {
    nomePaciente: session.user.name?.split(" ")[0] || "Paciente",
    proximasConsultas: proximasAgendamentosDb.length,
    consultasTotal,
    quizRealizados,
    proximas,
    historicoConsultas
  };

  return <PacienteDashboardClient stats={stats} />;
}
