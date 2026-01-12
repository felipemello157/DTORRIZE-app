/**
 * IA ORCHESTRATOR SERVICE
 * Centraliza chamadas as IAs
 * Logging de uso
 * Fallbacks se IA falhar
 * Metricas de precisao
 */

import radarIA from "./iaServices/radarIA"
import precosIA from "./iaServices/precosIA"
import notificacoesIA from "./iaServices/notificacoesIA"
import matchingIA from "./iaServices/matchingIA"
import feedIA from "./iaServices/feedIA"
import buscaIA from "./iaServices/buscaIA"

// Storage keys
const STORAGE_KEY_LOGS = "doutorizze_ia_logs"
const STORAGE_KEY_METRICS = "doutorizze_ia_metrics"

// Configuracao das IAs
const IA_CONFIG = {
  radar: {
    nome: "IA Radar",
    service: radarIA,
    timeout: 10000,
    retries: 2,
  },
  precos: {
    nome: "IA de Precos",
    service: precosIA,
    timeout: 5000,
    retries: 1,
  },
  notificacoes: {
    nome: "IA de Notificacoes",
    service: notificacoesIA,
    timeout: 3000,
    retries: 1,
  },
  matching: {
    nome: "IA de Matching",
    service: matchingIA,
    timeout: 5000,
    retries: 1,
  },
  feed: {
    nome: "IA do Feed",
    service: feedIA,
    timeout: 3000,
    retries: 1,
  },
  busca: {
    nome: "IA de Busca",
    service: buscaIA,
    timeout: 2000,
    retries: 1,
  },
}

/**
 * Executa uma funcao de IA com logging e fallback
 * @param {string} iaName - Nome da IA (radar, precos, etc)
 * @param {string} funcao - Nome da funcao a executar
 * @param {Array} args - Argumentos da funcao
 * @param {Object} opcoes - Opcoes extras
 * @returns {Promise<Object>} - Resultado da IA
 */
export async function executarIA(iaName, funcao, args = [], opcoes = {}) {
  const config = IA_CONFIG[iaName]

  if (!config) {
    return { success: false, error: `IA '${iaName}' nao encontrada` }
  }

  const service = config.service
  const fn = service[funcao]

  if (!fn) {
    return { success: false, error: `Funcao '${funcao}' nao encontrada em ${iaName}` }
  }

  const inicio = Date.now()
  let tentativas = 0
  let ultimoErro = null

  // Tentar com retries
  while (tentativas <= config.retries) {
    try {
      // Executar com timeout
      const resultado = await Promise.race([
        fn.apply(service, args),
        new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), config.timeout)),
      ])

      // Logar sucesso
      const tempo = Date.now() - inicio
      logExecucao(iaName, funcao, true, tempo, tentativas)

      // Atualizar metricas
      atualizarMetricas(iaName, funcao, true, tempo)

      return {
        success: true,
        data: resultado,
        meta: {
          ia: iaName,
          funcao,
          tempoMs: tempo,
          tentativas: tentativas + 1,
        },
      }
    } catch (error) {
      ultimoErro = error
      tentativas++

      // Logar falha
      logExecucao(iaName, funcao, false, Date.now() - inicio, tentativas, error.message)

      // Aguardar antes de retry
      if (tentativas <= config.retries) {
        await sleep(500 * tentativas)
      }
    }
  }

  // Todas tentativas falharam
  atualizarMetricas(iaName, funcao, false, Date.now() - inicio)

  // Tentar fallback se disponivel
  const fallback = opcoes.fallback
  if (fallback) {
    return {
      success: true,
      data: typeof fallback === "function" ? fallback() : fallback,
      meta: {
        ia: iaName,
        funcao,
        usouFallback: true,
        erro: ultimoErro?.message,
      },
    }
  }

  return {
    success: false,
    error: ultimoErro?.message || "Erro desconhecido",
    meta: {
      ia: iaName,
      funcao,
      tentativas,
    },
  }
}

// Atalhos para cada IA
export const radar = {
  buscar: (userId, filters) => executarIA("radar", "searchRadarMatches", [userId, filters]),
  salvarPrefs: (userId, prefs) => executarIA("radar", "savePreferences", [userId, prefs]),
  toggle: (userId, ativo) => executarIA("radar", "toggleRadar", [userId, ativo]),
}

export const precos = {
  analisar: (categoria, regiao) => executarIA("precos", "analisarPrecos", [categoria, regiao]),
  sugerirVenda: (categoria, regiao, condicao) =>
    executarIA("precos", "sugerirPrecoVenda", [categoria, regiao, condicao]),
  avaliarOferta: (preco, categoria, regiao) => executarIA("precos", "avaliarOferta", [preco, categoria, regiao]),
}

export const notificacoes = {
  processar: (notif, userId) => executarIA("notificacoes", "processarNotificacao", [notif, userId]),
  aprenderPadrao: (userId, acao, ctx) => executarIA("notificacoes", "aprenderPadrao", [userId, acao, ctx]),
  getHorariosIdeais: (userId) => executarIA("notificacoes", "getHorariosIdeais", [userId]),
  processarFila: (userId) => executarIA("notificacoes", "processarFila", [userId]),
}

export const matching = {
  calcular: (profissional, vaga) => executarIA("matching", "calcularMatch", [profissional, vaga]),
  rankearProfissionais: (profissionais, vaga, opcoes) =>
    executarIA("matching", "rankearProfissionais", [profissionais, vaga, opcoes]),
  rankearVagas: (profissional, vagas, opcoes) => executarIA("matching", "rankearVagas", [profissional, vagas, opcoes]),
  encontrarIdeais: (vaga, profissionais) => executarIA("matching", "encontrarMatchesIdeais", [vaga, profissionais]),
}

export const feed = {
  processar: (items, usuario, opcoes) => executarIA("feed", "processarFeed", [items, usuario, opcoes]),
  filtrarPorTipo: (items, tipo, usuario) => executarIA("feed", "filtrarPorTipo", [items, tipo, usuario]),
  buscar: (items, query, usuario) => executarIA("feed", "buscarNoFeed", [items, query, usuario]),
  registrarInteracao: (userId, itemId, acao) => executarIA("feed", "registrarInteracao", [userId, itemId, acao]),
}

export const busca = {
  buscar: (query, dados, opcoes) => executarIA("busca", "buscar", [query, dados, opcoes]),
  getSugestoes: (queryParcial, opcoes) => executarIA("busca", "getSugestoes", [queryParcial, opcoes]),
  getPopulares: () => executarIA("busca", "getSugestoesPopulares", []),
}

/**
 * Obtem metricas de todas as IAs
 * @returns {Object} - Metricas consolidadas
 */
export function getMetricas() {
  try {
    const metricas = JSON.parse(localStorage.getItem(STORAGE_KEY_METRICS) || "{}")

    const consolidado = {}
    for (const [iaName, config] of Object.entries(IA_CONFIG)) {
      const iaMetrics = metricas[iaName] || {}
      const totalChamadas = (iaMetrics.sucesso || 0) + (iaMetrics.falha || 0)

      consolidado[iaName] = {
        nome: config.nome,
        chamadas: totalChamadas,
        sucesso: iaMetrics.sucesso || 0,
        falha: iaMetrics.falha || 0,
        taxaSucesso: totalChamadas > 0 ? Math.round((iaMetrics.sucesso / totalChamadas) * 100) : 100,
        tempoMedio: iaMetrics.tempoTotal ? Math.round(iaMetrics.tempoTotal / totalChamadas) : 0,
      }
    }

    return consolidado
  } catch {
    return {}
  }
}

/**
 * Obtem logs de execucao
 * @param {Object} filtros - Filtros opcionais
 * @returns {Array} - Lista de logs
 */
export function getLogs(filtros = {}) {
  try {
    let logs = JSON.parse(localStorage.getItem(STORAGE_KEY_LOGS) || "[]")

    if (filtros.ia) {
      logs = logs.filter((l) => l.ia === filtros.ia)
    }
    if (filtros.sucesso !== undefined) {
      logs = logs.filter((l) => l.sucesso === filtros.sucesso)
    }
    if (filtros.limite) {
      logs = logs.slice(-filtros.limite)
    }

    return logs
  } catch {
    return []
  }
}

/**
 * Limpa logs e metricas
 */
export function limparDados() {
  localStorage.removeItem(STORAGE_KEY_LOGS)
  localStorage.removeItem(STORAGE_KEY_METRICS)
}

/**
 * Verifica saude de todas as IAs
 * @returns {Object} - Status de cada IA
 */
export async function healthCheck() {
  const status = {}

  for (const [iaName, config] of Object.entries(IA_CONFIG)) {
    try {
      const inicio = Date.now()
      // Verificar se servico existe e tem funcoes
      const temFuncoes = Object.keys(config.service).length > 0

      status[iaName] = {
        nome: config.nome,
        disponivel: temFuncoes,
        tempoResposta: Date.now() - inicio,
        funcoes: Object.keys(config.service),
      }
    } catch (error) {
      status[iaName] = {
        nome: config.nome,
        disponivel: false,
        erro: error.message,
      }
    }
  }

  return status
}

// Funcoes auxiliares privadas
function logExecucao(ia, funcao, sucesso, tempo, tentativas, erro = null) {
  try {
    const logs = JSON.parse(localStorage.getItem(STORAGE_KEY_LOGS) || "[]")

    logs.push({
      ia,
      funcao,
      sucesso,
      tempo,
      tentativas,
      erro,
      timestamp: Date.now(),
    })

    // Manter apenas ultimos 500 logs
    const recentes = logs.slice(-500)
    localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(recentes))
  } catch (error) {
    console.error("[IAOrchestrator] Erro ao logar:", error)
  }
}

function atualizarMetricas(ia, funcao, sucesso, tempo) {
  try {
    const metricas = JSON.parse(localStorage.getItem(STORAGE_KEY_METRICS) || "{}")

    if (!metricas[ia]) {
      metricas[ia] = { sucesso: 0, falha: 0, tempoTotal: 0 }
    }

    if (sucesso) {
      metricas[ia].sucesso++
    } else {
      metricas[ia].falha++
    }
    metricas[ia].tempoTotal += tempo

    localStorage.setItem(STORAGE_KEY_METRICS, JSON.stringify(metricas))
  } catch (error) {
    console.error("[IAOrchestrator] Erro ao atualizar metricas:", error)
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export default {
  executarIA,
  radar,
  precos,
  notificacoes,
  matching,
  feed,
  busca,
  getMetricas,
  getLogs,
  limparDados,
  healthCheck,
}
