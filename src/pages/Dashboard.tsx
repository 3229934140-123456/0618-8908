import { useSmartHomeStore } from '@/store'
import DeviceCard from '@/components/DeviceCard'
import QuickScenes from '@/components/QuickScenes'
import AlertPanel from '@/components/AlertPanel'
import EnergyOverview from '@/components/EnergyOverview'
import { motion } from 'framer-motion'

export default function Dashboard() {
  const devices = useSmartHomeStore((s) => s.devices)

  const onlineCount = devices.filter((d) => d.status === 'online').length
  const activeCount = devices.filter((d) => {
    if (d.status === 'offline') return false
    const state = d.state as unknown as Record<string, unknown>
    if ('on' in state) return !!state.on
    if ('locked' in state) return !!state.locked
    return false
  }).length

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="font-display font-bold text-2xl text-white">欢迎回家</h1>
          <p className="text-sm text-gray-500 mt-1 font-display">
            {onlineCount} 设备在线 · {activeCount} 设备活跃
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="glass-card px-4 py-2 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span className="text-xs text-gray-400 font-display">系统正常</span>
          </div>
        </div>
      </motion.div>

      <AlertPanel />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-semibold text-white text-base">设备状态</h2>
              <span className="text-xs text-gray-500 font-display">{devices.length} 个设备</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {devices.map((device, i) => (
                <motion.div
                  key={device.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <DeviceCard device={device} />
                </motion.div>
              ))}
            </div>
          </div>

          <QuickScenes />
        </div>

        <div className="space-y-6">
          <EnergyOverview />

          <div>
            <h2 className="font-display font-semibold text-white text-base mb-4">房间概览</h2>
            <div className="space-y-2">
              {Array.from(new Set(devices.map((d) => d.room))).map((room) => {
                const roomDevices = devices.filter((d) => d.room === room)
                const activeInRoom = roomDevices.filter((d) => {
                  const state = d.state as unknown as Record<string, unknown>
                  if (d.status === 'offline') return false
                  if ('on' in state) return !!state.on
                  if ('locked' in state) return !!state.locked
                  return false
                }).length
                return (
                  <div key={room} className="glass-card p-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-display font-medium text-white">{room}</p>
                      <p className="text-[10px] text-gray-500">{roomDevices.length} 设备</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <p className="text-xs font-display font-medium text-amber-primary">
                          {activeInRoom}
                        </p>
                        <p className="text-[10px] text-gray-600">活跃</p>
                      </div>
                      <div className="w-10 h-1.5 rounded-full bg-dark-500 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-amber-primary transition-all"
                          style={{ width: `${(activeInRoom / roomDevices.length) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
