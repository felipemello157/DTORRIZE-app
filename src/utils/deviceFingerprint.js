/**
 * DEVICE FINGERPRINT
 *
 * Gera identificador unico do dispositivo
 * para vinculacao de conta
 */

const MAX_DEVICES = 3

/**
 * Obter informacoes do dispositivo
 */
export function getDeviceInfo() {
  const ua = navigator.userAgent

  // Detectar browser
  let browser = "Desconhecido"
  if (ua.includes("Firefox")) browser = "Firefox"
  else if (ua.includes("SamsungBrowser")) browser = "Samsung Browser"
  else if (ua.includes("Opera") || ua.includes("OPR")) browser = "Opera"
  else if (ua.includes("Edge")) browser = "Edge"
  else if (ua.includes("Chrome")) browser = "Chrome"
  else if (ua.includes("Safari")) browser = "Safari"

  // Detectar OS
  let os = "Desconhecido"
  if (ua.includes("Windows NT 10")) os = "Windows 10/11"
  else if (ua.includes("Windows")) os = "Windows"
  else if (ua.includes("Mac OS X")) os = "macOS"
  else if (ua.includes("Android")) os = "Android"
  else if (ua.includes("iPhone") || ua.includes("iPad")) os = "iOS"
  else if (ua.includes("Linux")) os = "Linux"

  // Detectar tipo de dispositivo
  let deviceType = "Desktop"
  if (/Mobi|Android/i.test(ua)) deviceType = "Mobile"
  else if (/Tablet|iPad/i.test(ua)) deviceType = "Tablet"

  return {
    browser,
    os,
    deviceType,
    language: navigator.language,
    platform: navigator.platform,
    screenWidth: window.screen.width,
    screenHeight: window.screen.height,
    colorDepth: window.screen.colorDepth,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    touchSupport: "ontouchstart" in window,
    cookiesEnabled: navigator.cookieEnabled,
  }
}

/**
 * Gerar fingerprint usando canvas
 */
function getCanvasFingerprint() {
  try {
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")

    canvas.width = 200
    canvas.height = 50

    // Texto com fonte especifica
    ctx.textBaseline = "top"
    ctx.font = "14px 'Arial'"
    ctx.fillStyle = "#f60"
    ctx.fillRect(125, 1, 62, 20)
    ctx.fillStyle = "#069"
    ctx.fillText("Doutorizze FP", 2, 15)
    ctx.fillStyle = "rgba(102, 204, 0, 0.7)"
    ctx.fillText("Doutorizze FP", 4, 17)

    // Adicionar formas geometricas
    ctx.beginPath()
    ctx.arc(50, 25, 10, 0, Math.PI * 2)
    ctx.fill()

    return canvas.toDataURL()
  } catch {
    return ""
  }
}

/**
 * Gerar fingerprint usando WebGL
 */
function getWebGLFingerprint() {
  try {
    const canvas = document.createElement("canvas")
    const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl")

    if (!gl) return ""

    const debugInfo = gl.getExtension("WEBGL_debug_renderer_info")
    if (!debugInfo) return ""

    const vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL)
    const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)

    return `${vendor}~${renderer}`
  } catch {
    return ""
  }
}

/**
 * Gerar hash simples de string
 */
function simpleHash(str) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16).padStart(8, "0")
}

/**
 * Gerar fingerprint unico do dispositivo
 * @returns {string} - Device ID no formato DTZ-DEV-XXXX-XXXX
 */
export function generateFingerprint() {
  const deviceInfo = getDeviceInfo()
  const canvasFP = getCanvasFingerprint()
  const webglFP = getWebGLFingerprint()

  // Combinar todas as informacoes
  const rawFingerprint = [
    deviceInfo.browser,
    deviceInfo.os,
    deviceInfo.platform,
    deviceInfo.screenWidth,
    deviceInfo.screenHeight,
    deviceInfo.colorDepth,
    deviceInfo.timezone,
    deviceInfo.language,
    deviceInfo.touchSupport,
    canvasFP.substring(0, 50),
    webglFP,
  ].join("|")

  // Gerar hash
  const hash = simpleHash(rawFingerprint)
  const hash2 = simpleHash(rawFingerprint.split("").reverse().join(""))

  return `DTZ-DEV-${hash.toUpperCase()}-${hash2.toUpperCase()}`
}

/**
 * Salvar dispositivo no localStorage
 */
export function saveDevice(deviceId, userId) {
  const deviceInfo = getDeviceInfo()

  const device = {
    device_id: deviceId,
    user_id: userId,
    ...deviceInfo,
    primeiro_acesso: new Date().toISOString(),
    ultimo_acesso: new Date().toISOString(),
    acessos: 1,
  }

  // Salvar dispositivo atual
  localStorage.setItem("dtz_current_device", JSON.stringify(device))

  // Adicionar a lista de dispositivos do usuario
  const devices = JSON.parse(localStorage.getItem("dtz_user_devices") || "[]")
  const existingIndex = devices.findIndex((d) => d.device_id === deviceId)

  if (existingIndex >= 0) {
    devices[existingIndex].ultimo_acesso = new Date().toISOString()
    devices[existingIndex].acessos++
  } else {
    devices.push(device)
  }

  localStorage.setItem("dtz_user_devices", JSON.stringify(devices))

  return device
}

/**
 * Obter dispositivo atual
 */
export function getCurrentDevice() {
  const device = localStorage.getItem("dtz_current_device")
  return device ? JSON.parse(device) : null
}

/**
 * Listar todos os dispositivos vinculados
 */
export function getLinkedDevices() {
  const devices = localStorage.getItem("dtz_user_devices")
  return devices ? JSON.parse(devices) : []
}

/**
 * Remover dispositivo
 */
export function removeDevice(deviceId) {
  const devices = JSON.parse(localStorage.getItem("dtz_user_devices") || "[]")
  const filtered = devices.filter((d) => d.device_id !== deviceId)
  localStorage.setItem("dtz_user_devices", JSON.stringify(filtered))

  // Se removeu o dispositivo atual, limpar
  const current = getCurrentDevice()
  if (current && current.device_id === deviceId) {
    localStorage.removeItem("dtz_current_device")
  }

  return { success: true, remaining: filtered.length }
}

/**
 * Verificar se dispositivo esta autorizado
 */
export function isDeviceAuthorized(deviceId) {
  const devices = getLinkedDevices()
  return devices.some((d) => d.device_id === deviceId)
}

/**
 * Verificar limite de dispositivos (maximo 3)
 */
export function canAddDevice() {
  const devices = getLinkedDevices()
  return devices.length < MAX_DEVICES
}

export default {
  getDeviceInfo,
  generateFingerprint,
  saveDevice,
  getCurrentDevice,
  getLinkedDevices,
  removeDevice,
  isDeviceAuthorized,
  canAddDevice,
}
