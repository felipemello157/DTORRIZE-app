import { base44 } from "@/api/base44Client"

/**
 * Retorna o usuario logado ou null se nao estiver autenticado
 * Trata erro 401 silenciosamente para apps publicos
 */
export async function safeGetUser() {
  try {
    const user = await base44.auth.me()
    return user
  } catch (error) {
    // 401 = nao autenticado (normal em apps publicos)
    if (error?.response?.status === 401 || error?.status === 401) {
      return null
    }
    // Outros erros de rede/timeout tambem retornam null
    if (error?.code === "ECONNREFUSED" || error?.code === "NETWORK_ERROR") {
      console.warn("[safeGetUser] Erro de rede:", error.message)
      return null
    }
    // Erros inesperados logamos mas nao quebramos o app
    console.warn("[safeGetUser] Erro inesperado:", error)
    return null
  }
}

/**
 * Verifica se usuario esta autenticado
 */
export async function isAuthenticated() {
  const user = await safeGetUser()
  return !!user
}

/**
 * Retorna usuario ou redireciona para login
 */
export async function requireUser(navigate) {
  const user = await safeGetUser()
  if (!user && navigate) {
    navigate("/Login")
  }
  return user
}

export default { safeGetUser, isAuthenticated, requireUser }
