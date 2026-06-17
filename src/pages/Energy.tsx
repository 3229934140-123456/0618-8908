import { useState } from 'react'
import { useSmartHomeStore } from '@/store'
import { motion } from 'framer-motion'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line } from 'recharts'
import { Zap, TrendingUp } from 'lucide-react'

type ViewMode = 'daily' | 'monthly'

export default function Energy() {
  const energyData = useSmartHomeStore((s) => s.energyData)
  const [viewMode, setViewMode] = useState<ViewMode>('daily')
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null)

  const totalKWh = energyData.reduce((sum, d) => sum + d.totalKWh, 0)
  const sortedDevices = [...energyData].sort((a, b) => b.totalKWh - a.totalKWh)

  const chartData = selectedDevice
    ? (() => {
        const d = energyData.find((e) => e.deviceId === selectedDevice)
        if (!d) return []
        return viewMode === 'daily'
          ? d.daily.slice(-14).map((item) => ({ name: item.date.slice(5), kWh: item.kWh }))
          : d.monthly.map((item) => ({ name: item.month.slice(2), kWh: item.kWh }))
      })()
    : (() => {
        if (viewMode === 'daily') {
          const days = energyData[0]?.daily.slice(-14) || []
          return days.map((day, i) => ({
            name: day.date.slice(5),
            kWh: energyData.reduce((sum, e) => sum + (e.daily[i]?.kWh || 0), 0),
          }))
        }
        return energyData[0]?.monthly.map((m, i) => ({
          name: m.month.slice(2),
          kWh: energyData.reduce((sum, e) => sum + (e.monthly[i]?.kWh || 0), 0),
        })) || []
      })()

  const maxKWh = sortedDevices.length > 0 ? sortedDevices[0].totalKWh : 1

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-2xl text-white">能耗统计</h1>
          <p className="text-sm text-gray-500 mt-1 font-display">
            本月累计 {totalKWh.toFixed(0)} kWh · 约 ¥{(totalKWh * 0.56).toFixed(0)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-semibold text-white text-base flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-primary" /> 用电趋势
              </h2>
              <div className="flex items-center gap-3">
                <select
                  value={selectedDevice || ''}
                  onChange={(e) => setSelectedDevice(e.target.value || null)}
                  className="px-3 py-1.5 bg-dark-600/40 border border-dark-500/20 rounded-lg text-xs text-white focus:outline-none"
                >
                  <option value="">全部设备</option>
                  {energyData.map((d) => (
                    <option key={d.deviceId} value={d.deviceId}>{d.deviceName}</option>
                  ))}
                </select>
                <div className="flex gap-1">
                  {(['daily', 'monthly'] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => setViewMode(m)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-display font-medium transition-colors ${
                        viewMode === m ? 'bg-amber-primary/15 text-amber-primary' : 'bg-dark-500/40 text-gray-500'
                      }`}
                    >
                      {m === 'daily' ? '日' : '月'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                {viewMode === 'daily' ? (
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1A1F35" />
                    <XAxis dataKey="name" stroke="#4A5068" tick={{ fontSize: 10, fill: '#6B7280' }} />
                    <YAxis stroke="#4A5068" tick={{ fontSize: 10, fill: '#6B7280' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1A1F35',
                        border: '1px solid #2E3555',
                        borderRadius: '12px',
                        fontSize: '12px',
                        color: '#E8E9ED',
                      }}
                      formatter={(value: number) => [`${value.toFixed(1)} kWh`, '用电量']}
                    />
                    <Bar dataKey="kWh" fill="#F5A623" radius={[4, 4, 0, 0]} />
                  </BarChart>
                ) : (
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1A1F35" />
                    <XAxis dataKey="name" stroke="#4A5068" tick={{ fontSize: 10, fill: '#6B7280' }} />
                    <YAxis stroke="#4A5068" tick={{ fontSize: 10, fill: '#6B7280' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1A1F35',
                        border: '1px solid #2E3555',
                        borderRadius: '12px',
                        fontSize: '12px',
                        color: '#E8E9ED',
                      }}
                      formatter={(value: number) => [`${value.toFixed(1)} kWh`, '用电量']}
                    />
                    <Line type="monotone" dataKey="kWh" stroke="#F5A623" strokeWidth={2} dot={{ fill: '#F5A623', r: 4 }} />
                  </LineChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-card p-5">
            <h2 className="font-display font-semibold text-white text-base flex items-center gap-2 mb-4">
              <TrendingUp className="w-4 h-4 text-ice-primary" /> 设备能耗排行
            </h2>
            <div className="space-y-3">
              {sortedDevices.map((d, i) => {
                const pct = (d.totalKWh / totalKWh) * 100
                const barPct = (d.totalKWh / maxKWh) * 100
                return (
                  <motion.div
                    key={d.deviceId}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-display font-medium text-gray-300">{d.deviceName}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">{d.totalKWh.toFixed(1)} kWh</span>
                        <span className="text-[10px] text-amber-primary font-display font-medium">{pct.toFixed(0)}%</span>
                      </div>
                    </div>
                    <div className="w-full h-2 rounded-full bg-dark-500/40 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${barPct}%` }}
                        transition={{ duration: 0.6, delay: i * 0.05 }}
                        className="h-full rounded-full bg-gradient-to-r from-amber-primary to-amber-dark"
                      />
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>

          <div className="glass-card p-5">
            <h2 className="font-display font-semibold text-white text-sm mb-3">节能建议</h2>
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-primary mt-1.5 flex-shrink-0" />
                <p className="text-xs text-gray-400 leading-relaxed">客厅空调是最大耗能设备，建议温度设为26°C以上</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-ice-primary mt-1.5 flex-shrink-0" />
                <p className="text-xs text-gray-400 leading-relaxed">卧室灯夜间频繁开关，可设置自动关闭场景</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-success mt-1.5 flex-shrink-0" />
                <p className="text-xs text-gray-400 leading-relaxed">启用离家模式可每月节省约 15% 电量</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
