"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { TipoPergunta } from "@prisma/client";

export async function createPergunta(data: {
  texto: string;
  tipo: string;
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
    opcoes: { id?: string; texto: string; valor: number }[];
  }
) {
  const session = await auth();
  if (!session?.user?.id || session.user.tipo !== "admin") {
    throw new Error("Não autorizado");
  }

  // Primeiro apagamos todas as opções antigas (para simplificar a atualização, caso tenham sido removidas)
  // Mas como Prisma tem update com upsert/delete, vamos usar um modo mais simples: apagar todas as opções existentes e recriar.
  // Como `OpcaoResposta` pode estar ligada a `RespostasPaciente`, apagá-las e recriá-las pode quebrar o histórico (onDelete: SetNull).
  // Então vamos tentar atualizar, criar novas e deletar as ausentes.

  const currentOpcoes = await prisma.opcaoResposta.findMany({ where: { perguntaId: id } });
  const incomingIds = data.opcoes.map(o => o.id).filter(Boolean) as string[];
  const idsToDelete = currentOpcoes.map(o => o.id).filter(id => !incomingIds.includes(id));

  await prisma.pergunta.update({
    where: { id },
    data: {
      texto: data.texto,
      tipo: data.tipo as TipoPergunta,
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
