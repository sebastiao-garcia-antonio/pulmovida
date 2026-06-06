"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import fs from "fs/promises";
import path from "path";

export async function updateProfile(nome: string) {
  const session = await auth();
  if (!session?.user?.id || session.user.tipo !== "medico") {
    throw new Error("Não autorizado");
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { name: nome },
  });
  
  revalidatePath("/medico/configuracoes");
  return { success: true };
}

export async function updateAvatar(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id || session.user.tipo !== "medico") {
    throw new Error("Não autorizado");
  }

  const file = formData.get("file") as File;
  if (!file) throw new Error("Nenhuma imagem enviada");

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(uploadsDir, { recursive: true });

  const ext = path.extname(file.name) || '.jpg';
  const filename = `avatar_${Date.now()}${ext}`;
  const filepath = path.join(uploadsDir, filename);

  await fs.writeFile(filepath, buffer);

  const imageUrl = `/uploads/${filename}`;

  await prisma.user.update({
    where: { id: session.user.id },
    data: { image: imageUrl },
  });

  revalidatePath("/medico/configuracoes");
  return { success: true, imageUrl };
}
