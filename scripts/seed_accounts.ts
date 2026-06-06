import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

async function main() {
  // Senha padrão para todos os usuários criados aqui
  const senhaHash = await bcrypt.hash('123456', 10);

  // 1. Criar Paciente
  const pacienteUser = await prisma.usuario.upsert({
    where: { email: 'paciente@teste.com' },
    update: {},
    create: {
      nome: 'Paciente Teste',
      email: 'paciente@teste.com',
      senha: senhaHash,
      tipo: 'paciente',
      paciente: {
        create: {
          dataNascimento: new Date('1990-05-15T00:00:00.000Z'),
          genero: 'Masculino',
          telefone: '+244923456789'
        }
      }
    },
  });

  // 2. Criar Médico
  const medicoUser = await prisma.usuario.upsert({
    where: { email: 'medico@teste.com' },
    update: {},
    create: {
      nome: 'Dr. Médico Teste',
      email: 'medico@teste.com',
      senha: senhaHash,
      tipo: 'medico',
      medico: {
        create: {
          especialidade: 'Clínica Geral'
        }
      }
    },
  });

  // 3. Criar Admin
  const adminUser = await prisma.usuario.upsert({
    where: { email: 'admin@teste.com' },
    update: {},
    create: {
      nome: 'Administrador Teste',
      email: 'admin@teste.com',
      senha: senhaHash,
      tipo: 'admin',
    },
  });

  console.log('✅ Contas criadas com sucesso!');
  console.log('----------------------------------------------------');
  console.log('Acesso Paciente:');
  console.log('Email: paciente@teste.com');
  console.log('Senha: 123456');
  console.log('----------------------------------------------------');
  console.log('Acesso Médico:');
  console.log('Email: medico@teste.com');
  console.log('Senha: 123456');
  console.log('----------------------------------------------------');
  console.log('Acesso Administrador:');
  console.log('Email: admin@teste.com');
  console.log('Senha: 123456');
  console.log('----------------------------------------------------');
}

main()
  .catch((e) => {
    console.error('Erro ao criar contas:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
