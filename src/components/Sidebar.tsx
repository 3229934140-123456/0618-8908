import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  MonitorSmartphone,
  Workflow,
  History,
  Zap,
  Users,
  Home,
} from 'lucide-react'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: '仪表盘' },
  { to: '/devices', icon: MonitorSmartphone, label: '设备管理' },
  { to: '/scenes', icon: Workflow, label: '自动化场景' },
  { to: '/history', icon: History, label: '操作记录' },
  { to: '/energy', icon: Zap, label: '能耗统计' },
  { to: '/members', icon: Users, label: '家庭成员' },
]

export default function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 bottom-0 w-[72px] lg:w-[220px] bg-dark-800/80 backdrop-blur-xl border-r border-dark-500/20 z-50 flex flex-col">
      <div className="flex items-center gap-3 px-4 py-6 lg:px-5 border-b border-dark-500/20">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-primary to-amber-dark flex items-center justify-center flex-shrink-0">
          <Home className="w-5 h-5 text-dark-900" />
        </div>
        <div className="hidden lg:block">
          <h1 className="font-display font-bold text-sm text-white leading-tight">智家中枢</h1>
          <p className="text-[10px] text-gray-500 leading-tight mt-0.5">Smart Home Hub</p>
        </div>
      </div>

      <nav className="flex-1 py-4 px-2 lg:px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                isActive
                  ? 'bg-amber-primary/10 text-amber-primary'
                  : 'text-gray-500 hover:text-gray-300 hover:bg-dark-600/40'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon
                  className={`w-5 h-5 flex-shrink-0 transition-colors ${
                    isActive ? 'text-amber-primary' : 'text-gray-500 group-hover:text-gray-300'
                  }`}
                />
                <span className="hidden lg:block text-sm font-display font-medium">
                  {item.label}
                </span>
                {isActive && (
                  <div className="hidden lg:block ml-auto w-1.5 h-1.5 rounded-full bg-amber-primary" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 pb-4 hidden lg:block">
        <div className="glass-card p-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span className="text-xs text-gray-400 font-display">系统在线</span>
          </div>
          <p className="text-[10px] text-gray-600">12 设备已连接 · 2 成员在线</p>
        </div>
      </div>
    </aside>
  )
}
