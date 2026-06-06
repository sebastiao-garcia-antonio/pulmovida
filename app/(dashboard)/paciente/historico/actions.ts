"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function cancelarAgendamento(agendamentoId: string) {
  const session = await auth();
  if (!session?.user?.id || session.user.tipo !== "paciente") {
    throw new Error("Não autorizado");
  }

  const paciente = await prisma.paciente.findUnique({
    where: { userId: session.user.id }
  });

  if (!paciente) {
    throw new Error("Paciente não encontrado");
  }

  const agendamento = await prisma.agendamento.findUnique({
    where: { id: agendamentoId }
  });

  if (!agendamento || agendamento.pacienteId !== paciente.id) {
    throw new Error("Agendamento não encontrado ou não autorizado");
  }

  if (agendamento.status === "realizado") {
    throw new Error("Não é possível cancelar uma consulta que já foi realizada.");
  }

  // Para cancelar, vamos simplesmente eliminar o agendamento da base de dados.
  // Assim, a `Agenda` do médico volta a ficar livre para ser marcada por outra pessoa.
  await prisma.agendamento.delete({
    where: { id: agendamentoId }
  });

  revalidatePath("/paciente/historico");
  revalidatePath("/paciente/agendamento");
  revalidatePath("/paciente");
  
  return { success: true };
}
