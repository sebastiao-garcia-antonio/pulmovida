import { prisma } from "@/lib/prisma";
import RelatoriosClient from "./RelatoriosClient";

export const dynamic = "force-dynamic";

export default async function RelatoriosPage() {
  const agendamentosDb = await prisma.agendamento.findMany({
    include: {
      paciente: { include: { user: true } },
      medico: { include: { user: true, departamento: true } },
      agenda: true,
    },
    orderBy: { agenda: { data: "desc" } },
  });

  const departamentosDb = await prisma.departamento.findMany({
    include: { medicos: { include: { agendamentos: true } } },
  });

  const medicosDb = await prisma.medico.findMany({
    include: {
      user: true,
      departamento: true,
      agendamentos: {
        include: { agenda: true },
      },
    },
  });

  const agendamentos = agendamentosDb.map((a) => {
    return {
      id: a.id,
      paciente: a.paciente.user.name || "Desconhecido",
      medico: a.medico.user.name || "Desconhecido",
      departamento: a.medico.departamento?.nome || "Sem Especialidade",
      data: a.agenda.data.toISOString().split("T")[0],
      status: a.status,
    };
  });

  const departamentos = departamentosDb.map((d) => {
    const consultasRealizadas = d.medicos.reduce(
      (acc, m) =>
        acc +
        m.agendamentos.filter((ag) => ag.status === "realizado").length,
      0
    );
    const totalAgendamentos = d.medicos.reduce(
      (acc, m) => acc + m.agendamentos.length,
      0
    );
    return {
      nome: d.nome,
      consultas: consultasRealizadas,
      medicos: d.medicos.length,
      ocupacao:
        totalAgendamentos > 0
          ? Math.round((consultasRealizadas / totalAgendamentos) * 100)
          : 0,
    };
  });

  const medicos = medicosDb.map((m) => {
    const consultasRealizadas = m.agendamentos.filter(
      (a) => a.status === "realizado"
    ).length;
    return {
      nome: m.user.name || "Desconhecido",
      especialidade: m.especialidade || m.departamento?.nome || "Geral",
      consultas: consultasRealizadas,
      avaliacao: Number((Math.random() * (5 - 4) + 4).toFixed(1)),
    };
  });

  return (
    <RelatoriosClient
      data={{
        agendamentos,
        departamentos,
        medicos,
      }}
    />
  );
}
