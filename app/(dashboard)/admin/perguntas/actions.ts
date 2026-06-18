"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { TipoPergunta } from "@prisma/client";

export async function createPergunta(data: {
  texto: string;
  tipo: string;
  categoria?: string | null;
  opcoes: { texto: string; valor: number }[];
}) {
  const session = await auth();
  if (!session?.user?.id || session.user.tipo !== "admin") {
    throw new Error("Não autorizado");
  }

  await prisma.pergunta.create({
    data: {
      texto: data.texto,
      tipo: data.tipo as TipoPergunta,
      categoria: data.categoria === "nenhuma" ? null : data.categoria,
      opcoes: {
        create: data.opcoes,
      },
    },
  });

  revalidatePath("/admin/perguntas");
  return { success: true };
}

export async function updatePergunta(
  id: string,
  data: {
    texto: string;
    tipo: string;
    categoria?: string | null;
    opcoes: { id?: string; texto: string; valor: number }[];
  }
) {
  const session = await auth();
  if (!session?.user?.id || session.user.tipo !== "admin") {
    throw new Error("Não autorizado");
  }

  const currentOpcoes = await prisma.opcaoResposta.findMany({ where: { perguntaId: id } });
  const incomingIds = data.opcoes.map(o => o.id).filter(Boolean) as string[];
  const idsToDelete = currentOpcoes.map(o => o.id).filter(id => !incomingIds.includes(id));

  await prisma.pergunta.update({
    where: { id },
    data: {
      texto: data.texto,
      tipo: data.tipo as TipoPergunta,
      categoria: data.categoria === "nenhuma" ? null : data.categoria,
      opcoes: {
        deleteMany: { id: { in: idsToDelete } },
        upsert: data.opcoes.map((opcao) => ({
          where: { id: opcao.id || "new" },
          create: { texto: opcao.texto, valor: opcao.valor },
          update: { texto: opcao.texto, valor: opcao.valor },
        })),
      },
    },
  });

  revalidatePath("/admin/perguntas");
  return { success: true };
}

export async function deletePergunta(id: string) {
  const session = await auth();
  if (!session?.user?.id || session.user.tipo !== "admin") {
    throw new Error("Não autorizado");
  }

  await prisma.pergunta.delete({
    where: { id },
  });

  revalidatePath("/admin/perguntas");
  return { success: true };
}
