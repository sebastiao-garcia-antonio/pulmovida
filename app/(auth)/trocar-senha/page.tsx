import AuthShell from "@/components/AuthShell";
import TrocarSenhaForm from "@/components/forms/TrocarSenhaForm";

export default function TrocarSenhaPage() {
  return (
    <AuthShell
      title="Atualizar Senha"
      subtitle="Por questões de segurança, você precisa alterar sua senha temporária antes de acessar o sistema."
      footer={null}
    >
      <TrocarSenhaForm />
    </AuthShell>
  );
}
