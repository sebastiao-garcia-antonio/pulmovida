import Link from "next/link";
import AuthShell from "@/components/AuthShell";
import RegisterForm from "@/components/forms/RegisterForm";

export default function RegisterPage() {
  return (
    <AuthShell
      title="Criar Conta"
      subtitle="Cadastre-se para ter acesso à inteligência artificial do Pulmo Vida."
      footer={
        <>
          Já possui conta?{" "}
          <Link href="/login" className="font-bold text-[#3B82F6] hover:text-[#2563EB] transition-colors">
            Fazer Login
          </Link>
        </>
      }
    >
      <RegisterForm />
    </AuthShell>
  );
}
