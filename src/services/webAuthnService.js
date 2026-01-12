/**
 * WEBAUTHN SERVICE
 *
 * Service layer para operacoes de WebAuthn
 * Integra com API routes e armazenamento
 */

import {
  isBiometricSupported,
  isBiometricAvailable,
  registerBiometric,
  authenticateWithBiometric,
  removeBiometric,
  listBiometrics,
  hasBiometricSetup,
} from "@/lib/webauthn"

const API_BASE = "/api/webauthn"

/**
 * Verificar se WebAuthn e suportado
 */
export function isWebAuthnSupported() {
  return isBiometricSupported()
}

/**
 * Registrar nova credencial biometrica
 * @param {string} userId - ID do usuario
 * @param {object} userData - Dados do usuario { nome, email }
 */
export async function registerCredential(userId, userData) {
  try {
    // 1. Buscar challenge do servidor
    const challengeResponse = await fetch(`${API_BASE}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        action: "get_challenge",
      }),
    })

    if (!challengeResponse.ok) {
      // Se API nao disponivel, usar registro local
      console.warn("[WebAuthn] API nao disponivel, usando registro local")
    }

    // 2. Registrar no dispositivo
    const result = await registerBiometric({
      id: userId,
      nome: userData.nome || userData.name || "Usuario",
      email: userData.email,
    })

    // 3. Salvar credencial no servidor (se API disponivel)
    try {
      await fetch(`${API_BASE}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          action: "save_credential",
          credentialId: result.credentialId,
          deviceInfo: navigator.userAgent,
        }),
      })
    } catch (e) {
      console.warn("[WebAuthn] Falha ao salvar no servidor, usando localStorage")
    }

    return result
  } catch (error) {
    throw error
  }
}

/**
 * Verificar credencial biometrica
 * @param {string} userId - ID do usuario
 */
export async function verifyCredential(userId) {
  try {
    // 1. Buscar challenge do servidor
    try {
      const challengeResponse = await fetch(`${API_BASE}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          action: "get_challenge",
        }),
      })

      if (challengeResponse.ok) {
        // Usar challenge do servidor
      }
    } catch (e) {
      console.warn("[WebAuthn] API nao disponivel, usando verificacao local")
    }

    // 2. Autenticar no dispositivo
    const result = await authenticateWithBiometric()

    // 3. Verificar no servidor (se API disponivel)
    try {
      await fetch(`${API_BASE}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          action: "verify_credential",
          credentialId: result.credentialId,
        }),
      })
    } catch (e) {
      console.warn("[WebAuthn] Verificacao servidor falhou, usando local")
    }

    return result
  } catch (error) {
    throw error
  }
}

/**
 * Listar credenciais salvas do usuario
 * @param {string} userId - ID do usuario
 */
export async function getStoredCredentials(userId) {
  // Tentar buscar do servidor primeiro
  try {
    const response = await fetch(`${API_BASE}/credentials?userId=${userId}`)
    if (response.ok) {
      const data = await response.json()
      return data.credentials
    }
  } catch (e) {
    console.warn("[WebAuthn] Usando credenciais locais")
  }

  // Fallback para localStorage
  return listBiometrics()
}

/**
 * Remover credencial
 * @param {string} credentialId - ID da credencial
 */
export async function removeCredential(credentialId) {
  // Remover do servidor
  try {
    await fetch(`${API_BASE}/credentials`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ credentialId }),
    })
  } catch (e) {
    console.warn("[WebAuthn] Falha ao remover do servidor")
  }

  // Remover local
  return removeBiometric(credentialId)
}

/**
 * Verificar se usuario tem biometria configurada
 * @param {string} userId - ID do usuario (opcional)
 */
export async function hasCredentials(userId) {
  // Tentar verificar no servidor
  try {
    const response = await fetch(`${API_BASE}/credentials?userId=${userId}&check=true`)
    if (response.ok) {
      const data = await response.json()
      return data.hasCredentials
    }
  } catch (e) {
    // Fallback
  }

  return hasBiometricSetup()
}

/**
 * Verificar disponibilidade completa
 */
export async function checkAvailability() {
  const supported = isWebAuthnSupported()
  const available = await isBiometricAvailable()
  const setup = hasBiometricSetup()

  return {
    supported,
    available,
    setup,
    canUse: supported && available && setup,
    canSetup: supported && available,
  }
}

export default {
  isWebAuthnSupported,
  registerCredential,
  verifyCredential,
  getStoredCredentials,
  removeCredential,
  hasCredentials,
  checkAvailability,
}
