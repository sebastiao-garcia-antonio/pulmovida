import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import RelatoriosClient from "./RelatoriosClient";

export const dynamic = "force-dynamic";

export default async function MedicoRelatoriosPage() {
  const session = await auth();
  if (!session?.user?.id || session.user.tipo !== "medico") {
    redirect("/login");
  }

  const medico = await prisma.medico.findUnique({
    where: { userId: session.user.id },
    include: { departamento: true },
  });

  if (!medico) {
    return (
      <div className="p-10 max-w-7xl mx-auto">
        <div className="bg-red-50 text-red-600 p-6 rounded-xl border border-red-100 font-medium">
          ERRO: A sua conta não está corretamente configurada como Médico.
        </div>
      </div>
    );
  }

  // 1. Fetch Agendamentos
  const agendamentosDb = await prisma.agendamento.findMany({
    where: { 
      medicoId: medico.id
    },
    include: {
      paciente: { include: { user: true } },
      agenda: true,
    },
    orderBy: { agenda: { data: "desc" } }
  });

  // Fetch Consultas para saber o diagnóstico
  const consultasReaisDb = await prisma.consulta.findMany({
    where: { medicoId: medico.id }
  });

  // Formatar para a tabela de consultas
  const consultas = agendamentosDb.map((ag) => {
    let diagnostico = "—";
    
    // Status mapping for reports
    let statusLabel = "Agendada"; // pendente ou confirmado
    if (ag.status === "realizado") statusLabel = "Realizada";
    if ((ag.status as string) === "cancelado") statusLabel = "Cancelada";

    if (ag.status === "realizado") {
      const agData = ag.agenda.data.toISOString().split("T")[0];
      const consulta = consultasReaisDb.find(c => {
        const cData = c.dataConsulta.toISOString().split("T")[0];
        return c.pacienteId === ag.pacienteId && cData === agData;
      });
      if (consulta && consulta.diagnosticoFinal) {
        diagnostico = consulta.diagnosticoFinal;
      }
    }

    return {
      id: ag.id,
      paciente: ag.paciente.user.name || "Paciente Anónimo",
      data: ag.agenda.data.toISOString().split("T")[0],
      diagnostico,
      status: statusLabel,
      departamento: medico.departamento?.nome || "Geral",
    };
  });

  // 2. Gerar Resumo Mensal
  // Agrupar por Mês/Ano
  const mesesNomes = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
  
  const resumoMap: Record<string, { mesStr: string, consultas: number, realizadas: number, canceladas: number }> = {};

  agendamentosDb.forEach(ag => {
    const data = ag.agenda.data;
    const mesIndex = data.getMonth();
    const ano = data.getFullYear();
    const key = `${ano}-${mesIndex}`; // e.g. "2026-4"

    if (!resumoMap[key]) {
      resumoMap[key] = {
        mesStr: `${mesesNomes[mesIndex]} ${ano}`,
        consultas: 0,
        realizadas: 0,
        canceladas: 0
      };
    }

    resumoMap[key].consultas += 1;
    if (ag.status === "realizado") resumoMap[key].realizadas += 1;
    if ((ag.status as string) === "cancelado") resumoMap[key].canceladas += 1;
  });

  const resumoMensal = Object.values(resumoMap);

  return (
    <RelatoriosClient 
      consultas={consultas} 
      resumoMensal={resumoMensal} 
      departamento={medico.departamento?.nome || "Geral"}
    />
  );
}
