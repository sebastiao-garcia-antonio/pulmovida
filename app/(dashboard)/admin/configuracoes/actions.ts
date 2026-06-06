"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

import fs from "fs/promises";
import path from "path";

export async function updateProfile(nome: string) {
  const session = await auth();
  if (!session?.user?.email) throw new Error("Não autorizado");

  await prisma.user.update({
    where: { email: session.user.email },
    data: { name: nome },
  });
  
  revalidatePath("/admin/configuracoes");
  return { success: true };
}

export async function updateAvatar(formData: FormData) {
  const session = await auth();
  if (!session?.user?.email) throw new Error("Não autorizado");

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
    where: { email: session.user.email },
    data: { image: imageUrl },
  });

  revalidatePath("/admin/configuracoes");
  return { success: true, imageUrl };
}

export async function changePassword(atual: string, nova: string) {
  const session = await auth();
  if (!session?.user?.email) throw new Error("Não autorizado");

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user || !user.senha) throw new Error("Usuário inválido");

  const match = await bcrypt.compare(atual, user.senha);
  if (!match) throw new Error("Senha atual incorreta");

  const hash = await bcrypt.hash(nova, 10);
  await prisma.user.update({
    where: { id: user.id },
    data: { senha: hash },
  });
  
  return { success: true };
}
