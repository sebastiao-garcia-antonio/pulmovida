import { NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import { auth } from "@/auth";

const execAsync = promisify(exec);

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.tipo !== "admin") {
    return new NextResponse("Não Autorizado", { status: 401 });
  }

  try {
    // Tenta usar mysqldump (se estiver no PATH)
    const command = 'mysqldump -u root saudeinteligente';
    const { stdout } = await execAsync(command, { maxBuffer: 1024 * 1024 * 50 }); // 50MB max buffer

    const date = new Date().toISOString().split('T')[0];
    
    return new NextResponse(stdout, {
      headers: {
        "Content-Disposition": `attachment; filename="backup_pulmovida_${date}.sql"`,
        "Content-Type": "application/sql",
      },
    });
  } catch (error: any) {
    console.error("Erro ao gerar backup MySQL:", error);
    
    // Se o mysqldump falhar (não está no PATH do Windows), tenta procurar na pasta do XAMPP
    try {
      const xamppCommand = 'C:\\xampp\\mysql\\bin\\mysqldump.exe -u root saudeinteligente';
      const { stdout } = await execAsync(xamppCommand, { maxBuffer: 1024 * 1024 * 50 });
      
      const date = new Date().toISOString().split('T')[0];
      
      return new NextResponse(stdout, {
        headers: {
          "Content-Disposition": `attachment; filename="backup_pulmovida_${date}.sql"`,
          "Content-Type": "application/sql",
        },
      });
    } catch (xamppError: any) {
      console.error("Erro no XAMPP mysqldump:", xamppError);
      return new NextResponse(
        "Erro crítico ao gerar o backup. O utilitário 'mysqldump' não foi encontrado no sistema ou a base de dados não permitiu o acesso.\n\nDetalhe do erro: " + (error.message || ""),
        { status: 500 }
      );
    }
  }
}
