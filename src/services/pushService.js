// ============================================
// PUSH SERVICE - WRAPPER PARA PUSH NOTIFICATIONS
// ============================================

import {
  isPushSupported as checkSupport,
  getPermissionStatus,
  subscribe as subscribeInternal,
  unsubscribe as unsubscribeInternal,
  sendTestNotification as sendTest,
  getCurrentSubscription,
  registerServiceWorker,
  requestPermission as requestPerm,
} from "@/utils/pushSubscription"

// Verificar se push e suportado
export function isSupported() {
  return checkSupport()
}

// Pedir permissao para notificacoes
export async function requestPermission() {
  return await requestPerm()
}

// Inscrever para receber push
export async function subscribeToPush(userId) {
  if (!isSupported()) {
    return { success: false, error: "Push notifications nao suportadas neste navegador" }
  }

  try {
    // Registrar service worker
    await registerServiceWorker()

    // Inscrever
    const result = await subscribeInternal(userId)

    if (result.success && result.subscription) {
      // Enviar subscription para o servidor
      try {
        await fetch("/api/push/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: userId,
            subscription: result.subscription,
          }),
        })
      } catch (err) {
        console.warn("[PushService] Nao foi possivel salvar no servidor:", err)
      }
    }

    return result
  } catch (error) {
    console.error("[PushService] Erro ao inscrever:", error)
    return { success: false, error: error.message }
  }
}

// Cancelar inscricao
export async function unsubscribeFromPush(userId) {
  try {
    const result = await unsubscribeInternal(userId)

    if (result.success) {
      // Notificar servidor
      try {
        await fetch("/api/push/subscribe", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: userId }),
        })
      } catch (err) {
        console.warn("[PushService] Nao foi possivel remover do servidor:", err)
      }
    }

    return result
  } catch (error) {
    console.error("[PushService] Erro ao cancelar:", error)
    return { success: false, error: error.message }
  }
}

// Obter subscription atual
export async function getSubscription() {
  return await getCurrentSubscription()
}

// Verificar status da permissao
export function getStatus() {
  return {
    supported: isSupported(),
    permission: isSupported() ? getPermissionStatus() : "unsupported",
  }
}

// Enviar notificacao de teste (local)
export async function sendTestNotification() {
  return await sendTest()
}

// Enviar push para um usuario (via servidor)
export async function sendPushToUser(userId, notification) {
  try {
    const response = await fetch("/api/push/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: userId,
        ...notification,
      }),
    })

    if (!response.ok) {
      throw new Error("Falha ao enviar push")
    }

    return await response.json()
  } catch (error) {
    console.error("[PushService] Erro ao enviar push:", error)
    return { success: false, error: error.message }
  }
}

// Tipos de notificacao
export const PUSH_TYPES = {
  NOVA_VAGA: "nova_vaga",
  CANDIDATURA_ACEITA: "candidatura_aceita",
  NOVA_MENSAGEM: "nova_mensagem",
  SUBSTITUICAO_CONFIRMADA: "substituicao_confirmada",
  LEMBRETE: "lembrete",
  TOKEN_DESCONTO: "token_desconto",
  URGENTE: "urgente",
}

// Templates de notificacao
export const PUSH_TEMPLATES = {
  [PUSH_TYPES.NOVA_VAGA]: (data) => ({
    title: "Nova Vaga Disponivel",
    body: `${data.titulo} em ${data.cidade}`,
    icon: "/icon.svg",
    tag: "nova-vaga",
    data: { url: `/vaga/${data.vaga_id}`, tipo: PUSH_TYPES.NOVA_VAGA },
    actions: [
      { action: "ver", title: "Ver Vaga" },
      { action: "ignorar", title: "Ignorar" },
    ],
  }),

  [PUSH_TYPES.CANDIDATURA_ACEITA]: (data) => ({
    title: "Candidatura Aceita!",
    body: `Sua candidatura para ${data.vaga_titulo} foi aceita`,
    icon: "/icon.svg",
    tag: "candidatura-aceita",
    data: { url: `/substituicao/${data.substituicao_id}`, tipo: PUSH_TYPES.CANDIDATURA_ACEITA },
    actions: [{ action: "ver", title: "Ver Detalhes" }],
    requireInteraction: true,
  }),

  [PUSH_TYPES.NOVA_MENSAGEM]: (data) => ({
    title: `Mensagem de ${data.remetente_nome}`,
    body: data.preview || "Voce recebeu uma nova mensagem",
    icon: "/icon.svg",
    tag: `mensagem-${data.conversa_id}`,
    data: { url: `/mensagens/${data.conversa_id}`, tipo: PUSH_TYPES.NOVA_MENSAGEM },
    actions: [
      { action: "responder", title: "Responder" },
      { action: "ver", title: "Ver" },
    ],
  }),

  [PUSH_TYPES.SUBSTITUICAO_CONFIRMADA]: (data) => ({
    title: "Substituicao Confirmada",
    body: `${data.clinica_nome} - ${data.data} as ${data.horario}`,
    icon: "/icon.svg",
    tag: "substituicao-confirmada",
    data: { url: `/substituicao/${data.substituicao_id}`, tipo: PUSH_TYPES.SUBSTITUICAO_CONFIRMADA },
    actions: [{ action: "ver", title: "Ver Detalhes" }],
    requireInteraction: true,
  }),

  [PUSH_TYPES.LEMBRETE]: (data) => ({
    title: "Lembrete",
    body: data.mensagem,
    icon: "/icon.svg",
    tag: `lembrete-${data.id}`,
    data: { url: data.url || "/feed", tipo: PUSH_TYPES.LEMBRETE },
  }),

  [PUSH_TYPES.TOKEN_DESCONTO]: (data) => ({
    title: "Token de Desconto Recebido!",
    body: `${data.desconto}% de desconto em ${data.parceiro_nome}. Valido por ${data.validade}`,
    icon: "/icon.svg",
    tag: "token-desconto",
    data: { url: "/meu-perfil", tipo: PUSH_TYPES.TOKEN_DESCONTO },
    actions: [{ action: "ver", title: "Ver Token" }],
    requireInteraction: true,
  }),

  [PUSH_TYPES.URGENTE]: (data) => ({
    title: "URGENTE: " + data.titulo,
    body: data.mensagem,
    icon: "/icon.svg",
    tag: "urgente",
    data: { url: data.url || "/feed", tipo: PUSH_TYPES.URGENTE },
    requireInteraction: true,
    vibrate: [200, 100, 200, 100, 200],
  }),
}

// Criar payload de notificacao a partir do template
export function createPushPayload(type, data) {
  const template = PUSH_TEMPLATES[type]
  if (!template) {
    console.warn("[PushService] Template nao encontrado:", type)
    return null
  }
  return template(data)
}
