// Re-export everything from .js
export {
  MAX_DEVICES,
  generateDeviceFingerprint,
  bindDevice,
  unbindDevice,
  isDeviceTrusted,
  getDevices,
  canAddMoreDevices,
  isNewDevice,
  getCurrentDeviceInfo,
  renameDevice,
  default,
} from "./deviceBindingService.js"
