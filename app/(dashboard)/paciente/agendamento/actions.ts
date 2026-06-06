"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function agendarConsulta(agendaId: string) {
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

  // Verificar se a agenda ainda está disponível
  // Está disponível se não tem nenhum agendamento (ou só tem agendamentos cancelados)
  const agenda = await prisma.agenda.findUnique({
    where: { id: agendaId },
    include: {
      agendamentos: true
    }
  });

  if (!agenda) {
    throw new Error("Horário não encontrado.");
  }

  if (agenda.agendamentos.length > 0) {
    throw new Error("Este horário já não está disponível. Por favor, escolha outro.");
  }

  // Criar o Agendamento
  await prisma.agendamento.create({
    data: {
      pacienteId: paciente.id,
      medicoId: agenda.medicoId,
      agendaId: agenda.id,
      status: "pendente" // O médico depois confirma ou recusa
    }
  });

  revalidatePath("/paciente/agendamento");
  revalidatePath("/paciente");
  return { success: true };
}
