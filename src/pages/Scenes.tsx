import { useState } from 'react'
import { useSmartHomeStore } from '@/store'
import { getDeviceIcon } from '@/utils/deviceIcons'
import { formatDateTime } from '@/utils/deviceHelpers'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus, X, Play, Clock, MapPin, MonitorSmartphone, Hand,
  Home, Moon, DoorOpen, Sunrise, Clapperboard, Briefcase, ChevronRight, Zap,
} from 'lucide-react'
import type { Scene, Trigger, SceneAction } from '@/types'

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

function SceneEditor({ onClose }: { onClose: () => void }) {
  const { devices, scenes } = useSmartHomeStore()
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
      setActions([...actions, { deviceId: devices[0].id, command: {} }])
    }
  }
  const removeAction = (i: number) => setActions(actions.filter((_, idx) => idx !== i))
  const updateAction = (i: number, action: SceneAction) => {
    const updated = [...actions]
    updated[i] = action
    setActions(updated)
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
                      <div className="flex gap-2 mb-2">
                        {(['time', 'geofence', 'device_state', 'manual'] as const).map((t) => (
                          <button
                            key={t}
                            onClick={() => updateTrigger(i, { type: t, config: {} })}
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
                  return (
                    <div key={i} className="glass-card p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-display font-medium text-white">动作 {i + 1}</span>
                        <button onClick={() => removeAction(i)} className="text-gray-500 hover:text-danger text-xs">移除</button>
                      </div>
                      <select
                        value={action.deviceId}
                        onChange={(e) => updateAction(i, { ...action, deviceId: e.target.value })}
                        className="w-full px-3 py-2 bg-dark-600/40 border border-dark-500/20 rounded-lg text-sm text-white focus:outline-none mb-2"
                      >
                        {devices.map((d) => (
                          <option key={d.id} value={d.id}>{d.name} ({d.room})</option>
                        ))}
                      </select>
                      {device?.type === 'light' && (
                        <div className="space-y-2">
                          <label className="flex items-center gap-2 text-xs text-gray-400">
                            <input type="checkbox" className="accent-amber-primary" /> 开灯
                          </label>
                          <label className="text-xs text-gray-400 flex items-center gap-2">
                            亮度
                            <input type="range" min="0" max="100" defaultValue="80" className="flex-1 accent-amber-primary" />
                          </label>
                        </div>
                      )}
                      {(device?.type === 'thermostat') && (
                        <label className="text-xs text-gray-400 flex items-center gap-2">
                          目标温度
                          <input type="number" min="16" max="32" defaultValue="26" className="w-16 px-2 py-1 bg-dark-600/40 border border-dark-500/20 rounded text-white text-center" />
                          °C
                        </label>
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
                <div className="glass-card p-4 text-center">
                  {(() => {
                    const SceneIc = sceneIconMap[icon] || Home
                    return <SceneIc className="w-12 h-12 mx-auto text-amber-primary mb-2" />
                  })()}
                  <h4 className="font-display font-bold text-white text-lg">{name || '未命名场景'}</h4>
                </div>
                <div>
                  <h5 className="text-xs font-display font-medium text-gray-400 mb-2">触发条件</h5>
                  <div className="flex flex-wrap gap-2">
                    {triggers.map((t, i) => {
                      const TIcon = triggerIconMap[t.type] || Hand
                      return (
                        <span key={i} className="flex items-center gap-1.5 px-3 py-1.5 bg-ice-primary/10 rounded-lg text-xs text-ice-primary font-display">
                          <TIcon className="w-3 h-3" />
                          {triggerTypeLabels[t.type]}
                          {t.config.time && ` ${t.config.time}`}
                        </span>
                      )
                    })}
                  </div>
                </div>
                <div>
                  <h5 className="text-xs font-display font-medium text-gray-400 mb-2">执行动作</h5>
                  <div className="space-y-1.5">
                    {actions.map((a, i) => {
                      const d = devices.find((dv) => dv.id === a.deviceId)
                      if (!d) return null
                      const DIcon = getDeviceIcon(d.icon, d.type)
                      return (
                        <div key={i} className="flex items-center gap-2 text-xs text-gray-300">
                          <DIcon className="w-3 h-3 text-amber-primary" />
                          {d.name}
                          <ChevronRight className="w-3 h-3 text-gray-600" />
                          <span className="text-gray-500">控制设备</span>
                        </div>
                      )
                    })}
                    {actions.length === 0 && <p className="text-xs text-gray-600">暂无动作</p>}
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
                <button onClick={onClose} className="btn-primary flex-1 flex items-center justify-center gap-2">
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
                      className={`w-10 h-5.5 rounded-full transition-colors ${
                        scene.enabled ? 'bg-amber-primary' : 'bg-dark-500'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                        scene.enabled ? 'translate-x-[22px]' : 'translate-x-[3px]'
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

                  <div className="flex items-center gap-1 flex-wrap mb-3">
                    {scene.actions.map((action, idx) => {
                      const device = devices.find((d) => d.id === action.deviceId)
                      if (!device) return null
                      const DIcon = getDeviceIcon(device.icon, device.type)
                      return (
                        <div key={idx} className="flex items-center">
                          {idx > 0 && <ChevronRight className="w-3 h-3 text-gray-600 mx-0.5" />}
                          <div className="w-6 h-6 rounded-md bg-dark-500/40 flex items-center justify-center" title={device.name}>
                            <DIcon className="w-3 h-3 text-gray-400" />
                          </div>
                        </div>
                      )
                    })}
                    <span className="text-[10px] text-gray-600 ml-1">{scene.actions.length} 个动作</span>
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
                        上次执行: {formatDateTime(scene.lastExecuted)}
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
