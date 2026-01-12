/**
 * INDEX - Exporta todos os servicos de IA
 */

export { default as radarIA } from "./radarIA"
export { default as precosIA } from "./precosIA"
export { default as notificacoesIA } from "./notificacoesIA"
export { default as matchingIA } from "./matchingIA"
export { default as feedIA } from "./feedIA"
export { default as buscaIA } from "./buscaIA"

// Re-exportar funcoes principais para facilitar uso
export { searchRadarMatches, savePreferences as saveRadarPrefs, toggleRadar } from "./radarIA"
export { analisarPrecos, sugerirPrecoVenda, avaliarOferta } from "./precosIA"
export { processarNotificacao, aprenderPadrao, getHorariosIdeais } from "./notificacoesIA"
export { calcularMatch, rankearProfissionais, rankearVagas } from "./matchingIA"
export { processarFeed, filtrarPorTipo, registrarInteracao } from "./feedIA"
export { buscar, getSugestoes, getSugestoesPopulares } from "./buscaIA"
