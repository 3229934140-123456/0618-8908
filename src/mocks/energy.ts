import type { EnergyData } from '@/types'

function generateDailyData(days: number, baseKWh: number): { date: string; kWh: number }[] {
  const result: { date: string; kWh: number }[] = []
  const now = new Date('2026-06-18')
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().split('T')[0]
    result.push({
      date: dateStr,
      kWh: Math.round((baseKWh + (Math.random() - 0.3) * baseKWh * 0.4) * 100) / 100,
    })
  }
  return result
}

function generateMonthlyData(): { month: string; kWh: number }[] {
  const months = ['2026-01', '2026-02', '2026-03', '2026-04', '2026-05', '2026-06']
  return months.map((month) => ({
    month,
    kWh: Math.round((150 + Math.random() * 100) * 100) / 100,
  }))
}

export const energyData: EnergyData[] = [
  {
    deviceId: 'dev-003',
    deviceName: '客厅空调',
    daily: generateDailyData(30, 8.5),
    monthly: generateMonthlyData(),
    totalKWh: 245.6,
  },
  {
    deviceId: 'dev-004',
    deviceName: '卧室空调',
    daily: generateDailyData(30, 5.2),
    monthly: generateMonthlyData(),
    totalKWh: 156.3,
  },
  {
    deviceId: 'dev-001',
    deviceName: '客厅主灯',
    daily: generateDailyData(30, 1.2),
    monthly: generateMonthlyData(),
    totalKWh: 36.8,
  },
  {
    deviceId: 'dev-002',
    deviceName: '卧室灯',
    daily: generateDailyData(30, 0.8),
    monthly: generateMonthlyData(),
    totalKWh: 24.5,
  },
  {
    deviceId: 'dev-010',
    deviceName: '客厅插座',
    daily: generateDailyData(30, 3.5),
    monthly: generateMonthlyData(),
    totalKWh: 105.2,
  },
  {
    deviceId: 'dev-009',
    deviceName: '门口摄像头',
    daily: generateDailyData(30, 0.5),
    monthly: generateMonthlyData(),
    totalKWh: 15.2,
  },
]
