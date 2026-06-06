import { prisma } from "@/lib/prisma";
import AdminDashboardClient from "./AdminDashboardClient";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const session = await auth();
  const userName = session?.user?.name || "Administrador";

  // Data ranges
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

  // Queries
  const totalPacientes = await prisma.paciente.count();
  const totalDepartamentos = await prisma.departamento.count();
  const totalMedicos = await prisma.medico.count();

  const agendamentosHoje = await prisma.agendamento.count({
    where: {
      agenda: {
        data: {
          gte: today,
          lt: tomorrow,
        },
      },
    },
  });

  const consultasPendentes = await prisma.agendamento.count({
    where: { status: "pendente" },
  });

  const allAgendamentos = await prisma.agendamento.findMany();
  const totaisAgendamentos = allAgendamentos.length;
  const realizadas = allAgendamentos.filter((a) => a.status === "realizado").length;
  const taxaOcupacao = totaisAgendamentos > 0 ? Math.round((realizadas / totaisAgendamentos) * 100) : 0;

  // Chart Data (Last 7 days)
  const recentAgendamentos = await prisma.agendamento.findMany({
    where: {
      agenda: {
        data: {
          gte: sevenDaysAgo,
          lte: tomorrow,
        },
      },
    },
    include: { agenda: true },
  });

  const diasSemanaMap = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  const chartDataMap: Record<string, number> = {};
  
  // Initialize last 7 days
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dayStr = diasSemanaMap[d.getDay()];
    chartDataMap[dayStr] = 0;
  }

  recentAgendamentos.forEach((a) => {
    if (a.agenda?.data) {
      const dayStr = diasSemanaMap[a.agenda.data.getDay()];
      if (chartDataMap[dayStr] !== undefined) {
        chartDataMap[dayStr]++;
      }
    }
  });

  const chartData = Object.keys(chartDataMap).map((key) => ({
    name: key,
    consultas: chartDataMap[key],
  }));

  // Especialidades
  const departamentosDb = await prisma.departamento.findMany({
    include: {
      medicos: {
        include: { agendamentos: true }
      }
    },
  });

  const COLORS = ["#3B82F6", "#2563EB", "#1D4ED8", "#60A5FA", "#93C5FD", "#10B981", "#F59E0B"];
  const especialidadesDistribuicao = departamentosDb
    .map((d, i) => ({
      nome: d.nome,
      count: d.medicos.length,
      cor: COLORS[i % COLORS.length],
    }))
    .filter(d => d.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const departamentosTop = departamentosDb
    .map((d) => {
      const agendamentosDoDept = d.medicos.reduce((acc, m) => acc + m.agendamentos.length, 0);
      return {
        nome: d.nome,
        consultas: agendamentosDoDept,
      };
    })
    .sort((a, b) => b.consultas - a.consultas)
    .slice(0, 5);

  // Últimas atividades (Last 5 agendamentos)
  const lastAgendamentos = await prisma.agendamento.findMany({
    take: 5,
    orderBy: { agenda: { data: "desc" } },
    include: {
      paciente: { include: { user: true } },
      medico: { include: { user: true, departamento: true } },
      agenda: true,
    },
  });

  const ultimasAtividades = lastAgendamentos.map((a) => {
    return {
      id: a.id,
      tipo: a.status, // We map status to color in Client
      texto: `Consulta ${a.status}: ${a.paciente.user.name} com Dr(a). ${a.medico.user.name}`,
      hora: a.agenda.data.toLocaleDateString("pt-BR") + " " + a.agenda.horario,
    };
  });

  return (
    <AdminDashboardClient
      data={{
        userName,
        totalPacientes,
        consultasHoje: agendamentosHoje,
        consultasPendentes,
        taxaOcupacao,
        totalDepartamentos,
        totalMedicos,
        chartData,
        especialidadesDistribuicao,
        departamentosTop,
        ultimasAtividades,
      }}
    />
  );
}
