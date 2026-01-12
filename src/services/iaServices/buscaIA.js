/**
 * BUSCA IA SERVICE
 * Busca semantica com correcao de erros
 * Sugestoes baseadas em historico
 * Cache de buscas frequentes
 */

// Storage keys
const STORAGE_KEY_HISTORY = "doutorizze_busca_history"
const STORAGE_KEY_CACHE = "doutorizze_busca_cache"

// Dicionario de sinonimos para busca semantica
const SINONIMOS = {
  dentista: ["odonto", "odontologia", "dental", "dente"],
  medico: ["medicina", "clinico", "doutor", "dr"],
  equipamento: ["aparelho", "maquina", "instrumento", "device"],
  material: ["insumo", "consumivel", "produto"],
  urgente: ["emergencia", "rapido", "imediato", "hoje"],
  barato: ["promocao", "desconto", "economico", "oferta"],
  novo: ["lacrado", "zerado", "original"],
  usado: ["seminovo", "segunda mao", "desapego"],
  vaga: ["emprego", "trabalho", "oportunidade", "job"],
  curso: ["treinamento", "capacitacao", "workshop", "aula"],
  implante: ["implantodontia", "osseointegrado"],
  ortodontia: ["aparelho", "braquete", "alinhador"],
  protese: ["coroa", "faceta", "lente"],
  "raio-x": ["radiografia", "rx", "tomografia"],
}

// Correcoes comuns de digitacao
const CORRECOES = {
  denstista: "dentista",
  odontoligia: "odontologia",
  eqipamento: "equipamento",
  equipamneto: "equipamento",
  matrial: "material",
  vagaa: "vaga",
  inplante: "implante",
  ortoontia: "ortodontia",
  protesse: "protese",
}

/**
 * Realiza busca inteligente
 * @param {string} query - Texto de busca
 * @param {Array} dados - Dados para buscar
 * @param {Object} opcoes - Opcoes de busca
 * @returns {Object} - Resultados e metadados
 */
export function buscar(query, dados, opcoes = {}) {
  if (!query || query.length < 2) {
    return { resultados: [], sugestoes: getSugestoesPopulares() }
  }

  const inicio = Date.now()

  // 1. Corrigir erros de digitacao
  const queryCorrigida = corrigirQuery(query)

  // 2. Expandir com sinonimos
  const queryExpandida = expandirComSinonimos(queryCorrigida)

  // 3. Verificar cache
  const cacheKey = queryExpandida.join("_")
  const cached = getCache(cacheKey)
  if (cached && !opcoes.ignorarCache) {
    return {
      ...cached,
      fromCache: true,
      tempoMs: Date.now() - inicio,
    }
  }

  // 4. Buscar nos dados
  const resultados = buscarNoDados(queryExpandida, dados, opcoes)

  // 5. Ranquear por relevancia
  const ranqueados = ranquearResultados(resultados, queryCorrigida)

  // 6. Gerar sugestoes relacionadas
  const sugestoes = gerarSugestoes(queryCorrigida, ranqueados)

  // 7. Salvar no cache e historico
  const resultado = {
    query: query,
    queryCorrigida: queryCorrigida !== query ? queryCorrigida : null,
    queryExpandida,
    resultados: ranqueados,
    total: ranqueados.length,
    sugestoes,
    tempoMs: Date.now() - inicio,
  }

  setCache(cacheKey, resultado)
  salvarHistorico(query)

  return resultado
}

/**
 * Obtem sugestoes de busca baseadas no que o usuario digitou
 * @param {string} queryParcial - Query parcial digitada
 * @param {Object} opcoes - Opcoes
 * @returns {Array} - Lista de sugestoes
 */
export function getSugestoes(queryParcial, opcoes = {}) {
  if (!queryParcial || queryParcial.length < 2) {
    return getSugestoesPopulares()
  }

  const query = queryParcial.toLowerCase()
  const sugestoes = []

  // 1. Do historico do usuario
  const historico = getHistorico()
  const doHistorico = historico.filter((h) => h.toLowerCase().startsWith(query)).slice(0, 3)
  sugestoes.push(...doHistorico.map((s) => ({ texto: s, tipo: "historico" })))

  // 2. Completar com sinonimos
  for (const [termo, sins] of Object.entries(SINONIMOS)) {
    if (termo.startsWith(query)) {
      sugestoes.push({ texto: termo, tipo: "sugestao" })
    }
    sins.forEach((s) => {
      if (s.startsWith(query)) {
        sugestoes.push({ texto: s, tipo: "sinonimo", relacionado: termo })
      }
    })
  }

  // 3. Correcoes se parecer erro
  const correcao = corrigirQuery(queryParcial)
  if (correcao !== queryParcial) {
    sugestoes.unshift({ texto: correcao, tipo: "correcao" })
  }

  // Remover duplicados e limitar
  const unicos = [...new Map(sugestoes.map((s) => [s.texto, s])).values()]
  return unicos.slice(0, opcoes.limite || 8)
}

/**
 * Obtem sugestoes populares (sem query)
 * @returns {Array} - Buscas populares
 */
export function getSugestoesPopulares() {
  return [
    { texto: "equipamentos odontologicos", tipo: "popular" },
    { texto: "vagas dentista", tipo: "popular" },
    { texto: "material descartavel", tipo: "popular" },
    { texto: "cursos odontologia", tipo: "popular" },
    { texto: "implantes", tipo: "popular" },
  ]
}

/**
 * Limpa historico de buscas
 * @param {string} userId - ID do usuario (opcional)
 */
export function limparHistorico(userId = null) {
  if (userId) {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEY_HISTORY) || "{}")
    delete all[userId]
    localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(all))
  } else {
    localStorage.removeItem(STORAGE_KEY_HISTORY)
  }
}

/**
 * Limpa cache de buscas
 */
export function limparCache() {
  localStorage.removeItem(STORAGE_KEY_CACHE)
}

/**
 * Obtem estatisticas de busca
 */
export function getEstatisticas() {
  const historico = getHistorico()
  const cache = JSON.parse(localStorage.getItem(STORAGE_KEY_CACHE) || "{}")

  // Contar termos mais buscados
  const contagem = {}
  historico.forEach((q) => {
    contagem[q] = (contagem[q] || 0) + 1
  })

  const maisFrequentes = Object.entries(contagem)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([termo, count]) => ({ termo, count }))

  return {
    totalBuscas: historico.length,
    termosUnicos: Object.keys(contagem).length,
    maisFrequentes,
    cacheSize: Object.keys(cache).length,
  }
}

// Funcoes auxiliares privadas
function corrigirQuery(query) {
  let corrigida = query.toLowerCase().trim()

  // Aplicar correcoes conhecidas
  for (const [erro, correto] of Object.entries(CORRECOES)) {
    corrigida = corrigida.replace(new RegExp(erro, "gi"), correto)
  }

  // Correcao simples de letras duplicadas
  corrigida = corrigida.replace(/(.)\1{2,}/g, "$1$1")

  return corrigida
}

function expandirComSinonimos(query) {
  const palavras = query.split(" ").filter((p) => p.length > 2)
  const expandido = new Set(palavras)

  palavras.forEach((palavra) => {
    // Verificar se palavra e chave de sinonimo
    if (SINONIMOS[palavra]) {
      SINONIMOS[palavra].forEach((s) => expandido.add(s))
    }

    // Verificar se palavra e sinonimo de algo
    for (const [chave, sins] of Object.entries(SINONIMOS)) {
      if (sins.includes(palavra)) {
        expandido.add(chave)
        sins.forEach((s) => expandido.add(s))
      }
    }
  })

  return [...expandido]
}

function buscarNoDados(termos, dados, opcoes = {}) {
  if (!dados || dados.length === 0) return []

  const campos = opcoes.campos || ["titulo", "descricao", "categoria", "tags"]

  return dados.filter((item) => {
    const texto = campos
      .map((c) => item[c])
      .filter(Boolean)
      .join(" ")
      .toLowerCase()

    // Verificar se algum termo esta presente
    return termos.some((termo) => texto.includes(termo))
  })
}

function ranquearResultados(resultados, query) {
  const queryLower = query.toLowerCase()
  const palavras = queryLower.split(" ")

  return resultados
    .map((item) => {
      let score = 0
      const titulo = (item.titulo || "").toLowerCase()
      const descricao = (item.descricao || "").toLowerCase()

      // Titulo contem query exata = +50
      if (titulo.includes(queryLower)) score += 50

      // Titulo comeca com query = +30
      if (titulo.startsWith(queryLower)) score += 30

      // Cada palavra no titulo = +10
      palavras.forEach((p) => {
        if (titulo.includes(p)) score += 10
        if (descricao.includes(p)) score += 5
      })

      // Bonus por item recente
      const idade = Date.now() - new Date(item.createdAt || 0).getTime()
      if (idade < 24 * 60 * 60 * 1000) score += 10 // < 24h

      return { ...item, _searchScore: score }
    })
    .sort((a, b) => b._searchScore - a._searchScore)
}

function gerarSugestoes(query, resultados) {
  const sugestoes = []

  // Categorias encontradas nos resultados
  const categorias = new Set()
  resultados.slice(0, 20).forEach((r) => {
    if (r.categoria) categorias.add(r.categoria)
  })

  categorias.forEach((cat) => {
    sugestoes.push({
      texto: `${query} em ${cat}`,
      tipo: "refinamento",
    })
  })

  // Se poucos resultados, sugerir termo mais amplo
  if (resultados.length < 5) {
    const palavras = query.split(" ")
    if (palavras.length > 1) {
      sugestoes.push({
        texto: palavras[0],
        tipo: "ampliar",
      })
    }
  }

  return sugestoes.slice(0, 5)
}

function getHistorico() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY_HISTORY) || "[]")
  } catch {
    return []
  }
}

function salvarHistorico(query) {
  const historico = getHistorico()

  // Adicionar no inicio
  const atualizado = [query, ...historico.filter((h) => h !== query)]

  // Limitar a 100 itens
  localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(atualizado.slice(0, 100)))
}

function getCache(key) {
  try {
    const cache = JSON.parse(localStorage.getItem(STORAGE_KEY_CACHE) || "{}")
    const item = cache[key]

    // Cache valido por 5 minutos
    if (item && Date.now() - item.timestamp < 300000) {
      return item.data
    }
    return null
  } catch {
    return null
  }
}

function setCache(key, data) {
  try {
    const cache = JSON.parse(localStorage.getItem(STORAGE_KEY_CACHE) || "{}")

    // Limitar cache a 50 itens
    const keys = Object.keys(cache)
    if (keys.length >= 50) {
      // Remover mais antigo
      const oldest = keys.reduce((a, b) => (cache[a].timestamp < cache[b].timestamp ? a : b))
      delete cache[oldest]
    }

    cache[key] = { data, timestamp: Date.now() }
    localStorage.setItem(STORAGE_KEY_CACHE, JSON.stringify(cache))
  } catch (error) {
    console.error("[BuscaIA] Erro ao salvar cache:", error)
  }
}

export default {
  buscar,
  getSugestoes,
  getSugestoesPopulares,
  limparHistorico,
  limparCache,
  getEstatisticas,
}
