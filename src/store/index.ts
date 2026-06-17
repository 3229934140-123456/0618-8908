import { create } from 'zustand'
import type { Device, Scene, OperationRecord, AlertEvent, EnergyData, FamilyMember } from '@/types'
import { devices as mockDevices, scenes as mockScenes, operationRecords as mockHistory, alerts as mockAlerts, energyData as mockEnergy, members as mockMembers } from '@/mocks'

interface SmartHomeStore {
  devices: Device[]
  scenes: Scene[]
  operationRecords: OperationRecord[]
  alerts: AlertEvent[]
  energyData: EnergyData[]
  members: FamilyMember[]

  updateDeviceState: (deviceId: string, newState: Partial<Device['state']>) => void
  toggleDevice: (deviceId: string) => void
  toggleScene: (sceneId: string) => void
  executeScene: (sceneId: string) => void
  resolveAlert: (alertId: string) => void
  updateMemberPermissions: (memberId: string, deviceIds: string[]) => void
  addOperationRecord: (record: Omit<OperationRecord, 'id'>) => void
}

export const useSmartHomeStore = create<SmartHomeStore>((set) => ({
  devices: mockDevices,
  scenes: mockScenes,
  operationRecords: mockHistory,
  alerts: mockAlerts,
  energyData: mockEnergy,
  members: mockMembers,

  updateDeviceState: (deviceId, newState) =>
    set((state) => ({
      devices: state.devices.map((d) =>
        d.id === deviceId ? { ...d, state: { ...d.state, ...newState } } : d
      ),
    })),

  toggleDevice: (deviceId) =>
    set((state) => ({
      devices: state.devices.map((d) => {
        if (d.id !== deviceId) return d
        const s = d.state as unknown as Record<string, unknown>
        if ('on' in s) return { ...d, state: { ...d.state, on: !s.on } }
        if ('locked' in s) return { ...d, state: { ...d.state, locked: !s.locked } }
        return d
      }),
    })),

  toggleScene: (sceneId) =>
    set((state) => ({
      scenes: state.scenes.map((s) =>
        s.id === sceneId ? { ...s, enabled: !s.enabled } : s
      ),
    })),

  executeScene: (sceneId) =>
    set((state) => {
      const scene = state.scenes.find((s) => s.id === sceneId)
      if (!scene) return state
      const updatedDevices = state.devices.map((d) => {
        const action = scene.actions.find((a) => a.deviceId === d.id)
        if (!action) return d
        return { ...d, state: { ...d.state, ...action.command } }
      })
      const updatedScenes = state.scenes.map((s) =>
        s.id === sceneId ? { ...s, lastExecuted: new Date().toISOString() } : s
      )
      return { devices: updatedDevices, scenes: updatedScenes }
    }),

  resolveAlert: (alertId) =>
    set((state) => ({
      alerts: state.alerts.map((a) =>
        a.id === alertId ? { ...a, resolved: true } : a
      ),
    })),

  updateMemberPermissions: (memberId, deviceIds) =>
    set((state) => ({
      members: state.members.map((m) =>
        m.id === memberId ? { ...m, permissions: { ...m.permissions, deviceIds } } : m
      ),
    })),

  addOperationRecord: (record) =>
    set((state) => ({
      operationRecords: [
        { ...record, id: `op-${Date.now()}` },
        ...state.operationRecords,
      ],
    })),
}))
