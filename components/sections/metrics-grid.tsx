"use client"

import { useEffect, useState } from "react"
import { ParkingCircle, AlertTriangle, TrendingUp, Clock } from "lucide-react"
import { API_ENDPOINTS } from "@/lib/api-config"

interface SystemStats {
  total_areas: number
  total_slots: number
  total_occupied: number
  total_available: number
  overall_occupancy_rate: number
  active_events: number
  total_violations: number
}

export function MetricsGrid() {
  const [stats, setStats] = useState<SystemStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(`${API_ENDPOINTS.parkingAreas.replace('/parking-areas', '/stats/overview')}`, {
          cache: 'no-store'
        })
        if (response.ok) {
          const data = await response.json()
          setStats(data)
        }
      } catch (error) {
        console.error('Error fetching stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading || !stats) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-gray-100 rounded-xl h-32 animate-pulse"></div>
        ))}
      </div>
    )
  }

  const metrics = [
    { 
      label: "Total Capacity", 
      value: stats.total_slots.toString(), 
      subtext: "parking spaces",
      icon: ParkingCircle, 
      iconColor: "text-blue-600",
      iconBg: "bg-blue-100",
      accentColor: "border-l-blue-500"
    },
    { 
      label: "Currently Parked", 
      value: stats.total_occupied.toString(), 
      subtext: "vehicles now",
      change: `${stats.total_occupied}`, 
      icon: TrendingUp, 
      iconColor: "text-orange-600",
      iconBg: "bg-orange-100",
      accentColor: "border-l-orange-500",
      trend: "up"
    },
    { 
      label: "Available Spaces", 
      value: stats.total_available.toString(), 
      subtext: "slots free",
      icon: ParkingCircle, 
      iconColor: "text-green-600",
      iconBg: "bg-green-100",
      accentColor: "border-l-green-500",
      trend: "down"
    },
    { 
      label: "Active Issues", 
      value: stats.total_violations.toString(), 
      subtext: "violations",
      icon: AlertTriangle, 
      iconColor: "text-red-600",
      iconBg: "bg-red-100",
      accentColor: "border-l-red-500",
      trend: "down"
    },
    { 
      label: "Utilization Rate", 
      value: `${Number(stats.overall_occupancy_rate || 0).toFixed(1)}%`, 
      subtext: "avg occupancy",
      icon: TrendingUp, 
      iconColor: "text-purple-600",
      iconBg: "bg-purple-100",
      accentColor: "border-l-purple-500",
      trend: "up"
    },
    { 
      label: "Active Sessions", 
      value: stats.active_events.toString(), 
      subtext: "parking now",
      icon: Clock, 
      iconColor: "text-indigo-600",
      iconBg: "bg-indigo-100",
      accentColor: "border-l-indigo-500"
    },
  ]

  const getTrendBadgeStyle = (trend?: string) => {
    if (trend === 'up') return 'bg-green-100 text-green-700'
    if (trend === 'down') return 'bg-blue-100 text-blue-700'
    return 'bg-gray-100 text-gray-600'
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
      {metrics.map((metric) => {
        const Icon = metric.icon
        
        return (
          <div 
            key={metric.label} 
            className={`bg-white rounded-xl border-l-4 ${metric.accentColor} border-t border-r border-b border-gray-200 p-5 hover:shadow-lg transition-all duration-300 group`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 ${metric.iconBg} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <Icon className={`w-6 h-6 ${metric.iconColor}`} />
              </div>
              {metric.change && (
                <div className={`text-xs font-bold px-2.5 py-1 rounded-full ${getTrendBadgeStyle(metric.trend)}`}>
                  {metric.change}
                </div>
              )}
            </div>
            
            <div>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                {metric.label}
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1 group-hover:scale-105 transition-transform inline-block">
                {metric.value}
              </div>
              <div className="text-xs text-gray-400">
                {metric.subtext}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}


