# DOCUMENTACAO COMPLETA - 58 ENTIDADES DOUTORIZZE

## INSTRUCOES PARA IA DO BASE44

Este documento contem TODAS as 58 entidades do sistema Doutorizze, com campos detalhados, relacionamentos e conexoes.
Adicione as 17 entidades que estao faltando para ficar igual ao sistema externo.

---

# MAPA GERAL DE CONEXOES

```
USER (central)
  |
  +-- Professional (user_id) -----> Job, SubstituicaoUrgente, Rating, ProfessionalAd
  |     |
  |     +-- VinculoProfissionalClinica --> Company/Clinic
  |     +-- JobMatch, JobApplication --> Job
  |     +-- CandidaturaSubstituicao --> SubstituicaoUrgente
  |     +-- BloqueioAgenda
  |     +-- SuspensaoProfissional
  |
  +-- CompanyOwner (user_id) -----> Company
  |     |
  |     +-- CompanyUnit --> Company
  |     +-- Job --> Company
  |     +-- SubstituicaoUrgente --> Company
  |
  +-- Supplier (user_id) ---------> MarketplaceItem, Service
  |
  +-- Hospital (user_id) ---------> Job, SubstituicaoUrgente
  |
  +-- Clinic (user_id) -----------> Job, SubstituicaoUrgente, VinculoProfissionalClinica
  |
  +-- EducationInstitution -------> Course
  |     |
  |     +-- CourseEnrollment --> Professional
  |
  +-- Laboratorio (user_id) ------> Service, MarketplaceItem
```

---

# SECAO 1: AUTENTICACAO (2 entidades)

## 1.1 WhatsAppOTP
**Descricao:** Armazena codigos OTP enviados via WhatsApp para verificacao de telefone
**Conecta com:** User (user_id)

| Campo | Tipo | Obrigatorio | Descricao |
|-------|------|-------------|-----------|
| id | string | auto | ID unico gerado automaticamente |
| phone | string | sim | Numero de telefone (+55...) |
| code | string | sim | Codigo OTP de 6 digitos |
| user_id | relation | nao | ID do usuario (se ja existir) |
| verified | boolean | sim | Se foi verificado (default: false) |
| expires_at | datetime | sim | Data/hora de expiracao (5 minutos) |
| created_at | datetime | auto | Data de criacao |
| attempts | number | sim | Tentativas de verificacao (max 3) |

**Uso:** Quando usuario faz login/cadastro, envia OTP pro WhatsApp. Usuario digita codigo, sistema verifica.

---

## 1.2 EmailVerification
**Descricao:** Armazena tokens de verificacao de email
**Conecta com:** User (user_id)

| Campo | Tipo | Obrigatorio | Descricao |
|-------|------|-------------|-----------|
| id | string | auto | ID unico |
| email | string | sim | Email a ser verificado |
| token | string | sim | Token unico (UUID) |
| user_id | relation | nao | ID do usuario |
| verified | boolean | sim | Se foi verificado (default: false) |
| expires_at | datetime | sim | Expiracao (24 horas) |
| created_at | datetime | auto | Data de criacao |

**Uso:** Apos cadastro, envia email com link contendo token. Usuario clica, sistema verifica.

---

# SECAO 2: USUARIOS (12 entidades)

## 2.1 User (Built-in)
**Descricao:** Entidade central de usuarios do sistema
**Conecta com:** TODAS as outras entidades

| Campo | Tipo | Obrigatorio | Descricao |
|-------|------|-------------|-----------|
| id | string | auto | ID unico |
| email | string | sim | Email do usuario (unico) |
| password | string | sim | Senha (hash) |
| full_name | string | sim | Nome completo |
| phone | string | nao | Telefone |
| avatar | file | nao | Foto de perfil |
| user_type | select | sim | PROFISSIONAL, CLINICA, FORNECEDOR, HOSPITAL, INSTITUICAO, LABORATORIO |
| status | select | sim | ATIVO, INATIVO, PENDENTE, BLOQUEADO |
| email_verified | boolean | sim | Email verificado (default: false) |
| phone_verified | boolean | sim | Telefone verificado (default: false) |
| created_at | datetime | auto | Data de cadastro |
| updated_at | datetime | auto | Ultima atualizacao |
| last_login | datetime | nao | Ultimo acesso |

---

## 2.2 Professional
**Descricao:** Perfil de profissional de saude (dentista, tecnico, etc)
**Conecta com:** User (user_id), Job, SubstituicaoUrgente, Rating, VinculoProfissionalClinica

| Campo | Tipo | Obrigatorio | Descricao |
|-------|------|-------------|-----------|
| id | string | auto | ID unico |
| user_id | relation | sim | Conecta com User |
| full_name | string | sim | Nome completo |
| cpf | string | sim | CPF (unico) |
| cro | string | sim | Numero do CRO |
| cro_state | select | sim | Estado do CRO (SP, RJ, MG, etc) |
| specialty | multi-select | sim | Especialidades (CLINICO_GERAL, ORTODONTIA, IMPLANTE, etc) |
| phone | string | sim | Telefone/WhatsApp |
| email | string | sim | Email |
| avatar | file | nao | Foto de perfil |
| bio | text | nao | Biografia/Descricao |
| experience_years | number | nao | Anos de experiencia |
| hourly_rate | number | nao | Valor hora (R$) |
| available_shifts | multi-select | nao | Turnos disponiveis (MANHA, TARDE, NOITE) |
| available_days | multi-select | nao | Dias disponiveis (SEG, TER, QUA, etc) |
| city | string | sim | Cidade |
| state | select | sim | Estado |
| neighborhood | string | nao | Bairro |
| latitude | number | nao | Latitude para geolocalizacao |
| longitude | number | nao | Longitude para geolocalizacao |
| rating_average | number | nao | Media de avaliacoes (0-5) |
| rating_count | number | nao | Quantidade de avaliacoes |
| verified | boolean | sim | Perfil verificado (default: false) |
| status | select | sim | ATIVO, INATIVO, PENDENTE |
| created_at | datetime | auto | Data de cadastro |
| updated_at | datetime | auto | Ultima atualizacao |

---

## 2.3 Company
**Descricao:** Empresa/Clinica odontologica
**Conecta com:** CompanyOwner, CompanyUnit, Job, SubstituicaoUrgente, VinculoProfissionalClinica

| Campo | Tipo | Obrigatorio | Descricao |
|-------|------|-------------|-----------|
| id | string | auto | ID unico |
| owner_id | relation | sim | Conecta com CompanyOwner |
| name | string | sim | Nome fantasia |
| legal_name | string | sim | Razao social |
| cnpj | string | sim | CNPJ (unico) |
| phone | string | sim | Telefone |
| email | string | sim | Email |
| logo | file | nao | Logo da empresa |
| description | text | nao | Descricao |
| address | string | sim | Endereco completo |
| city | string | sim | Cidade |
| state | select | sim | Estado |
| zip_code | string | sim | CEP |
| neighborhood | string | nao | Bairro |
| latitude | number | nao | Latitude |
| longitude | number | nao | Longitude |
| specialties | multi-select | nao | Especialidades oferecidas |
| working_hours | json | nao | Horarios de funcionamento |
| rating_average | number | nao | Media de avaliacoes |
| rating_count | number | nao | Quantidade de avaliacoes |
| verified | boolean | sim | Empresa verificada |
| status | select | sim | ATIVA, INATIVA, PENDENTE |
| created_at | datetime | auto | Data de cadastro |
| updated_at | datetime | auto | Ultima atualizacao |

---

## 2.4 CompanyOwner
**Descricao:** Dono/Responsavel pela empresa
**Conecta com:** User (user_id), Company

| Campo | Tipo | Obrigatorio | Descricao |
|-------|------|-------------|-----------|
| id | string | auto | ID unico |
| user_id | relation | sim | Conecta com User |
| full_name | string | sim | Nome completo |
| cpf | string | sim | CPF |
| phone | string | sim | Telefone |
| email | string | sim | Email |
| role | select | sim | PROPRIETARIO, GERENTE, ADMINISTRADOR |
| created_at | datetime | auto | Data de cadastro |

---

## 2.5 CompanyUnit
**Descricao:** Unidade/Filial de uma empresa
**Conecta com:** Company (company_id)

| Campo | Tipo | Obrigatorio | Descricao |
|-------|------|-------------|-----------|
| id | string | auto | ID unico |
| company_id | relation | sim | Conecta com Company |
| name | string | sim | Nome da unidade |
| phone | string | sim | Telefone |
| email | string | nao | Email |
| address | string | sim | Endereco |
| city | string | sim | Cidade |
| state | select | sim | Estado |
| zip_code | string | sim | CEP |
| manager_name | string | nao | Nome do gerente |
| manager_phone | string | nao | Telefone do gerente |
| status | select | sim | ATIVA, INATIVA |
| created_at | datetime | auto | Data de cadastro |

---

## 2.6 Hospital
**Descricao:** Perfil de hospital
**Conecta com:** User (user_id), Job, SubstituicaoUrgente

| Campo | Tipo | Obrigatorio | Descricao |
|-------|------|-------------|-----------|
| id | string | auto | ID unico |
| user_id | relation | sim | Conecta com User |
| name | string | sim | Nome do hospital |
| cnpj | string | sim | CNPJ |
| phone | string | sim | Telefone |
| email | string | sim | Email |
| logo | file | nao | Logo |
| address | string | sim | Endereco |
| city | string | sim | Cidade |
| state | select | sim | Estado |
| zip_code | string | sim | CEP |
| departments | multi-select | nao | Departamentos (ODONTOLOGIA, BUCOMAXILO, etc) |
| contact_person | string | nao | Pessoa de contato |
| contact_phone | string | nao | Telefone contato |
| verified | boolean | sim | Hospital verificado |
| status | select | sim | ATIVO, INATIVO |
| created_at | datetime | auto | Data de cadastro |

---

## 2.7 Supplier
**Descricao:** Fornecedor de produtos/equipamentos odontologicos
**Conecta com:** User (user_id), MarketplaceItem, Service

| Campo | Tipo | Obrigatorio | Descricao |
|-------|------|-------------|-----------|
| id | string | auto | ID unico |
| user_id | relation | sim | Conecta com User |
| company_name | string | sim | Nome da empresa |
| cnpj | string | nao | CNPJ (opcional para PF) |
| cpf | string | nao | CPF (para pessoa fisica) |
| phone | string | sim | Telefone |
| email | string | sim | Email |
| logo | file | nao | Logo |
| description | text | nao | Descricao |
| address | string | sim | Endereco |
| city | string | sim | Cidade |
| state | select | sim | Estado |
| categories | multi-select | sim | Categorias (EQUIPAMENTOS, MATERIAIS, MOVEIS, etc) |
| website | string | nao | Site |
| instagram | string | nao | Instagram |
| delivery_regions | multi-select | nao | Regioes de entrega |
| rating_average | number | nao | Media de avaliacoes |
| verified | boolean | sim | Fornecedor verificado |
| status | select | sim | ATIVO, INATIVO |
| created_at | datetime | auto | Data de cadastro |

---

## 2.8 EducationInstitution
**Descricao:** Instituicao de ensino (faculdades, cursos)
**Conecta com:** User (user_id), Course

| Campo | Tipo | Obrigatorio | Descricao |
|-------|------|-------------|-----------|
| id | string | auto | ID unico |
| user_id | relation | sim | Conecta com User |
| name | string | sim | Nome da instituicao |
| cnpj | string | sim | CNPJ |
| phone | string | sim | Telefone |
| email | string | sim | Email |
| logo | file | nao | Logo |
| description | text | nao | Descricao |
| address | string | sim | Endereco |
| city | string | sim | Cidade |
| state | select | sim | Estado |
| website | string | nao | Site |
| course_types | multi-select | nao | Tipos de curso (GRADUACAO, POS, ESPECIALIZACAO, CURSO_LIVRE) |
| verified | boolean | sim | Instituicao verificada |
| status | select | sim | ATIVA, INATIVA |
| created_at | datetime | auto | Data de cadastro |

---

## 2.9 Laboratorio
**Descricao:** Laboratorio de protese dentaria
**Conecta com:** User (user_id), Service, MarketplaceItem

| Campo | Tipo | Obrigatorio | Descricao |
|-------|------|-------------|-----------|
| id | string | auto | ID unico |
| user_id | relation | sim | Conecta com User |
| name | string | sim | Nome do laboratorio |
| cnpj | string | nao | CNPJ |
| phone | string | sim | Telefone |
| email | string | sim | Email |
| logo | file | nao | Logo |
| description | text | nao | Descricao |
| address | string | sim | Endereco |
| city | string | sim | Cidade |
| state | select | sim | Estado |
| services | multi-select | sim | Servicos (PROTESE_FIXA, PROTESE_MOVEL, IMPLANTE, ORTODONTIA, etc) |
| delivery_time | string | nao | Prazo medio de entrega |
| rating_average | number | nao | Media de avaliacoes |
| verified | boolean | sim | Laboratorio verificado |
| status | select | sim | ATIVO, INATIVO |
| created_at | datetime | auto | Data de cadastro |

---

## 2.10 ProfessionalAd
**Descricao:** Anuncio de profissional buscando oportunidades
**Conecta com:** Professional (professional_id)

| Campo | Tipo | Obrigatorio | Descricao |
|-------|------|-------------|-----------|
| id | string | auto | ID unico |
| professional_id | relation | sim | Conecta com Professional |
| title | string | sim | Titulo do anuncio |
| description | text | sim | Descricao detalhada |
| specialty | multi-select | sim | Especialidades |
| availability | multi-select | sim | Disponibilidade (INTEGRAL, MEIO_PERIODO, PLANTAO, FREELANCER) |
| desired_salary | number | nao | Pretensao salarial |
| city | string | sim | Cidade desejada |
| state | select | sim | Estado |
| willing_to_relocate | boolean | nao | Aceita mudanca |
| experience_years | number | nao | Anos de experiencia |
| highlighted | boolean | nao | Anuncio destacado (pago) |
| views | number | auto | Visualizacoes |
| status | select | sim | ATIVO, PAUSADO, EXPIRADO |
| expires_at | datetime | nao | Data de expiracao |
| created_at | datetime | auto | Data de criacao |

---

## 2.11 Clinic (NOVA - adicionar no Base44)
**Descricao:** Clinica odontologica (similar a Company, mas mais simples)
**Conecta com:** User (user_id), Job, SubstituicaoUrgente, VinculoProfissionalClinica

| Campo | Tipo | Obrigatorio | Descricao |
|-------|------|-------------|-----------|
| id | string | auto | ID unico |
| user_id | relation | sim | Conecta com User |
| name | string | sim | Nome da clinica |
| cnpj | string | nao | CNPJ (opcional) |
| phone | string | sim | Telefone |
| email | string | sim | Email |
| logo | file | nao | Logo |
| address | string | sim | Endereco |
| city | string | sim | Cidade |
| state | select | sim | Estado |
| zip_code | string | sim | CEP |
| specialties | multi-select | nao | Especialidades |
| owner_name | string | sim | Nome do proprietario |
| owner_cro | string | nao | CRO do proprietario |
| rating_average | number | nao | Media de avaliacoes |
| verified | boolean | sim | Clinica verificada |
| status | select | sim | ATIVA, INATIVA |
| created_at | datetime | auto | Data de cadastro |

**Diferenca de Company:** Clinic e mais simples, para clinicas pequenas. Company e para redes/franquias com multiplas unidades.

---

## 2.12 Institution (NOVA - adicionar no Base44)
**Descricao:** Instituicao generica (pode ser ensino, saude, associacao)
**Conecta com:** User (user_id), Course, Event

| Campo | Tipo | Obrigatorio | Descricao |
|-------|------|-------------|-----------|
| id | string | auto | ID unico |
| user_id | relation | sim | Conecta com User |
| name | string | sim | Nome da instituicao |
| type | select | sim | ENSINO, SAUDE, ASSOCIACAO, SINDICATO, OUTRO |
| cnpj | string | nao | CNPJ |
| phone | string | sim | Telefone |
| email | string | sim | Email |
| logo | file | nao | Logo |
| description | text | nao | Descricao |
| address | string | sim | Endereco |
| city | string | sim | Cidade |
| state | select | sim | Estado |
| website | string | nao | Site |
| verified | boolean | sim | Instituicao verificada |
| status | select | sim | ATIVA, INATIVA |
| created_at | datetime | auto | Data de cadastro |

**Diferenca de EducationInstitution:** Institution e mais generica, abrange associacoes, sindicatos. EducationInstitution e especifica para ensino.

---

## 2.13 Laboratory (NOVA - adicionar no Base44)
**Descricao:** Laboratorio (versao em ingles, para compatibilidade)
**Conecta com:** User (user_id), Service, MarketplaceItem

| Campo | Tipo | Obrigatorio | Descricao |
|-------|------|-------------|-----------|
| id | string | auto | ID unico |
| user_id | relation | sim | Conecta com User |
| name | string | sim | Nome do laboratorio |
| cnpj | string | nao | CNPJ |
| phone | string | sim | Telefone |
| email | string | sim | Email |
| logo | file | nao | Logo |
| description | text | nao | Descricao |
| address | string | sim | Endereco |
| city | string | sim | Cidade |
| state | select | sim | Estado |
| services | multi-select | sim | Servicos oferecidos |
| rating_average | number | nao | Media de avaliacoes |
| verified | boolean | sim | Verificado |
| status | select | sim | ATIVO, INATIVO |
| created_at | datetime | auto | Data de cadastro |

**Nota:** Igual a Laboratorio, existe para compatibilidade com codigo em ingles.

---

# SECAO 3: VAGAS E CANDIDATURAS (6 entidades)

## 3.1 Job
**Descricao:** Vaga de emprego/oportunidade
**Conecta com:** Company/Clinic/Hospital (employer), Professional (candidates), JobMatch, JobApplication, JobContract

| Campo | Tipo | Obrigatorio | Descricao |
|-------|------|-------------|-----------|
| id | string | auto | ID unico |
| employer_type | select | sim | COMPANY, CLINIC, HOSPITAL |
| employer_id | relation | sim | ID do empregador |
| title | string | sim | Titulo da vaga |
| description | text | sim | Descricao detalhada |
| specialty | multi-select | sim | Especialidades requeridas |
| job_type | select | sim | CLT, PJ, AUTONOMO, ESTAGIO |
| work_schedule | select | sim | INTEGRAL, MEIO_PERIODO, PLANTAO, FLEXIVEL |
| shift | multi-select | nao | Turnos (MANHA, TARDE, NOITE) |
| salary_min | number | nao | Salario minimo |
| salary_max | number | nao | Salario maximo |
| salary_type | select | nao | MENSAL, SEMANAL, DIARIA, HORA |
| benefits | multi-select | nao | Beneficios (VT, VR, PLANO_SAUDE, etc) |
| requirements | text | nao | Requisitos |
| city | string | sim | Cidade |
| state | select | sim | Estado |
| address | string | nao | Endereco |
| remote | boolean | nao | Aceita remoto |
| experience_required | number | nao | Anos de experiencia |
| vacancies | number | sim | Numero de vagas (default: 1) |
| applications_count | number | auto | Candidaturas recebidas |
| views | number | auto | Visualizacoes |
| highlighted | boolean | nao | Vaga destacada (paga) |
| urgent | boolean | nao | Vaga urgente |
| status | select | sim | ABERTA, PAUSADA, FECHADA, PREENCHIDA |
| expires_at | datetime | nao | Data de expiracao |
| created_at | datetime | auto | Data de criacao |
| updated_at | datetime | auto | Ultima atualizacao |

---

## 3.2 JobMatch
**Descricao:** Match entre vaga e profissional (sistema automatico)
**Conecta com:** Job (job_id), Professional (professional_id)

| Campo | Tipo | Obrigatorio | Descricao |
|-------|------|-------------|-----------|
| id | string | auto | ID unico |
| job_id | relation | sim | Conecta com Job |
| professional_id | relation | sim | Conecta com Professional |
| match_score | number | sim | Pontuacao do match (0-100) |
| match_reasons | json | nao | Motivos do match (especialidade, localizacao, etc) |
| professional_interested | boolean | nao | Profissional demonstrou interesse |
| employer_interested | boolean | nao | Empregador demonstrou interesse |
| status | select | sim | PENDENTE, ACEITO, RECUSADO, EXPIRADO |
| notified | boolean | sim | Se foi notificado |
| created_at | datetime | auto | Data do match |

**Fluxo:** Sistema analisa vagas e profissionais, cria matches automaticos. Ambos podem aceitar ou recusar.

---

## 3.3 JobContract
**Descricao:** Contrato firmado entre empregador e profissional
**Conecta com:** Job (job_id), Professional (professional_id), Company/Clinic/Hospital (employer)

| Campo | Tipo | Obrigatorio | Descricao |
|-------|------|-------------|-----------|
| id | string | auto | ID unico |
| job_id | relation | sim | Conecta com Job |
| professional_id | relation | sim | Conecta com Professional |
| employer_type | select | sim | COMPANY, CLINIC, HOSPITAL |
| employer_id | relation | sim | ID do empregador |
| contract_type | select | sim | CLT, PJ, AUTONOMO |
| start_date | date | sim | Data de inicio |
| end_date | date | nao | Data de termino (se temporario) |
| salary | number | sim | Salario acordado |
| salary_type | select | sim | MENSAL, SEMANAL, DIARIA, HORA |
| work_hours | string | nao | Horario de trabalho |
| benefits | multi-select | nao | Beneficios |
| terms | text | nao | Termos adicionais |
| professional_signed | boolean | sim | Profissional assinou |
| employer_signed | boolean | sim | Empregador assinou |
| professional_signed_at | datetime | nao | Data assinatura profissional |
| employer_signed_at | datetime | nao | Data assinatura empregador |
| status | select | sim | PENDENTE, ATIVO, ENCERRADO, CANCELADO |
| created_at | datetime | auto | Data de criacao |

---

## 3.4 JobApplication (NOVA - adicionar no Base44)
**Descricao:** Candidatura manual a uma vaga
**Conecta com:** Job (job_id), Professional (professional_id)

| Campo | Tipo | Obrigatorio | Descricao |
|-------|------|-------------|-----------|
| id | string | auto | ID unico |
| job_id | relation | sim | Conecta com Job |
| professional_id | relation | sim | Conecta com Professional |
| cover_letter | text | nao | Carta de apresentacao |
| resume_file | file | nao | Curriculo anexado |
| expected_salary | number | nao | Pretensao salarial |
| available_start | date | nao | Disponibilidade para inicio |
| status | select | sim | ENVIADA, VISUALIZADA, EM_ANALISE, APROVADA, RECUSADA |
| employer_notes | text | nao | Notas do empregador |
| rejection_reason | text | nao | Motivo da recusa |
| viewed_at | datetime | nao | Data que foi visualizada |
| created_at | datetime | auto | Data da candidatura |
| updated_at | datetime | auto | Ultima atualizacao |

**Diferenca de JobMatch:** JobApplication e manual (profissional se candidata). JobMatch e automatico (sistema sugere).

---

## 3.5 Substitution (NOVA - adicionar no Base44)
**Descricao:** Substituicao (versao em ingles)
**Conecta com:** Company/Clinic/Hospital (employer), Professional, SubstitutionApplication

| Campo | Tipo | Obrigatorio | Descricao |
|-------|------|-------------|-----------|
| id | string | auto | ID unico |
| employer_type | select | sim | COMPANY, CLINIC, HOSPITAL |
| employer_id | relation | sim | ID do empregador |
| title | string | sim | Titulo |
| description | text | sim | Descricao |
| specialty | multi-select | sim | Especialidades |
| date | date | sim | Data da substituicao |
| start_time | time | sim | Horario inicio |
| end_time | time | sim | Horario fim |
| payment | number | sim | Valor do pagamento |
| payment_type | select | sim | HORA, TURNO, DIA |
| city | string | sim | Cidade |
| state | select | sim | Estado |
| address | string | sim | Endereco |
| urgent | boolean | nao | E urgente |
| status | select | sim | ABERTA, PREENCHIDA, CANCELADA, CONCLUIDA |
| selected_professional_id | relation | nao | Profissional selecionado |
| created_at | datetime | auto | Data de criacao |

**Nota:** Igual a SubstituicaoUrgente, existe para compatibilidade com codigo em ingles.

---

## 3.6 SubstitutionApplication (NOVA - adicionar no Base44)
**Descricao:** Candidatura a substituicao (versao em ingles)
**Conecta com:** Substitution (substitution_id), Professional (professional_id)

| Campo | Tipo | Obrigatorio | Descricao |
|-------|------|-------------|-----------|
| id | string | auto | ID unico |
| substitution_id | relation | sim | Conecta com Substitution |
| professional_id | relation | sim | Conecta com Professional |
| message | text | nao | Mensagem do profissional |
| status | select | sim | PENDENTE, ACEITA, RECUSADA |
| created_at | datetime | auto | Data da candidatura |

**Nota:** Igual a CandidaturaSubstituicao, existe para compatibilidade com codigo em ingles.

---

# SECAO 4: SUBSTITUICOES URGENTES (5 entidades)

## 4.1 SubstituicaoUrgente
**Descricao:** Substituicao urgente de profissional
**Conecta com:** Company/Clinic/Hospital (employer), Professional, CandidaturaSubstituicao, ValidacaoComparecimento

| Campo | Tipo | Obrigatorio | Descricao |
|-------|------|-------------|-----------|
| id | string | auto | ID unico |
| employer_type | select | sim | COMPANY, CLINIC, HOSPITAL |
| employer_id | relation | sim | ID do empregador |
| title | string | sim | Titulo |
| description | text | sim | Descricao detalhada |
| specialty | multi-select | sim | Especialidades requeridas |
| date | date | sim | Data da substituicao |
| start_time | time | sim | Horario de inicio |
| end_time | time | sim | Horario de termino |
| payment | number | sim | Valor do pagamento |
| payment_type | select | sim | HORA, TURNO, DIA |
| city | string | sim | Cidade |
| state | select | sim | Estado |
| address | string | sim | Endereco completo |
| latitude | number | nao | Latitude |
| longitude | number | nao | Longitude |
| requirements | text | nao | Requisitos especificos |
| urgent | boolean | sim | E urgente (default: true) |
| applications_count | number | auto | Candidaturas recebidas |
| selected_professional_id | relation | nao | Profissional selecionado |
| status | select | sim | ABERTA, EM_ANALISE, PREENCHIDA, EM_ANDAMENTO, CONCLUIDA, CANCELADA |
| cancellation_reason | text | nao | Motivo do cancelamento |
| created_at | datetime | auto | Data de criacao |
| updated_at | datetime | auto | Ultima atualizacao |

---

## 4.2 CandidaturaSubstituicao
**Descricao:** Candidatura de profissional a uma substituicao
**Conecta com:** SubstituicaoUrgente (substituicao_id), Professional (professional_id)

| Campo | Tipo | Obrigatorio | Descricao |
|-------|------|-------------|-----------|
| id | string | auto | ID unico |
| substituicao_id | relation | sim | Conecta com SubstituicaoUrgente |
| professional_id | relation | sim | Conecta com Professional |
| message | text | nao | Mensagem do profissional |
| proposed_value | number | nao | Valor proposto (se negociavel) |
| status | select | sim | PENDENTE, ACEITA, RECUSADA, CANCELADA |
| employer_notes | text | nao | Notas do empregador |
| rejection_reason | text | nao | Motivo da recusa |
| created_at | datetime | auto | Data da candidatura |
| updated_at | datetime | auto | Ultima atualizacao |

---

## 4.3 ValidacaoComparecimento
**Descricao:** Validacao de que profissional compareceu a substituicao
**Conecta com:** SubstituicaoUrgente (substituicao_id), Professional (professional_id)

| Campo | Tipo | Obrigatorio | Descricao |
|-------|------|-------------|-----------|
| id | string | auto | ID unico |
| substituicao_id | relation | sim | Conecta com SubstituicaoUrgente |
| professional_id | relation | sim | Conecta com Professional |
| check_in_time | datetime | nao | Horario de entrada |
| check_out_time | datetime | nao | Horario de saida |
| check_in_location | json | nao | Localizacao do check-in (lat, lng) |
| check_out_location | json | nao | Localizacao do check-out |
| check_in_photo | file | nao | Foto do check-in |
| check_out_photo | file | nao | Foto do check-out |
| employer_confirmed | boolean | sim | Empregador confirmou |
| professional_confirmed | boolean | sim | Profissional confirmou |
| issues | text | nao | Problemas reportados |
| status | select | sim | PENDENTE, CONFIRMADO, DISPUTADO |
| created_at | datetime | auto | Data de criacao |

---

## 4.4 SuspensaoProfissional
**Descricao:** Suspensao de profissional por faltas ou problemas
**Conecta com:** Professional (professional_id), SubstituicaoUrgente (motivo)

| Campo | Tipo | Obrigatorio | Descricao |
|-------|------|-------------|-----------|
| id | string | auto | ID unico |
| professional_id | relation | sim | Conecta com Professional |
| reason | select | sim | FALTA_SEM_AVISO, ATRASO_RECORRENTE, COMPORTAMENTO, QUALIDADE, OUTRO |
| description | text | sim | Descricao detalhada |
| related_substituicao_id | relation | nao | Substituicao relacionada |
| reported_by_type | select | sim | COMPANY, CLINIC, HOSPITAL, SISTEMA |
| reported_by_id | relation | nao | Quem reportou |
| start_date | date | sim | Inicio da suspensao |
| end_date | date | nao | Fim da suspensao (null = permanente) |
| status | select | sim | ATIVA, ENCERRADA, REVOGADA |
| created_at | datetime | auto | Data de criacao |

---

## 4.5 BloqueioAgenda
**Descricao:** Bloqueio de agenda do profissional (ferias, indisponibilidade)
**Conecta com:** Professional (professional_id)

| Campo | Tipo | Obrigatorio | Descricao |
|-------|------|-------------|-----------|
| id | string | auto | ID unico |
| professional_id | relation | sim | Conecta com Professional |
| title | string | sim | Titulo (ex: "Ferias") |
| reason | select | sim | FERIAS, DOENCA, PESSOAL, OUTRO_COMPROMISSO, OUTRO |
| description | text | nao | Descricao |
| start_date | date | sim | Data inicio |
| end_date | date | sim | Data fim |
| all_day | boolean | sim | Dia inteiro |
| start_time | time | nao | Horario inicio (se nao all_day) |
| end_time | time | nao | Horario fim (se nao all_day) |
| recurring | boolean | nao | E recorrente |
| recurrence_pattern | select | nao | DIARIO, SEMANAL, MENSAL |
| status | select | sim | ATIVO, CANCELADO |
| created_at | datetime | auto | Data de criacao |

---

# SECAO 5: CHAT E MENSAGENS (4 entidades)

## 5.1 ChatThread
**Descricao:** Thread/Conversa entre dois usuarios
**Conecta com:** User (participant1, participant2), ChatMessage

| Campo | Tipo | Obrigatorio | Descricao |
|-------|------|-------------|-----------|
| id | string | auto | ID unico |
| participant1_id | relation | sim | Usuario 1 |
| participant2_id | relation | sim | Usuario 2 |
| participant1_type | select | sim | PROFESSIONAL, COMPANY, SUPPLIER, etc |
| participant2_type | select | sim | PROFESSIONAL, COMPANY, SUPPLIER, etc |
| related_type | select | nao | Tipo relacionado (JOB, SUBSTITUICAO, MARKETPLACE, etc) |
| related_id | relation | nao | ID do item relacionado |
| last_message | text | nao | Ultima mensagem (preview) |
| last_message_at | datetime | nao | Data da ultima mensagem |
| participant1_unread | number | sim | Mensagens nao lidas do participante 1 |
| participant2_unread | number | sim | Mensagens nao lidas do participante 2 |
| status | select | sim | ATIVO, ARQUIVADO, BLOQUEADO |
| created_at | datetime | auto | Data de criacao |

---

## 5.2 ChatMessage
**Descricao:** Mensagem individual em uma conversa
**Conecta com:** ChatThread (thread_id), User (sender_id)

| Campo | Tipo | Obrigatorio | Descricao |
|-------|------|-------------|-----------|
| id | string | auto | ID unico |
| thread_id | relation | sim | Conecta com ChatThread |
| sender_id | relation | sim | Quem enviou |
| content | text | sim | Conteudo da mensagem |
| message_type | select | sim | TEXT, IMAGE, FILE, AUDIO, LOCATION, SYSTEM |
| file_url | file | nao | Arquivo anexado |
| file_name | string | nao | Nome do arquivo |
| read | boolean | sim | Foi lida (default: false) |
| read_at | datetime | nao | Data da leitura |
| deleted | boolean | sim | Foi deletada |
| deleted_at | datetime | nao | Data da delecao |
| created_at | datetime | auto | Data de envio |

---

## 5.3 Chat (NOVA - adicionar no Base44)
**Descricao:** Chat/Conversa (versao simplificada em ingles)
**Conecta com:** User (participants), Message

| Campo | Tipo | Obrigatorio | Descricao |
|-------|------|-------------|-----------|
| id | string | auto | ID unico |
| participants | relation[] | sim | Lista de participantes (User IDs) |
| type | select | sim | DIRECT, GROUP |
| name | string | nao | Nome do chat (para grupos) |
| related_type | select | nao | JOB, SUBSTITUICAO, MARKETPLACE, etc |
| related_id | relation | nao | ID relacionado |
| last_message | text | nao | Preview ultima mensagem |
| last_message_at | datetime | nao | Data ultima mensagem |
| status | select | sim | ACTIVE, ARCHIVED |
| created_at | datetime | auto | Data de criacao |

**Diferenca de ChatThread:** Chat e mais simples, suporta grupos. ChatThread e especifico para 2 participantes.

---

## 5.4 Message (NOVA - adicionar no Base44)
**Descricao:** Mensagem (versao em ingles)
**Conecta com:** Chat (chat_id), User (sender_id)

| Campo | Tipo | Obrigatorio | Descricao |
|-------|------|-------------|-----------|
| id | string | auto | ID unico |
| chat_id | relation | sim | Conecta com Chat |
| sender_id | relation | sim | Quem enviou |
| content | text | sim | Conteudo |
| type | select | sim | TEXT, IMAGE, FILE, AUDIO |
| file_url | file | nao | Arquivo |
| read_by | relation[] | nao | Lido por (lista de User IDs) |
| deleted | boolean | sim | Deletada |
| created_at | datetime | auto | Data de envio |

**Nota:** Igual a ChatMessage, existe para compatibilidade com codigo em ingles.

---

# SECAO 6: MARKETPLACE (3 entidades)

## 6.1 MarketplaceItem
**Descricao:** Item a venda no marketplace
**Conecta com:** User/Supplier (seller), MarketplaceChat

| Campo | Tipo | Obrigatorio | Descricao |
|-------|------|-------------|-----------|
| id | string | auto | ID unico |
| seller_id | relation | sim | Vendedor (User ou Supplier) |
| seller_type | select | sim | USER, SUPPLIER, PROFESSIONAL, COMPANY |
| title | string | sim | Titulo do anuncio |
| description | text | sim | Descricao detalhada |
| category | select | sim | EQUIPAMENTO, MATERIAL, MOVEL, INSTRUMENTO, LIVRO, OUTRO |
| subcategory | string | nao | Subcategoria |
| condition | select | sim | NOVO, SEMINOVO, USADO |
| price | number | sim | Preco |
| negotiable | boolean | sim | Preco negociavel |
| images | file[] | sim | Fotos do produto (ate 10) |
| brand | string | nao | Marca |
| model | string | nao | Modelo |
| year | number | nao | Ano de fabricacao |
| city | string | sim | Cidade |
| state | select | sim | Estado |
| shipping_available | boolean | nao | Envia para outras cidades |
| shipping_cost | number | nao | Custo do frete |
| quantity | number | sim | Quantidade disponivel |
| views | number | auto | Visualizacoes |
| favorites_count | number | auto | Vezes favoritado |
| highlighted | boolean | nao | Anuncio destacado (pago) |
| status | select | sim | ATIVO, PAUSADO, VENDIDO, EXPIRADO |
| expires_at | datetime | nao | Data de expiracao |
| created_at | datetime | auto | Data de criacao |
| updated_at | datetime | auto | Ultima atualizacao |

---

## 6.2 MarketplaceChat
**Descricao:** Chat especifico do marketplace (negociacao)
**Conecta com:** MarketplaceItem (item_id), User (buyer, seller)

| Campo | Tipo | Obrigatorio | Descricao |
|-------|------|-------------|-----------|
| id | string | auto | ID unico |
| item_id | relation | sim | Conecta com MarketplaceItem |
| buyer_id | relation | sim | Comprador interessado |
| seller_id | relation | sim | Vendedor |
| messages | json | sim | Array de mensagens |
| last_message | text | nao | Ultima mensagem |
| last_message_at | datetime | nao | Data ultima mensagem |
| buyer_unread | number | sim | Nao lidas pelo comprador |
| seller_unread | number | sim | Nao lidas pelo vendedor |
| status | select | sim | ATIVO, NEGOCIANDO, FECHADO, CANCELADO |
| created_at | datetime | auto | Data de criacao |

---

## 6.3 ProductRadar
**Descricao:** Alerta/Radar de produto (usuario quer ser notificado)
**Conecta com:** User (user_id)

| Campo | Tipo | Obrigatorio | Descricao |
|-------|------|-------------|-----------|
| id | string | auto | ID unico |
| user_id | relation | sim | Usuario que criou o radar |
| keywords | string | sim | Palavras-chave |
| category | select | nao | Categoria desejada |
| condition | multi-select | nao | Condicoes aceitas (NOVO, SEMINOVO, USADO) |
| price_min | number | nao | Preco minimo |
| price_max | number | nao | Preco maximo |
| city | string | nao | Cidade desejada |
| state | select | nao | Estado |
| notify_email | boolean | sim | Notificar por email |
| notify_push | boolean | sim | Notificar por push |
| notify_whatsapp | boolean | nao | Notificar por WhatsApp |
| last_notified | datetime | nao | Ultima notificacao |
| matches_found | number | auto | Produtos encontrados |
| status | select | sim | ATIVO, PAUSADO |
| created_at | datetime | auto | Data de criacao |

---

# SECAO 7: CONTEUDO E FEED (1 entidade)

## 7.1 FeedPost
**Descricao:** Post no feed de noticias/social
**Conecta com:** User (author_id)

| Campo | Tipo | Obrigatorio | Descricao |
|-------|------|-------------|-----------|
| id | string | auto | ID unico |
| author_id | relation | sim | Autor do post |
| author_type | select | sim | USER, PROFESSIONAL, COMPANY, SUPPLIER, ADMIN |
| content | text | sim | Conteudo do post |
| images | file[] | nao | Imagens (ate 10) |
| video_url | string | nao | URL do video |
| link_url | string | nao | Link externo |
| link_preview | json | nao | Preview do link (titulo, imagem, descricao) |
| post_type | select | sim | TEXTO, IMAGEM, VIDEO, LINK, ARTIGO, VAGA, EVENTO |
| category | select | nao | Categoria (NOVIDADE, DICA, CASO_CLINICO, HUMOR, OPINIAO) |
| hashtags | string[] | nao | Hashtags |
| mentions | relation[] | nao | Usuarios mencionados |
| likes_count | number | auto | Curtidas |
| comments_count | number | auto | Comentarios |
| shares_count | number | auto | Compartilhamentos |
| views | number | auto | Visualizacoes |
| pinned | boolean | nao | Fixado no topo |
| highlighted | boolean | nao | Destacado |
| allow_comments | boolean | sim | Permite comentarios |
| visibility | select | sim | PUBLICO, CONEXOES, PRIVADO |
| status | select | sim | PUBLICADO, RASCUNHO, REMOVIDO |
| published_at | datetime | nao | Data de publicacao |
| created_at | datetime | auto | Data de criacao |
| updated_at | datetime | auto | Ultima atualizacao |

---

# SECAO 8: CURSOS E EDUCACAO (2 entidades)

## 8.1 Course
**Descricao:** Curso disponivel na plataforma
**Conecta com:** EducationInstitution/Institution (provider), CourseEnrollment

| Campo | Tipo | Obrigatorio | Descricao |
|-------|------|-------------|-----------|
| id | string | auto | ID unico |
| provider_type | select | sim | INSTITUTION, EDUCATION_INSTITUTION, USER, ADMIN |
| provider_id | relation | sim | Quem oferece o curso |
| title | string | sim | Titulo do curso |
| description | text | sim | Descricao detalhada |
| short_description | string | sim | Descricao curta |
| thumbnail | file | sim | Imagem de capa |
| category | select | sim | ESPECIALIZACAO, ATUALIZACAO, TECNICO, WORKSHOP, PALESTRA |
| specialty | multi-select | nao | Especialidades relacionadas |
| instructor_name | string | sim | Nome do instrutor |
| instructor_bio | text | nao | Bio do instrutor |
| instructor_photo | file | nao | Foto do instrutor |
| duration_hours | number | sim | Duracao em horas |
| modality | select | sim | PRESENCIAL, ONLINE, HIBRIDO |
| start_date | date | nao | Data de inicio |
| end_date | date | nao | Data de termino |
| schedule | text | nao | Horarios das aulas |
| location | string | nao | Local (se presencial) |
| city | string | nao | Cidade |
| state | select | nao | Estado |
| price | number | sim | Preco |
| original_price | number | nao | Preco original (se promocao) |
| installments | number | nao | Parcelas disponiveis |
| certificate | boolean | sim | Oferece certificado |
| certificate_hours | number | nao | Horas do certificado |
| max_students | number | nao | Maximo de alunos |
| enrolled_count | number | auto | Alunos matriculados |
| rating_average | number | nao | Media de avaliacoes |
| rating_count | number | nao | Quantidade de avaliacoes |
| syllabus | json | nao | Conteudo programatico |
| requirements | text | nao | Pre-requisitos |
| target_audience | text | nao | Publico-alvo |
| highlighted | boolean | nao | Curso destacado |
| status | select | sim | ATIVO, PAUSADO, ENCERRADO, CANCELADO |
| created_at | datetime | auto | Data de criacao |
| updated_at | datetime | auto | Ultima atualizacao |

---

## 8.2 CourseEnrollment (NOVA - adicionar no Base44)
**Descricao:** Matricula de usuario em um curso
**Conecta com:** Course (course_id), User/Professional (student)

| Campo | Tipo | Obrigatorio | Descricao |
|-------|------|-------------|-----------|
| id | string | auto | ID unico |
| course_id | relation | sim | Conecta com Course |
| student_id | relation | sim | Aluno (User ou Professional) |
| student_type | select | sim | USER, PROFESSIONAL |
| payment_status | select | sim | PENDENTE, PAGO, CANCELADO, REEMBOLSADO |
| payment_method | select | nao | PIX, CARTAO, BOLETO |
| payment_id | string | nao | ID do pagamento externo |
| amount_paid | number | nao | Valor pago |
| enrolled_at | datetime | auto | Data da matricula |
| started_at | datetime | nao | Data que comecou |
| completed_at | datetime | nao | Data que completou |
| progress | number | sim | Progresso (0-100) |
| certificate_issued | boolean | sim | Certificado emitido |
| certificate_url | file | nao | URL do certificado |
| rating | number | nao | Avaliacao do aluno (1-5) |
| review | text | nao | Review do aluno |
| status | select | sim | ATIVO, CONCLUIDO, CANCELADO, EXPIRADO |
| created_at | datetime | auto | Data de criacao |

---

# SECAO 9: PROMOCOES E EVENTOS (2 entidades)

## 9.1 Promotion
**Descricao:** Promocao de produtos/servicos
**Conecta com:** Supplier/Company/User (owner)

| Campo | Tipo | Obrigatorio | Descricao |
|-------|------|-------------|-----------|
| id | string | auto | ID unico |
| owner_type | select | sim | SUPPLIER, COMPANY, USER, ADMIN |
| owner_id | relation | sim | Dono da promocao |
| title | string | sim | Titulo |
| description | text | sim | Descricao |
| image | file | sim | Imagem da promocao |
| original_price | number | nao | Preco original |
| promotional_price | number | sim | Preco promocional |
| discount_percentage | number | nao | Percentual de desconto |
| category | select | sim | PRODUTO, SERVICO, CURSO, EQUIPAMENTO |
| coupon_code | string | nao | Codigo do cupom |
| start_date | date | sim | Inicio da promocao |
| end_date | date | sim | Fim da promocao |
| terms | text | nao | Termos e condicoes |
| max_uses | number | nao | Maximo de usos |
| current_uses | number | auto | Usos atuais |
| city | string | nao | Cidade |
| state | select | nao | Estado |
| nationwide | boolean | nao | Vale para todo Brasil |
| link | string | nao | Link externo |
| views | number | auto | Visualizacoes |
| clicks | number | auto | Cliques |
| highlighted | boolean | nao | Promocao destacada |
| status | select | sim | ATIVA, PAUSADA, ENCERRADA |
| created_at | datetime | auto | Data de criacao |

---

## 9.2 Event (NOVA - adicionar no Base44)
**Descricao:** Evento (congresso, workshop, palestra)
**Conecta com:** Institution/Company (organizer), User (attendees)

| Campo | Tipo | Obrigatorio | Descricao |
|-------|------|-------------|-----------|
| id | string | auto | ID unico |
| organizer_type | select | sim | INSTITUTION, COMPANY, USER, ADMIN |
| organizer_id | relation | sim | Organizador |
| title | string | sim | Titulo do evento |
| description | text | sim | Descricao |
| short_description | string | sim | Descricao curta |
| image | file | sim | Imagem/Banner |
| event_type | select | sim | CONGRESSO, WORKSHOP, PALESTRA, FEIRA, CURSO, NETWORKING |
| category | multi-select | nao | Categorias/Especialidades |
| start_date | datetime | sim | Data/hora inicio |
| end_date | datetime | sim | Data/hora fim |
| timezone | string | sim | Fuso horario |
| modality | select | sim | PRESENCIAL, ONLINE, HIBRIDO |
| location | string | nao | Local (se presencial) |
| address | string | nao | Endereco completo |
| city | string | nao | Cidade |
| state | select | nao | Estado |
| online_url | string | nao | Link (se online) |
| price | number | nao | Preco (0 = gratuito) |
| max_attendees | number | nao | Maximo de participantes |
| registered_count | number | auto | Inscritos |
| speakers | json | nao | Palestrantes (nome, bio, foto) |
| schedule | json | nao | Programacao |
| sponsors | json | nao | Patrocinadores |
| contact_email | string | nao | Email de contato |
| contact_phone | string | nao | Telefone de contato |
| website | string | nao | Site do evento |
| registration_deadline | datetime | nao | Prazo de inscricao |
| certificate | boolean | nao | Oferece certificado |
| highlighted | boolean | nao | Evento destacado |
| views | number | auto | Visualizacoes |
| status | select | sim | AGENDADO, EM_ANDAMENTO, CONCLUIDO, CANCELADO |
| created_at | datetime | auto | Data de criacao |

---

# SECAO 10: AVALIACOES E FAVORITOS (4 entidades)

## 10.1 Rating
**Descricao:** Avaliacao/Nota dada a um profissional, empresa, etc
**Conecta com:** User (reviewer), Professional/Company/Supplier/etc (reviewed)

| Campo | Tipo | Obrigatorio | Descricao |
|-------|------|-------------|-----------|
| id | string | auto | ID unico |
| reviewer_id | relation | sim | Quem avaliou |
| reviewer_type | select | sim | PROFESSIONAL, COMPANY, USER |
| reviewed_type | select | sim | PROFESSIONAL, COMPANY, SUPPLIER, HOSPITAL, COURSE, MARKETPLACE_ITEM |
| reviewed_id | relation | sim | O que foi avaliado |
| related_type | select | nao | Contexto (JOB, SUBSTITUICAO, PURCHASE, COURSE) |
| related_id | relation | nao | ID do contexto |
| rating | number | sim | Nota (1-5) |
| title | string | nao | Titulo da avaliacao |
| comment | text | nao | Comentario |
| pros | text | nao | Pontos positivos |
| cons | text | nao | Pontos negativos |
| anonymous | boolean | sim | Avaliacao anonima |
| response | text | nao | Resposta do avaliado |
| response_at | datetime | nao | Data da resposta |
| helpful_count | number | auto | Marcacoes de "util" |
| reported | boolean | sim | Foi denunciada |
| verified | boolean | sim | Avaliacao verificada |
| status | select | sim | PUBLICADA, PENDENTE, REMOVIDA |
| created_at | datetime | auto | Data da avaliacao |

---

## 10.2 Favorito
**Descricao:** Item favoritado pelo usuario (portugues)
**Conecta com:** User (user_id), Qualquer entidade (favorited)

| Campo | Tipo | Obrigatorio | Descricao |
|-------|------|-------------|-----------|
| id | string | auto | ID unico |
| user_id | relation | sim | Usuario que favoritou |
| favorited_type | select | sim | PROFESSIONAL, COMPANY, JOB, MARKETPLACE_ITEM, COURSE, etc |
| favorited_id | relation | sim | ID do item favoritado |
| notes | text | nao | Notas pessoais |
| folder | string | nao | Pasta/Categoria |
| notify_changes | boolean | nao | Notificar mudancas |
| created_at | datetime | auto | Data que favoritou |

---

## 10.3 Review (NOVA - adicionar no Base44)
**Descricao:** Review/Avaliacao (versao em ingles)
**Conecta com:** User (reviewer), Qualquer entidade (reviewed)

| Campo | Tipo | Obrigatorio | Descricao |
|-------|------|-------------|-----------|
| id | string | auto | ID unico |
| reviewer_id | relation | sim | Quem avaliou |
| reviewed_type | select | sim | PROFESSIONAL, COMPANY, SUPPLIER, COURSE, PRODUCT |
| reviewed_id | relation | sim | O que foi avaliado |
| rating | number | sim | Nota (1-5) |
| title | string | nao | Titulo |
| comment | text | nao | Comentario |
| anonymous | boolean | sim | Anonimo |
| response | text | nao | Resposta |
| status | select | sim | PUBLISHED, PENDING, REMOVED |
| created_at | datetime | auto | Data |

**Nota:** Igual a Rating, existe para compatibilidade com codigo em ingles.

---

## 10.4 Favorite (NOVA - adicionar no Base44)
**Descricao:** Favorito (versao em ingles)
**Conecta com:** User (user_id), Qualquer entidade (favorited)

| Campo | Tipo | Obrigatorio | Descricao |
|-------|------|-------------|-----------|
| id | string | auto | ID unico |
| user_id | relation | sim | Usuario |
| favorited_type | select | sim | PROFESSIONAL, COMPANY, JOB, ITEM, COURSE |
| favorited_id | relation | sim | ID do favorito |
| created_at | datetime | auto | Data |

**Nota:** Igual a Favorito, existe para compatibilidade com codigo em ingles.

---

# SECAO 11: TOKENS E CUPONS (4 entidades)

## 11.1 TokenUsuario
**Descricao:** Tokens/Moedas do usuario (sistema de pontos)
**Conecta com:** User (user_id)

| Campo | Tipo | Obrigatorio | Descricao |
|-------|------|-------------|-----------|
| id | string | auto | ID unico |
| user_id | relation | sim | Usuario dono dos tokens |
| balance | number | sim | Saldo atual |
| total_earned | number | sim | Total ganho |
| total_spent | number | sim | Total gasto |
| last_transaction | datetime | nao | Ultima transacao |
| created_at | datetime | auto | Data de criacao |
| updated_at | datetime | auto | Ultima atualizacao |

---

## 11.2 TokenDesconto
**Descricao:** Token de desconto especifico
**Conecta com:** User (user_id, used_by)

| Campo | Tipo | Obrigatorio | Descricao |
|-------|------|-------------|-----------|
| id | string | auto | ID unico |
| code | string | sim | Codigo do token (unico) |
| description | string | sim | Descricao |
| discount_type | select | sim | PERCENTUAL, VALOR_FIXO |
| discount_value | number | sim | Valor do desconto |
| min_purchase | number | nao | Compra minima |
| max_discount | number | nao | Desconto maximo |
| applicable_to | multi-select | nao | Onde pode usar (COURSE, MARKETPLACE, JOB_HIGHLIGHT, etc) |
| valid_from | datetime | sim | Valido a partir de |
| valid_until | datetime | sim | Valido ate |
| max_uses | number | nao | Maximo de usos totais |
| max_uses_per_user | number | nao | Maximo por usuario |
| current_uses | number | auto | Usos atuais |
| created_by | relation | nao | Quem criou |
| used_by | relation[] | nao | Quem usou |
| status | select | sim | ATIVO, EXPIRADO, ESGOTADO |
| created_at | datetime | auto | Data de criacao |

---

## 11.3 Token (NOVA - adicionar no Base44)
**Descricao:** Token generico (versao em ingles)
**Conecta com:** User (user_id)

| Campo | Tipo | Obrigatorio | Descricao |
|-------|------|-------------|-----------|
| id | string | auto | ID unico |
| user_id | relation | sim | Usuario |
| type | select | sim | BALANCE, REWARD, REFERRAL, BONUS |
| amount | number | sim | Quantidade |
| description | string | nao | Descricao |
| source | select | nao | PURCHASE, REFERRAL, BONUS, REWARD |
| related_type | select | nao | Tipo relacionado |
| related_id | relation | nao | ID relacionado |
| expires_at | datetime | nao | Expiracao |
| used | boolean | sim | Foi usado |
| used_at | datetime | nao | Data do uso |
| created_at | datetime | auto | Data de criacao |

---

## 11.4 Coupon (NOVA - adicionar no Base44)
**Descricao:** Cupom de desconto (versao em ingles)
**Conecta com:** User (created_by, used_by)

| Campo | Tipo | Obrigatorio | Descricao |
|-------|------|-------------|-----------|
| id | string | auto | ID unico |
| code | string | sim | Codigo (unico) |
| description | string | sim | Descricao |
| discount_type | select | sim | PERCENTAGE, FIXED |
| discount_value | number | sim | Valor |
| min_purchase | number | nao | Compra minima |
| max_discount | number | nao | Desconto maximo |
| valid_from | datetime | sim | Inicio |
| valid_until | datetime | sim | Fim |
| max_uses | number | nao | Maximo usos |
| current_uses | number | auto | Usos atuais |
| status | select | sim | ACTIVE, EXPIRED, EXHAUSTED |
| created_at | datetime | auto | Data de criacao |

**Nota:** Igual a TokenDesconto, existe para compatibilidade com codigo em ingles.

---

# SECAO 12: NOTIFICACOES (3 entidades)

## 12.1 Notification
**Descricao:** Notificacao para o usuario
**Conecta com:** User (user_id)

| Campo | Tipo | Obrigatorio | Descricao |
|-------|------|-------------|-----------|
| id | string | auto | ID unico |
| user_id | relation | sim | Destinatario |
| title | string | sim | Titulo |
| message | text | sim | Mensagem |
| type | select | sim | INFO, SUCCESS, WARNING, ERROR, SYSTEM |
| category | select | sim | JOB, SUBSTITUICAO, CHAT, MARKETPLACE, COURSE, RATING, SYSTEM |
| related_type | select | nao | Tipo relacionado |
| related_id | relation | nao | ID relacionado |
| action_url | string | nao | URL de acao |
| action_text | string | nao | Texto do botao |
| icon | string | nao | Icone |
| image | file | nao | Imagem |
| read | boolean | sim | Foi lida (default: false) |
| read_at | datetime | nao | Data da leitura |
| sent_push | boolean | sim | Enviou push |
| sent_email | boolean | sim | Enviou email |
| sent_whatsapp | boolean | sim | Enviou WhatsApp |
| created_at | datetime | auto | Data de criacao |

---

## 12.2 NotificationPreference
**Descricao:** Preferencias de notificacao do usuario
**Conecta com:** User (user_id)

| Campo | Tipo | Obrigatorio | Descricao |
|-------|------|-------------|-----------|
| id | string | auto | ID unico |
| user_id | relation | sim | Usuario |
| email_enabled | boolean | sim | Receber por email |
| push_enabled | boolean | sim | Receber push |
| whatsapp_enabled | boolean | sim | Receber WhatsApp |
| sms_enabled | boolean | sim | Receber SMS |
| job_notifications | boolean | sim | Notificacoes de vagas |
| substituicao_notifications | boolean | sim | Notificacoes de substituicoes |
| chat_notifications | boolean | sim | Notificacoes de chat |
| marketplace_notifications | boolean | sim | Notificacoes de marketplace |
| course_notifications | boolean | sim | Notificacoes de cursos |
| marketing_notifications | boolean | sim | Notificacoes de marketing |
| quiet_hours_enabled | boolean | nao | Horario silencioso |
| quiet_hours_start | time | nao | Inicio horario silencioso |
| quiet_hours_end | time | nao | Fim horario silencioso |
| created_at | datetime | auto | Data de criacao |
| updated_at | datetime | auto | Ultima atualizacao |

---

## 12.3 WhatsAppNotification
**Descricao:** Notificacao enviada via WhatsApp (log)
**Conecta com:** User (user_id), Notification (notification_id)

| Campo | Tipo | Obrigatorio | Descricao |
|-------|------|-------------|-----------|
| id | string | auto | ID unico |
| user_id | relation | sim | Destinatario |
| notification_id | relation | nao | Notificacao relacionada |
| phone | string | sim | Numero de telefone |
| template | string | sim | Template usado |
| message | text | sim | Mensagem enviada |
| variables | json | nao | Variaveis do template |
| provider | select | sim | TWILIO, WPPCONNECT, EVOLUTION, OUTRO |
| provider_message_id | string | nao | ID da mensagem no provider |
| status | select | sim | PENDING, SENT, DELIVERED, READ, FAILED |
| error_message | text | nao | Mensagem de erro |
| sent_at | datetime | nao | Data de envio |
| delivered_at | datetime | nao | Data de entrega |
| read_at | datetime | nao | Data de leitura |
| created_at | datetime | auto | Data de criacao |

---

# SECAO 13: RELACIONAMENTOS (1 entidade)

## 13.1 VinculoProfissionalClinica
**Descricao:** Vinculo entre profissional e clinica (trabalha em)
**Conecta com:** Professional (professional_id), Company/Clinic (clinic_id)

| Campo | Tipo | Obrigatorio | Descricao |
|-------|------|-------------|-----------|
| id | string | auto | ID unico |
| professional_id | relation | sim | Profissional |
| clinic_type | select | sim | COMPANY, CLINIC |
| clinic_id | relation | sim | Clinica/Empresa |
| role | select | sim | FUNCIONARIO, AUTONOMO, SOCIO, PROPRIETARIO |
| specialty | multi-select | nao | Especialidades neste local |
| start_date | date | nao | Data de inicio |
| end_date | date | nao | Data de termino |
| work_days | multi-select | nao | Dias de trabalho |
| work_hours | string | nao | Horario de trabalho |
| verified_by_clinic | boolean | sim | Confirmado pela clinica |
| verified_by_professional | boolean | sim | Confirmado pelo profissional |
| status | select | sim | ATIVO, INATIVO, PENDENTE |
| created_at | datetime | auto | Data de criacao |
| updated_at | datetime | auto | Ultima atualizacao |

---

# SECAO 14: PREFERENCIAS (1 entidade)

## 14.1 MatchPreferences
**Descricao:** Preferencias de match do usuario (para sistema de sugestoes)
**Conecta com:** User (user_id)

| Campo | Tipo | Obrigatorio | Descricao |
|-------|------|-------------|-----------|
| id | string | auto | ID unico |
| user_id | relation | sim | Usuario |
| user_type | select | sim | PROFESSIONAL, COMPANY, HOSPITAL |
| preferred_specialties | multi-select | nao | Especialidades preferidas |
| preferred_cities | string[] | nao | Cidades preferidas |
| preferred_states | multi-select | nao | Estados preferidos |
| max_distance_km | number | nao | Distancia maxima |
| preferred_job_types | multi-select | nao | Tipos de vaga (CLT, PJ, etc) |
| preferred_shifts | multi-select | nao | Turnos preferidos |
| salary_min | number | nao | Salario minimo |
| salary_max | number | nao | Salario maximo |
| available_immediately | boolean | nao | Disponivel imediatamente |
| willing_to_relocate | boolean | nao | Aceita mudanca |
| experience_min | number | nao | Experiencia minima (anos) |
| rating_min | number | nao | Avaliacao minima |
| verified_only | boolean | nao | Apenas verificados |
| notification_frequency | select | sim | IMEDIATO, DIARIO, SEMANAL |
| created_at | datetime | auto | Data de criacao |
| updated_at | datetime | auto | Ultima atualizacao |

---

# SECAO 15: CREDITO (1 entidade)

## 15.1 PreSimulacao
**Descricao:** Pre-simulacao de credito para profissionais
**Conecta com:** User/Professional (user_id)

| Campo | Tipo | Obrigatorio | Descricao |
|-------|------|-------------|-----------|
| id | string | auto | ID unico |
| user_id | relation | sim | Usuario |
| professional_id | relation | nao | Profissional |
| full_name | string | sim | Nome completo |
| cpf | string | sim | CPF |
| email | string | sim | Email |
| phone | string | sim | Telefone |
| monthly_income | number | sim | Renda mensal |
| employment_type | select | sim | CLT, PJ, AUTONOMO, MISTO |
| credit_purpose | select | sim | EQUIPAMENTO, REFORMA, CAPITAL_GIRO, EXPANSAO, OUTRO |
| requested_amount | number | sim | Valor solicitado |
| has_property | boolean | nao | Possui imovel |
| has_vehicle | boolean | nao | Possui veiculo |
| has_restrictions | boolean | nao | Possui restricoes |
| city | string | sim | Cidade |
| state | select | sim | Estado |
| simulated_rate | number | nao | Taxa simulada |
| simulated_installments | number | nao | Parcelas simuladas |
| simulated_monthly | number | nao | Valor mensal simulado |
| approved | boolean | nao | Pre-aprovado |
| approval_limit | number | nao | Limite aprovado |
| contacted | boolean | sim | Foi contatado |
| contacted_at | datetime | nao | Data do contato |
| partner_sent | boolean | nao | Enviado para parceiro |
| partner_id | string | nao | ID do parceiro |
| notes | text | nao | Observacoes |
| status | select | sim | NOVA, EM_ANALISE, PRE_APROVADA, RECUSADA, CONVERTIDA |
| created_at | datetime | auto | Data de criacao |
| updated_at | datetime | auto | Ultima atualizacao |

---

# SECAO 16: SISTEMA E SERVICOS (8 entidades)

## 16.1 Report
**Descricao:** Denuncia/Report de conteudo ou usuario
**Conecta com:** User (reporter, reported)

| Campo | Tipo | Obrigatorio | Descricao |
|-------|------|-------------|-----------|
| id | string | auto | ID unico |
| reporter_id | relation | sim | Quem denunciou |
| reported_type | select | sim | USER, PROFESSIONAL, COMPANY, JOB, POST, MESSAGE, MARKETPLACE_ITEM |
| reported_id | relation | sim | O que foi denunciado |
| reason | select | sim | SPAM, FRAUDE, CONTEUDO_INADEQUADO, ASSEDIO, FALSO, OUTRO |
| description | text | sim | Descricao detalhada |
| evidence | file[] | nao | Evidencias (prints, etc) |
| priority | select | sim | BAIXA, MEDIA, ALTA, URGENTE |
| assigned_to | relation | nao | Moderador responsavel |
| resolution | text | nao | Resolucao |
| action_taken | select | nao | NENHUMA, AVISO, SUSPENSAO, BANIMENTO, REMOCAO |
| status | select | sim | ABERTA, EM_ANALISE, RESOLVIDA, ARQUIVADA |
| resolved_at | datetime | nao | Data da resolucao |
| created_at | datetime | auto | Data da denuncia |

---

## 16.2 TelegramAccess
**Descricao:** Acesso/Integracao com Telegram
**Conecta com:** User (user_id)

| Campo | Tipo | Obrigatorio | Descricao |
|-------|------|-------------|-----------|
| id | string | auto | ID unico |
| user_id | relation | sim | Usuario |
| telegram_id | string | sim | ID do Telegram |
| telegram_username | string | nao | Username do Telegram |
| telegram_first_name | string | nao | Primeiro nome |
| telegram_last_name | string | nao | Sobrenome |
| telegram_photo_url | string | nao | URL da foto |
| chat_id | string | sim | ID do chat |
| notifications_enabled | boolean | sim | Notificacoes ativas |
| verified | boolean | sim | Conta verificada |
| auth_token | string | nao | Token de autenticacao |
| last_interaction | datetime | nao | Ultima interacao |
| status | select | sim | ATIVO, INATIVO, BLOQUEADO |
| created_at | datetime | auto | Data de conexao |

---

## 16.3 AuditLog
**Descricao:** Log de auditoria (acoes no sistema)
**Conecta com:** User (user_id)

| Campo | Tipo | Obrigatorio | Descricao |
|-------|------|-------------|-----------|
| id | string | auto | ID unico |
| user_id | relation | nao | Usuario que executou |
| action | select | sim | CREATE, UPDATE, DELETE, LOGIN, LOGOUT, VIEW, EXPORT, etc |
| entity_type | string | sim | Tipo da entidade afetada |
| entity_id | string | sim | ID da entidade |
| old_values | json | nao | Valores anteriores |
| new_values | json | nao | Valores novos |
| ip_address | string | nao | IP do usuario |
| user_agent | string | nao | User agent |
| session_id | string | nao | ID da sessao |
| description | text | nao | Descricao da acao |
| created_at | datetime | auto | Data/hora da acao |

---

## 16.4 Task
**Descricao:** Tarefa do sistema (jobs, agendamentos)
**Conecta com:** User (created_by, assigned_to)

| Campo | Tipo | Obrigatorio | Descricao |
|-------|------|-------------|-----------|
| id | string | auto | ID unico |
| title | string | sim | Titulo |
| description | text | nao | Descricao |
| type | select | sim | SYSTEM, MANUAL, SCHEDULED, REMINDER |
| priority | select | sim | LOW, MEDIUM, HIGH, URGENT |
| created_by | relation | nao | Quem criou |
| assigned_to | relation | nao | Responsavel |
| related_type | select | nao | Tipo relacionado |
| related_id | relation | nao | ID relacionado |
| due_date | datetime | nao | Prazo |
| completed_at | datetime | nao | Data de conclusao |
| result | json | nao | Resultado da tarefa |
| error | text | nao | Erro (se falhou) |
| retry_count | number | nao | Tentativas |
| status | select | sim | PENDING, RUNNING, COMPLETED, FAILED, CANCELLED |
| created_at | datetime | auto | Data de criacao |

---

## 16.5 Service (NOVA - adicionar no Base44)
**Descricao:** Servico oferecido por fornecedor/laboratorio
**Conecta com:** Supplier/Laboratorio (provider)

| Campo | Tipo | Obrigatorio | Descricao |
|-------|------|-------------|-----------|
| id | string | auto | ID unico |
| provider_type | select | sim | SUPPLIER, LABORATORIO, LABORATORY, COMPANY |
| provider_id | relation | sim | Quem oferece |
| name | string | sim | Nome do servico |
| description | text | sim | Descricao |
| category | select | sim | PROTESE, MANUTENCAO, INSTALACAO, CONSULTORIA, OUTRO |
| price | number | nao | Preco base |
| price_type | select | nao | FIXO, HORA, ORCAMENTO |
| duration | string | nao | Tempo de execucao |
| delivery_time | string | nao | Prazo de entrega |
| images | file[] | nao | Fotos do servico |
| city | string | sim | Cidade |
| state | select | sim | Estado |
| service_area | multi-select | nao | Area de atendimento |
| rating_average | number | nao | Media de avaliacoes |
| featured | boolean | nao | Servico destacado |
| status | select | sim | ATIVO, INATIVO |
| created_at | datetime | auto | Data de criacao |

---

## 16.6 TelegramUser (NOVA - adicionar no Base44)
**Descricao:** Usuario do Telegram (versao simplificada)
**Conecta com:** User (user_id)

| Campo | Tipo | Obrigatorio | Descricao |
|-------|------|-------------|-----------|
| id | string | auto | ID unico |
| user_id | relation | nao | Usuario do sistema |
| telegram_id | string | sim | ID do Telegram (unico) |
| username | string | nao | Username |
| first_name | string | nao | Primeiro nome |
| last_name | string | nao | Sobrenome |
| phone | string | nao | Telefone |
| language_code | string | nao | Idioma |
| is_bot | boolean | sim | E um bot |
| subscribed | boolean | sim | Inscrito para notificacoes |
| last_message | datetime | nao | Ultima mensagem |
| created_at | datetime | auto | Data de criacao |

**Diferenca de TelegramAccess:** TelegramUser e mais simples, apenas dados do usuario. TelegramAccess inclui configuracoes e tokens.

---

## 16.7 ClienteDoutorizze (NOVA - adicionar no Base44)
**Descricao:** Cliente especial do Doutorizze (parceiros, VIPs)
**Conecta com:** User (user_id), Company (company_id)

| Campo | Tipo | Obrigatorio | Descricao |
|-------|------|-------------|-----------|
| id | string | auto | ID unico |
| user_id | relation | nao | Usuario |
| company_id | relation | nao | Empresa |
| client_type | select | sim | PARCEIRO, VIP, PREMIUM, TESTE |
| name | string | sim | Nome do cliente |
| email | string | sim | Email |
| phone | string | sim | Telefone |
| plan | select | sim | FREE, BASIC, PRO, ENTERPRISE |
| plan_start | date | nao | Inicio do plano |
| plan_end | date | nao | Fim do plano |
| credits | number | nao | Creditos disponiveis |
| discount_percentage | number | nao | Desconto em servicos |
| referral_code | string | nao | Codigo de indicacao |
| referred_by | relation | nao | Indicado por |
| notes | text | nao | Observacoes internas |
| account_manager | string | nao | Gerente de conta |
| status | select | sim | ATIVO, INATIVO, PENDENTE, CANCELADO |
| created_at | datetime | auto | Data de cadastro |

---

# RESUMO FINAL

## TOTAL: 58 ENTIDADES

| Secao | Quantidade | Entidades |
|-------|------------|-----------|
| Autenticacao | 2 | WhatsAppOTP, EmailVerification |
| Usuarios | 13 | User, Professional, Company, CompanyOwner, CompanyUnit, Hospital, Supplier, EducationInstitution, Laboratorio, ProfessionalAd, Clinic*, Institution*, Laboratory* |
| Vagas | 6 | Job, JobMatch, JobContract, JobApplication*, Substitution*, SubstitutionApplication* |
| Substituicoes | 5 | SubstituicaoUrgente, CandidaturaSubstituicao, ValidacaoComparecimento, SuspensaoProfissional, BloqueioAgenda |
| Chat | 4 | ChatThread, ChatMessage, Chat*, Message* |
| Marketplace | 3 | MarketplaceItem, MarketplaceChat, ProductRadar |
| Conteudo | 1 | FeedPost |
| Cursos | 2 | Course, CourseEnrollment* |
| Promocoes/Eventos | 2 | Promotion, Event* |
| Avaliacoes/Favoritos | 4 | Rating, Favorito, Review*, Favorite* |
| Tokens/Cupons | 4 | TokenUsuario, TokenDesconto, Token*, Coupon* |
| Notificacoes | 3 | Notification, NotificationPreference, WhatsAppNotification |
| Relacionamentos | 1 | VinculoProfissionalClinica |
| Preferencias | 1 | MatchPreferences |
| Credito | 1 | PreSimulacao |
| Sistema | 6 | Report, TelegramAccess, AuditLog, Task, Service*, TelegramUser*, ClienteDoutorizze* |

*Entidades marcadas com * sao as 17 NOVAS que precisam ser adicionadas no Base44

## ENTIDADES NOVAS A ADICIONAR (17):

1. Clinic
2. Institution
3. Laboratory
4. JobApplication
5. Substitution
6. SubstitutionApplication
7. CourseEnrollment
8. Chat
9. Message
10. Review
11. Favorite
12. Token
13. Coupon
14. Event
15. Service
16. TelegramUser
17. ClienteDoutorizze

---

# FIM DO DOCUMENTO

Este documento foi criado para garantir que o Base44 tenha EXATAMENTE as mesmas 58 entidades do sistema externo, com todos os campos, tipos e relacionamentos corretos.
