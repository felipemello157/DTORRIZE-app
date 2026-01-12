/**
 * RADAR IA SERVICE
 * Conecta com endpoint do n8n para monitoramento de oportunidades
 * POST http://164.152.59.49:5678/webhook/radar-search
 */

import { callN8nWebhook } from "@/config/n8n"

// Constantes
const RADAR_WEBHOOK = "/webhook/radar-search"
const STORAGE_KEY = "doutorizze_radar_preferences"

/**
 * Busca matches baseado nas preferencias do usuario
 * @param {string} userId - ID do usuario
 * @param {Object} filters - Filtros opcionais
 * @returns {Promise<Object>} - Matches encontrados
 */
export async function searchRadarMatches(userId, filters = {}) {
  try {
    const preferences = getPreferences(userId)

    const payload = {
      user_id: userId,
      preferences: preferences,
      filters: {
        categoria: filters.categoria || preferences.categorias || [],
        preco_min: filters.precoMin || preferences.precoMin || 0,
        preco_max: filters.precoMax || preferences.precoMax || 999999,
        regiao: filters.regiao || preferences.regioes || [],
        urgente: filters.apenasUrgentes || false,
        ...filters,
      },
      timestamp: new Date().toISOString(),
    }

    const response = await callN8nWebhook(RADAR_WEBHOOK, payload)

    if (response.success) {
      // Salvar matches no cache local
      cacheMatches(userId, response.matches)

      return {
        success: true,
        matches: response.matches || [],
        total: response.total || 0,
        timestamp: response.timestamp,
      }
    }

    // Fallback: retornar cache local se n8n falhar
    return {
      success: true,
      matches: getCachedMatches(userId),
      total: 0,
      fromCache: true,
    }
  } catch (error) {
    console.error("[RadarIA] Erro ao buscar matches:", error)
    return {
      success: false,
      matches: getCachedMatches(userId),
      error: error.message,
      fromCache: true,
    }
  }
}

/**
 * Salva preferencias do radar do usuario
 * @param {string} userId - ID do usuario
 * @param {Object} preferences - Preferencias a salvar
 */
export function savePreferences(userId, preferences) {
  try {
    const allPrefs = getAllPreferences()
    allPrefs[userId] = {
      ...allPrefs[userId],
      ...preferences,
      updatedAt: new Date().toISOString(),
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allPrefs))

    // Sincronizar com backend via n8n
    syncPreferencesWithBackend(userId, allPrefs[userId])

    return true
  } catch (error) {
    console.error("[RadarIA] Erro ao salvar preferencias:", error)
    return false
  }
}

/**
 * Obtem preferencias do usuario
 * @param {string} userId - ID do usuario
 * @returns {Object} - Preferencias do usuario
 */
export function getPreferences(userId) {
  const allPrefs = getAllPreferences()
  return (
    allPrefs[userId] || {
      categorias: [],
      regioes: [],
      precoMin: 0,
      precoMax: 999999,
      notificarWhatsApp: true,
      notificarPush: true,
      frequencia: "instantaneo", // instantaneo, diario, semanal
      ativo: false,
    }
  )
}

/**
 * Ativa/desativa o radar do usuario
 * @param {string} userId - ID do usuario
 * @param {boolean} ativo - Status do radar
 */
export async function toggleRadar(userId, ativo) {
  savePreferences(userId, { ativo })

  // Notificar backend
  try {
    await callN8nWebhook("/webhook/radar-toggle", {
      user_id: userId,
      ativo: ativo,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("[RadarIA] Erro ao sincronizar toggle:", error)
  }

  return ativo
}

/**
 * Adiciona item ao radar
 * @param {string} userId - ID do usuario
 * @param {Object} item - Item a monitorar
 */
export function addToRadar(userId, item) {
  const prefs = getPreferences(userId)
  const itens = prefs.itensMonitorados || []

  // Evita duplicados
  if (!itens.find((i) => i.id === item.id)) {
    itens.push({
      ...item,
      addedAt: new Date().toISOString(),
    })
    savePreferences(userId, { itensMonitorados: itens })
  }

  return itens
}

/**
 * Remove item do radar
 * @param {string} userId - ID do usuario
 * @param {string} itemId - ID do item a remover
 */
export function removeFromRadar(userId, itemId) {
  const prefs = getPreferences(userId)
  const itens = (prefs.itensMonitorados || []).filter((i) => i.id !== itemId)
  savePreferences(userId, { itensMonitorados: itens })
  return itens
}

// Funcoes auxiliares privadas
function getAllPreferences() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}")
  } catch {
    return {}
  }
}

function cacheMatches(userId, matches) {
  try {
    const cache = JSON.parse(localStorage.getItem("radar_matches_cache") || "{}")
    cache[userId] = {
      matches: matches.slice(0, 50), // Limitar cache
      timestamp: Date.now(),
    }
    localStorage.setItem("radar_matches_cache", JSON.stringify(cache))
  } catch (error) {
    console.error("[RadarIA] Erro ao cachear matches:", error)
  }
}

function getCachedMatches(userId) {
  try {
    const cache = JSON.parse(localStorage.getItem("radar_matches_cache") || "{}")
    const userCache = cache[userId]

    // Cache valido por 1 hora
    if (userCache && Date.now() - userCache.timestamp < 3600000) {
      return userCache.matches
    }
    return []
  } catch {
    return []
  }
}

async function syncPreferencesWithBackend(userId, preferences) {
  try {
    await callN8nWebhook("/webhook/radar-sync-preferences", {
      user_id: userId,
      preferences: preferences,
    })
  } catch (error) {
    console.error("[RadarIA] Erro ao sincronizar preferencias:", error)
  }
}

export default {
  searchRadarMatches,
  savePreferences,
  getPreferences,
  toggleRadar,
  addToRadar,
  removeFromRadar,
}
