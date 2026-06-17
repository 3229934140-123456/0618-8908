import { useState, useMemo } from 'react'
import { useSmartHomeStore } from '@/store'
import DeviceCard from '@/components/DeviceCard'
import { DeviceControlModal } from '@/components/DeviceControlDrawer'
import { getDeviceIcon } from '@/utils/deviceIcons'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus, X, Key, Search, SlidersHorizontal, Battery, Thermometer, Sun, Lock,
  Lightbulb, Shield, Droplets, Flame, Video, Plug, Blinds, Check, Loader2,
} from 'lucide-react'
import type { Device, DeviceType } from '@/types'

const rooms = ['全部', '客厅', '卧室', '书房', '门厅', '厨房', '后院', '卫生间', '阳台']
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

const brands = ['Philips Hue', 'Yeelight', 'Daikin', 'Gree', 'Aqara', 'Xiaomi', 'Honeywell', 'Hikvision', 'TP-Link', 'Google Nest', 'Amazon Echo', '小米', '华为']

type SimulatedDevice = {
  name: string
  type: DeviceType
  icon: string
  room: string
  state: Record<string, unknown>
}

const brandDeviceMap: Record<string, SimulatedDevice[]> = {
  'Philips Hue': [
    { name: 'Hue 彩光灯带', type: 'light', icon: 'lightbulb', room: '客厅', state: { on: false, brightness: 100, colorTemp: 4000 } },
    { name: 'Hue 壁灯', type: 'light', icon: 'lightbulb', room: '走廊', state: { on: false, brightness: 60, colorTemp: 3000 } },
  ],
  'Yeelight': [
    { name: '易来智能灯泡', type: 'light', icon: 'lightbulb', room: '卫生间', state: { on: false, brightness: 80, colorTemp: 4000 } },
  ],
  'Daikin': [
    { name: '大金立式空调', type: 'thermostat', icon: 'thermometer', room: '客厅', state: { temperature: 27, targetTemp: 26, mode: 'cooling', on: false } },
  ],
  'Gree': [
    { name: '格力空调', type: 'thermostat', icon: 'thermometer', room: '书房', state: { temperature: 26, targetTemp: 25, mode: 'cooling', on: false } },
  ],
  'Aqara': [
    { name: '绿米智能门锁', type: 'lock', icon: 'lock', room: '门厅', state: { locked: true, batteryLevel: 90 } },
    { name: '绿米电动窗帘', type: 'curtain', icon: 'blinds', room: '客厅', state: { position: 0 } },
  ],
  'Xiaomi': [
    { name: '小米温湿度计', type: 'sensor', icon: 'droplets', room: '卧室', state: { value: 55, unit: '%', alertThreshold: 80 } },
  ],
  'Honeywell': [
    { name: '霍尼韦尔燃气报警器', type: 'sensor', icon: 'flame', room: '厨房', state: { value: 5, unit: 'ppm', alertThreshold: 50 } },
  ],
  'Hikvision': [
    { name: '海康监控摄像头', type: 'camera', icon: 'video', room: '后院', state: { recording: true, streamUrl: '' } },
  ],
  'TP-Link': [
    { name: 'Kasa 智能插座', type: 'switch', icon: 'plug', room: '书房', state: { on: false } },
  ],
  'Google Nest': [
    { name: 'Nest 温控器', type: 'thermostat', icon: 'thermometer', room: '卧室', state: { temperature: 24, targetTemp: 23, mode: 'auto', on: false } },
  ],
  'Amazon Echo': [
    { name: 'Echo Show', type: 'switch', icon: 'plug', room: '客厅', state: { on: true } },
  ],
  '小米': [
    { name: '小米智能插座', type: 'switch', icon: 'plug', room: '卧室', state: { on: false } },
  ],
  '华为': [
    { name: '华为电动窗帘', type: 'curtain', icon: 'blinds', room: '书房', state: { position: 0 } },
  ],
}

type AddStep = 'brand' | 'auth' | 'loading' | 'select' | 'done'

function AddDeviceModal({ onClose }: { onClose: () => void }) {
  const addDevice = useSmartHomeStore((s) => s.addDevice)
  const existing = useSmartHomeStore((s) => s.devices)
  const [step, setStep] = useState<AddStep>('brand')
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null)
  const [apiKey, setApiKey] = useState('')
  const [selectedDevices, setSelectedDevices] = useState<number[]>([])
  const [addedCount, setAddedCount] = useState(0)

  const available = useMemo(() => {
    const list = brandDeviceMap[selectedBrand || ''] || []
    const existingNames = new Set(existing.map((d) => `${d.name}${d.brand}`))
    return list.filter((sim) => !existingNames.has(`${sim.name}${selectedBrand}`))
  }, [selectedBrand, existing])

  const toggleSelect = (i: number) => {
    setSelectedDevices((prev) =>
      prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]
    )
  }

  const handleAuthorize = async () => {
    if (!selectedBrand || !apiKey.trim()) return
    setStep('loading')
    await new Promise((r) => setTimeout(r, 1200))
    setStep('select')
  }

  const handleAddSelected = () => {
    if (!selectedBrand) return
    selectedDevices.forEach((i) => {
      const sim = available[i]
      addDevice({
        name: sim.name,
        brand: selectedBrand,
        type: sim.type,
        room: sim.room,
        status: 'online',
        state: sim.state as unknown as Device['state'],
        icon: sim.icon,
      })
    })
    setAddedCount(selectedDevices.length)
    setStep('done')
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50"
        onClick={step === 'done' ? onClose : onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <div className="bg-dark-800 border border-dark-500/30 rounded-2xl w-full max-w-2xl p-6 max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-display font-bold text-lg text-white">添加设备</h3>
              <p className="text-xs text-gray-500 mt-1 font-display">
                {step === 'brand' && '第 1 步 · 选择设备品牌'}
                {step === 'auth' && '第 2 步 · 品牌 API 授权'}
                {step === 'loading' && '正在连接品牌服务器...'}
                {step === 'select' && `第 3 步 · 选择要接入的设备（${selectedDevices.length} 已选择）`}
                {step === 'done' && '接入成功！'}
              </p>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-lg bg-dark-600 flex items-center justify-center text-gray-400 hover:text-white transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          {step === 'brand' && (
            <div>
              <h4 className="text-sm font-display font-medium text-gray-300 mb-3">选择品牌</h4>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {brands.map((brand) => (
                  <button
                    key={brand}
                    onClick={() => {
                      setSelectedBrand(brand)
                      setStep('auth')
                    }}
                    className="p-4 rounded-xl text-xs font-display font-medium transition-all bg-dark-600/40 border border-dark-500/20 text-gray-300 hover:border-amber-primary/40 hover:text-amber-primary hover:bg-amber-primary/5"
                  >
                    {brand}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 'auth' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <div className="glass-card p-4 mb-5 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-primary/15 flex items-center justify-center flex-shrink-0">
                  <Shield className="w-5 h-5 text-amber-primary" />
                </div>
                <div>
                  <p className="text-sm font-display font-semibold text-white">{selectedBrand}</p>
                  <p className="text-xs text-gray-500">将跳转至品牌授权页面，安全授权后读取您的设备列表</p>
                </div>
              </div>
              <h4 className="text-sm font-display font-medium text-gray-300 mb-3">API 密钥</h4>
              <div className="relative mb-4">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="请输入品牌 API 密钥，测试可输入任意非空值"
                  className="w-full pl-10 pr-4 py-3 bg-dark-600/40 border border-dark-500/20 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-amber-primary/40 transition-colors"
                />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep('brand')} className="btn-secondary flex-1">返回</button>
                <button
                  onClick={handleAuthorize}
                  disabled={!apiKey.trim()}
                  className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  授权并获取设备
                </button>
              </div>
            </motion.div>
          )}

          {step === 'loading' && (
            <div className="py-16 flex flex-col items-center justify-center">
              <Loader2 className="w-12 h-12 text-amber-primary animate-spin" />
              <p className="mt-4 text-sm text-gray-400 font-display">正在连接 {selectedBrand} 服务器...</p>
              <p className="mt-1 text-xs text-gray-600 font-display">读取您账号下的智能设备列表</p>
            </div>
          )}

          {step === 'select' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-display font-medium text-gray-300">
                  发现 {available.length} 台新设备
                </h4>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedDevices(available.map((_, i) => i))}
                    className="text-[10px] text-ice-primary font-display font-medium hover:underline"
                  >全选</button>
                  <button
                    onClick={() => setSelectedDevices([])}
                    className="text-[10px] text-gray-500 font-display font-medium hover:underline"
                  >清空</button>
                </div>
              </div>
              <div className="space-y-2 mb-5 max-h-[40vh] overflow-y-auto pr-1">
                {available.length === 0 && (
                  <div className="text-center py-8">
                    <Lightbulb className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                    <p className="text-xs text-gray-500">该品牌下暂无可接入的新设备</p>
                  </div>
                )}
                {available.map((sim, i) => {
                  const selected = selectedDevices.includes(i)
                  const Icon = getDeviceIcon(sim.icon, sim.type)
                  return (
                    <button
                      key={i}
                      onClick={() => toggleSelect(i)}
                      className={`w-full p-3 rounded-xl transition-all flex items-center gap-3 text-left ${
                        selected
                          ? 'bg-amber-primary/10 border border-amber-primary/40'
                          : 'bg-dark-600/20 border border-dark-500/20 hover:border-dark-500/50'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        selected ? 'bg-amber-primary/20' : 'bg-dark-500/30'
                      }`}>
                        <Icon className={`w-5 h-5 ${selected ? 'text-amber-primary' : 'text-gray-400'}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-display font-medium text-white truncate">{sim.name}</p>
                        <p className="text-[10px] text-gray-500 truncate">
                          {sim.room} · {
                            sim.type === 'light' ? '灯光' :
                            sim.type === 'thermostat' ? '温控' :
                            sim.type === 'lock' ? '门锁' :
                            sim.type === 'sensor' ? '传感器' :
                            sim.type === 'camera' ? '摄像头' :
                            sim.type === 'switch' ? '插座' : '窗帘'
                          }
                        </p>
                      </div>
                      <div className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 transition-all ${
                        selected ? 'bg-amber-primary' : 'bg-dark-500/40 border border-dark-500'
                      }`}>
                        {selected && <Check className="w-3 h-3 text-dark-900" />}
                      </div>
                    </button>
                  )
                })}
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep('auth')} className="btn-secondary flex-1">返回</button>
                <button
                  onClick={handleAddSelected}
                  disabled={selectedDevices.length === 0}
                  className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Plus className="w-4 h-4" /> 接入 {selectedDevices.length} 台设备
                </button>
              </div>
            </motion.div>
          )}

          {step === 'done' && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="py-8 flex flex-col items-center">
              <div className="w-20 h-20 rounded-full bg-success/15 flex items-center justify-center mb-4">
                <Check className="w-10 h-10 text-success" />
              </div>
              <h4 className="font-display font-bold text-white text-xl mb-1">接入成功</h4>
              <p className="text-sm text-gray-400 mb-6">
                已成功添加 <span className="text-success font-bold">{addedCount}</span> 台设备到您的家中
              </p>
              <button onClick={onClose} className="btn-primary px-8">完成</button>
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
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)

  const filtered = devices.filter((d) => {
    if (selectedRoom !== '全部' && d.room !== selectedRoom) return false
    if (selectedType !== 'all' && d.type !== selectedType) return false
    if (searchQuery && !d.name.toLowerCase().includes(searchQuery.toLowerCase()) && !d.brand.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  const allRooms = useMemo(() => {
    const set = new Set(rooms)
    devices.forEach((d) => set.add(d.room))
    return Array.from(set)
  }, [devices])

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-2xl text-white">设备管理</h1>
          <p className="text-sm text-gray-500 mt-1 font-display">
            {devices.length} 个已接入设备 · {devices.filter((d) => d.status === 'online').length} 在线
          </p>
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
            placeholder="搜索设备名称或品牌..."
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
        {allRooms.map((room) => (
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
          >
            <DeviceCard device={device} onOpen={() => setSelectedDeviceId(device.id)} />
          </motion.div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <Lightbulb className="w-12 h-12 text-gray-700 mx-auto mb-3" />
          <p className="text-gray-500 font-display mb-4">未找到匹配的设备</p>
          <button onClick={() => { setSearchQuery(''); setSelectedRoom('全部'); setSelectedType('all') }}
            className="text-xs text-amber-primary font-display hover:underline">
            清除筛选条件
          </button>
        </div>
      )}

      <DeviceControlModal
        open={selectedDeviceId !== null}
        deviceId={selectedDeviceId}
        onClose={() => setSelectedDeviceId(null)}
      />

      <AnimatePresence>
        {showAddModal && <AddDeviceModal onClose={() => setShowAddModal(false)} />}
      </AnimatePresence>
    </div>
  )
}
