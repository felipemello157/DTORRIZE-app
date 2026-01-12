/**
 * PRECOS IA SERVICE
 * Analisa precos historicos e sugere preco ideal
 */

// Storage keys
const STORAGE_KEY_HISTORY = "doutorizze_precos_history"
const STORAGE_KEY_CACHE = "doutorizze_precos_cache"

/**
 * Analisa precos de uma categoria nos ultimos 30 dias
 * @param {string} categoria - Categoria do produto
 * @param {string} regiao - Regiao para analise
 * @returns {Promise<Object>} - Analise de precos
 */
export async function analisarPrecos(categoria, regiao = null) {
  try {
    // Buscar historico de precos (mock local + cache)
    const historico = await getHistoricoPrecos(categoria, regiao)

    if (historico.length === 0) {
      return {
        success: false,
        message: "Sem dados suficientes para analise",
        sugestao: null,
      }
    }

    // Calcular estatisticas
    const precos = historico.map((h) => h.preco)
    const stats = calcularEstatisticas(precos)

    // Calcular tendencia
    const tendencia = calcularTendencia(historico)

    return {
      success: true,
      categoria,
      regiao,
      periodo: "30 dias",
      totalAnalisado: historico.length,
      estatisticas: {
        media: stats.media,
        mediana: stats.mediana,
        minimo: stats.minimo,
        maximo: stats.maximo,
        desvioPadrao: stats.desvioPadrao,
      },
      tendencia: tendencia, // 'alta', 'baixa', 'estavel'
      sugestaoVenda: calcularPrecoIdeal(stats, tendencia, "venda"),
      sugestaoCompra: calcularPrecoIdeal(stats, tendencia, "compra"),
      melhorMomento: tendencia === "baixa" ? "comprar" : tendencia === "alta" ? "vender" : "neutro",
      atualizadoEm: new Date().toISOString(),
    }
  } catch (error) {
    console.error("[PrecosIA] Erro ao analisar precos:", error)
    return {
      success: false,
      error: error.message,
    }
  }
}

/**
 * Sugere preco ideal para venda
 * @param {string} categoria - Categoria do produto
 * @param {string} regiao - Regiao do vendedor
 * @param {string} condicao - Condicao do item (novo, usado, seminovo)
 * @returns {Promise<Object>} - Sugestao de preco
 */
export async function sugerirPrecoVenda(categoria, regiao, condicao = "usado") {
  const analise = await analisarPrecos(categoria, regiao)

  if (!analise.success) {
    return analise
  }

  // Ajustar por condicao
  const multiplicadores = {
    novo: 1.15,
    seminovo: 1.0,
    usado: 0.85,
    defeito: 0.5,
  }

  const mult = multiplicadores[condicao] || 1.0
  const precoBase = analise.sugestaoVenda

  return {
    success: true,
    precoSugerido: Math.round(precoBase * mult),
    precoMinimo: Math.round(precoBase * mult * 0.85),
    precoMaximo: Math.round(precoBase * mult * 1.15),
    condicao,
    baseadoEm: `${analise.totalAnalisado} anuncios`,
    dica: gerarDicaPreco(analise.tendencia, condicao),
  }
}

/**
 * Verifica se um preco e uma boa oferta
 * @param {number} preco - Preco a verificar
 * @param {string} categoria - Categoria do produto
 * @param {string} regiao - Regiao
 * @returns {Promise<Object>} - Avaliacao da oferta
 */
export async function avaliarOferta(preco, categoria, regiao) {
  const analise = await analisarPrecos(categoria, regiao)

  if (!analise.success) {
    return { success: false, avaliacao: "sem_dados" }
  }

  const { media, minimo, maximo } = analise.estatisticas
  const percentualDoMinimo = ((preco - minimo) / minimo) * 100
  const percentualDaMedia = ((preco - media) / media) * 100

  let avaliacao, nota, emoji

  if (preco <= minimo) {
    avaliacao = "excelente"
    nota = 5
    emoji = "🔥"
  } else if (preco <= media * 0.85) {
    avaliacao = "muito_bom"
    nota = 4
    emoji = "👍"
  } else if (preco <= media) {
    avaliacao = "bom"
    nota = 3
    emoji = "✅"
  } else if (preco <= media * 1.15) {
    avaliacao = "regular"
    nota = 2
    emoji = "⚠️"
  } else {
    avaliacao = "caro"
    nota = 1
    emoji = "❌"
  }

  return {
    success: true,
    preco,
    avaliacao,
    nota,
    emoji,
    comparacao: {
      vsMedia: `${percentualDaMedia > 0 ? "+" : ""}${percentualDaMedia.toFixed(1)}%`,
      vsMinimo: `${percentualDoMinimo > 0 ? "+" : ""}${percentualDoMinimo.toFixed(1)}%`,
      precoMedio: media,
      precoMinimo: minimo,
    },
    recomendacao:
      avaliacao === "excelente" || avaliacao === "muito_bom"
        ? "Compre agora, preco abaixo do mercado!"
        : avaliacao === "caro"
          ? "Aguarde, existem opcoes mais baratas"
          : "Preco dentro da media do mercado",
  }
}

/**
 * Registra um preco no historico (para aprendizado)
 * @param {Object} dados - Dados do preco
 */
export function registrarPreco(dados) {
  try {
    const historico = JSON.parse(localStorage.getItem(STORAGE_KEY_HISTORY) || "[]")
    historico.push({
      ...dados,
      timestamp: Date.now(),
    })

    // Manter apenas ultimos 1000 registros
    const recente = historico.slice(-1000)
    localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(recente))
  } catch (error) {
    console.error("[PrecosIA] Erro ao registrar preco:", error)
  }
}

// Funcoes auxiliares
async function getHistoricoPrecos(categoria, regiao) {
  // Primeiro tenta cache
  const cacheKey = `${categoria}_${regiao || "all"}`
  const cache = getCache(cacheKey)
  if (cache) return cache

  // Buscar do localStorage (mock)
  const historico = JSON.parse(localStorage.getItem(STORAGE_KEY_HISTORY) || "[]")

  // Filtrar por categoria e regiao
  let filtrado = historico.filter((h) => {
    const matchCategoria = !categoria || h.categoria === categoria
    const matchRegiao = !regiao || h.regiao === regiao
    const ultimos30Dias = Date.now() - h.timestamp < 30 * 24 * 60 * 60 * 1000
    return matchCategoria && matchRegiao && ultimos30Dias
  })

  // Se nao tem dados reais, gerar mock
  if (filtrado.length < 10) {
    filtrado = gerarDadosMock(categoria, 30)
  }

  // Salvar no cache
  setCache(cacheKey, filtrado)

  return filtrado
}

function calcularEstatisticas(precos) {
  const sorted = [...precos].sort((a, b) => a - b)
  const n = sorted.length

  const soma = precos.reduce((a, b) => a + b, 0)
  const media = soma / n

  const mediana = n % 2 === 0 ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2 : sorted[Math.floor(n / 2)]

  const variancia = precos.reduce((sum, p) => sum + Math.pow(p - media, 2), 0) / n
  const desvioPadrao = Math.sqrt(variancia)

  return {
    media: Math.round(media),
    mediana: Math.round(mediana),
    minimo: sorted[0],
    maximo: sorted[n - 1],
    desvioPadrao: Math.round(desvioPadrao),
  }
}

function calcularTendencia(historico) {
  if (historico.length < 5) return "estavel"

  // Dividir em duas metades e comparar medias
  const metade = Math.floor(historico.length / 2)
  const primeiraMeta = historico.slice(0, metade)
  const segundaMetade = historico.slice(metade)

  const media1 = primeiraMeta.reduce((a, b) => a + b.preco, 0) / primeiraMeta.length
  const media2 = segundaMetade.reduce((a, b) => a + b.preco, 0) / segundaMetade.length

  const variacao = ((media2 - media1) / media1) * 100

  if (variacao > 5) return "alta"
  if (variacao < -5) return "baixa"
  return "estavel"
}

function calcularPrecoIdeal(stats, tendencia, tipo) {
  let base = stats.mediana

  if (tipo === "venda") {
    // Para venda: considerar ligeiramente acima da mediana se tendencia de alta
    base = tendencia === "alta" ? stats.media * 1.05 : stats.media * 0.98
  } else {
    // Para compra: considerar abaixo da mediana
    base = tendencia === "baixa" ? stats.media * 0.92 : stats.media * 0.95
  }

  return Math.round(base)
}

function gerarDicaPreco(tendencia, condicao) {
  const dicas = {
    alta: "Precos em alta - bom momento para vender!",
    baixa: "Precos em queda - considere aguardar ou ajuste o valor.",
    estavel: "Mercado estavel - preco competitivo deve vender rapido.",
  }
  return dicas[tendencia] || dicas.estavel
}

function gerarDadosMock(categoria, dias) {
  const dados = []
  const basePrice = {
    equipamentos: 5000,
    materiais: 500,
    moveis: 2000,
    uniformes: 200,
    default: 1000,
  }

  const base = basePrice[categoria] || basePrice.default

  for (let i = 0; i < dias; i++) {
    dados.push({
      preco: base + (Math.random() - 0.5) * base * 0.3,
      categoria,
      timestamp: Date.now() - i * 24 * 60 * 60 * 1000,
    })
  }

  return dados
}

function getCache(key) {
  try {
    const cache = JSON.parse(localStorage.getItem(STORAGE_KEY_CACHE) || "{}")
    const item = cache[key]
    if (item && Date.now() - item.timestamp < 3600000) {
      // 1 hora
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
    cache[key] = { data, timestamp: Date.now() }
    localStorage.setItem(STORAGE_KEY_CACHE, JSON.stringify(cache))
  } catch (error) {
    console.error("[PrecosIA] Erro ao salvar cache:", error)
  }
}

export default {
  analisarPrecos,
  sugerirPrecoVenda,
  avaliarOferta,
  registrarPreco,
}
