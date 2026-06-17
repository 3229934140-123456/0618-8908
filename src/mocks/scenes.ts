import type { Scene } from '@/types'

export const scenes: Scene[] = [
  {
    id: 'scene-001',
    name: '回家模式',
    icon: 'home',
    enabled: true,
    triggers: [
      { type: 'geofence', config: { geofence: { lat: 31.2304, lng: 121.4737, radius: 200 } } },
    ],
    actions: [
      { deviceId: 'dev-001', command: { on: true, brightness: 80 } },
      { deviceId: 'dev-003', command: { on: true, targetTemp: 26 } },
      { deviceId: 'dev-011', command: { position: 50 } },
      { deviceId: 'dev-010', command: { on: true } },
    ],
    lastExecuted: '2026-06-18T18:30:00Z',
  },
  {
    id: 'scene-002',
    name: '睡前模式',
    icon: 'moon',
    enabled: true,
    triggers: [
      { type: 'time', config: { time: '22:30' } },
    ],
    actions: [
      { deviceId: 'dev-001', command: { on: false } },
      { deviceId: 'dev-002', command: { on: false } },
      { deviceId: 'dev-005', command: { locked: true } },
      { deviceId: 'dev-006', command: { locked: true } },
      { deviceId: 'dev-003', command: { targetTemp: 26, on: true } },
      { deviceId: 'dev-011', command: { position: 0 } },
    ],
    lastExecuted: '2026-06-17T22:30:00Z',
  },
  {
    id: 'scene-003',
    name: '离家模式',
    icon: 'door-open',
    enabled: true,
    triggers: [
      { type: 'geofence', config: { geofence: { lat: 31.2304, lng: 121.4737, radius: 500 } } },
    ],
    actions: [
      { deviceId: 'dev-001', command: { on: false } },
      { deviceId: 'dev-002', command: { on: false } },
      { deviceId: 'dev-005', command: { locked: true } },
      { deviceId: 'dev-006', command: { locked: true } },
      { deviceId: 'dev-003', command: { on: false } },
      { deviceId: 'dev-004', command: { on: false } },
      { deviceId: 'dev-010', command: { on: false } },
    ],
    lastExecuted: '2026-06-18T08:00:00Z',
  },
  {
    id: 'scene-004',
    name: '起床模式',
    icon: 'sunrise',
    enabled: true,
    triggers: [
      { type: 'time', config: { time: '07:00' } },
    ],
    actions: [
      { deviceId: 'dev-002', command: { on: true, brightness: 60 } },
      { deviceId: 'dev-011', command: { position: 100 } },
      { deviceId: 'dev-004', command: { on: true, targetTemp: 24 } },
    ],
    lastExecuted: '2026-06-18T07:00:00Z',
  },
  {
    id: 'scene-005',
    name: '影院模式',
    icon: 'clapperboard',
    enabled: false,
    triggers: [
      { type: 'manual', config: {} },
    ],
    actions: [
      { deviceId: 'dev-001', command: { on: true, brightness: 10 } },
      { deviceId: 'dev-011', command: { position: 0 } },
    ],
  },
  {
    id: 'scene-006',
    name: '工作模式',
    icon: 'briefcase',
    enabled: true,
    triggers: [
      { type: 'time', config: { time: '09:00' } },
    ],
    actions: [
      { deviceId: 'dev-001', command: { on: true, brightness: 100, colorTemp: 5000 } },
      { deviceId: 'dev-010', command: { on: true } },
    ],
    lastExecuted: '2026-06-18T09:00:00Z',
  },
]
