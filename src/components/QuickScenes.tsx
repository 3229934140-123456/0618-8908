import { useSmartHomeStore } from '@/store'
import { getDeviceIcon } from '@/utils/deviceIcons'
import { isDeviceOn } from '@/utils/deviceHelpers'
import { motion } from 'framer-motion'
import { Play, ChevronRight, Home, Moon, DoorOpen, Sunrise, Clapperboard, Briefcase } from 'lucide-react'
import type { Scene } from '@/types'

const sceneIconMap: Record<string, React.ElementType> = {
  home: Home,
  moon: Moon,
  'door-open': DoorOpen,
  sunrise: Sunrise,
  clapperboard: Clapperboard,
  briefcase: Briefcase,
}

function SceneIcon({ iconName, className }: { iconName: string; className?: string }) {
  const Icon = sceneIconMap[iconName] || ChevronRight
  return <Icon className={className} />
}

function SceneCard({ scene }: { scene: Scene }) {
  const { executeScene, toggleScene, devices } = useSmartHomeStore()

  const handleExecute = (e: React.MouseEvent) => {
    e.stopPropagation()
    executeScene(scene.id)
  }

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation()
    toggleScene(scene.id)
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`glass-card p-4 min-w-[200px] flex-shrink-0 ${
        scene.enabled ? '' : 'opacity-50'
      }`}
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl bg-ice-primary/15 flex items-center justify-center">
          <SceneIcon iconName={scene.icon} className="w-5 h-5 text-ice-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-display font-semibold text-sm text-white truncate">
            {scene.name}
          </h3>
          <p className="text-[10px] text-gray-500">
            {scene.actions.length} 个动作
          </p>
        </div>
        <button
          onClick={handleToggle}
          className={`w-9 h-5 rounded-full transition-colors ${
            scene.enabled ? 'bg-amber-primary' : 'bg-dark-500'
          }`}
        >
          <div
            className={`w-3.5 h-3.5 rounded-full bg-white transition-transform ${
              scene.enabled ? 'translate-x-[18px]' : 'translate-x-[3px]'
            }`}
          />
        </button>
      </div>

      <div className="flex items-center gap-1 mb-3 overflow-hidden">
        {scene.actions.slice(0, 4).map((action, i) => {
          const device = devices.find((d) => d.id === action.deviceId)
          if (!device) return null
          const DevIcon = getDeviceIcon(device.icon, device.type)
          return (
            <div key={i} className="flex items-center">
              {i > 0 && <ChevronRight className="w-3 h-3 text-gray-600 mx-0.5" />}
              <div className="w-6 h-6 rounded-lg bg-dark-500/40 flex items-center justify-center">
                <DevIcon
                  className={`w-3 h-3 ${
                    isDeviceOn(device) ? 'text-amber-primary' : 'text-gray-500'
                  }`}
                />
              </div>
            </div>
          )
        })}
        {scene.actions.length > 4 && (
          <span className="text-[10px] text-gray-500 ml-1">
            +{scene.actions.length - 4}
          </span>
        )}
      </div>

      <button
        onClick={handleExecute}
        disabled={!scene.enabled}
        className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-ice-primary/10 text-ice-primary text-xs font-display font-medium hover:bg-ice-primary/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <Play className="w-3.5 h-3.5" />
        执行场景
      </button>
    </motion.div>
  )
}

export default function QuickScenes() {
  const scenes = useSmartHomeStore((s) => s.scenes)

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display font-semibold text-white text-base">快捷场景</h2>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
        {scenes.map((scene) => (
          <SceneCard key={scene.id} scene={scene} />
        ))}
      </div>
    </div>
  )
}
