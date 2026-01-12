// ============================================
// PUSH SUBSCRIPTION MANAGER
// ============================================

import { base44 } from "@/api/base44Client"

// VAPID Public Key - precisa gerar uma propria para producao
const VAPID_PUBLIC_KEY = "BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U"

// Converter base64 para Uint8Array
function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/")

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

// Verificar se push notifications sao suportadas
export function isPushSupported() {
  return "serviceWorker" in navigator && "PushManager" in window && "Notification" in window
}

// Verificar status da permissao
export function getPermissionStatus() {
  if (!isPushSupported()) return "unsupported"
  return Notification.permission // 'granted', 'denied', 'default'
}

// Registrar service worker
export async function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) {
    throw new Error("Service Worker nao suportado")
  }

  try {
    const registration = await navigator.serviceWorker.register("/sw.js", {
      scope: "/",
    })

    console.log("[Push] Service Worker registrado:", registration.scope)

    // Aguardar SW ficar pronto
    await navigator.serviceWorker.ready

    return registration
  } catch (error) {
    console.error("[Push] Erro ao registrar SW:", error)
    throw error
  }
}

// Pedir permissao para notificacoes
export async function requestPermission() {
  if (!isPushSupported()) {
    return { success: false, error: "Push nao suportado neste navegador" }
  }

  try {
    const permission = await Notification.requestPermission()

    if (permission === "granted") {
      return { success: true, permission }
    } else if (permission === "denied") {
      return { success: false, error: "Permissao negada pelo usuario", permission }
    } else {
      return { success: false, error: "Permissao nao concedida", permission }
    }
  } catch (error) {
    console.error("[Push] Erro ao pedir permissao:", error)
    return { success: false, error: error.message }
  }
}

// Inscrever para push notifications
export async function subscribe(userId) {
  if (!isPushSupported()) {
    return { success: false, error: "Push nao suportado" }
  }

  if (Notification.permission !== "granted") {
    const permResult = await requestPermission()
    if (!permResult.success) return permResult
  }

  try {
    // Registrar SW se necessario
    const registration = await registerServiceWorker()

    // Verificar se ja tem subscription
    let subscription = await registration.pushManager.getSubscription()

    if (!subscription) {
      // Criar nova subscription
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      })

      console.log("[Push] Nova subscription criada")
    }

    // Salvar subscription no banco
    const subscriptionData = subscription.toJSON()

    if (userId) {
      await savePushSubscription(userId, subscriptionData)
    }

    return {
      success: true,
      subscription: subscriptionData,
    }
  } catch (error) {
    console.error("[Push] Erro ao inscrever:", error)
    return { success: false, error: error.message }
  }
}

// Cancelar subscription
export async function unsubscribe(userId) {
  try {
    const registration = await navigator.serviceWorker.ready
    const subscription = await registration.pushManager.getSubscription()

    if (subscription) {
      await subscription.unsubscribe()
      console.log("[Push] Subscription cancelada")
    }

    // Remover do banco
    if (userId) {
      await removePushSubscription(userId)
    }

    return { success: true }
  } catch (error) {
    console.error("[Push] Erro ao cancelar:", error)
    return { success: false, error: error.message }
  }
}

// Salvar subscription no Base44
async function savePushSubscription(userId, subscription) {
  try {
    // Verificar se ja existe
    const existing = await base44.entities.PushSubscription?.filter({ user_id: userId })

    const data = {
      user_id: userId,
      endpoint: subscription.endpoint,
      p256dh: subscription.keys?.p256dh,
      auth: subscription.keys?.auth,
      created_at: new Date().toISOString(),
      active: true,
    }

    if (existing && existing.length > 0) {
      await base44.entities.PushSubscription.update(existing[0].id, data)
    } else {
      await base44.entities.PushSubscription?.create(data)
    }

    console.log("[Push] Subscription salva no banco")
  } catch (error) {
    // Se a entidade nao existir, apenas logar
    console.warn("[Push] Nao foi possivel salvar subscription:", error.message)
  }
}

// Remover subscription do banco
async function removePushSubscription(userId) {
  try {
    const existing = await base44.entities.PushSubscription?.filter({ user_id: userId })

    if (existing && existing.length > 0) {
      await base44.entities.PushSubscription.update(existing[0].id, {
        active: false,
        unsubscribed_at: new Date().toISOString(),
      })
    }
  } catch (error) {
    console.warn("[Push] Nao foi possivel remover subscription:", error.message)
  }
}

// Enviar notificacao de teste
export async function sendTestNotification() {
  if (Notification.permission !== "granted") {
    return { success: false, error: "Permissao nao concedida" }
  }

  try {
    const registration = await navigator.serviceWorker.ready

    await registration.showNotification("Teste Doutorizze", {
      body: "Se voce esta vendo isso, as notificacoes estao funcionando!",
      icon: "/icon.svg",
      badge: "/icon-dark-32x32.png",
      tag: "test-notification",
      vibrate: [200, 100, 200],
      actions: [
        { action: "open", title: "Abrir App" },
        { action: "dismiss", title: "Fechar" },
      ],
    })

    return { success: true }
  } catch (error) {
    console.error("[Push] Erro ao enviar teste:", error)
    return { success: false, error: error.message }
  }
}

// Verificar subscription atual
export async function getCurrentSubscription() {
  if (!isPushSupported()) return null

  try {
    const registration = await navigator.serviceWorker.ready
    const subscription = await registration.pushManager.getSubscription()
    return subscription?.toJSON() || null
  } catch (error) {
    console.error("[Push] Erro ao obter subscription:", error)
    return null
  }
}
