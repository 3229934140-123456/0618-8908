import { useSmartHomeStore } from '@/store'
import { Zap, TrendingUp, TrendingDown } from 'lucide-react'

export default function EnergyOverview() {
  const energyData = useSmartHomeStore((s) => s.energyData)

  const todayKWh = energyData.reduce((sum, d) => {
    const today = d.daily[d.daily.length - 1]
    return sum + (today?.kWh || 0)
  }, 0)

  const yesterdayKWh = energyData.reduce((sum, d) => {
    const yesterday = d.daily[d.daily.length - 2]
    return sum + (yesterday?.kWh || 0)
  }, 0)

  const monthKWh = energyData.reduce((sum, d) => sum + d.totalKWh, 0)

  const todayChange = yesterdayKWh > 0 ? ((todayKWh - yesterdayKWh) / yesterdayKWh) * 100 : 0

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display font-semibold text-white text-base flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-primary" />
          能耗速览
        </h2>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="glass-card p-4">
          <p className="text-xs text-gray-500 font-display">今日用电</p>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-display font-bold text-white">
              {todayKWh.toFixed(1)}
            </span>
            <span className="text-xs text-gray-500">kWh</span>
          </div>
          <div className="flex items-center gap-1 mt-1">
            {todayChange >= 0 ? (
              <TrendingUp className="w-3 h-3 text-danger" />
            ) : (
              <TrendingDown className="w-3 h-3 text-success" />
            )}
            <span className={`text-[10px] font-display ${todayChange >= 0 ? 'text-danger' : 'text-success'}`}>
              {todayChange >= 0 ? '+' : ''}{todayChange.toFixed(1)}%
            </span>
            <span className="text-[10px] text-gray-600">较昨日</span>
          </div>
        </div>
        <div className="glass-card p-4">
          <p className="text-xs text-gray-500 font-display">本月累计</p>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-display font-bold text-white">
              {monthKWh.toFixed(0)}
            </span>
            <span className="text-xs text-gray-500">kWh</span>
          </div>
          <p className="text-[10px] text-gray-600 mt-1">
            约 ¥{(monthKWh * 0.56).toFixed(0)}
          </p>
        </div>
      </div>
    </div>
  )
}
