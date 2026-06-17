import type { Device } from '@/types'
import { useSmartHomeStore } from '@/store'
import { getDeviceIcon } from '@/utils/deviceIcons'
import { getDeviceStatusText, isDeviceOn } from '@/utils/deviceHelpers'
import { motion } from 'framer-motion'

interface Props {
  device: Device
}

export default function DeviceCard({ device }: Props) {
  const toggleDevice = useSmartHomeStore((s) => s.toggleDevice)
  const isOn = isDeviceOn(device)
  const statusText = getDeviceStatusText(device)
  const Icon = getDeviceIcon(device.icon, device.type)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      className={`glass-card-hover p-4 cursor-pointer ${
        isOn ? 'device-toggle-on' : 'device-toggle-off'
      }`}
      onClick={() => toggleDevice(device.id)}
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
        {device.status === 'online' ? (
          <div className="w-2 h-2 rounded-full bg-success mt-1" />
        ) : (
          <div className="w-2 h-2 rounded-full bg-gray-600 mt-1" />
        )}
      </div>
      <h3 className="font-display font-semibold text-sm text-white truncate">
        {device.name}
      </h3>
      <p className="text-xs text-gray-400 mt-1 truncate">{device.room}</p>
      <p
        className={`text-xs font-display font-medium mt-2 ${
          isOn ? 'text-amber-primary' : 'text-gray-500'
        }`}
      >
        {statusText}
      </p>
    </motion.div>
  )
}
