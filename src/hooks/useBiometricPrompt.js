"use client"

/**
 * HOOK - useBiometricPrompt
 *
 * Hook para facilitar uso do BiometricPrompt em acoes criticas
 */

import { useState, useCallback } from "react"

export function useBiometricPrompt() {
  const [isOpen, setIsOpen] = useState(false)
  const [config, setConfig] = useState({
    action: "confirmar esta acao",
    actionType: "generic",
  })
  const [resolvePromise, setResolvePromise] = useState(null)

  /**
   * Solicitar verificacao biometrica
   * @param {object} options - { action, actionType }
   * @returns {Promise<object>} - Resultado da verificacao
   */
  const requestVerification = useCallback((options = {}) => {
    return new Promise((resolve, reject) => {
      setConfig({
        action: options.action || "confirmar esta acao",
        actionType: options.actionType || "generic",
      })
      setResolvePromise({ resolve, reject })
      setIsOpen(true)
    })
  }, [])

  const handleSuccess = useCallback(
    (result) => {
      resolvePromise?.resolve(result)
      setIsOpen(false)
      setResolvePromise(null)
    },
    [resolvePromise],
  )

  const handleCancel = useCallback(() => {
    resolvePromise?.reject(new Error("Verificacao cancelada"))
    setIsOpen(false)
    setResolvePromise(null)
  }, [resolvePromise])

  const handleClose = useCallback(() => {
    setIsOpen(false)
  }, [])

  return {
    isOpen,
    config,
    requestVerification,
    onSuccess: handleSuccess,
    onCancel: handleCancel,
    onClose: handleClose,
    // Helpers para acoes especificas
    requestForVaga: () =>
      requestVerification({
        action: "aceitar esta vaga",
        actionType: "aceitar_vaga",
      }),
    requestForPagamento: () =>
      requestVerification({
        action: "confirmar este pagamento",
        actionType: "confirmar_pagamento",
      }),
    requestForDadosBancarios: () =>
      requestVerification({
        action: "alterar seus dados bancarios",
        actionType: "alterar_dados_bancarios",
      }),
  }
}

export default useBiometricPrompt
