import { useState } from 'react'
import { useSmartHomeStore } from '@/store'
import { motion, AnimatePresence } from 'framer-motion'
import { Crown, Shield, UserPlus, X, Check, Mail, MonitorSmartphone, Workflow, Users } from 'lucide-react'
import type { FamilyMember } from '@/types'

function PermissionDrawer({ member, onClose }: { member: FamilyMember; onClose: () => void }) {
  const { devices, updateMemberPermissions } = useSmartHomeStore()
  const [selectedIds, setSelectedIds] = useState<string[]>(member.permissions.deviceIds)

  const toggleDevice = (deviceId: string) => {
    setSelectedIds((prev) =>
      prev.includes(deviceId) ? prev.filter((id) => id !== deviceId) : [...prev, deviceId]
    )
  }

  const selectAll = () => setSelectedIds(devices.map((d) => d.id))
  const deselectAll = () => setSelectedIds([])

  const handleSave = () => {
    updateMemberPermissions(member.id, selectedIds)
    onClose()
  }

  const rooms = Array.from(new Set(devices.map((d) => d.room)))

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 250 }}
        className="fixed right-0 top-0 bottom-0 w-[380px] bg-dark-800 border-l border-dark-500/20 z-50 overflow-y-auto"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-display font-bold text-lg text-white">权限设置</h3>
            <button onClick={onClose} className="w-8 h-8 rounded-lg bg-dark-600 flex items-center justify-center text-gray-400 hover:text-white transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="glass-card p-4 mb-6 flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-ice-primary/20 flex items-center justify-center">
              <span className="font-display font-bold text-ice-primary text-lg">
                {member.name[0]}
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-display font-semibold text-white">{member.name}</p>
                {member.role === 'admin' && <Crown className="w-4 h-4 text-amber-primary" />}
              </div>
              <p className="text-xs text-gray-500">
                {member.role === 'admin' ? '管理员' : '成员'} · {member.online ? '在线' : '离线'}
              </p>
            </div>
          </div>

          <div className="mb-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-display font-semibold text-sm text-gray-300">设备权限</h4>
              <div className="flex gap-2">
                <button onClick={selectAll} className="text-[10px] text-ice-primary font-display font-medium hover:underline">全选</button>
                <button onClick={deselectAll} className="text-[10px] text-gray-500 font-display font-medium hover:underline">反选</button>
              </div>
            </div>

            <div className="space-y-4">
              {rooms.map((room) => {
                const roomDevices = devices.filter((d) => d.room === room)
                return (
                  <div key={room}>
                    <h5 className="text-xs font-display font-medium text-gray-500 mb-2">{room}</h5>
                    <div className="space-y-1">
                      {roomDevices.map((device) => (
                        <label
                          key={device.id}
                          className="flex items-center gap-3 p-2 rounded-lg hover:bg-dark-600/30 transition-colors cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(device.id)}
                            onChange={() => toggleDevice(device.id)}
                            className="accent-amber-primary w-4 h-4"
                          />
                          <MonitorSmartphone className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-300 font-display">{device.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="mb-6">
            <h4 className="font-display font-semibold text-sm text-gray-300 mb-3">功能权限</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-3 p-2 glass-card">
                <Workflow className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-300 font-display flex-1">创建场景</span>
                <span className={`text-xs font-display ${member.permissions.canCreateScene ? 'text-success' : 'text-gray-600'}`}>
                  {member.permissions.canCreateScene ? '允许' : '禁止'}
                </span>
              </div>
              <div className="flex items-center gap-3 p-2 glass-card">
                <Users className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-300 font-display flex-1">管理成员</span>
                <span className={`text-xs font-display ${member.permissions.canManageMembers ? 'text-success' : 'text-gray-600'}`}>
                  {member.permissions.canManageMembers ? '允许' : '禁止'}
                </span>
              </div>
            </div>
          </div>

          <button onClick={handleSave} className="btn-primary w-full flex items-center justify-center gap-2">
            <Check className="w-4 h-4" /> 保存权限
          </button>
        </div>
      </motion.div>
    </>
  )
}

function InviteModal({ onClose }: { onClose: () => void }) {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<'member'>('member')

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <div className="bg-dark-800 border border-dark-500/30 rounded-2xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-display font-bold text-lg text-white">邀请成员</h3>
            <button onClick={onClose} className="w-8 h-8 rounded-lg bg-dark-600 flex items-center justify-center text-gray-400 hover:text-white transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-display font-medium text-gray-300 mb-2 block">邮箱地址</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="输入邮箱地址"
                  className="w-full pl-10 pr-4 py-3 bg-dark-600/40 border border-dark-500/20 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-amber-primary/40"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-display font-medium text-gray-300 mb-2 block">角色</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setRole('member')}
                  className={`flex-1 py-3 rounded-xl text-sm font-display font-medium transition-colors flex items-center justify-center gap-2 ${
                    role === 'member' ? 'bg-amber-primary/15 text-amber-primary border border-amber-primary/30' : 'bg-dark-600/40 text-gray-500 border border-dark-500/20'
                  }`}
                >
                  <Shield className="w-4 h-4" /> 家庭成员
                </button>
              </div>
            </div>
          </div>

          <button onClick={onClose} className="btn-primary w-full mt-6 flex items-center justify-center gap-2">
            <UserPlus className="w-4 h-4" /> 发送邀请
          </button>
        </div>
      </motion.div>
    </>
  )
}

export default function Members() {
  const { members, devices } = useSmartHomeStore()
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null)
  const [showInvite, setShowInvite] = useState(false)

  const onlineCount = members.filter((m) => m.online).length

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-2xl text-white">家庭成员</h1>
          <p className="text-sm text-gray-500 mt-1 font-display">
            {members.length} 位成员 · {onlineCount} 位在线
          </p>
        </div>
        <button onClick={() => setShowInvite(true)} className="btn-primary flex items-center gap-2">
          <UserPlus className="w-4 h-4" /> 邀请成员
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {members.map((member, i) => {
          const deviceCount = member.permissions.deviceIds.length
          const devicePct = devices.length > 0 ? (deviceCount / devices.length) * 100 : 0
          return (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass-card-hover p-5 cursor-pointer"
              onClick={() => setSelectedMember(member)}
            >
              <div className="flex items-start gap-4">
                <div className="relative">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                    member.role === 'admin' ? 'bg-amber-primary/20' : 'bg-ice-primary/20'
                  }`}>
                    <span className={`font-display font-bold text-xl ${
                      member.role === 'admin' ? 'text-amber-primary' : 'text-ice-primary'
                    }`}>
                      {member.name[0]}
                    </span>
                  </div>
                  {member.role === 'admin' && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-primary flex items-center justify-center">
                      <Crown className="w-3 h-3 text-dark-900" />
                    </div>
                  )}
                  <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-dark-700 ${
                    member.online ? 'bg-success' : 'bg-gray-600'
                  }`} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-display font-bold text-white text-base">{member.name}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {member.role === 'admin' ? '管理员' : '家庭成员'} · {member.online ? '在线' : '离线'}
                  </p>
                  <div className="mt-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] text-gray-500 font-display">设备权限</span>
                      <span className="text-[10px] text-gray-400 font-display">{deviceCount}/{devices.length}</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-dark-500/40 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-ice-primary to-ice-dark transition-all"
                        style={{ width: `${devicePct}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex gap-3 mt-2">
                    <span className={`text-[10px] font-display ${
                      member.permissions.canCreateScene ? 'text-success' : 'text-gray-600'
                    }`}>
                      {member.permissions.canCreateScene ? '✓' : '✗'} 创建场景
                    </span>
                    <span className={`text-[10px] font-display ${
                      member.permissions.canManageMembers ? 'text-success' : 'text-gray-600'
                    }`}>
                      {member.permissions.canManageMembers ? '✓' : '✗'} 管理成员
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      <AnimatePresence>
        {selectedMember && (
          <PermissionDrawer member={selectedMember} onClose={() => setSelectedMember(null)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showInvite && <InviteModal onClose={() => setShowInvite(false)} />}
      </AnimatePresence>
    </div>
  )
}
