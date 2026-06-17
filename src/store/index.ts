import { create } from 'zustand'
import type { Device, Scene, OperationRecord, AlertEvent, EnergyData, FamilyMember, SceneAction, Trigger, DeviceState } from '@/types'
import { devices as mockDevices, scenes as mockScenes, operationRecords as mockHistory, alerts as mockAlerts, energyData as mockEnergy, members as mockMembers } from '@/mocks'

const CURRENT_MEMBER = {
  id: 'member-001',
  name: '张伟',
}

function generateId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`
}

interface SmartHomeStore {
  devices: Device[]
  scenes: Scene[]
  operationRecords: OperationRecord[]
  alerts: AlertEvent[]
  energyData: EnergyData[]
  members: FamilyMember[]

  addDevice: (device: Omit<Device, 'id' | 'lastUpdated'>) => void
  updateDeviceState: (deviceId: string, newState: Partial<Device['state']>, recordAction?: string) => void
  toggleDevice: (deviceId: string) => void

  addScene: (scene: Omit<Scene, 'id'>) => void
  toggleScene: (sceneId: string) => void
  executeScene: (sceneId: string) => void

  resolveAlert: (alertId: string) => void
  updateMemberPermissions: (memberId: string, deviceIds: string[]) => void
  addOperationRecord: (record: Omit<OperationRecord, 'id'>) => void
}

export const useSmartHomeStore = create<SmartHomeStore>((set, get) => ({
  devices: mockDevices,
  scenes: mockScenes,
  operationRecords: mockHistory,
  alerts: mockAlerts,
  energyData: mockEnergy,
  members: mockMembers,

  addOperationRecord: (record) =>
    set((state) => ({
      operationRecords: [
        { ...record, id: generateId('op') },
        ...state.operationRecords,
      ],
    })),

  addDevice: (device) => {
    const newDevice: Device = {
      ...device,
      id: generateId('dev'),
      lastUpdated: new Date().toISOString(),
    }
    set((state) => ({
      devices: [...state.devices, newDevice],
    }))
    get().addOperationRecord({
      memberId: CURRENT_MEMBER.id,
      memberName: CURRENT_MEMBER.name,
      deviceId: newDevice.id,
      deviceName: newDevice.name,
      action: `接入新设备（品牌：${newDevice.brand}）`,
      timestamp: new Date().toISOString(),
      result: 'success',
    })
  },

  updateDeviceState: (deviceId, newState, recordAction) => {
    const oldDevice = get().devices.find((d) => d.id === deviceId)
    if (!oldDevice) return

    set((state) => ({
      devices: state.devices.map((d) =>
        d.id === deviceId
          ? { ...d, state: { ...d.state, ...newState }, lastUpdated: new Date().toISOString() }
          : d
      ),
    }))

    const actionText = recordAction || buildActionText(oldDevice, newState)
    if (actionText) {
      get().addOperationRecord({
        memberId: CURRENT_MEMBER.id,
        memberName: CURRENT_MEMBER.name,
        deviceId,
        deviceName: oldDevice.name,
        action: actionText,
        timestamp: new Date().toISOString(),
        result: 'success',
      })
    }
  },

  toggleDevice: (deviceId) => {
    const device = get().devices.find((d) => d.id === deviceId)
    if (!device) return

    const s = device.state as unknown as Record<string, unknown>
    if ('on' in s) {
      const wasOn = !!s.on
      const newOn = !wasOn
      get().updateDeviceState(deviceId, { on: newOn } as Partial<DeviceState>,
        `${device.name}${newOn ? '已开启' : '已关闭'}`)
    } else if ('locked' in s) {
      const wasLocked = !!s.locked
      const newLocked = !wasLocked
      get().updateDeviceState(deviceId, { locked: newLocked } as Partial<DeviceState>,
        newLocked ? '锁定门锁' : '解锁门锁')
    }
  },

  addScene: (scene) => {
    const newScene: Scene = {
      ...scene,
      id: generateId('scene'),
    }
    set((state) => ({
      scenes: [...state.scenes, newScene],
    }))
    get().addOperationRecord({
      memberId: CURRENT_MEMBER.id,
      memberName: CURRENT_MEMBER.name,
      deviceId: '',
      deviceName: '-',
      action: `创建自动化场景"${newScene.name}"（${newScene.actions.length}个动作）`,
      timestamp: new Date().toISOString(),
      result: 'success',
    })
  },

  toggleScene: (sceneId) => {
    const scene = get().scenes.find((s) => s.id === sceneId)
    set((state) => ({
      scenes: state.scenes.map((s) =>
        s.id === sceneId ? { ...s, enabled: !s.enabled } : s
      ),
    }))
    if (scene) {
      const nowEnabled = !scene.enabled
      get().addOperationRecord({
        memberId: CURRENT_MEMBER.id,
        memberName: CURRENT_MEMBER.name,
        deviceId: '',
        deviceName: '-',
        action: `${nowEnabled ? '启用' : '停用'}场景"${scene.name}"`,
        timestamp: new Date().toISOString(),
        result: 'success',
      })
    }
  },

  executeScene: (sceneId) => {
    const scene = get().scenes.find((s) => s.id === sceneId)
    if (!scene) return

    set((state) => {
      const updatedDevices = state.devices.map((d) => {
        const action = scene.actions.find((a) => a.deviceId === d.id)
        if (!action) return d
        return {
          ...d,
          state: { ...d.state, ...action.command },
          lastUpdated: new Date().toISOString(),
        }
      })
      const updatedScenes = state.scenes.map((s) =>
        s.id === sceneId ? { ...s, lastExecuted: new Date().toISOString() } : s
      )
      return { devices: updatedDevices, scenes: updatedScenes }
    })

    const deviceNames = scene.actions
      .map((a) => get().devices.find((d) => d.id === a.deviceId)?.name)
      .filter(Boolean)
      .join('、')

    get().addOperationRecord({
      memberId: CURRENT_MEMBER.id,
      memberName: CURRENT_MEMBER.name,
      deviceId: scene.actions[0]?.deviceId || '',
      deviceName: deviceNames || '-',
      action: `执行场景"${scene.name}"：${deviceNames || scene.actions.length + '个设备'}`,
      timestamp: new Date().toISOString(),
      result: 'success',
    })

    scene.actions.forEach((a) => {
      const d = get().devices.find((dv) => dv.id === a.deviceId)
      if (d) {
        get().addOperationRecord({
          memberId: CURRENT_MEMBER.id,
          memberName: CURRENT_MEMBER.name,
          deviceId: a.deviceId,
          deviceName: d.name,
          action: buildActionText(d, a.command),
          timestamp: new Date().toISOString(),
          result: 'success',
        })
      }
    })
  },

  resolveAlert: (alertId) => {
    const alert = get().alerts.find((a) => a.id === alertId)
    set((state) => ({
      alerts: state.alerts.map((a) =>
        a.id === alertId ? { ...a, resolved: true } : a
      ),
    }))
    if (alert) {
      get().addOperationRecord({
        memberId: CURRENT_MEMBER.id,
        memberName: CURRENT_MEMBER.name,
        deviceId: alert.deviceId,
        deviceName: alert.deviceName,
        action: `处理告警：${alert.message}`,
        timestamp: new Date().toISOString(),
        result: 'success',
      })
    }
  },

  updateMemberPermissions: (memberId, deviceIds) =>
    set((state) => ({
      members: state.members.map((m) =>
        m.id === memberId ? { ...m, permissions: { ...m.permissions, deviceIds } } : m
      ),
    })),
}))

function buildActionText(device: Device, newState: Record<string, unknown>): string {
  const parts: string[] = []
  if ('on' in newState) {
    parts.push(newState.on ? '开启' : '关闭')
  }
  if ('brightness' in newState) {
    parts.push(`亮度设为${newState.brightness}%`)
  }
  if ('colorTemp' in newState) {
    parts.push(`色温设为${newState.colorTemp}K`)
  }
  if ('targetTemp' in newState) {
    parts.push(`目标温度设为${newState.targetTemp}°C`)
  }
  if ('mode' in newState) {
    const modeMap: Record<string, string> = { cooling: '制冷', heating: '制热', auto: '自动' }
    parts.push(`切换为${modeMap[newState.mode as string] || newState.mode}模式`)
  }
  if ('locked' in newState) {
    parts.push(newState.locked ? '锁定' : '解锁')
  }
  if ('position' in newState) {
    parts.push(`开合度设为${newState.position}%`)
  }
  if ('recording' in newState) {
    parts.push(newState.recording ? '开始录制' : '停止录制')
  }
  return parts.join(' · ')
}

export function buildActionTextForPreview(command: Record<string, unknown>, deviceName: string): string {
  const parts = buildActionTextForPreviewParts(command)
  return `${deviceName} → ${parts.join('、') || '控制'}`
}

function buildActionTextForPreviewParts(command: Record<string, unknown>): string[] {
  const parts: string[] = []
  if ('on' in command) parts.push(command.on ? '开启' : '关闭')
  if ('brightness' in command) parts.push(`亮度${command.brightness}%`)
  if ('colorTemp' in command) parts.push(`色温${command.colorTemp}K`)
  if ('targetTemp' in command) parts.push(`温度${command.targetTemp}°C`)
  if ('mode' in command) {
    const modeMap: Record<string, string> = { cooling: '制冷', heating: '制热', auto: '自动' }
    parts.push(modeMap[command.mode as string] || `${command.mode}模式`)
  }
  if ('locked' in command) parts.push(command.locked ? '锁定' : '解锁')
  if ('position' in command) parts.push(`开合度${command.position}%`)
  return parts
}
