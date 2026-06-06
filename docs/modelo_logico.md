# Modelo Lógico (Entidade-Relacionamento)

Este documento contém o esquema lógico das entidades do banco de dados 100% traduzido para o Português, ideal para inclusão em monografias, TCCs e documentação técnica.

```prisma
model Usuario {
  id               String          @id
  nome             String?
  email            String?         @unique
  email_verificado DateTime?
  imagem           String?
  senha            String?
  tipo             TipoUsuario     @default(paciente)
  criado_em        DateTime        @default(now())

  contas           Conta[]
  sessoes          Sessao[]
  paciente         Paciente?
  medico           Medico?
}

model Conta {
  id                String  @id
  usuario_id        String  
  tipo_conta        String  
  provedor          String  
  id_conta_provedor String  
  token_atualizacao String? 
  token_acesso      String? 
  expira_em         Int?    
  tipo_token        String? 
  escopo            String? 
  id_token          String? 
  estado_sessao     String? 
 
  usuario           Usuario @relation(fields: [usuario_id], references: [id])
}
 
model Sessao {
  id           String   @id 
  token_sessao String   @unique 
  usuario_id   String   
  expira_em    DateTime 
  usuario      Usuario  @relation(fields: [usuario_id], references: [id])
}
 
model TokenVerificacao {
  identificador String   
  token         String   @unique 
  expira_em     DateTime 
}

model Paciente {
  id              String   @id
  usuario_id      String   @unique
  usuario         Usuario  @relation(fields: [usuario_id], references: [id])
  data_nascimento DateTime? 
  genero          String?
  telefone        String?

  diagnosticos    Diagnostico[]
  respostas       RespostasPaciente[]
  agendamentos    Agendamento[]
  consultas       Consulta[]
}

model Departamento {
  id    String @id 
  nome  String 

  medicos Medico[]
}

model Medico {
  id              String        @id 
  usuario_id      String        @unique 
  usuario         Usuario       @relation(fields: [usuario_id], references: [id])
  especialidade   String?       
  departamento_id String?       
  departamento    Departamento? @relation(fields: [departamento_id], references: [id])

  agendas         Agenda[]
  agendamentos    Agendamento[]
  consultas       Consulta[]
}

model Pergunta {
  id        String        @id 
  texto     String        
  tipo      TipoPergunta  
  categoria String?       
  peso      Int           @default(1) 

  opcoes    OpcaoResposta[]
  respostas RespostasPaciente[]
}

model OpcaoResposta {
  id          String  @id 
  pergunta_id String  
  pergunta    Pergunta @relation(fields: [pergunta_id], references: [id])
  texto       String  
  valor       Int     

  respostas   RespostasPaciente[]
}

model Diagnostico {
  id             String    @id 
  paciente_id    String    
  paciente       Paciente  @relation(fields: [paciente_id], references: [id])
  resultado_ia   String?   
  probabilidade  Float?    
  data           DateTime  @default(now()) 

  respostas      RespostasPaciente[]
  recomendacoes  Recomendacao[]
  feedbacks      FeedbackIa[]
}

model RespostasPaciente {
  id             String      @id 
  paciente_id    String      
  paciente       Paciente    @relation(fields: [paciente_id], references: [id])
  pergunta_id    String      
  pergunta       Pergunta    @relation(fields: [pergunta_id], references: [id])
  opcao_id       String?     
  opcao          OpcaoResposta? @relation(fields: [opcao_id], references: [id])
  valor          Int         
  diagnostico_id String?     
  diagnostico    Diagnostico? @relation(fields: [diagnostico_id], references: [id])
}

model Agenda {
  id        String   @id 
  medico_id String   
  medico    Medico   @relation(fields: [medico_id], references: [id])
  data      DateTime 
  horario   String   

  agendamentos Agendamento[]
}

model Agendamento {
  id          String            @id 
  paciente_id String            
  paciente    Paciente          @relation(fields: [paciente_id], references: [id])
  medico_id   String            
  medico      Medico            @relation(fields: [medico_id], references: [id])
  agenda_id   String            
  agenda      Agenda            @relation(fields: [agenda_id], references: [id])
  status      StatusAgendamento @default(pendente) 
}

model Consulta {
  id                String   @id 
  paciente_id       String   
  paciente          Paciente @relation(fields: [paciente_id], references: [id])
  medico_id         String   
  medico            Medico   @relation(fields: [medico_id], references: [id])
  observacoes       String?  
  diagnostico_final String?  
  data_consulta     DateTime @default(now()) 
}

model Recomendacao {
  id             String      @id 
  diagnostico_id String      
  diagnostico    Diagnostico @relation(fields: [diagnostico_id], references: [id])
  descricao      String      
}

model FeedbackIa {
  id               String      @id 
  diagnostico_id   String      
  diagnostico      Diagnostico @relation(fields: [diagnostico_id], references: [id])
  diagnostico_real String?     
  correto          Boolean?    
}
```
