"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

async function getMedicoId() {
  const session = await auth();
  if (!session?.user?.id || session.user.tipo !== "medico") {
    throw new Error("Não autorizado");
  }
  const medico = await prisma.medico.findUnique({ where: { userId: session.user.id } });
  if (!medico) throw new Error("Médico não encontrado");
  return medico.id;
}

export async function createAgenda(dataStr: string, horario: string) {
  const medicoId = await getMedicoId();
  
  // Converter string YYYY-MM-DD para Date
  const dataParts = dataStr.split('-');
  const data = new Date(parseInt(dataParts[0]), parseInt(dataParts[1]) - 1, parseInt(dataParts[2]));
  data.setHours(0, 0, 0, 0);

  // Validação: Não permitir criar no passado ou no próprio dia
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  if (data <= hoje) {
    throw new Error("Não é permitido criar horários para o dia de hoje ou para dias passados. Por favor, selecione uma data a partir de amanhã.");
  }

  // Check se já existe
  const exists = await prisma.agenda.findFirst({
    where: { medicoId, data, horario }
  });

  if (exists) {
    throw new Error("Já existe um horário para esta data.");
  }

  await prisma.agenda.create({
    data: {
      medicoId,
      data,
      horario
    }
  });

  revalidatePath("/medico/agenda");
  return { success: true };
}

export async function updateAgenda(id: string, dataStr: string, horario: string) {
  const medicoId = await getMedicoId();

  const dataParts = dataStr.split('-');
  const data = new Date(parseInt(dataParts[0]), parseInt(dataParts[1]) - 1, parseInt(dataParts[2]));
  data.setHours(0, 0, 0, 0);

  // Validação: Não permitir criar no passado ou no próprio dia
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  if (data <= hoje) {
    throw new Error("Não é permitido agendar horários para o dia de hoje ou para dias passados. Por favor, selecione uma data a partir de amanhã.");
  }

  // Garantir que a agenda pertence ao médico
  const agenda = await prisma.agenda.findUnique({ where: { id } });
  if (!agenda || agenda.medicoId !== medicoId) throw new Error("Não autorizado");

  // Check se já tem agendamento
  const agendamento = await prisma.agendamento.findFirst({ where: { agendaId: id } });
  if (agendamento) {
    throw new Error("Não pode editar um horário que já tem uma marcação.");
  }

  await prisma.agenda.update({
    where: { id },
    data: { data, horario }
  });

  revalidatePath("/medico/agenda");
  return { success: true };
}

export async function deleteAgenda(id: string) {
  const medicoId = await getMedicoId();

  const agenda = await prisma.agenda.findUnique({ where: { id } });
  if (!agenda || agenda.medicoId !== medicoId) throw new Error("Não autorizado");

  const agendamento = await prisma.agendamento.findFirst({ where: { agendaId: id } });
  if (agendamento) {
    throw new Error("Não pode eliminar um horário que já tem uma marcação.");
  }

  await prisma.agenda.delete({
    where: { id }
  });

  revalidatePath("/medico/agenda");
  return { success: true };
}
