import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import ConsultasClient from "./ConsultasClient";

export const dynamic = "force-dynamic";

export default async function ConsultasPage() {
  const session = await auth();
  
  if (!session?.user?.id || session.user.tipo !== "medico") {
    redirect("/login");
  }

  const medico = await prisma.medico.findUnique({
    where: { userId: session.user.id },
  });

  if (!medico) {
    return (
      <div className="p-10 max-w-7xl mx-auto">
        <div className="bg-red-50 text-red-600 p-6 rounded-xl border border-red-100 font-medium">
          ERRO: A sua conta não está corretamente configurada como Médico na base de dados.
        </div>
      </div>
    );
  }

  const agendamentos = await prisma.agendamento.findMany({
    where: { 
      medicoId: medico.id
    },
    include: {
      paciente: { include: { user: true } },
      agenda: true,
    },
    orderBy: [
      { agenda: { data: "desc" } },
      { agenda: { horario: "asc" } },
    ],
  });

  const consultasReaisDb = await prisma.consulta.findMany({
    where: { medicoId: medico.id }
  });

  const initialConsultas = agendamentos.map((ag) => {
    let diagnostico = null;
    let prescricao = null;

    if (ag.status === "realizado") {
      // Tentar encontrar a consulta associada a este paciente na mesma data
      const agData = ag.agenda.data.toISOString().split("T")[0];
      const consultaCorrespondente = consultasReaisDb.find(c => {
        const cData = c.dataConsulta.toISOString().split("T")[0];
        return c.pacienteId === ag.pacienteId && cData === agData;
      });

      if (consultaCorrespondente) {
        diagnostico = consultaCorrespondente.diagnosticoFinal;
        prescricao = consultaCorrespondente.observacoes;
      }
    }

    return {
      id: ag.id,
      paciente: ag.paciente.user.name || "Sem Nome",
      data: ag.agenda.data.toLocaleDateString("pt-BR", { day: '2-digit', month: '2-digit', year: 'numeric' }),
      hora: ag.agenda.horario,
      status: ag.status,
      diagnostico,
      prescricao
    };
  });

  return <ConsultasClient initialConsultas={initialConsultas} />;
}
