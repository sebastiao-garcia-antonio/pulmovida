import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import AgendaClient from "./AgendaClient";

export const dynamic = "force-dynamic";

export default async function AgendaPage() {
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

  const agendasDb = await prisma.agenda.findMany({
    where: { medicoId: medico.id },
    orderBy: [{ data: "desc" }, { horario: "asc" }],
    include: {
      agendamentos: true,
    },
  });

  const initialAgendas = agendasDb.map((a) => {
    let status = "disponivel";
    // Como a relação é 1 Agenda para N Agendamentos (no Prisma), vamos ver o mais recente
    // Idealmente devia ser 1 para 1, mas caso haja, pegamos no primeiro que não seja cancelado
    const agendamentoValido = a.agendamentos.find(ag => (ag.status as string) !== "cancelado") || a.agendamentos[0];
    
    if (agendamentoValido) {
      status = agendamentoValido.status; // "pendente", "confirmado", "realizado"
      if ((status as string) === "cancelado") status = "disponivel"; // Se foi cancelado, volta a estar disponível
    }

    return {
      id: a.id,
      data: a.data.toISOString().split("T")[0],
      horario: a.horario,
      disponivel: status === "disponivel",
      status,
    };
  });

  return <AgendaClient initialAgendas={initialAgendas} />;
}
