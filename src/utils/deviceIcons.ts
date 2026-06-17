import { Lightbulb, Thermometer, Lock, Droplets, Flame, Video, Plug, Blinds, Lamp, LampDesk } from 'lucide-react'
import type { DeviceType } from '@/types'

const iconMap: Record<DeviceType, React.ElementType> = {
  light: Lightbulb,
  thermostat: Thermometer,
  lock: Lock,
  sensor: Droplets,
  camera: Video,
  switch: Plug,
  curtain: Blinds,
}

const overrideMap: Record<string, React.ElementType> = {
  flame: Flame,
  lamp: Lamp,
  'lamp-desk': LampDesk,
  video: Video,
  blinds: Blinds,
  plug: Plug,
}

export function getDeviceIcon(deviceIcon: string, deviceType: DeviceType) {
  if (overrideMap[deviceIcon]) return overrideMap[deviceIcon]
  return iconMap[deviceType]
}
