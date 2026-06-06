"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function registrarConsulta(
  agendamentoId: string,
  diagnosticoFinal: string,
  observacoes: string
) {
  const session = await auth();
  if (!session?.user?.id || session.user.tipo !== "medico") {
    throw new Error("Não autorizado");
  }

  const medico = await prisma.medico.findUnique({
    where: { userId: session.user.id },
  });
  if (!medico) throw new Error("Médico não encontrado");

  const agendamento = await prisma.agendamento.findUnique({
    where: { id: agendamentoId },
  });

  if (!agendamento || agendamento.medicoId !== medico.id) {
    throw new Error("Agendamento não encontrado ou não autorizado");
  }

  if (agendamento.status === "realizado") {
    throw new Error("Consulta já realizada");
  }

  // 1. Atualizar status do agendamento
  await prisma.agendamento.update({
    where: { id: agendamentoId },
    data: { status: "realizado" },
  });

  // 2. Criar registo na tabela Consulta
  await prisma.consulta.create({
    data: {
      pacienteId: agendamento.pacienteId,
      medicoId: medico.id,
      diagnosticoFinal,
      observacoes,
    },
  });

  revalidatePath("/medico/consultas");
  return { success: true };
}
