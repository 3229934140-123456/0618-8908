import { useState } from 'react'
import { useSmartHomeStore } from '@/store'
import { formatDateTime } from '@/utils/deviceHelpers'
import { motion } from 'framer-motion'
import { CheckCircle2, XCircle, Filter, User, MonitorSmartphone } from 'lucide-react'

export default function History() {
  const { operationRecords, devices, members } = useSmartHomeStore()
  const [filterMember, setFilterMember] = useState('all')
  const [filterDevice, setFilterDevice] = useState('all')
  const [filterResult, setFilterResult] = useState<'all' | 'success' | 'failed'>('all')

  const filtered = operationRecords.filter((r) => {
    if (filterMember !== 'all' && r.memberId !== filterMember) return false
    if (filterDevice !== 'all' && r.deviceId !== filterDevice) return false
    if (filterResult !== 'all' && r.result !== filterResult) return false
    return true
  })

  const grouped = filtered.reduce<Record<string, typeof filtered>>((acc, r) => {
    const date = new Date(r.timestamp).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    })
    if (!acc[date]) acc[date] = []
    acc[date].push(r)
    return acc
  }, {})

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-2xl text-white">操作记录</h1>
          <p className="text-sm text-gray-500 mt-1 font-display">{operationRecords.length} 条记录</p>
        </div>
      </div>

      <div className="glass-card p-4 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-display font-medium text-gray-300">筛选</span>
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <User className="w-3.5 h-3.5 text-gray-500" />
            <select
              value={filterMember}
              onChange={(e) => setFilterMember(e.target.value)}
              className="px-3 py-1.5 bg-dark-600/40 border border-dark-500/20 rounded-lg text-xs text-white focus:outline-none focus:border-amber-primary/40"
            >
              <option value="all">全部成员</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <MonitorSmartphone className="w-3.5 h-3.5 text-gray-500" />
            <select
              value={filterDevice}
              onChange={(e) => setFilterDevice(e.target.value)}
              className="px-3 py-1.5 bg-dark-600/40 border border-dark-500/20 rounded-lg text-xs text-white focus:outline-none focus:border-amber-primary/40"
            >
              <option value="all">全部设备</option>
              {devices.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-1.5">
            {(['all', 'success', 'failed'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setFilterResult(r)}
                className={`px-3 py-1.5 rounded-lg text-xs font-display font-medium transition-colors ${
                  filterResult === r ? 'bg-amber-primary/15 text-amber-primary' : 'bg-dark-500/40 text-gray-500'
                }`}
              >
                {r === 'all' ? '全部' : r === 'success' ? '成功' : '失败'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-8">
        {Object.entries(grouped).map(([date, records]) => (
          <div key={date}>
            <h3 className="font-display font-semibold text-sm text-gray-400 mb-4">{date}</h3>
            <div className="relative pl-6">
              <div className="absolute left-[7px] top-2 bottom-2 w-px bg-dark-500/30" />
              <div className="space-y-3">
                {records.map((record, i) => (
                  <motion.div
                    key={record.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="relative glass-card p-4"
                  >
                    <div className={`absolute left-[-22px] top-4 w-3 h-3 rounded-full border-2 ${
                      record.result === 'success'
                        ? 'bg-dark-800 border-success'
                        : 'bg-dark-800 border-danger'
                    }`} />
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-display font-semibold text-white">
                            {record.memberName}
                          </span>
                          <span className="text-[10px] text-gray-600 font-display">
                            {formatDateTime(record.timestamp)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-400">
                          <span className="text-ice-primary font-display">{record.deviceName}</span>
                          <span className="mx-1.5 text-gray-600">·</span>
                          {record.action}
                        </p>
                      </div>
                      <div className={`flex items-center gap-1 text-xs font-display font-medium ${
                        record.result === 'success' ? 'text-success' : 'text-danger'
                      }`}>
                        {record.result === 'success' ? (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        ) : (
                          <XCircle className="w-3.5 h-3.5" />
                        )}
                        {record.result === 'success' ? '成功' : '失败'}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <p className="text-gray-500 font-display">未找到匹配的操作记录</p>
        </div>
      )}
    </div>
  )
}
