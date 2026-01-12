/**
 * MATCHING IA SERVICE
 * Algoritmo de compatibilidade profissional-clinica
 * Score de 0-100 baseado em multiplos fatores
 */

// Pesos dos fatores no calculo de match
const PESOS = {
  especialidade: 35, // Match exato de especialidade
  localizacao: 25, // Distancia em km
  disponibilidade: 20, // Horarios compativeis
  rating: 10, // Avaliacao do profissional
  experiencia: 5, // Anos de experiencia
  preco: 5, // Compatibilidade de valor
}

/**
 * Calcula score de match entre profissional e vaga
 * @param {Object} profissional - Dados do profissional
 * @param {Object} vaga - Dados da vaga/clinica
 * @returns {Object} - Score e detalhes do match
 */
export function calcularMatch(profissional, vaga) {
  const scores = {
    especialidade: calcularScoreEspecialidade(profissional, vaga),
    localizacao: calcularScoreLocalizacao(profissional, vaga),
    disponibilidade: calcularScoreDisponibilidade(profissional, vaga),
    rating: calcularScoreRating(profissional),
    experiencia: calcularScoreExperiencia(profissional, vaga),
    preco: calcularScorePreco(profissional, vaga),
  }

  // Calcular score final ponderado
  let scoreTotal = 0
  const detalhes = {}

  for (const [fator, peso] of Object.entries(PESOS)) {
    const scoreFator = scores[fator] || 0
    const contribuicao = (scoreFator * peso) / 100
    scoreTotal += contribuicao
    detalhes[fator] = {
      score: scoreFator,
      peso: peso,
      contribuicao: Math.round(contribuicao * 100) / 100,
    }
  }

  // Bonus por matches perfeitos
  if (scores.especialidade === 100) scoreTotal += 3
  if (scores.localizacao >= 90) scoreTotal += 2

  // Limitar a 100
  scoreTotal = Math.min(100, Math.round(scoreTotal))

  return {
    score: scoreTotal,
    nivel: getNivelMatch(scoreTotal),
    detalhes,
    recomendacao: gerarRecomendacao(scoreTotal, detalhes),
    profissional: {
      id: profissional.id,
      nome: profissional.nome,
    },
    vaga: {
      id: vaga.id,
      titulo: vaga.titulo,
    },
  }
}

/**
 * Rankeia lista de profissionais para uma vaga
 * @param {Array} profissionais - Lista de profissionais
 * @param {Object} vaga - Vaga a ser preenchida
 * @param {Object} opcoes - Opcoes de filtragem
 * @returns {Array} - Profissionais rankeados com scores
 */
export function rankearProfissionais(profissionais, vaga, opcoes = {}) {
  const { minScore = 0, limite = 20 } = opcoes

  const matches = profissionais.map((prof) => ({
    ...calcularMatch(prof, vaga),
    profissional: prof,
  }))

  return matches
    .filter((m) => m.score >= minScore)
    .sort((a, b) => b.score - a.score)
    .slice(0, limite)
}

/**
 * Rankeia lista de vagas para um profissional
 * @param {Object} profissional - Profissional buscando vaga
 * @param {Array} vagas - Lista de vagas disponiveis
 * @param {Object} opcoes - Opcoes de filtragem
 * @returns {Array} - Vagas rankeadas com scores
 */
export function rankearVagas(profissional, vagas, opcoes = {}) {
  const { minScore = 0, limite = 20 } = opcoes

  const matches = vagas.map((vaga) => ({
    ...calcularMatch(profissional, vaga),
    vaga: vaga,
  }))

  return matches
    .filter((m) => m.score >= minScore)
    .sort((a, b) => b.score - a.score)
    .slice(0, limite)
}

/**
 * Encontra matches ideais (score > 80) para uma vaga
 * @param {Object} vaga - Vaga a ser preenchida
 * @param {Array} profissionais - Pool de profissionais
 * @returns {Array} - Top matches
 */
export function encontrarMatchesIdeais(vaga, profissionais) {
  return rankearProfissionais(profissionais, vaga, { minScore: 80, limite: 10 })
}

/**
 * Sugere melhorias para aumentar score de match
 * @param {Object} profissional - Profissional
 * @param {Object} vaga - Vaga desejada
 * @returns {Array} - Lista de sugestoes
 */
export function sugerirMelhorias(profissional, vaga) {
  const match = calcularMatch(profissional, vaga)
  const sugestoes = []

  for (const [fator, info] of Object.entries(match.detalhes)) {
    if (info.score < 70) {
      sugestoes.push(gerarSugestao(fator, info.score, profissional, vaga))
    }
  }

  return sugestoes.filter(Boolean).sort((a, b) => b.impacto - a.impacto)
}

// Funcoes de calculo de score por fator
function calcularScoreEspecialidade(profissional, vaga) {
  const espProf = (profissional.especialidades || []).map((e) => e.toLowerCase())
  const espVaga = (vaga.especialidades || [vaga.especialidade]).map((e) => e?.toLowerCase())

  // Match exato
  const matchExato = espProf.some((e) => espVaga.includes(e))
  if (matchExato) return 100

  // Match parcial (mesma area)
  const areaProf = profissional.area?.toLowerCase()
  const areaVaga = vaga.area?.toLowerCase()
  if (areaProf && areaVaga && areaProf === areaVaga) return 60

  return 0
}

function calcularScoreLocalizacao(profissional, vaga) {
  const distancia = calcularDistancia(profissional, vaga)

  if (distancia === null) return 50 // Sem dados
  if (distancia <= 5) return 100 // Muito perto
  if (distancia <= 10) return 90
  if (distancia <= 20) return 75
  if (distancia <= 30) return 60
  if (distancia <= 50) return 40
  return 20 // Muito longe
}

function calcularDistancia(profissional, vaga) {
  // Se tem coordenadas, calcular distancia real
  if (profissional.lat && profissional.lng && vaga.lat && vaga.lng) {
    return haversine(profissional.lat, profissional.lng, vaga.lat, vaga.lng)
  }

  // Se tem cidade, comparar
  if (profissional.cidade && vaga.cidade) {
    return profissional.cidade.toLowerCase() === vaga.cidade.toLowerCase() ? 5 : 30
  }

  return null
}

function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371 // Raio da Terra em km
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function calcularScoreDisponibilidade(profissional, vaga) {
  const dispProf = profissional.disponibilidade || []
  const dispVaga = vaga.horarios || []

  if (dispProf.length === 0 || dispVaga.length === 0) return 50

  // Contar quantos horarios da vaga o profissional atende
  const matches = dispVaga.filter((h) => dispProf.some((d) => d.dia === h.dia && horariosCompativeis(d, h)))

  return Math.round((matches.length / dispVaga.length) * 100)
}

function horariosCompativeis(dispProf, horarioVaga) {
  // Simplificado: verificar se periodos se sobrepoem
  const inicioProf = Number.parseInt(dispProf.inicio?.replace(":", "") || "0")
  const fimProf = Number.parseInt(dispProf.fim?.replace(":", "") || "2400")
  const inicioVaga = Number.parseInt(horarioVaga.inicio?.replace(":", "") || "0")
  const fimVaga = Number.parseInt(horarioVaga.fim?.replace(":", "") || "2400")

  return inicioProf <= inicioVaga && fimProf >= fimVaga
}

function calcularScoreRating(profissional) {
  const rating = profissional.rating || profissional.avaliacao || 0
  // Rating de 0-5 convertido para 0-100
  return Math.round((rating / 5) * 100)
}

function calcularScoreExperiencia(profissional, vaga) {
  const anosExp = profissional.anosExperiencia || 0
  const anosReq = vaga.experienciaMinima || 0

  if (anosReq === 0) return 80 // Sem requisito

  if (anosExp >= anosReq * 1.5) return 100 // Muito experiente
  if (anosExp >= anosReq) return 85 // Atende requisito
  if (anosExp >= anosReq * 0.7) return 60 // Quase atende
  return 30 // Pouca experiencia
}

function calcularScorePreco(profissional, vaga) {
  const valorProf = profissional.valorHora || profissional.pretensao || 0
  const valorVaga = vaga.valorHora || vaga.budget || 0

  if (valorProf === 0 || valorVaga === 0) return 50 // Sem dados

  const diferenca = Math.abs(valorProf - valorVaga) / valorVaga

  if (diferenca <= 0.1) return 100 // Diferenca <= 10%
  if (diferenca <= 0.2) return 80
  if (diferenca <= 0.3) return 60
  if (diferenca <= 0.5) return 40
  return 20
}

function getNivelMatch(score) {
  if (score >= 90) return { nivel: "perfeito", cor: "#22C55E", emoji: "🎯" }
  if (score >= 75) return { nivel: "excelente", cor: "#3B82F6", emoji: "⭐" }
  if (score >= 60) return { nivel: "bom", cor: "#F59E0B", emoji: "👍" }
  if (score >= 40) return { nivel: "regular", cor: "#F97316", emoji: "🤔" }
  return { nivel: "baixo", cor: "#EF4444", emoji: "❌" }
}

function gerarRecomendacao(score, detalhes) {
  if (score >= 90) {
    return "Match perfeito! Alta probabilidade de sucesso."
  }
  if (score >= 75) {
    return "Excelente compatibilidade. Recomendamos entrar em contato."
  }
  if (score >= 60) {
    const pontoFraco = Object.entries(detalhes)
      .filter(([_, v]) => v.score < 60)
      .sort((a, b) => b[1].peso - a[1].peso)[0]

    if (pontoFraco) {
      return `Boa compatibilidade, mas ${pontoFraco[0]} pode ser um desafio.`
    }
    return "Boa compatibilidade geral."
  }
  return "Compatibilidade baixa. Considere outras opcoes."
}

function gerarSugestao(fator, score, profissional, vaga) {
  const sugestoes = {
    especialidade: {
      texto: "Adicione mais especialidades ao seu perfil",
      impacto: 35,
    },
    localizacao: {
      texto: "Considere expandir sua area de atuacao",
      impacto: 25,
    },
    disponibilidade: {
      texto: "Atualize seus horarios disponiveis",
      impacto: 20,
    },
    rating: {
      texto: "Solicite avaliacoes de clinicas anteriores",
      impacto: 10,
    },
    experiencia: {
      texto: "Adicione experiencias e certificacoes ao perfil",
      impacto: 5,
    },
    preco: {
      texto: "Revise sua pretensao salarial",
      impacto: 5,
    },
  }

  return sugestoes[fator] || null
}

export default {
  calcularMatch,
  rankearProfissionais,
  rankearVagas,
  encontrarMatchesIdeais,
  sugerirMelhorias,
}
