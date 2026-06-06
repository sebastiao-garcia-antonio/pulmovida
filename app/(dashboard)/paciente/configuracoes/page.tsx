import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import PacienteConfigClient from "./PacienteConfigClient";

export const dynamic = "force-dynamic";

export default async function PacienteConfiguracoesPage() {
  const session = await auth();

  if (!session?.user?.id || session.user.tipo !== "paciente") {
    redirect("/login");
  }

  // Obter detalhes completos do Utilizador e Paciente associado
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      paciente: true
    }
  });

  if (!user || !user.paciente) {
    return (
      <div className="p-10 max-w-7xl mx-auto">
        <div className="bg-red-50 text-red-600 p-6 rounded-xl border border-red-100 font-medium">
          ERRO: A sua conta não está corretamente configurada na base de dados.
        </div>
      </div>
    );
  }

  const initialPerfil = {
    nome: user.name || "Paciente Anónimo",
    email: user.email || "",
    tipo: "Paciente",
    image: user.image,
    dataNascimento: user.paciente?.dataNascimento ? user.paciente.dataNascimento.toISOString().split("T")[0] : "",
    genero: user.paciente?.genero || ""
  };

  const initialPreferencias = {
    notificarEmail: user.paciente.notificarEmail ?? true,
    notificarSMS: user.paciente.notificarSMS ?? false,
    notificarWhatsApp: user.paciente.notificarWhatsApp ?? true,
    lembreteConsulta: user.paciente.lembreteConsulta ?? true,
    lembreteAntesHoras: user.paciente.lembreteAntesHoras ?? 24,
    compartilharDados: user.paciente.compartilharDados ?? true,
  };

  return <PacienteConfigClient initialPerfil={initialPerfil} initialPreferencias={initialPreferencias} />;
}
