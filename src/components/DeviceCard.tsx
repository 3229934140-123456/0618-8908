import type { Device } from '@/types'
import { getDeviceIcon } from '@/utils/deviceIcons'
import { getDeviceStatusText, isDeviceOn } from '@/utils/deviceHelpers'
import { motion } from 'framer-motion'
import { useSmartHomeStore } from '@/store'
import { Power } from 'lucide-react'

interface Props {
  device: Device
  onOpen: () => void
}

export default function DeviceCard({ device, onOpen }: Props) {
  const toggleDevice = useSmartHomeStore((s) => s.toggleDevice)
  const isOn = isDeviceOn(device)
  const statusText = getDeviceStatusText(device)
  const Icon = getDeviceIcon(device.icon, device.type)
  const isOffline = device.status === 'offline'

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (isOffline) return
    toggleDevice(device.id)
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      className={`glass-card-hover p-4 cursor-pointer ${
        isOn ? 'device-toggle-on' : 'device-toggle-off'
      } ${isOffline ? 'opacity-50' : ''}`}
      onClick={onOpen}
    >
      <div className="flex items-start justify-between mb-3">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            isOn
              ? 'bg-amber-primary/20 text-amber-primary'
              : 'bg-dark-500/30 text-gray-500'
          }`}
        >
          <Icon className="w-5 h-5" />
        </div>
        <button
          onClick={handleToggle}
          disabled={isOffline}
          title={isOn ? '关闭' : '开启'}
          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
            isOn
              ? 'bg-amber-primary text-dark-900 hover:bg-amber-light'
              : 'bg-dark-500/40 text-gray-500 hover:bg-dark-500/60'
          } ${isOffline ? 'cursor-not-allowed opacity-40' : ''}`}
        >
          <Power className="w-3.5 h-3.5" />
        </button>
      </div>
      <h3 className="font-display font-semibold text-sm text-white truncate">
        {device.name}
      </h3>
      <p className="text-xs text-gray-400 mt-1 truncate">{device.room} · {device.brand}</p>
      <p
        className={`text-xs font-display font-medium mt-2 ${
          isOn ? 'text-amber-primary' : 'text-gray-500'
        }`}
      >
        {isOffline ? '离线' : statusText}
      </p>
    </motion.div>
  )
}
