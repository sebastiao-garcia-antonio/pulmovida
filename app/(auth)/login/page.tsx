import Link from "next/link";
import AuthShell from "@/components/AuthShell";
import LoginForm from "@/components/forms/LoginForm";

export default function LoginPage() {
  return (
    <AuthShell
      title="Entrar"
      subtitle="Acesse sua area de paciente, medico ou administrador."
      footer={
        <>
          Nao tem conta?{" "}
          <Link href="/register" className="font-semibold text-[#3B82F6] hover:text-[#2563EB]">
            Registrar
          </Link>
        </>
      }
    >
      <LoginForm />
    </AuthShell>
  );
}
