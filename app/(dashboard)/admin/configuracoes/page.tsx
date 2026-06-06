import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import AdminConfigClient from "./AdminConfigClient";

export const dynamic = "force-dynamic";

export default async function AdminConfiguracoesPage() {
  const session = await auth();

  if (!session?.user?.email) {
    return <div>ERRO: Sessão sem email. {JSON.stringify(session)}</div>;
  }

  const userDb = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, name: true, email: true, tipo: true, image: true },
  });

  if (!userDb) {
    return <div>ERRO: Usuário não encontrado no banco de dados. Email buscado: {session.user.email}</div>;
  }

  const adminUser = {
    nome: userDb.name || "Administrador",
    email: userDb.email || "Sem e-mail",
    tipo: userDb.tipo || "admin",
    image: userDb.image || null,
  };

  return <AdminConfigClient user={adminUser} />;
}
