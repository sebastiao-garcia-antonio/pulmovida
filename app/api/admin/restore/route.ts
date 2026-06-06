import { NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import { auth } from "@/auth";
import fs from "fs/promises";
import path from "path";
import os from "os";

const execAsync = promisify(exec);

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user || session.user.tipo !== "admin") {
    return new NextResponse("Não Autorizado", { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    
    if (!file) {
      return new NextResponse("Nenhum arquivo enviado", { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Salvar em ficheiro temporário para o comando MySQL ler
    const tempFilePath = path.join(os.tmpdir(), `restore_${Date.now()}.sql`);
    await fs.writeFile(tempFilePath, buffer);

    try {
      // Tenta usar o comando nativo se estiver no PATH
      const command = `mysql -u root saudeinteligente < "${tempFilePath}"`;
      await execAsync(command);
    } catch (error) {
      // Falha fallback para diretório XAMPP
      try {
        const xamppCommand = `"C:\\xampp\\mysql\\bin\\mysql.exe" -u root saudeinteligente < "${tempFilePath}"`;
        await execAsync(xamppCommand);
      } catch (xamppError) {
        await fs.unlink(tempFilePath).catch(() => {});
        throw new Error("Utilitário mysql não encontrado ou ficheiro SQL com sintaxe inválida.");
      }
    }

    // Limpar o ficheiro temporário após o sucesso
    await fs.unlink(tempFilePath).catch(() => {});
    return NextResponse.json({ success: true, message: "Restauro concluído com sucesso!" });

  } catch (error: any) {
    console.error("Erro no restauro:", error);
    return new NextResponse("Erro ao restaurar backup: " + (error.message || ""), { status: 500 });
  }
}
