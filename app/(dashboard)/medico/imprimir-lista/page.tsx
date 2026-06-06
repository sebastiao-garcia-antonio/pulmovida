import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import ImprimirListaClient from "./ImprimirListaClient";

export const dynamic = "force-dynamic";

export default async function ImprimirListaPage() {
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

  const doctorName = session.user.name || "Médico";

  // Buscar todos os agendamentos do médico que não sejam apenas "slots vazios" da agenda
  // (Ou seja, onde existe um paciente real alocado)
  const agendamentosDb = await prisma.agendamento.findMany({
    where: { 
      medicoId: medico.id,
      // Não filtramos status porque a enfermeira pode querer ver cancelados ou pendentes
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

  // Mapear os dados para o formato esperado pelo cliente
  const agendamentos = agendamentosDb.map((ag) => {
    return {
      id: ag.id,
      paciente: ag.paciente.user.name || "Paciente Anónimo",
      data: ag.agenda.data.toISOString().split("T")[0], // Formato YYYY-MM-DD para o input=date
      horario: ag.agenda.horario,
      status: ag.status, // pendente, confirmado, cancelado, realizado
    };
  });

  return (
    <ImprimirListaClient
      agendamentos={agendamentos}
      doctorName={doctorName}
    />
  );
}
