/**
 * NOTIFICACOES IA SERVICE
 * Aprende horarios de abertura do usuario
 * Agrupa notificacoes similares
 * Prioriza por tipo
 */

import { sendPushToUser } from "@/services/pushService"

// Storage keys
const STORAGE_KEY_PATTERNS = "doutorizze_notif_patterns"
const STORAGE_KEY_QUEUE = "doutorizze_notif_queue"
const STORAGE_KEY_PREFS = "doutorizze_notif_prefs"

// Prioridades de notificacao (maior = mais urgente)
const PRIORIDADES = {
  URGENTE: 100,
  VAGA_ACEITA: 90,
  PAGAMENTO: 85,
  CANDIDATURA: 70,
  MATCH: 60,
  MENSAGEM: 50,
  OFERTA: 40,
  GERAL: 10,
}

/**
 * Processa uma notificacao com IA
 * @param {Object} notificacao - Notificacao a processar
 * @param {string} userId - ID do usuario
 */
export async function processarNotificacao(notificacao, userId) {
  // 1. Verificar se usuario esta em horario de silencio
  const patterns = getPatterns(userId)
  const agora = new Date()
  const horaAtual = agora.getHours()

  // Se esta em horario de silencio, adicionar a fila
  if (isHorarioSilencio(patterns, horaAtual)) {
    return adicionarFila(notificacao, userId)
  }

  // 2. Verificar se pode agrupar com outras
  const notifAgrupada = tentarAgrupar(notificacao, userId)

  // 3. Priorizar
  const prioridade = calcularPrioridade(notifAgrupada)

  // 4. Enviar se prioridade alta ou horario ideal
  if (prioridade >= PRIORIDADES.CANDIDATURA || isHorarioIdeal(patterns, horaAtual)) {
    await enviarNotificacao(notifAgrupada, userId)
    registrarAbertura(userId, horaAtual)
    return { enviada: true, agrupada: notifAgrupada.agrupada }
  }

  // 5. Senao, adicionar a fila para proximo horario ideal
  return adicionarFila(notifAgrupada, userId)
}

/**
 * Aprende padroes de uso do usuario
 * @param {string} userId - ID do usuario
 * @param {string} acao - Acao realizada (abertura, clique, dismiss)
 * @param {Object} contexto - Contexto da acao
 */
export function aprenderPadrao(userId, acao, contexto = {}) {
  const patterns = getPatterns(userId)
  const agora = new Date()
  const hora = agora.getHours()
  const diaSemana = agora.getDay()

  if (acao === "abertura") {
    // Registrar horario de abertura
    if (!patterns.horariosAbertura) patterns.horariosAbertura = {}
    if (!patterns.horariosAbertura[hora]) patterns.horariosAbertura[hora] = 0
    patterns.horariosAbertura[hora]++

    // Registrar dia da semana
    if (!patterns.diasAtivos) patterns.diasAtivos = {}
    if (!patterns.diasAtivos[diaSemana]) patterns.diasAtivos[diaSemana] = 0
    patterns.diasAtivos[diaSemana]++
  }

  if (acao === "clique") {
    // Registrar tipo de notificacao que gera engajamento
    const tipo = contexto.tipo || "geral"
    if (!patterns.engajamento) patterns.engajamento = {}
    if (!patterns.engajamento[tipo]) patterns.engajamento[tipo] = 0
    patterns.engajamento[tipo]++
  }

  if (acao === "dismiss") {
    // Registrar horarios de dismiss (para evitar)
    if (!patterns.horariosEvitar) patterns.horariosEvitar = {}
    if (!patterns.horariosEvitar[hora]) patterns.horariosEvitar[hora] = 0
    patterns.horariosEvitar[hora]++
  }

  patterns.ultimaAtualizacao = Date.now()
  salvarPatterns(userId, patterns)
}

/**
 * Obtem horarios ideais para notificar usuario
 * @param {string} userId - ID do usuario
 * @returns {Array} - Lista de horarios ideais (0-23)
 */
export function getHorariosIdeais(userId) {
  const patterns = getPatterns(userId)
  const horariosAbertura = patterns.horariosAbertura || {}
  const horariosEvitar = patterns.horariosEvitar || {}

  // Calcular score para cada hora
  const scores = []
  for (let h = 0; h < 24; h++) {
    const aberturas = horariosAbertura[h] || 0
    const evitar = horariosEvitar[h] || 0
    scores.push({
      hora: h,
      score: aberturas - evitar * 2, // Penalizar horarios de dismiss
    })
  }

  // Ordenar por score e retornar top 5
  return scores
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .filter((s) => s.score > 0)
    .map((s) => s.hora)
}

/**
 * Processa fila de notificacoes pendentes
 * @param {string} userId - ID do usuario
 */
export async function processarFila(userId) {
  const fila = getFila(userId)
  const patterns = getPatterns(userId)
  const horaAtual = new Date().getHours()

  if (fila.length === 0) return { processadas: 0 }

  // Verificar se e horario ideal
  if (!isHorarioIdeal(patterns, horaAtual)) {
    return { processadas: 0, mensagem: "Aguardando horario ideal" }
  }

  // Agrupar notificacoes similares
  const agrupadas = agruparNotificacoes(fila)

  // Enviar cada grupo
  let processadas = 0
  for (const grupo of agrupadas) {
    await enviarNotificacao(grupo, userId)
    processadas++
  }

  // Limpar fila
  limparFila(userId)

  return { processadas, total: fila.length }
}

/**
 * Configura horario de silencio
 * @param {string} userId - ID do usuario
 * @param {number} inicio - Hora de inicio (0-23)
 * @param {number} fim - Hora de fim (0-23)
 */
export function configurarHorarioSilencio(userId, inicio, fim) {
  const prefs = getPrefs(userId)
  prefs.silencio = { inicio, fim, ativo: true }
  salvarPrefs(userId, prefs)
}

/**
 * Obtem estatisticas de notificacoes
 * @param {string} userId - ID do usuario
 */
export function getEstatisticas(userId) {
  const patterns = getPatterns(userId)
  const horariosIdeais = getHorariosIdeais(userId)

  const totalAberturas = Object.values(patterns.horariosAbertura || {}).reduce((a, b) => a + b, 0)

  const engajamento = patterns.engajamento || {}
  const tipoMaisEngajado = Object.entries(engajamento).sort((a, b) => b[1] - a[1])[0]

  return {
    horariosIdeais,
    totalAberturas,
    tipoMaisEngajado: tipoMaisEngajado ? tipoMaisEngajado[0] : null,
    diasAtivos: Object.keys(patterns.diasAtivos || {}).length,
    ultimaAtualizacao: patterns.ultimaAtualizacao,
  }
}

// Funcoes auxiliares privadas
function getPatterns(userId) {
  try {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEY_PATTERNS) || "{}")
    return (
      all[userId] || {
        horariosAbertura: {},
        horariosEvitar: {},
        diasAtivos: {},
        engajamento: {},
      }
    )
  } catch {
    return {}
  }
}

function salvarPatterns(userId, patterns) {
  const all = JSON.parse(localStorage.getItem(STORAGE_KEY_PATTERNS) || "{}")
  all[userId] = patterns
  localStorage.setItem(STORAGE_KEY_PATTERNS, JSON.stringify(all))
}

function getPrefs(userId) {
  try {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEY_PREFS) || "{}")
    return all[userId] || {}
  } catch {
    return {}
  }
}

function salvarPrefs(userId, prefs) {
  const all = JSON.parse(localStorage.getItem(STORAGE_KEY_PREFS) || "{}")
  all[userId] = prefs
  localStorage.setItem(STORAGE_KEY_PREFS, JSON.stringify(all))
}

function getFila(userId) {
  try {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEY_QUEUE) || "{}")
    return all[userId] || []
  } catch {
    return []
  }
}

function adicionarFila(notificacao, userId) {
  const all = JSON.parse(localStorage.getItem(STORAGE_KEY_QUEUE) || "{}")
  if (!all[userId]) all[userId] = []
  all[userId].push({
    ...notificacao,
    filaTimestamp: Date.now(),
  })
  localStorage.setItem(STORAGE_KEY_QUEUE, JSON.stringify(all))
  return { enviada: false, naFila: true }
}

function limparFila(userId) {
  const all = JSON.parse(localStorage.getItem(STORAGE_KEY_QUEUE) || "{}")
  all[userId] = []
  localStorage.setItem(STORAGE_KEY_QUEUE, JSON.stringify(all))
}

function isHorarioSilencio(patterns, hora) {
  const prefs = patterns.silencio
  if (!prefs || !prefs.ativo) return false

  const { inicio, fim } = prefs
  if (inicio < fim) {
    return hora >= inicio && hora < fim
  } else {
    // Horario que passa da meia-noite (ex: 22h - 7h)
    return hora >= inicio || hora < fim
  }
}

function isHorarioIdeal(patterns, hora) {
  const horariosAbertura = patterns.horariosAbertura || {}
  const horariosEvitar = patterns.horariosEvitar || {}

  // Se nao tem dados, qualquer horario comercial e ok
  if (Object.keys(horariosAbertura).length === 0) {
    return hora >= 8 && hora <= 20
  }

  const aberturas = horariosAbertura[hora] || 0
  const evitar = horariosEvitar[hora] || 0

  return aberturas > evitar
}

function calcularPrioridade(notificacao) {
  const tipo = notificacao.tipo || "geral"
  return PRIORIDADES[tipo.toUpperCase()] || PRIORIDADES.GERAL
}

function tentarAgrupar(notificacao, userId) {
  const fila = getFila(userId)
  const similares = fila.filter(
    (n) => n.tipo === notificacao.tipo && Date.now() - n.filaTimestamp < 300000, // 5 minutos
  )

  if (similares.length > 0) {
    return {
      ...notificacao,
      agrupada: true,
      quantidade: similares.length + 1,
      titulo: `${similares.length + 1} novas ${notificacao.tipo}`,
    }
  }

  return notificacao
}

function agruparNotificacoes(fila) {
  const grupos = {}

  fila.forEach((notif) => {
    const tipo = notif.tipo || "geral"
    if (!grupos[tipo]) {
      grupos[tipo] = { ...notif, quantidade: 0, ids: [] }
    }
    grupos[tipo].quantidade++
    grupos[tipo].ids.push(notif.id)
  })

  return Object.values(grupos).map((g) => ({
    ...g,
    titulo: g.quantidade > 1 ? `${g.quantidade} ${g.tipo}` : g.titulo,
    agrupada: g.quantidade > 1,
  }))
}

async function enviarNotificacao(notificacao, userId) {
  try {
    await sendPushToUser(userId, {
      title: notificacao.titulo,
      body: notificacao.mensagem,
      data: notificacao.data,
      tag: notificacao.tipo, // Agrupa no SO
    })
  } catch (error) {
    console.error("[NotificacoesIA] Erro ao enviar:", error)
  }
}

function registrarAbertura(userId, hora) {
  aprenderPadrao(userId, "abertura", { hora })
}

export default {
  processarNotificacao,
  aprenderPadrao,
  getHorariosIdeais,
  processarFila,
  configurarHorarioSilencio,
  getEstatisticas,
}
