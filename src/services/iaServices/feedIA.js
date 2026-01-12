/**
 * FEED IA SERVICE
 * Filtra e prioriza conteudo do feed
 * Personalizado por area, regiao e preferencias
 */

// Storage keys
const STORAGE_KEY_PREFS = "doutorizze_feed_prefs"
const STORAGE_KEY_HISTORY = "doutorizze_feed_history"
const STORAGE_KEY_CACHE = "doutorizze_feed_cache"

// Configuracoes
const CONFIG = {
  MAX_ITEMS_FEED: 50,
  URGENTE_BOOST: 50, // Bonus de score para urgentes
  REGIAO_BOOST: 30, // Bonus para mesma regiao
  AREA_BOOST: 40, // Bonus para mesma area
  RECENCIA_PESO: 0.3, // Peso da recencia no score
  RELEVANCIA_PESO: 0.7, // Peso da relevancia no score
}

/**
 * Processa e filtra feed para usuario
 * @param {Array} items - Items brutos do feed
 * @param {Object} usuario - Dados do usuario
 * @param {Object} opcoes - Opcoes de filtragem
 * @returns {Array} - Feed processado e ordenado
 */
export function processarFeed(items, usuario, opcoes = {}) {
  if (!items || items.length === 0) return []

  const prefs = getPreferences(usuario.id)
  const history = getHistory(usuario.id)

  // 1. Filtrar por area (odonto/medicina)
  let filtrado = filtrarPorArea(items, usuario.area, prefs)

  // 2. Remover duplicados
  filtrado = removerDuplicados(filtrado)

  // 3. Remover ja visualizados (se opcao ativa)
  if (opcoes.apenasNovos) {
    filtrado = filtrado.filter((item) => !history.vistos?.includes(item.id))
  }

  // 4. Calcular score de relevancia para cada item
  filtrado = filtrado.map((item) => ({
    ...item,
    _score: calcularScoreRelevancia(item, usuario, prefs),
  }))

  // 5. Ordenar por score (urgentes primeiro, depois por relevancia)
  filtrado.sort((a, b) => {
    // Urgentes sempre primeiro
    if (a.urgente && !b.urgente) return -1
    if (!a.urgente && b.urgente) return 1
    return b._score - a._score
  })

  // 6. Limitar quantidade
  const limite = opcoes.limite || CONFIG.MAX_ITEMS_FEED
  filtrado = filtrado.slice(0, limite)

  // 7. Destacar urgentes
  filtrado = filtrado.map((item) => ({
    ...item,
    _destaque: item.urgente || item._score >= 80,
  }))

  return filtrado
}

/**
 * Filtra feed por tipo especifico
 * @param {Array} items - Items do feed
 * @param {string} tipo - Tipo a filtrar (ofertas, vagas, produtos, etc)
 * @param {Object} usuario - Dados do usuario
 */
export function filtrarPorTipo(items, tipo, usuario) {
  const filtrado = items.filter((item) => item.tipo === tipo)
  return processarFeed(filtrado, usuario)
}

/**
 * Busca items relevantes por query
 * @param {Array} items - Items do feed
 * @param {string} query - Texto de busca
 * @param {Object} usuario - Dados do usuario
 */
export function buscarNoFeed(items, query, usuario) {
  if (!query || query.length < 2) return []

  const queryLower = query.toLowerCase()
  const palavras = queryLower.split(" ").filter((p) => p.length > 2)

  const comMatch = items.filter((item) => {
    const texto = `${item.titulo} ${item.descricao} ${item.categoria}`.toLowerCase()
    return palavras.some((p) => texto.includes(p))
  })

  return processarFeed(comMatch, usuario)
}

/**
 * Registra interacao do usuario (para aprendizado)
 * @param {string} userId - ID do usuario
 * @param {string} itemId - ID do item
 * @param {string} acao - Tipo de acao (view, click, save, hide)
 */
export function registrarInteracao(userId, itemId, acao) {
  const history = getHistory(userId)

  switch (acao) {
    case "view":
      if (!history.vistos) history.vistos = []
      if (!history.vistos.includes(itemId)) {
        history.vistos.push(itemId)
        // Limitar historico
        if (history.vistos.length > 500) {
          history.vistos = history.vistos.slice(-500)
        }
      }
      break

    case "click":
      if (!history.clicados) history.clicados = []
      history.clicados.push({ id: itemId, timestamp: Date.now() })
      break

    case "save":
      if (!history.salvos) history.salvos = []
      if (!history.salvos.includes(itemId)) {
        history.salvos.push(itemId)
      }
      break

    case "hide":
      if (!history.ocultos) history.ocultos = []
      if (!history.ocultos.includes(itemId)) {
        history.ocultos.push(itemId)
      }
      break
  }

  saveHistory(userId, history)
}

/**
 * Atualiza preferencias do usuario
 * @param {string} userId - ID do usuario
 * @param {Object} novasPrefs - Novas preferencias
 */
export function atualizarPreferencias(userId, novasPrefs) {
  const prefs = getPreferences(userId)
  const atualizado = { ...prefs, ...novasPrefs, updatedAt: Date.now() }
  savePreferences(userId, atualizado)
  return atualizado
}

/**
 * Obtem sugestoes de categorias baseado no historico
 * @param {string} userId - ID do usuario
 */
export function getSugestoesCategorias(userId) {
  const history = getHistory(userId)
  const clicados = history.clicados || []

  // Contar categorias mais clicadas
  const categorias = {}
  clicados.forEach((c) => {
    const cat = c.categoria || "geral"
    categorias[cat] = (categorias[cat] || 0) + 1
  })

  return Object.entries(categorias)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([cat, count]) => ({ categoria: cat, interacoes: count }))
}

/**
 * Obtem estatisticas do feed do usuario
 * @param {string} userId - ID do usuario
 */
export function getEstatisticasFeed(userId) {
  const history = getHistory(userId)

  return {
    totalVistos: (history.vistos || []).length,
    totalClicados: (history.clicados || []).length,
    totalSalvos: (history.salvos || []).length,
    totalOcultos: (history.ocultos || []).length,
    taxaEngajamento: calcularTaxaEngajamento(history),
    categoriasPreferidas: getSugestoesCategorias(userId),
  }
}

// Funcoes auxiliares privadas
function filtrarPorArea(items, areaUsuario, prefs) {
  if (!areaUsuario && !prefs.areas?.length) return items

  const areas = prefs.areas || [areaUsuario]

  return items.filter((item) => {
    // Se item nao tem area definida, mostrar para todos
    if (!item.area) return true
    // Se area do item esta nas preferencias do usuario
    return areas.some((a) => item.area.toLowerCase().includes(a.toLowerCase()))
  })
}

function removerDuplicados(items) {
  const vistos = new Set()
  return items.filter((item) => {
    // Criar chave unica baseada em titulo e tipo
    const chave = `${item.titulo?.toLowerCase()}_${item.tipo}`
    if (vistos.has(chave)) return false
    vistos.add(chave)
    return true
  })
}

function calcularScoreRelevancia(item, usuario, prefs) {
  let score = 50 // Score base

  // Bonus por urgencia
  if (item.urgente) {
    score += CONFIG.URGENTE_BOOST
  }

  // Bonus por mesma regiao
  if (item.regiao && usuario.regiao) {
    if (item.regiao.toLowerCase() === usuario.regiao.toLowerCase()) {
      score += CONFIG.REGIAO_BOOST
    }
  }

  // Bonus por mesma area
  if (item.area && usuario.area) {
    if (item.area.toLowerCase().includes(usuario.area.toLowerCase())) {
      score += CONFIG.AREA_BOOST
    }
  }

  // Bonus por categoria preferida
  const categoriasPrefs = prefs.categorias || []
  if (categoriasPrefs.includes(item.categoria)) {
    score += 20
  }

  // Penalidade por recencia (items antigos perdem pontos)
  const idadeHoras = (Date.now() - new Date(item.createdAt).getTime()) / (1000 * 60 * 60)
  if (idadeHoras > 24) {
    score -= Math.min(30, Math.floor(idadeHoras / 24) * 5)
  }

  // Normalizar entre 0-100
  return Math.max(0, Math.min(100, score))
}

function calcularTaxaEngajamento(history) {
  const vistos = (history.vistos || []).length
  const clicados = (history.clicados || []).length

  if (vistos === 0) return 0
  return Math.round((clicados / vistos) * 100)
}

function getPreferences(userId) {
  try {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEY_PREFS) || "{}")
    return (
      all[userId] || {
        areas: [],
        categorias: [],
        regioes: [],
        mostrarUrgentesFirst: true,
      }
    )
  } catch {
    return {}
  }
}

function savePreferences(userId, prefs) {
  const all = JSON.parse(localStorage.getItem(STORAGE_KEY_PREFS) || "{}")
  all[userId] = prefs
  localStorage.setItem(STORAGE_KEY_PREFS, JSON.stringify(all))
}

function getHistory(userId) {
  try {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEY_HISTORY) || "{}")
    return (
      all[userId] || {
        vistos: [],
        clicados: [],
        salvos: [],
        ocultos: [],
      }
    )
  } catch {
    return {}
  }
}

function saveHistory(userId, history) {
  const all = JSON.parse(localStorage.getItem(STORAGE_KEY_HISTORY) || "{}")
  all[userId] = history
  localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(all))
}

export default {
  processarFeed,
  filtrarPorTipo,
  buscarNoFeed,
  registrarInteracao,
  atualizarPreferencias,
  getSugestoesCategorias,
  getEstatisticasFeed,
}
