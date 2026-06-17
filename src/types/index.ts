export type DeviceType = 'light' | 'thermostat' | 'lock' | 'sensor' | 'camera' | 'switch' | 'curtain'

export interface LightState {
  on: boolean
  brightness: number
  colorTemp: number
}

export interface ThermostatState {
  temperature: number
  targetTemp: number
  mode: string
  on: boolean
}

export interface LockState {
  locked: boolean
  batteryLevel: number
}

export interface SensorState {
  value: number
  unit: string
  alertThreshold: number
}

export interface CameraState {
  recording: boolean
  streamUrl: string
}

export interface SwitchState {
  on: boolean
}

export interface CurtainState {
  position: number
}

export type DeviceState = LightState | ThermostatState | LockState | SensorState | CameraState | SwitchState | CurtainState

export interface Device {
  id: string
  name: string
  brand: string
  type: DeviceType
  room: string
  status: 'online' | 'offline'
  state: DeviceState
  icon: string
  lastUpdated: string
}

export interface Trigger {
  type: 'time' | 'geofence' | 'device_state' | 'manual'
  config: {
    time?: string
    geofence?: { lat: number; lng: number; radius: number }
    deviceId?: string
    stateCondition?: Record<string, unknown>
  }
}

export interface SceneAction {
  deviceId: string
  command: Record<string, unknown>
  delay?: number
}

export interface Scene {
  id: string
  name: string
  icon: string
  enabled: boolean
  triggers: Trigger[]
  actions: SceneAction[]
  lastExecuted?: string
}

export interface OperationRecord {
  id: string
  memberId: string
  memberName: string
  deviceId: string
  deviceName: string
  action: string
  timestamp: string
  result: 'success' | 'failed'
}

export interface AlertEvent {
  id: string
  type: 'security' | 'safety' | 'device'
  severity: 'critical' | 'warning' | 'info'
  deviceId: string
  deviceName: string
  message: string
  timestamp: string
  resolved: boolean
}

export interface EnergyDaily {
  date: string
  kWh: number
}

export interface EnergyMonthly {
  month: string
  kWh: number
}

export interface EnergyData {
  deviceId: string
  deviceName: string
  daily: EnergyDaily[]
  monthly: EnergyMonthly[]
  totalKWh: number
}

export interface FamilyMember {
  id: string
  name: string
  avatar: string
  role: 'admin' | 'member'
  online: boolean
  permissions: {
    deviceIds: string[]
    canCreateScene: boolean
    canManageMembers: boolean
  }
}
