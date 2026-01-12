# RELATORIO COMPLETO - ARQUIVOS FALTANTES NO PROJETO NOVO

## COMPARACAO: APP-CHEQUEMATE (antigo) vs DTORRIZE-app (novo)

Este documento detalha TUDO que existe no projeto antigo e esta faltando no projeto novo.

---

# SUMARIO

1. [TELAS/PAGINAS FALTANTES](#1-telaspaginas-faltantes-10)
2. [SERVICES FALTANTES](#2-services-faltantes-8)
3. [HOOKS FALTANTES](#3-hooks-faltantes-2)
4. [SISTEMA DE IAs](#4-sistema-de-ias-completo)
5. [MAPA DE CONEXOES](#5-mapa-de-conexoes)
6. [COMO IMPLEMENTAR](#6-como-implementar)

---

# 1. TELAS/PAGINAS FALTANTES (10)

## 1.1 ClubePontos.jsx

### O QUE FAZ:
Sistema de gamificacao com niveis (Bronze, Prata, Ouro, Diamante) e selos de conquista

### ONDE ENTRA NO SISTEMA:
- Menu lateral > "Niveis e Selos"
- Dashboard do profissional > Card de nivel
- Perfil do usuario > Mostrar badges

### QUEM PODE VER:
- **Profissionais**: Veem seu proprio nivel e selos
- **Clinicas**: Veem nivel dos profissionais ao contratar
- **Todos**: Podem ver o ranking Top 5

### FUNCIONALIDADES:
```
NIVEIS:
- Bronze (0 pontos): 5 anuncios/dia, Chat basico, Acesso ao Feed
- Prata (500 pontos): 7 anuncios/dia, Badge no perfil, Prioridade no Feed
- Ouro (2000 pontos): 10 anuncios/dia, Destaque no Radar, Selo dourado
- Diamante (5000 pontos): 15 anuncios/dia, Perfil verificado premium, Suporte prioritario

SELOS (8 tipos):
- Identidade Verificada: Enviou documentos e selfie
- Responde Rapido: Responde em menos de 1 hora
- 100% Confiavel: Nunca cancelou uma negociacao
- Veterano: Mais de 1 ano na plataforma
- Super Avaliado: Media acima de 4.8 estrelas
- Embaixador: Indicou 10+ amigos
- Top Vendedor: 100+ vendas no Marketplace
- Especialista: 50+ substituicoes realizadas

COMO GANHAR PONTOS:
- Completar uma venda/compra: +50 rep
- Receber avaliacao 5 estrelas: +30 rep
- Completar substituicao: +40 rep
- Indicar amigo que se cadastrou: +100 rep
- Responder mensagem em < 1h: +10 rep
- Manter perfil 100% completo: +20 rep/semana
```

### CONECTA COM:
- Professional (nivel, selos)
- Rating (calcular pontos)
- JobContract (contar substituicoes)
- MarketplaceItem (contar vendas)

### ROTA:
`/clube-pontos`

---

## 1.2 ComparadorPrecos.jsx

### O QUE FAZ:
Compara precos de produtos entre diferentes fornecedores com analise de IA

### ONDE ENTRA NO SISTEMA:
- Marketplace > Botao "Comparar Precos"
- Menu lateral > "Comparador de Precos"

### QUEM PODE VER:
- **Todos** os usuarios logados

### FUNCIONALIDADES:
```
- Buscar produto por nome
- Ver lista de fornecedores com precos
- Ordenar por: Menor Preco, Melhor Avaliacao, Entrega Rapida
- Ver historico de precos (min/max 30 dias)
- Badge "MELHOR PRECO" no fornecedor mais barato
- Ver detalhes do fornecedor: avaliacao, entregas, cidade, tempo entrega
```

### CONECTA COM:
- MarketplaceItem (produtos)
- Supplier (fornecedores)
- IA de Precos (precosIA.js)
- N8N Service (buscar precos externos)

### ROTA:
`/comparador-precos`

---

## 1.3 IndicarAmigo.jsx

### O QUE FAZ:
Sistema de indicacao de amigos com codigo/link exclusivo e rastreamento de pontos

### ONDE ENTRA NO SISTEMA:
- Menu lateral > "Indicar Amigo"
- Dashboard > Card "Ganhe pontos indicando"

### QUEM PODE VER:
- **Todos** os usuarios logados

### FUNCIONALIDADES:
```
- Codigo de indicacao unico por usuario (ex: DOUT2025FMP)
- Link de indicacao compartilhavel
- Botao compartilhar (nativo do celular)
- Enviar convite por email
- Ver lista de indicados (nome, status, pontos ganhos)
- Stats: indicacoes do mes, restantes (limite 10/mes), pontos ganhos
```

### COMO FUNCIONA:
1. Usuario compartilha codigo ou link
2. Amigo se cadastra usando o codigo
3. Quando amigo faz primeira compra, AMBOS ganham pontos

### CONECTA COM:
- User (referral_code, referred_by)
- TokenUsuario (adicionar pontos)
- ClubePontos (selo Embaixador)

### ROTA:
`/indicar-amigo`

---

## 1.4 ContratoDigital.jsx

### O QUE FAZ:
Contrato digital entre profissional e clinica para substituicoes/vagas

### ONDE ENTRA NO SISTEMA:
- Apos aceitar candidatura de substituicao
- Apos match confirmado em vaga
- Dashboard > Meus Contratos

### QUEM PODE VER:
- **Profissional**: Seus contratos
- **Clinica**: Contratos com profissionais
- **Hospital**: Contratos com profissionais

### FUNCIONALIDADES:
```
STATUS DO CONTRATO:
- Pendente (aguardando assinatura)
- Aceito
- Em Andamento
- Concluido
- Cancelado

INFORMACOES EXIBIDAS:
- Dados do profissional (nome, CRO, telefone, foto)
- Dados da clinica (nome, CNPJ, endereco, responsavel)
- Detalhes do servico (data, horario, carga horaria, valor)
- Termos e condicoes (lista)
- Aviso legal (Doutorizze como intermediadora)

ACOES:
- Aceitar termos (checkbox)
- Assinar digitalmente
- Baixar PDF
- Compartilhar
```

### CONECTA COM:
- JobContract (entidade)
- Professional (dados do profissional)
- Company/Clinic/Hospital (dados do contratante)
- SubstituicaoUrgente (se for substituicao)

### ROTA:
`/contrato-digital?id=CTR-2025-0001`

---

## 1.5 IAsDisponiveis.jsx

### O QUE FAZ:
Pagina institucional mostrando as 6 IAs do sistema e suas funcionalidades

### ONDE ENTRA NO SISTEMA:
- Menu lateral > "IAs Doutorizze"
- Pagina de Marketing
- Onboarding (opcional)

### QUEM PODE VER:
- **Todos** (inclusive nao logados)

### IAs LISTADAS:
```
1. IA RADAR (cor #FB923C)
   - Monitora marketplace 24/7
   - Alerta quando encontra o que voce procura
   - Filtra por preco, regiao e categoria
   - Aprende suas preferencias
   - Stats: 850+ matches/dia, 94% precisao

2. IA DE PRECOS (cor #4ADE80)
   - Analisa precos dos ultimos 30 dias
   - Sugere preco ideal para venda
   - Alerta menor preco historico
   - Compara com concorrentes
   - Stats: 32% economia, 12k analises/mes

3. IA DE NOTIFICACOES (cor #22D3EE)
   - Aprende sua rotina
   - Agrupa notificacoes similares
   - Prioriza urgencias
   - Modo silencioso inteligente
   - Stats: 78% abertura, 4.8 satisfacao

4. IA DE MATCHING (cor #A855F7)
   - Analisa perfil e experiencia
   - Considera localizacao
   - Verifica disponibilidade
   - Ranqueia por compatibilidade
   - Stats: 340 matches/dia, 89% sucesso

5. IA DO FEED (cor #E94560)
   - Filtra por area (odonto/medicina)
   - Prioriza ofertas da regiao
   - Destaca oportunidades urgentes
   - Remove conteudo irrelevante
   - Stats: 98% relevancia, 2h/dia economia

6. IA DE BUSCA (cor #FBBF24)
   - Busca semantica
   - Sugestoes inteligentes
   - Correcao de erros
   - Historico personalizado
   - Stats: 96% assertividade, <1s velocidade
```

### STATS GERAIS:
- 2.500+ matches/dia
- 94% precisao media
- 2h/dia tempo economizado

### ROTA:
`/ias-disponiveis`

---

## 1.6 MentoriaExpress.jsx

### O QUE FAZ:
Sistema de mentoria rapida entre profissionais experientes e iniciantes

### ONDE ENTRA NO SISTEMA:
- Menu lateral > "Mentoria Express"
- Dashboard profissional > "Buscar Mentor"

### QUEM PODE VER:
- **Profissionais**: Buscar ou oferecer mentoria
- **Estudantes**: Buscar mentores

### FUNCIONALIDADES:
```
- Buscar mentores por especialidade
- Ver perfil do mentor (experiencia, avaliacoes)
- Agendar sessao de mentoria (30min, 1h)
- Chat com mentor
- Avaliar mentoria
- Historico de mentorias
```

### CONECTA COM:
- Professional (mentor)
- User (mentee)
- ChatThread (comunicacao)
- Rating (avaliacoes)

### ROTA:
`/mentoria-express`

---

## 1.7 Perfil.jsx

### O QUE FAZ:
Pagina de perfil generico (diferente dos perfis especificos)

### ONDE ENTRA NO SISTEMA:
- Ao clicar no avatar de qualquer usuario
- Links de perfil publico

### QUEM PODE VER:
- **Todos** (com restricoes de privacidade)

### ROTA:
`/perfil/:id`

---

## 1.8 EscolherTipoCadastro.jsx

### O QUE FAZ:
Tela inicial de cadastro onde usuario escolhe o tipo de conta

### ONDE ENTRA NO SISTEMA:
- Primeira tela apos clicar em "Cadastrar"
- Antes de qualquer formulario de cadastro

### TIPOS DE CONTA:
```
- Profissional de Saude (dentista, medico, tecnico)
- Clinica/Consultorio
- Hospital
- Fornecedor
- Instituicao de Ensino
- Laboratorio
```

### FLUXO:
```
EscolherTipoCadastro --> CadastroProfissional
                    --> CadastroClinica
                    --> CadastroHospital
                    --> CadastroFornecedor
                    --> CadastroInstituicao
                    --> CadastroLaboratorio
```

### ROTA:
`/escolher-tipo-cadastro`

---

## 1.9 TestProfessional.jsx

### O QUE FAZ:
Pagina de teste para profissionais (verificar funcionalidades)

### ONDE ENTRA:
- Ambiente de desenvolvimento/testes

### ROTA:
`/test-professional`

---

## 1.10 FeedBackup.jsx

### O QUE FAZ:
Versao de backup do Feed (fallback se o principal falhar)

### ONDE ENTRA:
- Usado automaticamente se Feed.jsx falhar

---

# 2. SERVICES FALTANTES (8)

## 2.1 iaOrchestrator.js

### O QUE FAZ:
Centralizador de todas as IAs do sistema. Gerencia chamadas, logs, metricas, fallbacks e retries.

### ONDE ENTRA:
- Qualquer componente que use IA
- Importado em todas as paginas que precisam de IA

### FUNCIONALIDADES:
```javascript
// Configuracao de cada IA
const IA_CONFIG = {
  radar: { nome: "IA Radar", timeout: 10000, retries: 2 },
  precos: { nome: "IA de Precos", timeout: 5000, retries: 1 },
  notificacoes: { nome: "IA de Notificacoes", timeout: 3000, retries: 1 },
  matching: { nome: "IA de Matching", timeout: 5000, retries: 1 },
  feed: { nome: "IA do Feed", timeout: 3000, retries: 1 },
  busca: { nome: "IA de Busca", timeout: 2000, retries: 1 },
}

// Funcoes disponiveis
executarIA(iaName, funcao, args, opcoes)  // Executa qualquer IA
getMetricas()                              // Metricas de todas as IAs
getLogs(filtros)                           // Logs de execucao
limparDados()                              // Limpar logs e metricas
healthCheck()                              // Verificar saude das IAs

// Atalhos por IA
radar.buscar(userId, filters)
radar.salvarPrefs(userId, prefs)
precos.analisar(categoria, regiao)
precos.sugerirVenda(categoria, regiao, condicao)
notificacoes.processar(notif, userId)
matching.calcular(profissional, vaga)
matching.rankearProfissionais(profissionais, vaga, opcoes)
feed.processar(items, usuario, opcoes)
busca.buscar(query, dados, opcoes)
```

### LOGS GERADOS:
```javascript
{
  ia: "matching",
  funcao: "calcularMatch",
  sucesso: true,
  tempo: 234,       // ms
  tentativas: 1,
  erro: null,
  timestamp: 1234567890
}
```

### CONECTA COM:
- radarIA.js
- precosIA.js
- notificacoesIA.js
- matchingIA.js
- feedIA.js
- buscaIA.js

---

## 2.2 n8nService.js

### O QUE FAZ:
Integra com N8N para automacoes (WhatsApp, email, webhooks)

### ONDE ENTRA:
- Envio de notificacoes WhatsApp
- Envio de emails
- Webhooks de eventos

### FUNCIONALIDADES:
```javascript
// WhatsApp
enviarWhatsAppConfirmacao(dados)   // Confirmacao de substituicao
enviarWhatsAppNotificacao(dados)   // Notificacao generica
enviarWhatsAppLembrete(dados)      // Lembrete de evento

// Vagas e Substituicoes
notificarNovaVaga(dados)           // Nova vaga criada
notificarNovaSubstituicao(dados)   // Nova substituicao urgente
notificarCandidaturaRecebida(dados)// Candidatura recebida

// Cadastros
notificarCadastroAprovado(dados)   // Cadastro aprovado
notificarCadastroPendente(dados)   // Cadastro pendente

// Tokens
validarTokenDoutorizze(tokenId, parceiroId)
gerarTokenDesconto(dados)
enviarTokenDesconto(dados)

// Comparador
buscarPrecosExternos(dados)        // Buscar precos em outros sites

// Notificacoes
enviarPushNotification(dados)
enviarEmailNotificacao(dados)
```

### CONECTA COM:
- N8N (servidor externo)
- Twilio/WhatsApp API
- SendGrid/Email

---

## 2.3 pushService.js

### O QUE FAZ:
Gerencia notificacoes push do navegador/app

### FUNCIONALIDADES:
```
- Solicitar permissao de notificacao
- Registrar service worker
- Enviar push notification
- Gerenciar tokens FCM
```

---

## 2.4 deviceBindingService.jsx

### O QUE FAZ:
Vincula dispositivos a conta do usuario (max 3 dispositivos)

### FUNCIONALIDADES:
```javascript
generateFingerprint()        // Gera ID unico do dispositivo
saveDevice(deviceId, userId) // Salva dispositivo
getCurrentDevice()           // Obtem dispositivo atual
getLinkedDevices()           // Lista todos dispositivos
removeDevice(deviceId)       // Remove dispositivo
isDeviceAuthorized()         // Verifica se autorizado
canAddDevice()               // Verifica se pode adicionar mais
getDeviceInfo()              // Info do dispositivo (browser, OS)
```

---

## 2.5 discountTokenService.js

### O QUE FAZ:
Gerencia tokens de desconto e cupons

### FUNCIONALIDADES:
```
- Gerar token de desconto
- Validar token
- Aplicar desconto
- Verificar validade
- Listar tokens do usuario
```

### CONECTA COM:
- TokenDesconto (entidade)
- Coupon (entidade)

---

## 2.6 webAuthnService.js

### O QUE FAZ:
Implementa autenticacao WebAuthn (biometria, chave de seguranca)

### FUNCIONALIDADES:
```
- Registrar credencial biometrica
- Autenticar com biometria
- Verificar suporte do navegador
- Gerenciar credenciais
```

---

## 2.7 iaServices/matchingIA.js

### O QUE FAZ:
Algoritmo de compatibilidade profissional-vaga (score 0-100)

### PESOS DO CALCULO:
```javascript
const PESOS = {
  especialidade: 35,    // Match exato de especialidade
  localizacao: 25,      // Distancia em km
  disponibilidade: 20,  // Horarios compativeis
  rating: 10,           // Avaliacao do profissional
  experiencia: 5,       // Anos de experiencia
  preco: 5,             // Compatibilidade de valor
}
```

### FUNCOES:
```javascript
calcularMatch(profissional, vaga)
// Retorna: { score: 85, nivel: "excelente", detalhes: {...}, recomendacao: "..." }

rankearProfissionais(profissionais, vaga, opcoes)
// Retorna: Array de profissionais ordenados por score

rankearVagas(profissional, vagas, opcoes)
// Retorna: Array de vagas ordenadas por compatibilidade

encontrarMatchesIdeais(vaga, profissionais)
// Retorna: Top 10 com score > 80

sugerirMelhorias(profissional, vaga)
// Retorna: Lista de sugestoes para aumentar score
```

### NIVEIS DE MATCH:
```
90-100: Perfeito (verde)
75-89:  Excelente (azul)
60-74:  Bom (amarelo)
40-59:  Regular (laranja)
0-39:   Baixo (vermelho)
```

---

## 2.8 iaServices/ (pasta completa)

### ARQUIVOS:
```
iaServices/
├── index.js           # Exportacoes
├── buscaIA.js         # IA de busca semantica
├── feedIA.js          # IA de personalizacao do feed
├── matchingIA.js      # IA de matching profissional-vaga
├── notificacoesIA.js  # IA de notificacoes inteligentes
├── precosIA.js        # IA de analise de precos
└── radarIA.js         # IA de radar de produtos
```

---

# 3. HOOKS FALTANTES (2)

## 3.1 useBiometricPrompt.js

### O QUE FAZ:
Hook para verificacao biometrica em acoes criticas

### ONDE USAR:
- Aceitar vaga
- Confirmar pagamento
- Alterar dados bancarios
- Qualquer acao sensivel

### FUNCIONALIDADES:
```javascript
const {
  isOpen,                    // Modal aberto?
  config,                    // Configuracao atual
  requestVerification,       // Solicitar verificacao
  onSuccess,                 // Callback sucesso
  onCancel,                  // Callback cancelado
  onClose,                   // Fechar modal
  // Helpers prontos
  requestForVaga,            // Verificar para aceitar vaga
  requestForPagamento,       // Verificar para pagamento
  requestForDadosBancarios,  // Verificar para alterar dados
} = useBiometricPrompt()

// Uso
const handleAceitarVaga = async () => {
  try {
    await requestForVaga()
    // Usuario verificado, pode aceitar
    aceitarVaga()
  } catch (error) {
    // Usuario cancelou ou falhou
  }
}
```

---

## 3.2 useDeviceBinding.js

### O QUE FAZ:
Gerencia vinculacao de dispositivos (max 3 por conta)

### FUNCIONALIDADES:
```javascript
const {
  currentDevice,            // Dispositivo atual
  linkedDevices,            // Lista de dispositivos vinculados
  isAuthorized,             // Este dispositivo esta autorizado?
  isNewDevice,              // E um dispositivo novo?
  isLoading,                // Carregando?
  error,                    // Erro?
  canAddMore,               // Pode adicionar mais dispositivos?
  maxDevices,               // Limite (3)
  registerCurrentDevice,    // Registrar este dispositivo
  unlinkDevice,             // Remover dispositivo
  isCurrentDevice,          // Verificar se e o atual
  getDeviceDisplayInfo,     // Info para exibir
} = useDeviceBinding(userId)
```

### FLUXO:
```
1. Usuario faz login
2. Hook verifica se dispositivo esta vinculado
3. Se NAO: isNewDevice = true, mostrar tela de confirmacao
4. Se SIM: isAuthorized = true, acesso normal
5. Se > 3 dispositivos: canAddMore = false, pedir para remover um
```

---

# 4. SISTEMA DE IAs COMPLETO

## ARQUITETURA:
```
Usuario
   |
   v
Componente (ex: Feed.jsx)
   |
   v
iaOrchestrator.js  <-- Centralizador
   |
   +-- radarIA.js
   +-- precosIA.js
   +-- notificacoesIA.js
   +-- matchingIA.js
   +-- feedIA.js
   +-- buscaIA.js
   |
   v
Logs + Metricas (localStorage)
```

## FLUXO DE EXECUCAO:
```
1. Componente chama: matching.calcular(profissional, vaga)
2. iaOrchestrator recebe chamada
3. Executa com timeout e retries
4. Registra log de execucao
5. Atualiza metricas
6. Retorna resultado ou fallback
```

## METRICAS COLETADAS:
```javascript
{
  matching: {
    sucesso: 1234,
    falha: 12,
    tempoTotal: 45678,    // ms total
  },
  // ... outras IAs
}

// Consolidado:
{
  matching: {
    nome: "IA de Matching",
    chamadas: 1246,
    sucesso: 1234,
    falha: 12,
    taxaSucesso: 99,      // %
    tempoMedio: 37,       // ms
  }
}
```

---

# 5. MAPA DE CONEXOES

## ONDE CADA ARQUIVO SE CONECTA:

```
ClubePontos.jsx
    |
    +-- Professional (nivel, selos do usuario)
    +-- Rating (calcular pontos por avaliacoes)
    +-- JobContract (contar substituicoes)
    +-- MarketplaceItem (contar vendas)
    +-- TokenUsuario (saldo de pontos)

ComparadorPrecos.jsx
    |
    +-- MarketplaceItem (produtos)
    +-- Supplier (fornecedores)
    +-- iaOrchestrator > precosIA (analise)
    +-- n8nService (buscar precos externos)

IndicarAmigo.jsx
    |
    +-- User (referral_code, referred_by)
    +-- TokenUsuario (adicionar pontos)
    +-- n8nService (enviar email convite)

ContratoDigital.jsx
    |
    +-- JobContract (entidade principal)
    +-- Professional (dados profissional)
    +-- Company/Clinic/Hospital (dados contratante)
    +-- SubstituicaoUrgente (se for substituicao)

IAsDisponiveis.jsx
    |
    +-- Nenhuma conexao (pagina estatica/marketing)

iaOrchestrator.js
    |
    +-- radarIA.js
    +-- precosIA.js
    +-- notificacoesIA.js
    +-- matchingIA.js
    +-- feedIA.js
    +-- buscaIA.js
    +-- localStorage (logs, metricas)

n8nService.js
    |
    +-- N8N Server (webhooks externos)
    +-- WhatsAppNotification (entidade)
    +-- Notification (entidade)

useBiometricPrompt.js
    |
    +-- BiometricPrompt component (UI)
    +-- WebAuthn API (navegador)

useDeviceBinding.js
    |
    +-- deviceFingerprint utils
    +-- localStorage (dispositivos)
    +-- User (vincular ao usuario)
```

---

# 6. COMO IMPLEMENTAR

## ORDEM DE IMPLEMENTACAO SUGERIDA:

### FASE 1 - SERVICES BASE (Prioridade Alta)
```
1. iaServices/ (pasta completa)
   - Criar pasta src/services/iaServices/
   - Copiar todos os 7 arquivos

2. iaOrchestrator.js
   - Copiar para src/services/
   - Ajustar imports

3. n8nService.js
   - Copiar para src/services/
   - Configurar webhooks N8N
```

### FASE 2 - HOOKS (Prioridade Alta)
```
4. useBiometricPrompt.js
   - Copiar para src/hooks/

5. useDeviceBinding.js
   - Copiar para src/hooks/
   - Criar utils/deviceFingerprint.js
```

### FASE 3 - TELAS ESSENCIAIS (Prioridade Media)
```
6. ContratoDigital.jsx
   - Copiar para src/pages/
   - Adicionar rota em App.jsx

7. ClubePontos.jsx
   - Copiar para src/pages/
   - Adicionar rota

8. EscolherTipoCadastro.jsx
   - Copiar para src/pages/
   - Ajustar fluxo de onboarding
```

### FASE 4 - TELAS COMPLEMENTARES (Prioridade Baixa)
```
9. IndicarAmigo.jsx
10. ComparadorPrecos.jsx
11. IAsDisponiveis.jsx
12. MentoriaExpress.jsx
```

## ARQUIVOS PARA COPIAR:

### Do projeto antigo (APP-CHEQUEMATE):
```
src/pages/
├── ClubePontos.jsx           --> COPIAR
├── ComparadorPrecos.jsx      --> COPIAR
├── ContratoDigital.jsx       --> COPIAR
├── EscolherTipoCadastro.jsx  --> COPIAR
├── IAsDisponiveis.jsx        --> COPIAR
├── IndicarAmigo.jsx          --> COPIAR
├── MentoriaExpress.jsx       --> COPIAR
├── Perfil.jsx                --> COPIAR

src/services/
├── iaOrchestrator.js         --> COPIAR
├── n8nService.js             --> COPIAR
├── pushService.js            --> COPIAR
├── deviceBindingService.jsx  --> COPIAR
├── discountTokenService.js   --> COPIAR
├── webAuthnService.js        --> COPIAR
└── iaServices/               --> COPIAR PASTA INTEIRA
    ├── index.js
    ├── buscaIA.js
    ├── feedIA.js
    ├── matchingIA.js
    ├── notificacoesIA.js
    ├── precosIA.js
    └── radarIA.js

src/hooks/
├── useBiometricPrompt.js     --> COPIAR
└── useDeviceBinding.js       --> COPIAR
```

## CONFIGURACOES NECESSARIAS:

### 1. N8N Webhooks (criar no N8N):
```
WHATSAPP_CONFIRMACAO
WHATSAPP_NOTIFICACAO
WHATSAPP_LEMBRETE
NOVA_VAGA
NOVA_SUBSTITUICAO
CANDIDATURA_RECEBIDA
CADASTRO_APROVADO
CADASTRO_PENDENTE
TOKEN_VALIDAR
TOKEN_GERAR_DESCONTO
TOKEN_ENVIAR_WHATSAPP
COMPARADOR_BUSCAR
PUSH_NOTIFICATION
EMAIL_NOTIFICACAO
```

### 2. Rotas no App.jsx:
```jsx
<Route path="/clube-pontos" element={<ClubePontos />} />
<Route path="/comparador-precos" element={<ComparadorPrecos />} />
<Route path="/indicar-amigo" element={<IndicarAmigo />} />
<Route path="/contrato-digital" element={<ContratoDigital />} />
<Route path="/ias-disponiveis" element={<IAsDisponiveis />} />
<Route path="/mentoria-express" element={<MentoriaExpress />} />
<Route path="/escolher-tipo-cadastro" element={<EscolherTipoCadastro />} />
<Route path="/perfil/:id" element={<Perfil />} />
```

---

# FIM DO DOCUMENTO

Este documento foi criado em 12/01/2026 para documentar todos os arquivos que existem no projeto antigo (APP-CHEQUEMATE) e estao faltando no projeto novo (DTORRIZE-app).

**RESUMO:**
- 10 Telas/Paginas faltando
- 8 Services faltando (incluindo sistema de IAs)
- 2 Hooks faltando

**PRIORIDADE:**
1. Sistema de IAs (iaOrchestrator + iaServices)
2. Hooks de seguranca (biometria, device binding)
3. Telas essenciais (Contrato, ClubePontos, EscolherTipo)
4. Telas complementares (Indicar, Comparador, etc)
