/**
 * SERVICO N8N
 *
 * Funcoes especificas para cada tipo de webhook
 * Abstrai a comunicacao com o n8n
 */

import { callN8nWebhook, N8N_WEBHOOKS } from "@/config/n8n"

// ============================================
// WHATSAPP
// ============================================

/**
 * Enviar WhatsApp de confirmacao de substituicao
 */
export async function enviarWhatsAppConfirmacao(dados) {
  return callN8nWebhook(N8N_WEBHOOKS.WHATSAPP_CONFIRMACAO, {
    numero: dados.numero,
    mensagem: dados.mensagem,
    link: dados.link,
    tipo: "CONFIRMACAO_SUBSTITUICAO",
    substituicao_id: dados.substituicaoId,
    profissional_id: dados.profissionalId,
  })
}

/**
 * Enviar WhatsApp de notificacao generica
 */
export async function enviarWhatsAppNotificacao(dados) {
  return callN8nWebhook(N8N_WEBHOOKS.WHATSAPP_NOTIFICACAO, {
    numero: dados.numero,
    mensagem: dados.mensagem,
    tipo: dados.tipo || "NOTIFICACAO",
    dados_adicionais: dados.extra,
  })
}

/**
 * Enviar WhatsApp de lembrete
 */
export async function enviarWhatsAppLembrete(dados) {
  return callN8nWebhook(N8N_WEBHOOKS.WHATSAPP_LEMBRETE, {
    numero: dados.numero,
    mensagem: dados.mensagem,
    tipo: "LEMBRETE",
    evento_id: dados.eventoId,
    data_evento: dados.dataEvento,
  })
}

// ============================================
// VAGAS E SUBSTITUICOES
// ============================================

/**
 * Notificar nova vaga criada
 */
export async function notificarNovaVaga(dados) {
  return callN8nWebhook(N8N_WEBHOOKS.NOVA_VAGA, {
    vaga_id: dados.vagaId,
    titulo: dados.titulo,
    especialidade: dados.especialidade,
    cidade: dados.cidade,
    estado: dados.estado,
    tipo_contrato: dados.tipoContrato,
    valor: dados.valor,
    criador_id: dados.criadorId,
    criador_nome: dados.criadorNome,
  })
}

/**
 * Notificar nova substituicao urgente
 */
export async function notificarNovaSubstituicao(dados) {
  return callN8nWebhook(N8N_WEBHOOKS.NOVA_SUBSTITUICAO, {
    substituicao_id: dados.substituicaoId,
    clinica_nome: dados.clinicaNome,
    especialidade: dados.especialidade,
    data_inicio: dados.dataInicio,
    urgente: dados.urgente,
    valor: dados.valor,
  })
}

/**
 * Notificar candidatura recebida
 */
export async function notificarCandidaturaRecebida(dados) {
  return callN8nWebhook(N8N_WEBHOOKS.CANDIDATURA_RECEBIDA, {
    vaga_id: dados.vagaId,
    candidato_id: dados.candidatoId,
    candidato_nome: dados.candidatoNome,
    candidato_especialidade: dados.candidatoEspecialidade,
    recrutador_id: dados.recrutadorId,
    recrutador_whatsapp: dados.recrutadorWhatsapp,
  })
}

// ============================================
// CADASTROS
// ============================================

/**
 * Notificar cadastro aprovado
 */
export async function notificarCadastroAprovado(dados) {
  return callN8nWebhook(N8N_WEBHOOKS.CADASTRO_APROVADO, {
    usuario_id: dados.usuarioId,
    nome: dados.nome,
    email: dados.email,
    whatsapp: dados.whatsapp,
    tipo_conta: dados.tipoConta,
    token_id: dados.tokenId,
  })
}

/**
 * Notificar cadastro pendente de aprovacao
 */
export async function notificarCadastroPendente(dados) {
  return callN8nWebhook(N8N_WEBHOOKS.CADASTRO_PENDENTE, {
    usuario_id: dados.usuarioId,
    nome: dados.nome,
    tipo_conta: dados.tipoConta,
    documentos: dados.documentos,
  })
}

// ============================================
// TOKENS DE DESCONTO
// ============================================

/**
 * Validar token de usuario Doutorizze
 */
export async function validarTokenDoutorizze(tokenId, parceiroId) {
  return callN8nWebhook(N8N_WEBHOOKS.TOKEN_VALIDAR, {
    token_id: tokenId,
    parceiro_id: parceiroId,
    validado_em: new Date().toISOString(),
  })
}

/**
 * Gerar token de desconto
 */
export async function gerarTokenDesconto(dados) {
  return callN8nWebhook(N8N_WEBHOOKS.TOKEN_GERAR_DESCONTO, {
    user_token_id: dados.userTokenId,
    parceiro_id: dados.parceiroId,
    parceiro_nome: dados.parceiroNome,
    desconto_percentual: dados.descontoPercentual,
    usuario_nome: dados.usuarioNome,
    usuario_nivel: dados.usuarioNivel,
  })
}

/**
 * Enviar token de desconto via WhatsApp
 */
export async function enviarTokenDesconto(dados) {
  return callN8nWebhook(N8N_WEBHOOKS.TOKEN_ENVIAR_WHATSAPP, {
    numero: dados.numero,
    token_desconto: dados.tokenDesconto,
    desconto_percentual: dados.descontoPercentual,
    parceiro_nome: dados.parceiroNome,
    validade: dados.validade,
    usuario_nome: dados.usuarioNome,
  })
}

// ============================================
// COMPARADOR DE PRECOS
// ============================================

/**
 * Buscar precos em marketplaces externos
 */
export async function buscarPrecosExternos(dados) {
  return callN8nWebhook(
    N8N_WEBHOOKS.COMPARADOR_BUSCAR,
    {
      produto: dados.produto,
      categoria: dados.categoria,
      marketplaces: dados.marketplaces || ["mercadolivre", "olx"],
      limite: dados.limite || 10,
    },
    { timeout: 60000 },
  ) // Timeout maior para scraping
}

// ============================================
// NOTIFICACOES
// ============================================

/**
 * Enviar push notification
 */
export async function enviarPushNotification(dados) {
  return callN8nWebhook(N8N_WEBHOOKS.PUSH_NOTIFICATION, {
    usuario_id: dados.usuarioId,
    titulo: dados.titulo,
    mensagem: dados.mensagem,
    tipo: dados.tipo,
    dados: dados.payload,
    url_acao: dados.urlAcao,
  })
}

/**
 * Enviar email de notificacao
 */
export async function enviarEmailNotificacao(dados) {
  return callN8nWebhook(N8N_WEBHOOKS.EMAIL_NOTIFICACAO, {
    destinatario: dados.email,
    nome: dados.nome,
    assunto: dados.assunto,
    template: dados.template,
    variaveis: dados.variaveis,
  })
}

// ============================================
// EXPORT DEFAULT
// ============================================

export default {
  // WhatsApp
  enviarWhatsAppConfirmacao,
  enviarWhatsAppNotificacao,
  enviarWhatsAppLembrete,

  // Vagas
  notificarNovaVaga,
  notificarNovaSubstituicao,
  notificarCandidaturaRecebida,

  // Cadastros
  notificarCadastroAprovado,
  notificarCadastroPendente,

  // Tokens
  validarTokenDoutorizze,
  gerarTokenDesconto,
  enviarTokenDesconto,

  // Comparador
  buscarPrecosExternos,

  // Notificacoes
  enviarPushNotification,
  enviarEmailNotificacao,
}
