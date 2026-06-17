import type { Device, DeviceState } from '@/types'

export function getDeviceStatusText(device: Device): string {
  if (device.status === 'offline') return '离线'
  const state = device.state as DeviceState
  switch (device.type) {
    case 'light': {
      const s = state as { on: boolean; brightness: number }
      return s.on ? `开启 · ${s.brightness}%` : '关闭'
    }
    case 'thermostat': {
      const s = state as { temperature: number; targetTemp: number; on: boolean }
      return s.on ? `${s.temperature}°C → ${s.targetTemp}°C` : '关闭'
    }
    case 'lock': {
      const s = state as { locked: boolean; batteryLevel: number }
      return s.locked ? '已锁定' : '未锁定'
    }
    case 'sensor': {
      const s = state as { value: number; unit: string }
      return `${s.value}${s.unit}`
    }
    case 'camera': {
      const s = state as { recording: boolean }
      return s.recording ? '录制中' : '待机'
    }
    case 'switch': {
      const s = state as { on: boolean }
      return s.on ? '开启' : '关闭'
    }
    case 'curtain': {
      const s = state as { position: number }
      return `开合度 ${s.position}%`
    }
    default:
      return '未知'
  }
}

export function isDeviceOn(device: Device): boolean {
  if (device.status === 'offline') return false
  const state = device.state as unknown as Record<string, unknown>
  if ('on' in state) return !!state.on
  if ('locked' in state) return !!state.locked
  if ('recording' in state) return !!state.recording
  return true
}

export function formatTime(isoString: string): string {
  const d = new Date(isoString)
  return d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}

export function formatDateTime(isoString: string): string {
  const d = new Date(isoString)
  return d.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}
