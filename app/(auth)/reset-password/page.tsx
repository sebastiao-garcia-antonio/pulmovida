"use client";

import Link from "next/link";
import { useState } from "react";
import AuthShell from "@/components/AuthShell";
import ResetPasswordForm from "@/components/forms/ResetPasswordForm";

export default function ResetPasswordPage() {
  const [step, setStep] = useState(1);

  return (
    <AuthShell
      title="Redefinir Senha"
      subtitle="Informe seu email para receber um codigo de verificacao."
      footer={
        <Link href="/login" className="font-semibold text-[#3B82F6] hover:text-[#2563EB]">
          Voltar ao login
        </Link>
      }
    >
      <ResetPasswordForm step={step} setStep={setStep} />
    </AuthShell>
  );
}
