import { useSmartHomeStore } from '@/store'
import { getDeviceIcon } from '@/utils/deviceIcons'
import { isDeviceOn } from '@/utils/deviceHelpers'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X, Battery, Thermometer, Sun, Lock, Blinds, Droplets, Video,
} from 'lucide-react'
import type {
  LightState, ThermostatState, LockState, SwitchState,
  CurtainState, SensorState, CameraState,
} from '@/types'

function PowerToggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-12 h-7 rounded-full transition-colors ${on ? 'bg-amber-primary' : 'bg-dark-500'}`}
    >
      <div className={`w-5 h-5 rounded-full bg-white transition-transform ${on ? 'translate-x-[26px]' : 'translate-x-[3px]'}`} />
    </button>
  )
}

export default function DeviceControlDrawer({
  deviceId,
  onClose,
}: {
  deviceId: string
  onClose: () => void
}) {
  const device = useSmartHomeStore((s) => s.devices.find((d) => d.id === deviceId))
  const updateDeviceState = useSmartHomeStore((s) => s.updateDeviceState)
  const toggleDevice = useSmartHomeStore((s) => s.toggleDevice)

  if (!device) return null
  const isOn = isDeviceOn(device)

  const renderControls = () => {
    switch (device.type) {
      case 'light': {
        const s = device.state as LightState
        return (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300 font-display">电源</span>
              <PowerToggle on={s.on} onClick={() => toggleDevice(device.id)} />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-300 font-display flex items-center gap-1.5">
                  <Sun className="w-3.5 h-3.5" /> 亮度
                </span>
                <span className="text-xs text-amber-primary font-display">{s.brightness}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={s.brightness}
                onChange={(e) => updateDeviceState(device.id, { brightness: +e.target.value })}
                className="w-full accent-amber-primary"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-300 font-display flex items-center gap-1.5">
                  <Thermometer className="w-3.5 h-3.5" /> 色温
                </span>
                <span className="text-xs text-ice-primary font-display">{s.colorTemp}K</span>
              </div>
              <input
                type="range"
                min="2700"
                max="6500"
                value={s.colorTemp}
                onChange={(e) => updateDeviceState(device.id, { colorTemp: +e.target.value })}
                className="w-full accent-ice-primary"
              />
            </div>
          </div>
        )
      }
      case 'thermostat': {
        const s = device.state as ThermostatState
        return (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300 font-display">电源</span>
              <PowerToggle on={s.on} onClick={() => toggleDevice(device.id)} />
            </div>
            <div className="text-center py-4">
              <p className="text-4xl font-display font-bold text-white">{s.temperature}°C</p>
              <p className="text-xs text-gray-500 mt-1">当前温度</p>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-300 font-display">目标温度</span>
                <span className="text-xs text-amber-primary font-display">{s.targetTemp}°C</span>
              </div>
              <input
                type="range"
                min="16"
                max="32"
                value={s.targetTemp}
                onChange={(e) => updateDeviceState(device.id, { targetTemp: +e.target.value })}
                className="w-full accent-amber-primary"
              />
            </div>
            <div className="flex gap-2">
              {['cooling', 'heating', 'auto'].map((mode) => (
                <button
                  key={mode}
                  onClick={() => updateDeviceState(device.id, { mode })}
                  className={`flex-1 py-2 rounded-lg text-xs font-display font-medium transition-colors ${
                    s.mode === mode ? 'bg-amber-primary/20 text-amber-primary' : 'bg-dark-500/40 text-gray-500 hover:text-gray-300'
                  }`}
                >
                  {mode === 'cooling' ? '制冷' : mode === 'heating' ? '制热' : '自动'}
                </button>
              ))}
            </div>
          </div>
        )
      }
      case 'lock': {
        const s = device.state as LockState
        return (
          <div className="space-y-5">
            <div className="text-center py-4">
              <Lock className={`w-12 h-12 mx-auto ${s.locked ? 'text-success' : 'text-danger'}`} />
              <p className={`text-lg font-display font-bold mt-2 ${s.locked ? 'text-success' : 'text-danger'}`}>
                {s.locked ? '已锁定' : '未锁定'}
              </p>
            </div>
            <button
              onClick={() => toggleDevice(device.id)}
              className={`w-full py-3 rounded-xl font-display font-semibold text-sm transition-colors ${
                s.locked ? 'bg-danger/20 text-danger hover:bg-danger/30' : 'bg-success/20 text-success hover:bg-success/30'
              }`}
            >
              {s.locked ? '解锁' : '锁定'}
            </button>
            <div className="flex items-center justify-between glass-card p-3">
              <span className="text-xs text-gray-400 font-display flex items-center gap-1.5">
                <Battery className="w-3.5 h-3.5" /> 电池电量
              </span>
              <span className={`text-xs font-display font-medium ${s.batteryLevel > 30 ? 'text-success' : 'text-danger'}`}>
                {s.batteryLevel}%
              </span>
            </div>
          </div>
        )
      }
      case 'switch': {
        const s = device.state as SwitchState
        return (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300 font-display">电源</span>
              <PowerToggle on={s.on} onClick={() => toggleDevice(device.id)} />
            </div>
          </div>
        )
      }
      case 'curtain': {
        const s = device.state as CurtainState
        return (
          <div className="space-y-5">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-300 font-display flex items-center gap-1.5">
                  <Blinds className="w-3.5 h-3.5" /> 开合度
                </span>
                <span className="text-xs text-amber-primary font-display">{s.position}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={s.position}
                onChange={(e) => updateDeviceState(device.id, { position: +e.target.value })}
                className="w-full accent-amber-primary"
              />
            </div>
            <div className="flex gap-2">
              {[0, 50, 100].map((v) => (
                <button
                  key={v}
                  onClick={() => updateDeviceState(device.id, { position: v })}
                  className={`flex-1 py-2 rounded-lg text-xs font-display font-medium transition-colors ${
                    s.position === v ? 'bg-amber-primary/20 text-amber-primary' : 'bg-dark-500/40 text-gray-500 hover:text-gray-300'
                  }`}
                >
                  {v === 0 ? '全关' : v === 50 ? '半开' : '全开'}
                </button>
              ))}
            </div>
          </div>
        )
      }
      case 'sensor': {
        const s = device.state as SensorState
        const danger = s.value >= s.alertThreshold
        return (
          <div className="space-y-5">
            <div className="text-center py-4">
              <Droplets className={`w-12 h-12 mx-auto ${danger ? 'text-danger' : 'text-ice-primary'}`} />
              <p className="text-3xl font-display font-bold mt-2 text-white">
                {s.value} <span className="text-lg text-gray-400">{s.unit}</span>
              </p>
              <p className="text-xs text-gray-500 mt-1">告警阈值：{s.alertThreshold}{s.unit}</p>
            </div>
          </div>
        )
      }
      case 'camera': {
        const s = device.state as CameraState
        return (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300 font-display">录制</span>
              <PowerToggle on={s.recording} onClick={() => toggleDevice(device.id)} />
            </div>
            <div className="aspect-video bg-dark-900 rounded-xl flex items-center justify-center border border-dark-500/30">
              <Video className="w-10 h-10 text-dark-500" />
            </div>
          </div>
        )
      }
      default:
        return <p className="text-sm text-gray-500 text-center py-4">暂无控制选项</p>
    }
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50"
        onClick={onClose}
      />
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 250 }}
        className="fixed right-0 top-0 bottom-0 w-[360px] bg-dark-800 border-l border-dark-500/20 z-50 overflow-y-auto"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-display font-bold text-lg text-white">{device.name}</h3>
            <button onClick={onClose} className="w-8 h-8 rounded-lg bg-dark-600 flex items-center justify-center text-gray-400 hover:text-white transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="glass-card p-4 mb-6">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isOn ? 'bg-amber-primary/20' : 'bg-dark-500/30'}`}>
                {(() => {
                  const Icon = getDeviceIcon(device.icon, device.type)
                  return <Icon className={`w-6 h-6 ${isOn ? 'text-amber-primary' : 'text-gray-500'}`} />
                })()}
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-400">{device.brand}</p>
                <p className="text-xs text-gray-600">
                  {device.room} · {device.status === 'online' ? '在线' : '离线'}
                </p>
              </div>
              <div className={`w-2.5 h-2.5 rounded-full ${device.status === 'online' ? 'bg-success' : 'bg-gray-600'}`} />
            </div>
          </div>
          <div>
            <h4 className="font-display font-semibold text-sm text-gray-400 mb-4">设备控制</h4>
            {renderControls()}
          </div>
        </div>
      </motion.div>
    </>
  )
}

export function DeviceControlModal({
  open,
  deviceId,
  onClose,
}: {
  open: boolean
  deviceId: string | null
  onClose: () => void
}) {
  return (
    <AnimatePresence>
      {open && deviceId && (
        <DeviceControlDrawer deviceId={deviceId} onClose={onClose} />
      )}
    </AnimatePresence>
  )
}
