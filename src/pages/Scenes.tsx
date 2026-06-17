import { useState } from 'react'
import { useSmartHomeStore } from '@/store'
import { getDeviceIcon } from '@/utils/deviceIcons'
import { formatDateTime } from '@/utils/deviceHelpers'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus, X, Play, Clock, MapPin, MonitorSmartphone, Hand,
  Home, Moon, DoorOpen, Sunrise, Clapperboard, Briefcase, ChevronRight, Zap, Sun, Thermometer, Lock, Blinds, Video, Plug, Droplets,
} from 'lucide-react'
import type { Scene, Trigger, SceneAction, DeviceType, LightState, ThermostatState, LockState, SwitchState, CurtainState, CameraState } from '@/types'

const sceneIconMap: Record<string, React.ElementType> = {
  home: Home,
  moon: Moon,
  'door-open': DoorOpen,
  sunrise: Sunrise,
  clapperboard: Clapperboard,
  briefcase: Briefcase,
}

const triggerIconMap: Record<string, React.ElementType> = {
  time: Clock,
  geofence: MapPin,
  device_state: MonitorSmartphone,
  manual: Hand,
}

const triggerTypeLabels: Record<string, string> = {
  time: '定时触发',
  geofence: '地理围栏',
  device_state: '设备状态',
  manual: '手动触发',
}

const availableSceneIcons = ['home', 'moon', 'door-open', 'sunrise', 'clapperboard', 'briefcase']

function describeActionCommand(action: SceneAction, type: DeviceType | undefined): string {
  const c = action.command || {}
  if (!type) return '未知'
  const parts: string[] = []
  if (type === 'light') {
    if (c.on === true) parts.push('开灯')
    if (c.on === false) parts.push('关灯')
    if (typeof c.brightness === 'number') parts.push(`亮度 ${c.brightness}%`)
    if (typeof c.colorTemp === 'number') parts.push(`色温 ${c.colorTemp}K`)
  } else if (type === 'thermostat') {
    if (c.on === true) parts.push('开空调')
    if (c.on === false) parts.push('关空调')
    if (typeof c.targetTemp === 'number') parts.push(`调至 ${c.targetTemp}°C`)
    if (typeof c.mode === 'string') parts.push(c.mode === 'cooling' ? '制冷' : c.mode === 'heating' ? '制热' : '自动')
  } else if (type === 'lock') {
    if (c.locked === true) parts.push('上锁')
    if (c.locked === false) parts.push('解锁')
  } else if (type === 'switch') {
    if (c.on === true) parts.push('通电')
    if (c.on === false) parts.push('断电')
  } else if (type === 'curtain') {
    if (typeof c.position === 'number') parts.push(`开合 ${c.position}%`)
  } else if (type === 'camera') {
    if (c.recording === true) parts.push('开始录制')
    if (c.recording === false) parts.push('停止录制')
  } else if (type === 'sensor') {
    parts.push('无控制')
  }
  return parts.length ? parts.join(' · ') : '设置动作'
}

function getCommandIcon(type: DeviceType | undefined): React.ElementType {
  switch (type) {
    case 'light': return Sun
    case 'thermostat': return Thermometer
    case 'lock': return Lock
    case 'curtain': return Blinds
    case 'camera': return Video
    case 'switch': return Plug
    case 'sensor': return Droplets
    default: return Plug
  }
}

function SceneEditor({ onClose }: { onClose: () => void }) {
  const { devices, addScene } = useSmartHomeStore()
  const [step, setStep] = useState(0)
  const [name, setName] = useState('')
  const [icon, setIcon] = useState('home')
  const [triggers, setTriggers] = useState<Trigger[]>([{ type: 'manual', config: {} }])
  const [actions, setActions] = useState<SceneAction[]>([])

  const addTrigger = () => setTriggers([...triggers, { type: 'time', config: { time: '08:00' } }])
  const removeTrigger = (i: number) => setTriggers(triggers.filter((_, idx) => idx !== i))
  const updateTrigger = (i: number, trigger: Trigger) => {
    const updated = [...triggers]
    updated[i] = trigger
    setTriggers(updated)
  }

  const addAction = () => {
    if (devices.length > 0) {
      const d = devices[0]
      let cmd: Record<string, unknown> = {}
      if (d.type === 'light') cmd = { on: true, brightness: 80 }
      else if (d.type === 'thermostat') cmd = { on: true, targetTemp: 26, mode: 'cooling' }
      else if (d.type === 'lock') cmd = { locked: true }
      else if (d.type === 'switch') cmd = { on: true }
      else if (d.type === 'curtain') cmd = { position: 50 }
      else if (d.type === 'camera') cmd = { recording: true }
      setActions([...actions, { deviceId: devices[0].id, command: cmd }])
    }
  }
  const removeAction = (i: number) => setActions(actions.filter((_, idx) => idx !== i))
  const updateAction = (i: number, patch: Partial<SceneAction> | ((prev: SceneAction) => SceneAction)) => {
    const updated = [...actions]
    if (typeof patch === 'function') {
      updated[i] = patch(updated[i])
    } else {
      updated[i] = { ...updated[i], ...patch }
    }
    setActions(updated)
  }

  const updateActionCmd = (i: number, cmdPatch: Record<string, unknown>) => {
    updateAction(i, (prev) => ({ ...prev, command: { ...(prev.command || {}), ...cmdPatch } }))
  }

  const handleSave = () => {
    const sceneName = name.trim() || '未命名场景'
    const newScene: Omit<Scene, 'id' | 'createdAt' | 'lastExecuted'> & { id?: string } = {
      name: sceneName,
      icon,
      enabled: true,
      triggers,
      actions,
    }
    addScene(newScene as Scene)
    onClose()
  }

  const steps = ['基本信息', '触发条件', '执行动作', '预览确认']

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <div className="bg-dark-800 border border-dark-500/30 rounded-2xl w-full max-w-xl max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display font-bold text-lg text-white">创建场景</h3>
              <button onClick={onClose} className="w-8 h-8 rounded-lg bg-dark-600 flex items-center justify-center text-gray-400 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-2 mb-6">
              {steps.map((s, i) => (
                <div key={i} className="flex items-center gap-2 flex-1">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-display font-bold ${
                    i <= step ? 'bg-amber-primary text-dark-900' : 'bg-dark-600 text-gray-500'
                  }`}>
                    {i + 1}
                  </div>
                  <span className={`text-xs font-display hidden sm:block ${i <= step ? 'text-gray-300' : 'text-gray-600'}`}>{s}</span>
                  {i < steps.length - 1 && <div className="flex-1 h-px bg-dark-500/30" />}
                </div>
              ))}
            </div>

            {step === 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                <div>
                  <label className="text-sm font-display font-medium text-gray-300 mb-2 block">场景名称</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="例如：睡前模式"
                    className="w-full px-4 py-3 bg-dark-600/40 border border-dark-500/20 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-amber-primary/40"
                  />
                </div>
                <div>
                  <label className="text-sm font-display font-medium text-gray-300 mb-2 block">选择图标</label>
                  <div className="flex gap-2 flex-wrap">
                    {availableSceneIcons.map((ic) => {
                      const Ic = sceneIconMap[ic] || Home
                      return (
                        <button
                          key={ic}
                          onClick={() => setIcon(ic)}
                          className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                            icon === ic ? 'bg-amber-primary/20 border-amber-primary/40 border glow-amber' : 'bg-dark-600/40 border border-dark-500/20'
                          }`}
                        >
                          <Ic className={`w-5 h-5 ${icon === ic ? 'text-amber-primary' : 'text-gray-500'}`} />
                        </button>
                      )
                    })}
                  </div>
                </div>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                {triggers.map((trigger, i) => {
                  const TriggerIcon = triggerIconMap[trigger.type] || Hand
                  return (
                    <div key={i} className="glass-card p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <TriggerIcon className="w-4 h-4 text-ice-primary" />
                          <span className="text-sm font-display font-medium text-white">
                            {triggerTypeLabels[trigger.type]}
                          </span>
                        </div>
                        {triggers.length > 1 && (
                          <button onClick={() => removeTrigger(i)} className="text-gray-500 hover:text-danger text-xs">移除</button>
                        )}
                      </div>
                      <div className="flex gap-2 mb-2 flex-wrap">
                        {(['time', 'geofence', 'device_state', 'manual'] as const).map((t) => (
                          <button
                            key={t}
                            onClick={() => updateTrigger(i, { type: t, config: t === 'time' ? { time: '08:00' } : {} })}
                            className={`px-3 py-1.5 rounded-lg text-xs font-display ${
                              trigger.type === t ? 'bg-ice-primary/15 text-ice-primary' : 'bg-dark-500/40 text-gray-500'
                            }`}
                          >
                            {triggerTypeLabels[t]}
                          </button>
                        ))}
                      </div>
                      {trigger.type === 'time' && (
                        <input
                          type="time"
                          value={trigger.config.time || '08:00'}
                          onChange={(e) => updateTrigger(i, { ...trigger, config: { time: e.target.value } })}
                          className="px-3 py-2 bg-dark-600/40 border border-dark-500/20 rounded-lg text-sm text-white focus:outline-none focus:border-ice-primary/40"
                        />
                      )}
                      {trigger.type === 'geofence' && (
                        <select
                          value={trigger.config.area || 'home'}
                          onChange={(e) => updateTrigger(i, { ...trigger, config: { area: e.target.value } })}
                          className="w-full px-3 py-2 bg-dark-600/40 border border-dark-500/20 rounded-lg text-sm text-white focus:outline-none"
                        >
                          <option value="home">到家（进入范围）</option>
                          <option value="away">离家（离开范围）</option>
                        </select>
                      )}
                      {trigger.type === 'device_state' && (
                        <select
                          value={trigger.config.deviceId || (devices[0]?.id || '')}
                          onChange={(e) => updateTrigger(i, { ...trigger, config: { deviceId: e.target.value } })}
                          className="w-full px-3 py-2 bg-dark-600/40 border border-dark-500/20 rounded-lg text-sm text-white focus:outline-none"
                        >
                          {devices.map((d) => (
                            <option key={d.id} value={d.id}>{d.name}</option>
                          ))}
                        </select>
                      )}
                    </div>
                  )
                })}
                <button onClick={addTrigger} className="w-full py-3 rounded-xl border border-dashed border-dark-500/40 text-gray-500 hover:text-gray-300 hover:border-dark-500/60 transition-colors text-sm font-display">
                  + 添加触发条件
                </button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                {actions.map((action, i) => {
                  const device = devices.find((d) => d.id === action.deviceId)
                  const cmd = action.command || {}
                  return (
                    <div key={i} className="glass-card p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-display font-medium text-white">动作 {i + 1}</span>
                        <button onClick={() => removeAction(i)} className="text-gray-500 hover:text-danger text-xs">移除</button>
                      </div>
                      <select
                        value={action.deviceId}
                        onChange={(e) => {
                          const d = devices.find((dv) => dv.id === e.target.value)
                          let newCmd: Record<string, unknown> = {}
                          if (d?.type === 'light') newCmd = { on: true, brightness: 80 }
                          else if (d?.type === 'thermostat') newCmd = { on: true, targetTemp: 26, mode: 'cooling' }
                          else if (d?.type === 'lock') newCmd = { locked: true }
                          else if (d?.type === 'switch') newCmd = { on: true }
                          else if (d?.type === 'curtain') newCmd = { position: 50 }
                          else if (d?.type === 'camera') newCmd = { recording: true }
                          updateAction(i, { deviceId: e.target.value, command: newCmd })
                        }}
                        className="w-full px-3 py-2 bg-dark-600/40 border border-dark-500/20 rounded-lg text-sm text-white focus:outline-none mb-3"
                      >
                        {devices.map((d) => (
                          <option key={d.id} value={d.id}>{d.name}（{d.room}）</option>
                        ))}
                      </select>

                      {device?.type === 'light' && (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 text-xs text-gray-300">
                              <input
                                type="checkbox"
                                className="accent-amber-primary"
                                checked={cmd.on === true}
                                onChange={(e) => updateActionCmd(i, { on: e.target.checked })}
                              />
                              开启灯
                            </label>
                            <span className="text-[10px] text-gray-600">
                              {cmd.on === true ? 'ON' : cmd.on === false ? 'OFF' : '不变'}
                            </span>
                          </div>
                          {cmd.on !== false && (
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-400 flex items-center gap-1.5">
                                  <Sun className="w-3 h-3" /> 亮度
                                </span>
                                <span className="text-xs text-amber-primary">{(cmd.brightness as number) ?? 80}%</span>
                              </div>
                              <input
                                type="range"
                                min="0"
                                max="100"
                                value={(cmd.brightness as number) ?? 80}
                                onChange={(e) => updateActionCmd(i, { brightness: +e.target.value })}
                                className="w-full accent-amber-primary"
                              />
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-400 flex items-center gap-1.5">
                                  <Thermometer className="w-3 h-3" /> 色温
                                </span>
                                <span className="text-xs text-ice-primary">{(cmd.colorTemp as number) ?? 4000}K</span>
                              </div>
                              <input
                                type="range"
                                min="2700"
                                max="6500"
                                value={(cmd.colorTemp as number) ?? 4000}
                                onChange={(e) => updateActionCmd(i, { colorTemp: +e.target.value })}
                                className="w-full accent-ice-primary"
                              />
                            </div>
                          )}
                        </div>
                      )}

                      {device?.type === 'thermostat' && (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 text-xs text-gray-300">
                              <input
                                type="checkbox"
                                className="accent-amber-primary"
                                checked={cmd.on === true}
                                onChange={(e) => updateActionCmd(i, { on: e.target.checked })}
                              />
                              开启空调
                            </label>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-400">目标温度</span>
                            <input
                              type="number"
                              min="16"
                              max="32"
                              value={(cmd.targetTemp as number) ?? 26}
                              onChange={(e) => updateActionCmd(i, { targetTemp: +e.target.value })}
                              className="w-16 px-2 py-1 bg-dark-600/40 border border-dark-500/20 rounded text-white text-center text-xs"
                            />
                            <span className="text-xs text-gray-400">°C</span>
                          </div>
                          <div className="flex gap-2">
                            {(['cooling', 'heating', 'auto'] as const).map((m) => (
                              <button
                                key={m}
                                onClick={() => updateActionCmd(i, { mode: m })}
                                className={`flex-1 py-1.5 rounded-lg text-[10px] font-display ${
                                  (cmd.mode as string) === m ? 'bg-amber-primary/20 text-amber-primary' : 'bg-dark-500/40 text-gray-500'
                                }`}
                              >
                                {m === 'cooling' ? '制冷' : m === 'heating' ? '制热' : '自动'}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {device?.type === 'lock' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => updateActionCmd(i, { locked: true })}
                            className={`flex-1 py-2 rounded-lg text-xs font-display ${
                              cmd.locked === true ? 'bg-success/20 text-success' : 'bg-dark-500/40 text-gray-500'
                            }`}
                          >
                            <Lock className="w-3 h-3 inline mr-1" /> 上锁
                          </button>
                          <button
                            onClick={() => updateActionCmd(i, { locked: false })}
                            className={`flex-1 py-2 rounded-lg text-xs font-display ${
                              cmd.locked === false ? 'bg-danger/20 text-danger' : 'bg-dark-500/40 text-gray-500'
                            }`}
                          >
                            解锁
                          </button>
                        </div>
                      )}

                      {device?.type === 'switch' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => updateActionCmd(i, { on: true })}
                            className={`flex-1 py-2 rounded-lg text-xs font-display ${
                              cmd.on === true ? 'bg-amber-primary/20 text-amber-primary' : 'bg-dark-500/40 text-gray-500'
                            }`}
                          >
                            <Plug className="w-3 h-3 inline mr-1" /> 通电
                          </button>
                          <button
                            onClick={() => updateActionCmd(i, { on: false })}
                            className={`flex-1 py-2 rounded-lg text-xs font-display ${
                              cmd.on === false ? 'bg-danger/20 text-danger' : 'bg-dark-500/40 text-gray-500'
                            }`}
                          >
                            断电
                          </button>
                        </div>
                      )}

                      {device?.type === 'curtain' && (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-400 flex items-center gap-1.5">
                              <Blinds className="w-3 h-3" /> 开合度
                            </span>
                            <span className="text-xs text-amber-primary">{(cmd.position as number) ?? 50}%</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={(cmd.position as number) ?? 50}
                            onChange={(e) => updateActionCmd(i, { position: +e.target.value })}
                            className="w-full accent-amber-primary"
                          />
                          <div className="flex gap-2">
                            {[0, 50, 100].map((v) => (
                              <button
                                key={v}
                                onClick={() => updateActionCmd(i, { position: v })}
                                className={`flex-1 py-1.5 rounded-lg text-[10px] font-display ${
                                  (cmd.position as number) === v ? 'bg-amber-primary/20 text-amber-primary' : 'bg-dark-500/40 text-gray-500'
                                }`}
                              >
                                {v === 0 ? '全关' : v === 50 ? '半开' : '全开'}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {device?.type === 'camera' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => updateActionCmd(i, { recording: true })}
                            className={`flex-1 py-2 rounded-lg text-xs font-display ${
                              cmd.recording === true ? 'bg-danger/20 text-danger' : 'bg-dark-500/40 text-gray-500'
                            }`}
                          >
                            <Video className="w-3 h-3 inline mr-1" /> 开始录制
                          </button>
                          <button
                            onClick={() => updateActionCmd(i, { recording: false })}
                            className={`flex-1 py-2 rounded-lg text-xs font-display ${
                              cmd.recording === false ? 'bg-success/20 text-success' : 'bg-dark-500/40 text-gray-500'
                            }`}
                          >
                            停止录制
                          </button>
                        </div>
                      )}

                      {device?.type === 'sensor' && (
                        <p className="text-xs text-gray-600">传感器为只读设备，不支持控制</p>
                      )}
                    </div>
                  )
                })}
                <button onClick={addAction} className="w-full py-3 rounded-xl border border-dashed border-dark-500/40 text-gray-500 hover:text-gray-300 hover:border-dark-500/60 transition-colors text-sm font-display">
                  + 添加执行动作
                </button>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                <div className="glass-card p-5 text-center">
                  {(() => {
                    const SceneIc = sceneIconMap[icon] || Home
                    return <SceneIc className="w-14 h-14 mx-auto text-amber-primary mb-2" />
                  })()}
                  <h4 className="font-display font-bold text-white text-xl">{name.trim() || '未命名场景'}</h4>
                  <p className="text-xs text-gray-500 mt-1">包含 {actions.length} 个动作</p>
                </div>
                <div>
                  <h5 className="text-xs font-display font-medium text-gray-400 mb-2">触发条件</h5>
                  <div className="flex flex-wrap gap-2">
                    {triggers.map((t, i) => {
                      const TIcon = triggerIconMap[t.type] || Hand
                      return (
                        <span key={i} className="flex items-center gap-1.5 px-3 py-2 bg-ice-primary/10 rounded-lg text-xs text-ice-primary font-display">
                          <TIcon className="w-3.5 h-3.5" />
                          {triggerTypeLabels[t.type]}
                          {t.config.time && ` · ${t.config.time}`}
                          {t.config.area && ` · ${t.config.area === 'home' ? '到家' : '离家'}`}
                          {t.config.deviceId && (
                            ` · ${devices.find((d) => d.id === t.config.deviceId)?.name || '设备'}`
                          )}
                        </span>
                      )
                    })}
                  </div>
                </div>
                <div>
                  <h5 className="text-xs font-display font-medium text-gray-400 mb-3">执行动作</h5>
                  <div className="space-y-2">
                    {actions.map((a, i) => {
                      const d = devices.find((dv) => dv.id === a.deviceId)
                      if (!d) return null
                      const DIcon = getDeviceIcon(d.icon, d.type)
                      const CmdIc = getCommandIcon(d.type)
                      return (
                        <div key={i} className="glass-card p-3 flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-dark-500/40 flex items-center justify-center flex-shrink-0">
                            <DIcon className="w-4.5 h-4.5 text-amber-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-display font-medium text-white">{d.name}</p>
                            <p className="text-xs text-gray-500">{d.room} · {d.brand}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <ChevronRight className="w-4 h-4 text-gray-600 flex-shrink-0" />
                            <div className="glass-card bg-dark-900/50 px-3 py-2 flex items-center gap-1.5 max-w-[180px]">
                              <CmdIc className="w-3.5 h-3.5 text-ice-primary flex-shrink-0" />
                              <span className="text-xs text-gray-300 truncate">
                                {describeActionCommand(a, d.type)}
                              </span>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                    {actions.length === 0 && (
                      <div className="text-center py-6 glass-card">
                        <p className="text-xs text-gray-600">未添加任何动作，返回上一步添加</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            <div className="flex gap-3 mt-6">
              {step > 0 && (
                <button onClick={() => setStep(step - 1)} className="btn-secondary flex-1">上一步</button>
              )}
              {step < 3 ? (
                <button onClick={() => setStep(step + 1)} className="btn-primary flex-1">下一步</button>
              ) : (
                <button onClick={handleSave} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  <Zap className="w-4 h-4" /> 创建场景
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </>
  )
}

export default function Scenes() {
  const { scenes, toggleScene, executeScene, devices } = useSmartHomeStore()
  const [showEditor, setShowEditor] = useState(false)

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-2xl text-white">自动化场景</h1>
          <p className="text-sm text-gray-500 mt-1 font-display">{scenes.length} 个场景 · {scenes.filter((s) => s.enabled).length} 个启用</p>
        </div>
        <button onClick={() => setShowEditor(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> 创建场景
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {scenes.map((scene, i) => {
          const SceneIcon = sceneIconMap[scene.icon] || Home
          return (
            <motion.div
              key={scene.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`glass-card p-5 ${!scene.enabled ? 'opacity-60' : ''}`}
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-ice-primary/15 flex items-center justify-center flex-shrink-0">
                  <SceneIcon className="w-6 h-6 text-ice-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-display font-bold text-white">{scene.name}</h3>
                    <button
                      onClick={() => toggleScene(scene.id)}
                      className={`w-11 h-6 rounded-full transition-colors relative ${
                        scene.enabled ? 'bg-amber-primary' : 'bg-dark-500'
                      }`}
                    >
                      <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                        scene.enabled ? 'left-[22px]' : 'left-0.5'
                      }`} />
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {scene.triggers.map((t, idx) => {
                      const TIcon = triggerIconMap[t.type] || Hand
                      return (
                        <span key={idx} className="flex items-center gap-1 px-2 py-0.5 bg-dark-500/40 rounded-md text-[10px] text-gray-400 font-display">
                          <TIcon className="w-3 h-3" />
                          {triggerTypeLabels[t.type]}
                          {t.config.time && ` ${t.config.time}`}
                        </span>
                      )
                    })}
                  </div>

                  <div className="space-y-1.5 mb-3 max-h-32 overflow-y-auto">
                    {scene.actions.map((action, idx) => {
                      const device = devices.find((d) => d.id === action.deviceId)
                      if (!device) return null
                      const DIcon = getDeviceIcon(device.icon, device.type)
                      return (
                        <div key={idx} className="flex items-center gap-2">
                          <DIcon className="w-3 h-3 text-amber-primary flex-shrink-0" />
                          <span className="text-xs text-gray-300">{device.name}</span>
                          <ChevronRight className="w-3 h-3 text-gray-600 flex-shrink-0" />
                          <span className="text-xs text-gray-500 truncate">
                            {describeActionCommand(action, device.type)}
                          </span>
                        </div>
                      )
                    })}
                    {scene.actions.length === 0 && <p className="text-xs text-gray-700">无动作</p>}
                  </div>

                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => executeScene(scene.id)}
                      disabled={!scene.enabled}
                      className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-ice-primary/10 text-ice-primary text-xs font-display font-medium hover:bg-ice-primary/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <Play className="w-3.5 h-3.5" /> 执行
                    </button>
                    {scene.lastExecuted && (
                      <span className="text-[10px] text-gray-600 font-display">
                        上次: {formatDateTime(scene.lastExecuted)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      <AnimatePresence>
        {showEditor && <SceneEditor onClose={() => setShowEditor(false)} />}
      </AnimatePresence>
    </div>
  )
}
