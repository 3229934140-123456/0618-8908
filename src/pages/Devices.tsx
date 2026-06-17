import { useState } from 'react'
import { useSmartHomeStore } from '@/store'
import DeviceCard from '@/components/DeviceCard'
import { getDeviceIcon } from '@/utils/deviceIcons'
import { getDeviceStatusText, isDeviceOn } from '@/utils/deviceHelpers'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X, Key, Search, SlidersHorizontal, Battery, Thermometer, Sun, Lock } from 'lucide-react'
import type { Device, LightState, ThermostatState, LockState, SwitchState } from '@/types'

const rooms = ['全部', '客厅', '卧室', '书房', '门厅', '厨房', '后院']
const types: { label: string; value: string }[] = [
  { label: '全部', value: 'all' },
  { label: '灯光', value: 'light' },
  { label: '温控', value: 'thermostat' },
  { label: '门锁', value: 'lock' },
  { label: '传感器', value: 'sensor' },
  { label: '摄像头', value: 'camera' },
  { label: '插座', value: 'switch' },
  { label: '窗帘', value: 'curtain' },
]

const brands = ['Philips Hue', 'Yeelight', 'Daikin', 'Gree', 'Aqara', 'Xiaomi', 'Honeywell', 'Hikvision', 'TP-Link']

function DeviceControlDrawer({ device, onClose }: { device: Device; onClose: () => void }) {
  const { updateDeviceState, toggleDevice } = useSmartHomeStore()
  const isOn = isDeviceOn(device)

  const renderControls = () => {
    switch (device.type) {
      case 'light': {
        const s = device.state as LightState
        return (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300 font-display">电源</span>
              <button
                onClick={() => toggleDevice(device.id)}
                className={`w-12 h-7 rounded-full transition-colors ${s.on ? 'bg-amber-primary' : 'bg-dark-500'}`}
              >
                <div className={`w-5 h-5 rounded-full bg-white transition-transform ${s.on ? 'translate-x-[26px]' : 'translate-x-[3px]'}`} />
              </button>
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
              <button
                onClick={() => toggleDevice(device.id)}
                className={`w-12 h-7 rounded-full transition-colors ${s.on ? 'bg-amber-primary' : 'bg-dark-500'}`}
              >
                <div className={`w-5 h-5 rounded-full bg-white transition-transform ${s.on ? 'translate-x-[26px]' : 'translate-x-[3px]'}`} />
              </button>
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
                    s.mode === mode ? 'bg-amber-primary/20 text-amber-primary' : 'bg-dark-500/40 text-gray-500'
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
              <button
                onClick={() => toggleDevice(device.id)}
                className={`w-12 h-7 rounded-full transition-colors ${s.on ? 'bg-amber-primary' : 'bg-dark-500'}`}
              >
                <div className={`w-5 h-5 rounded-full bg-white transition-transform ${s.on ? 'translate-x-[26px]' : 'translate-x-[3px]'}`} />
              </button>
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
              <div>
                <p className="text-sm text-gray-400">{device.brand}</p>
                <p className="text-xs text-gray-600">{device.room} · {device.status === 'online' ? '在线' : '离线'}</p>
              </div>
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

function AddDeviceModal({ onClose }: { onClose: () => void }) {
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null)
  const [apiKey, setApiKey] = useState('')

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
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <div className="bg-dark-800 border border-dark-500/30 rounded-2xl w-full max-w-lg p-6 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-display font-bold text-lg text-white">添加设备</h3>
            <button onClick={onClose} className="w-8 h-8 rounded-lg bg-dark-600 flex items-center justify-center text-gray-400 hover:text-white transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="mb-5">
            <h4 className="text-sm font-display font-medium text-gray-300 mb-3">选择品牌</h4>
            <div className="grid grid-cols-3 gap-2">
              {brands.map((brand) => (
                <button
                  key={brand}
                  onClick={() => setSelectedBrand(brand)}
                  className={`p-3 rounded-xl text-xs font-display font-medium transition-all ${
                    selectedBrand === brand
                      ? 'bg-amber-primary/15 border border-amber-primary/40 text-amber-primary'
                      : 'bg-dark-600/40 border border-dark-500/20 text-gray-400 hover:border-dark-500/50'
                  }`}
                >
                  {brand}
                </button>
              ))}
            </div>
          </div>

          {selectedBrand && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <h4 className="text-sm font-display font-medium text-gray-300 mb-3">API 密钥</h4>
              <div className="relative mb-4">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="输入品牌 API 密钥"
                  className="w-full pl-10 pr-4 py-3 bg-dark-600/40 border border-dark-500/20 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-amber-primary/40 transition-colors"
                />
              </div>
              <button className="btn-primary w-full flex items-center justify-center gap-2">
                授权并获取设备
              </button>
            </motion.div>
          )}
        </div>
      </motion.div>
    </>
  )
}

export default function Devices() {
  const devices = useSmartHomeStore((s) => s.devices)
  const [selectedRoom, setSelectedRoom] = useState('全部')
  const [selectedType, setSelectedType] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)

  const filtered = devices.filter((d) => {
    if (selectedRoom !== '全部' && d.room !== selectedRoom) return false
    if (selectedType !== 'all' && d.type !== selectedType) return false
    if (searchQuery && !d.name.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-2xl text-white">设备管理</h1>
          <p className="text-sm text-gray-500 mt-1 font-display">{devices.length} 个已接入设备</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> 添加设备
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索设备..."
            className="w-full pl-10 pr-4 py-2.5 bg-dark-700/60 border border-dark-500/30 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-amber-primary/40 transition-colors"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <SlidersHorizontal className="w-4 h-4 text-gray-500" />
          {types.map((t) => (
            <button
              key={t.value}
              onClick={() => setSelectedType(t.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-display font-medium transition-colors ${
                selectedType === t.value
                  ? 'bg-amber-primary/15 text-amber-primary'
                  : 'bg-dark-600/40 text-gray-500 hover:text-gray-300'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {rooms.map((room) => (
          <button
            key={room}
            onClick={() => setSelectedRoom(room)}
            className={`px-4 py-2 rounded-xl text-sm font-display font-medium transition-colors whitespace-nowrap ${
              selectedRoom === room
                ? 'bg-amber-primary text-dark-900'
                : 'bg-dark-600/40 text-gray-400 hover:text-white hover:bg-dark-500/40'
            }`}
          >
            {room}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {filtered.map((device, i) => (
          <motion.div
            key={device.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            onClick={() => setSelectedDevice(device)}
            className="cursor-pointer"
          >
            <DeviceCard device={device} />
          </motion.div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <p className="text-gray-500 font-display">未找到匹配的设备</p>
        </div>
      )}

      <AnimatePresence>
        {selectedDevice && (
          <DeviceControlDrawer device={selectedDevice} onClose={() => setSelectedDevice(null)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAddModal && <AddDeviceModal onClose={() => setShowAddModal(false)} />}
      </AnimatePresence>
    </div>
  )
}
