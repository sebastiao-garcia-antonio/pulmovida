import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import MedicoDashboardClient from "./MedicoDashboardClient";

export const dynamic = "force-dynamic";

export default async function MedicoDashboardPage() {
  const session = await auth();
  
  if (!session?.user?.id) {
    redirect("/login");
  }

  // Verifica se o user tem de facto o tipo 'medico' e encontra o registo 'Medico' dele
  const medico = await prisma.medico.findUnique({
    where: { userId: session.user.id },
    include: { departamento: true },
  });

  if (!medico) {
    const { signOut } = await import("@/auth");
    await signOut({ redirectTo: "/login" });
    return null;
  }

  const userName = session.user.name || "Médico";

  // Lógica de Datas
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const startOfWeek = new Date(today);
  // Ajuste para considerar Segunda como início da semana
  startOfWeek.setDate(today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1));
  
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

  // Queries Prisma - Consultas Hoje
  const consultasHoje = await prisma.agendamento.count({
    where: {
      medicoId: medico.id,
      agenda: {
        data: {
          gte: today,
          lt: tomorrow,
        },
      },
    },
  });

  // Consultas na Semana
  const consultasSemana = await prisma.agendamento.count({
    where: {
      medicoId: medico.id,
      agenda: {
        data: {
          gte: startOfWeek,
          lte: endOfWeek,
        },
      },
    },
  });

  // Pacientes Únicos (ativos) que já marcaram ou têm consulta com este médico
  const agendamentosMedico = await prisma.agendamento.findMany({
    where: { medicoId: medico.id },
    select: { pacienteId: true },
  });
  const pacientesUnicos = new Set(agendamentosMedico.map(a => a.pacienteId));
  const pacientesAtivos = pacientesUnicos.size;

  const tempoMedio = 30; // Tempo padrão da consulta

  // Gráfico: Agendamentos nos últimos 7 dias
  const recentAgendamentos = await prisma.agendamento.findMany({
    where: {
      medicoId: medico.id,
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
  
  // Inicializar o mapa com os últimos 7 dias
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dayStr = diasSemanaMap[d.getDay()];
    chartDataMap[dayStr] = 0;
  }

  // Preencher os dados
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

  // Distribuição de Status (Todas as consultas do médico desta semana)
  const statusSemana = await prisma.agendamento.findMany({
    where: { 
      medicoId: medico.id,
      agenda: { data: { gte: startOfWeek, lte: endOfWeek } }
    },
    select: { status: true },
  });

  let pendentes = 0;
  let confirmadas = 0;
  let realizadas = 0;
  statusSemana.forEach(a => {
    if (a.status === "pendente") pendentes++;
    else if (a.status === "confirmado") confirmadas++;
    else if (a.status === "realizado") realizadas++;
  });

  const distribuicaoStatus = [
    { status: "Confirmadas", count: confirmadas, cor: "#3B82F6" },
    { status: "Realizadas", count: realizadas, cor: "#10B981" },
    { status: "Pendentes", count: pendentes, cor: "#F59E0B" },
  ];

  // Consultas Recentes / Próximas
  const upcomingAgendamentos = await prisma.agendamento.findMany({
    where: {
      medicoId: medico.id,
      agenda: {
        data: { gte: today },
      },
    },
    take: 5,
    orderBy: [
      { agenda: { data: "asc" } },
      { agenda: { horario: "asc" } }
    ],
    include: {
      paciente: { include: { user: true } },
      agenda: true,
    },
  });

  const consultasRecentes = upcomingAgendamentos.map(a => ({
    paciente: a.paciente.user.name || "Paciente Anónimo",
    data: a.agenda.data.toLocaleDateString("pt-BR", { day: '2-digit', month: '2-digit', year: 'numeric' }),
    hora: a.agenda.horario,
    status: a.status,
    especialidade: medico.departamento?.nome || medico.especialidade || "Clínica Geral",
  }));

  return (
    <MedicoDashboardClient
      data={{
        userName,
        consultasHoje,
        consultasSemana,
        pacientesAtivos,
        tempoMedio,
        consultasRecentes,
        chartData,
        distribuicaoStatus,
      }}
    />
  );
}
