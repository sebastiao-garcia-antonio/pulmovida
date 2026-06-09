-- CreateEnum
CREATE TYPE "TipoUsuario" AS ENUM ('paciente', 'medico', 'admin');

-- CreateEnum
CREATE TYPE "TipoPergunta" AS ENUM ('booleano', 'escala', 'multipla');

-- CreateEnum
CREATE TYPE "StatusAgendamento" AS ENUM ('pendente', 'confirmado', 'realizado');

-- CreateTable
CREATE TABLE "usuarios" (
    "id" TEXT NOT NULL,
    "nome" TEXT,
    "email" TEXT,
    "email_verificado" TIMESTAMP(3),
    "imagem" TEXT,
    "senha" TEXT,
    "senha_temporaria" BOOLEAN NOT NULL DEFAULT false,
    "senha_temporaria_expira" TIMESTAMP(3),
    "tipo" "TipoUsuario" NOT NULL DEFAULT 'paciente',
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pacientes" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "data_nascimento" DATE,
    "genero" TEXT,
    "telefone" TEXT,
    "notificar_email" BOOLEAN NOT NULL DEFAULT true,
    "notificar_sms" BOOLEAN NOT NULL DEFAULT false,
    "notificar_whatsapp" BOOLEAN NOT NULL DEFAULT true,
    "lembrete_consulta" BOOLEAN NOT NULL DEFAULT true,
    "lembrete_antes_horas" INTEGER NOT NULL DEFAULT 24,
    "compartilhar_dados" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "pacientes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "departamentos" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "icone" TEXT NOT NULL DEFAULT 'Stethoscope',

    CONSTRAINT "departamentos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "medicos" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "especialidade" TEXT,
    "departamento_id" TEXT,

    CONSTRAINT "medicos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "perguntas" (
    "id" TEXT NOT NULL,
    "texto" TEXT NOT NULL,
    "tipo" "TipoPergunta" NOT NULL,
    "categoria" TEXT,
    "peso" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "perguntas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "opcoes_resposta" (
    "id" TEXT NOT NULL,
    "pergunta_id" TEXT NOT NULL,
    "texto" TEXT NOT NULL,
    "valor" INTEGER NOT NULL,

    CONSTRAINT "opcoes_resposta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "diagnosticos" (
    "id" TEXT NOT NULL,
    "paciente_id" TEXT NOT NULL,
    "resultado_ia" TEXT,
    "probabilidade" DOUBLE PRECISION,
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "diagnosticos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "respostas_paciente" (
    "id" TEXT NOT NULL,
    "paciente_id" TEXT NOT NULL,
    "pergunta_id" TEXT NOT NULL,
    "opcao_id" TEXT,
    "valor" INTEGER NOT NULL,
    "diagnostico_id" TEXT,

    CONSTRAINT "respostas_paciente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agendas" (
    "id" TEXT NOT NULL,
    "medico_id" TEXT NOT NULL,
    "data" DATE NOT NULL,
    "horario" TEXT NOT NULL,

    CONSTRAINT "agendas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agendamentos" (
    "id" TEXT NOT NULL,
    "paciente_id" TEXT NOT NULL,
    "medico_id" TEXT NOT NULL,
    "agenda_id" TEXT NOT NULL,
    "status" "StatusAgendamento" NOT NULL DEFAULT 'pendente',

    CONSTRAINT "agendamentos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consultas" (
    "id" TEXT NOT NULL,
    "paciente_id" TEXT NOT NULL,
    "medico_id" TEXT NOT NULL,
    "observacoes" TEXT,
    "diagnostico_final" TEXT,
    "data_consulta" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "consultas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recomendacoes" (
    "id" TEXT NOT NULL,
    "diagnostico_id" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,

    CONSTRAINT "recomendacoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feedback_ia" (
    "id" TEXT NOT NULL,
    "diagnostico_id" TEXT NOT NULL,
    "diagnostico_real" TEXT,
    "correto" BOOLEAN,

    CONSTRAINT "feedback_ia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contas" (
    "id" TEXT NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "tipo_conta" TEXT NOT NULL,
    "provedor" TEXT NOT NULL,
    "id_conta_provedor" TEXT NOT NULL,
    "token_atualizacao" TEXT,
    "token_acesso" TEXT,
    "expira_em" INTEGER,
    "tipo_token" TEXT,
    "escopo" TEXT,
    "id_token" TEXT,
    "estado_sessao" TEXT,

    CONSTRAINT "contas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessoes" (
    "id" TEXT NOT NULL,
    "token_sessao" TEXT NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "expira_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tokens_verificacao" (
    "identificador" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expira_em" TIMESTAMP(3) NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "pacientes_user_id_key" ON "pacientes"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "medicos_user_id_key" ON "medicos"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "contas_provedor_id_conta_provedor_key" ON "contas"("provedor", "id_conta_provedor");

-- CreateIndex
CREATE UNIQUE INDEX "sessoes_token_sessao_key" ON "sessoes"("token_sessao");

-- CreateIndex
CREATE UNIQUE INDEX "tokens_verificacao_token_key" ON "tokens_verificacao"("token");

-- CreateIndex
CREATE UNIQUE INDEX "tokens_verificacao_identificador_token_key" ON "tokens_verificacao"("identificador", "token");

-- AddForeignKey
ALTER TABLE "pacientes" ADD CONSTRAINT "pacientes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medicos" ADD CONSTRAINT "medicos_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medicos" ADD CONSTRAINT "medicos_departamento_id_fkey" FOREIGN KEY ("departamento_id") REFERENCES "departamentos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "opcoes_resposta" ADD CONSTRAINT "opcoes_resposta_pergunta_id_fkey" FOREIGN KEY ("pergunta_id") REFERENCES "perguntas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diagnosticos" ADD CONSTRAINT "diagnosticos_paciente_id_fkey" FOREIGN KEY ("paciente_id") REFERENCES "pacientes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "respostas_paciente" ADD CONSTRAINT "respostas_paciente_paciente_id_fkey" FOREIGN KEY ("paciente_id") REFERENCES "pacientes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "respostas_paciente" ADD CONSTRAINT "respostas_paciente_pergunta_id_fkey" FOREIGN KEY ("pergunta_id") REFERENCES "perguntas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "respostas_paciente" ADD CONSTRAINT "respostas_paciente_opcao_id_fkey" FOREIGN KEY ("opcao_id") REFERENCES "opcoes_resposta"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "respostas_paciente" ADD CONSTRAINT "respostas_paciente_diagnostico_id_fkey" FOREIGN KEY ("diagnostico_id") REFERENCES "diagnosticos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agendas" ADD CONSTRAINT "agendas_medico_id_fkey" FOREIGN KEY ("medico_id") REFERENCES "medicos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agendamentos" ADD CONSTRAINT "agendamentos_paciente_id_fkey" FOREIGN KEY ("paciente_id") REFERENCES "pacientes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agendamentos" ADD CONSTRAINT "agendamentos_medico_id_fkey" FOREIGN KEY ("medico_id") REFERENCES "medicos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agendamentos" ADD CONSTRAINT "agendamentos_agenda_id_fkey" FOREIGN KEY ("agenda_id") REFERENCES "agendas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consultas" ADD CONSTRAINT "consultas_paciente_id_fkey" FOREIGN KEY ("paciente_id") REFERENCES "pacientes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consultas" ADD CONSTRAINT "consultas_medico_id_fkey" FOREIGN KEY ("medico_id") REFERENCES "medicos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recomendacoes" ADD CONSTRAINT "recomendacoes_diagnostico_id_fkey" FOREIGN KEY ("diagnostico_id") REFERENCES "diagnosticos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedback_ia" ADD CONSTRAINT "feedback_ia_diagnostico_id_fkey" FOREIGN KEY ("diagnostico_id") REFERENCES "diagnosticos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contas" ADD CONSTRAINT "contas_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessoes" ADD CONSTRAINT "sessoes_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

