"use client"

/**
 * HOOK - DEVICE BINDING
 *
 * Gerencia vinculacao de dispositivos
 * Maximo 3 dispositivos por conta
 */

import { useState, useEffect, useCallback } from "react"
import {
  generateFingerprint,
  saveDevice,
  getCurrentDevice,
  getLinkedDevices,
  removeDevice,
  isDeviceAuthorized,
  canAddDevice,
  getDeviceInfo,
} from "@/utils/deviceFingerprint"

const MAX_DEVICES = 3

export function useDeviceBinding(userId) {
  const [currentDevice, setCurrentDevice] = useState(null)
  const [linkedDevices, setLinkedDevices] = useState([])
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [isNewDevice, setIsNewDevice] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  // Inicializar
  useEffect(() => {
    if (!userId) {
      setIsLoading(false)
      return
    }

    try {
      const deviceId = generateFingerprint()
      const authorized = isDeviceAuthorized(deviceId)

      setIsAuthorized(authorized)
      setIsNewDevice(!authorized)
      setCurrentDevice(getCurrentDevice())
      setLinkedDevices(getLinkedDevices())
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  // Registrar dispositivo atual
  const registerCurrentDevice = useCallback(
    (deviceName = null) => {
      if (!userId) {
        setError("Usuario nao identificado")
        return { success: false, error: "Usuario nao identificado" }
      }

      if (!canAddDevice()) {
        setError(`Limite de ${MAX_DEVICES} dispositivos atingido`)
        return {
          success: false,
          error: `Limite de ${MAX_DEVICES} dispositivos atingido. Remova um dispositivo antes de adicionar outro.`,
        }
      }

      try {
        const deviceId = generateFingerprint()
        const device = saveDevice(deviceId, userId)

        // Adicionar nome customizado se fornecido
        if (deviceName) {
          device.custom_name = deviceName
          const allDevices = getLinkedDevices()
          const idx = allDevices.findIndex((d) => d.device_id === deviceId)
          if (idx >= 0) {
            allDevices[idx].custom_name = deviceName
            localStorage.setItem("dtz_user_devices", JSON.stringify(allDevices))
          }
        }

        setCurrentDevice(device)
        setLinkedDevices(getLinkedDevices())
        setIsAuthorized(true)
        setIsNewDevice(false)
        setError(null)

        return { success: true, device }
      } catch (err) {
        setError(err.message)
        return { success: false, error: err.message }
      }
    },
    [userId],
  )

  // Remover dispositivo
  const unlinkDevice = useCallback(
    (deviceId) => {
      try {
        const result = removeDevice(deviceId)
        setLinkedDevices(getLinkedDevices())

        // Verificar se removeu o dispositivo atual
        if (currentDevice?.device_id === deviceId) {
          setCurrentDevice(null)
          setIsAuthorized(false)
          setIsNewDevice(true)
        }

        return result
      } catch (err) {
        setError(err.message)
        return { success: false, error: err.message }
      }
    },
    [currentDevice],
  )

  // Verificar se este e o dispositivo atual
  const isCurrentDevice = useCallback(
    (deviceId) => {
      return currentDevice?.device_id === deviceId
    },
    [currentDevice],
  )

  // Obter info do dispositivo atual
  const getDeviceDisplayInfo = useCallback(() => {
    return getDeviceInfo()
  }, [])

  return {
    currentDevice,
    linkedDevices,
    isAuthorized,
    isNewDevice,
    isLoading,
    error,
    canAddMore: linkedDevices.length < MAX_DEVICES,
    maxDevices: MAX_DEVICES,
    registerCurrentDevice,
    unlinkDevice,
    isCurrentDevice,
    getDeviceDisplayInfo,
  }
}

export default useDeviceBinding
