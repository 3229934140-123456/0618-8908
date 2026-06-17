import { useSmartHomeStore } from '@/store'
import { AlertTriangle, Shield, Flame, Info, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import type { AlertEvent } from '@/types'
import { formatDateTime } from '@/utils/deviceHelpers'

const severityConfig = {
  critical: { icon: Shield, color: 'text-danger', bg: 'bg-danger/10', border: 'border-danger/30', glow: 'glow-danger' },
  warning: { icon: AlertTriangle, color: 'text-warning', bg: 'bg-warning/10', border: 'border-warning/30', glow: '' },
  info: { icon: Info, color: 'text-info', bg: 'bg-info/10', border: 'border-info/30', glow: '' },
}

const typeIcons = {
  security: Shield,
  safety: Flame,
  device: Info,
}

function AlertCard({ alert }: { alert: AlertEvent }) {
  const resolveAlert = useSmartHomeStore((s) => s.resolveAlert)
  const config = severityConfig[alert.severity]
  const TypeIcon = typeIcons[alert.type]

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: 100 }}
      className={`glass-card p-4 border ${config.border} ${alert.resolved ? 'opacity-40' : config.glow} ${
        alert.severity === 'critical' && !alert.resolved ? 'animate-pulse-glow' : ''
      }`}
    >
      <div className="flex items-start gap-3">
        <div className={`w-9 h-9 rounded-xl ${config.bg} flex items-center justify-center flex-shrink-0`}>
          <TypeIcon className={`w-4.5 h-4.5 ${config.color}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs font-display font-semibold ${config.color} uppercase`}>
              {alert.severity === 'critical' ? '严重' : alert.severity === 'warning' ? '警告' : '信息'}
            </span>
            <span className="text-[10px] text-gray-500">{alert.deviceName}</span>
          </div>
          <p className="text-sm text-gray-300 leading-relaxed">{alert.message}</p>
          <p className="text-[10px] text-gray-600 mt-1">{formatDateTime(alert.timestamp)}</p>
        </div>
        {!alert.resolved && (
          <button
            onClick={() => resolveAlert(alert.id)}
            className="flex-shrink-0 w-7 h-7 rounded-lg bg-dark-500/40 flex items-center justify-center text-gray-500 hover:text-white hover:bg-dark-500 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </motion.div>
  )
}

export default function AlertPanel() {
  const alerts = useSmartHomeStore((s) => s.alerts)
  const unresolvedAlerts = alerts.filter((a) => !a.resolved)

  if (unresolvedAlerts.length === 0) {
    return null
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display font-semibold text-white text-base flex items-center gap-2">
          异常告警
          <span className="bg-danger text-white text-[10px] font-display font-bold px-1.5 py-0.5 rounded-full">
            {unresolvedAlerts.length}
          </span>
        </h2>
      </div>
      <div className="space-y-3">
        <AnimatePresence>
          {unresolvedAlerts.map((alert) => (
            <AlertCard key={alert.id} alert={alert} />
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
