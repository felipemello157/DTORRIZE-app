/**
 * DISCOUNT TOKEN SERVICE
 * Sistema completo de gerenciamento de tokens de desconto DESC-
 *
 * Funcionalidades:
 * - Gerar tokens com tipo, percentual e validade
 * - Validar tokens antes do uso
 * - Marcar token como usado
 * - Listar tokens ativos
 * - Verificar expiracao
 */

// Tipos de token disponíveis
export const TOKEN_TYPES = {
  PRIMEIRO_USO: {
    id: "PRIMEIRO_USO",
    label: "Primeiro Uso",
    percentualPadrao: 10,
    diasValidade: 30,
    description: "Desconto especial para novos usuários",
  },
  INDICACAO: {
    id: "INDICACAO",
    label: "Indicação",
    percentualPadrao: 15,
    diasValidade: 14,
    description: "Bônus por indicar um amigo",
  },
  PROMOCAO: {
    id: "PROMOCAO",
    label: "Promoção",
    percentualPadrao: 20,
    diasValidade: 7,
    description: "Promoção por tempo limitado",
  },
  FIDELIDADE: {
    id: "FIDELIDADE",
    label: "Fidelidade",
    percentualPadrao: 25,
    diasValidade: 60,
    description: "Recompensa por fidelidade",
  },
  PARCEIRO: {
    id: "PARCEIRO",
    label: "Parceiro",
    percentualPadrao: 15,
    diasValidade: 3, // 72 horas
    description: "Desconto via parceiro Doutorizze",
  },
}

// Storage key para localStorage (fallback quando não há backend)
const STORAGE_KEY = "doutorizze_discount_tokens"

/**
 * Gera um novo token de desconto
 */
export function generateToken(userId, tipo, percentual = null, diasValidade = null) {
  const tokenType = TOKEN_TYPES[tipo] || TOKEN_TYPES.PROMOCAO

  const token = {
    id: `token_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
    token: `DESC-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
    user_id: userId,
    tipo: tipo,
    percentual: percentual || tokenType.percentualPadrao,
    valor_maximo: calcularValorMaximo(percentual || tokenType.percentualPadrao),
    usado: false,
    usado_em: null,
    usado_em_parceiro: null,
    valor_economizado: null,
    criado_em: new Date().toISOString(),
    expira_em: calcularExpiracao(diasValidade || tokenType.diasValidade),
  }

  // Salvar no storage local
  const tokens = getStoredTokens()
  tokens.push(token)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tokens))

  return token
}

/**
 * Calcula valor máximo de desconto baseado no percentual
 */
function calcularValorMaximo(percentual) {
  // R$50 base + R$10 por cada 5% de desconto
  return 50 + Math.floor(percentual / 5) * 10
}

/**
 * Calcula data de expiração
 */
function calcularExpiracao(diasValidade) {
  const expira = new Date()
  expira.setDate(expira.getDate() + diasValidade)
  return expira.toISOString()
}

/**
 * Valida um token antes do uso
 */
export function validateToken(tokenString) {
  const tokens = getStoredTokens()
  const token = tokens.find((t) => t.token === tokenString)

  if (!token) {
    return {
      valid: false,
      error: "TOKEN_NAO_ENCONTRADO",
      message: "Token não encontrado no sistema",
    }
  }

  if (token.usado) {
    return {
      valid: false,
      error: "TOKEN_JA_USADO",
      message: "Este token já foi utilizado",
      usado_em: token.usado_em,
      usado_em_parceiro: token.usado_em_parceiro,
    }
  }

  if (isExpired(token)) {
    return {
      valid: false,
      error: "TOKEN_EXPIRADO",
      message: "Este token expirou",
      expira_em: token.expira_em,
    }
  }

  // Token válido
  const diasRestantes = getDiasRestantes(token)

  return {
    valid: true,
    token: token,
    percentual: token.percentual,
    valor_maximo: token.valor_maximo,
    tipo: token.tipo,
    tipo_label: TOKEN_TYPES[token.tipo]?.label || token.tipo,
    dias_restantes: diasRestantes,
    expira_em: token.expira_em,
    alerta_expiracao: diasRestantes <= 3,
    urgente: diasRestantes <= 1,
  }
}

/**
 * Marca um token como usado
 */
export function useToken(tokenString, valorCompra, parceiroNome = null) {
  const validation = validateToken(tokenString)

  if (!validation.valid) {
    return validation
  }

  const token = validation.token
  const valorDesconto = Math.min(valorCompra * (token.percentual / 100), token.valor_maximo)

  // Atualizar token no storage
  const tokens = getStoredTokens()
  const index = tokens.findIndex((t) => t.token === tokenString)

  if (index !== -1) {
    tokens[index] = {
      ...tokens[index],
      usado: true,
      usado_em: new Date().toISOString(),
      usado_em_parceiro: parceiroNome,
      valor_economizado: valorDesconto,
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tokens))
  }

  return {
    success: true,
    valor_original: valorCompra,
    valor_desconto: valorDesconto,
    valor_final: valorCompra - valorDesconto,
    percentual_aplicado: token.percentual,
    message: `Desconto de ${token.percentual}% aplicado! Você economizou R$ ${valorDesconto.toFixed(2)}`,
  }
}

/**
 * Lista tokens ativos (não usados e não expirados) de um usuário
 */
export function getActiveTokens(userId) {
  const tokens = getStoredTokens()

  return tokens
    .filter((t) => t.user_id === userId && !t.usado && !isExpired(t))
    .map((t) => ({
      ...t,
      dias_restantes: getDiasRestantes(t),
      alerta_expiracao: getDiasRestantes(t) <= 3,
      urgente: getDiasRestantes(t) <= 1,
      tipo_label: TOKEN_TYPES[t.tipo]?.label || t.tipo,
    }))
    .sort((a, b) => new Date(a.expira_em) - new Date(b.expira_em))
}

/**
 * Lista todos os tokens de um usuário (histórico completo)
 */
export function getAllTokens(userId) {
  const tokens = getStoredTokens()

  return tokens
    .filter((t) => t.user_id === userId)
    .map((t) => ({
      ...t,
      status: t.usado ? "USADO" : isExpired(t) ? "EXPIRADO" : "ATIVO",
      dias_restantes: isExpired(t) ? 0 : getDiasRestantes(t),
      tipo_label: TOKEN_TYPES[t.tipo]?.label || t.tipo,
    }))
    .sort((a, b) => new Date(b.criado_em) - new Date(a.criado_em))
}

/**
 * Verifica se um token está expirado
 */
export function isExpired(token) {
  if (typeof token === "string") {
    const tokens = getStoredTokens()
    token = tokens.find((t) => t.token === token)
    if (!token) return true
  }

  return new Date(token.expira_em) < new Date()
}

/**
 * Calcula dias restantes para expiração
 */
export function getDiasRestantes(token) {
  const agora = new Date()
  const expira = new Date(token.expira_em)
  const diff = expira - agora

  if (diff <= 0) return 0

  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

/**
 * Calcula horas restantes para expiração
 */
export function getHorasRestantes(token) {
  const agora = new Date()
  const expira = new Date(token.expira_em)
  const diff = expira - agora

  if (diff <= 0) return 0

  return Math.ceil(diff / (1000 * 60 * 60))
}

/**
 * Busca tokens que vão expirar em X dias
 */
export function getTokensExpiringSoon(userId, dias = 3) {
  const tokens = getActiveTokens(userId)
  return tokens.filter((t) => t.dias_restantes <= dias)
}

/**
 * Expira tokens manualmente (para cron job)
 */
export function expireOldTokens() {
  const tokens = getStoredTokens()
  const agora = new Date()
  let expirados = 0

  const tokensAtualizados = tokens.map((t) => {
    if (!t.usado && new Date(t.expira_em) < agora && t.status !== "EXPIRADO") {
      expirados++
      return { ...t, status: "EXPIRADO" }
    }
    return t
  })

  localStorage.setItem(STORAGE_KEY, JSON.stringify(tokensAtualizados))

  return { expirados, total: tokens.length }
}

/**
 * Busca tokens do storage local
 */
function getStoredTokens() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

/**
 * Formata tempo restante para exibição
 */
export function formatTempoRestante(token) {
  const horas = getHorasRestantes(token)

  if (horas <= 0) return "Expirado"
  if (horas < 24) return `${horas}h restantes`

  const dias = Math.floor(horas / 24)
  return dias === 1 ? "1 dia restante" : `${dias} dias restantes`
}

/**
 * Calcula economia total do usuário com tokens
 */
export function getEconomiaTotal(userId) {
  const tokens = getStoredTokens()

  return tokens
    .filter((t) => t.user_id === userId && t.usado && t.valor_economizado)
    .reduce((total, t) => total + t.valor_economizado, 0)
}

// Export default com todas as funções
export default {
  TOKEN_TYPES,
  generateToken,
  validateToken,
  useToken,
  getActiveTokens,
  getAllTokens,
  isExpired,
  getDiasRestantes,
  getHorasRestantes,
  getTokensExpiringSoon,
  expireOldTokens,
  formatTempoRestante,
  getEconomiaTotal,
}
