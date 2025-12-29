"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Clock, MapPin, Timer, AlertCircle, TrendingUp, CreditCard, RefreshCw, Car } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { API_ENDPOINTS, API_URL } from "@/lib/api-config"

interface ActiveParking {
  vehicle_id: number
  slot_id: string
  parking_area?: string
  slot_number?: number
  entry_time: string
  duration_seconds: number
  duration_minutes: number
  status: string
  vehicle_type?: string
  color?: string
  license_plate?: string
}

const HOURLY_RATE = 20 // Nu. 20 per hour

export function DurationTracker() {
  const router = useRouter()
  const [currentTime, setCurrentTime] = useState(Date.now())
  const [activeParkingSessions, setActiveParkingSessions] = useState<ActiveParking[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isInitialLoad, setIsInitialLoad] = useState(true)

  // Fetch active parking sessions from backend
  useEffect(() => {
    const fetchActiveSessions = async (showLoading = false) => {
      if (showLoading) setLoading(true)
      
      try {
        console.log('📡 Fetching from:', API_ENDPOINTS.activeEvents)
        const response = await fetch(API_ENDPOINTS.activeEvents, {
          cache: 'no-store'
        })
        console.log('📡 Response status:', response.status, response.statusText)
        
        if (response.ok) {
          const data = await response.json()
          console.log('✓ Duration tracker fetched:', data.length, 'active sessions', data)
          setActiveParkingSessions(data)
          setErrorMessage(null)
        } else {
          const errorText = await response.text()
          console.error('❌ Failed to fetch parking data:', response.status, errorText)
          setErrorMessage(`Server error: ${response.status}`)
          setActiveParkingSessions([]) // Set empty array on error
        }
      } catch (err) {
        console.error('❌ Backend connection error:', err)
        setErrorMessage('Cannot connect to backend. Make sure simple_server.py is running.')
        setActiveParkingSessions([]) // Set empty array on error
      } finally {
        setLoading(false)
        setIsInitialLoad(false)
      }
    }

    // Initial fetch with loading state
    fetchActiveSessions(true)

    // Refetch when component becomes visible again (no loading state)
    const handleVisibilityChange = () => {
      if (!document.hidden && !isInitialLoad) {
        console.log('👁️ Component visible - refetching data')
        fetchActiveSessions(false)
      }
    }

    const handleFocus = () => {
      if (!isInitialLoad) {
        console.log('🔍 Window focused - refetching data')
        fetchActiveSessions(false)
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('focus', handleFocus)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', handleFocus)
    }
  }, [isInitialLoad])

  // Manual refresh function
  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      console.log('🔄 Refreshing from:', API_ENDPOINTS.activeEvents)
      const response = await fetch(`${API_BASE_URL}/api/parking/active`, {
        cache: 'no-store'
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log('✓ Duration tracker refreshed:', data.length, 'active sessions', data)
        setActiveParkingSessions(data)
        setErrorMessage(null)
      } else {
        const errorText = await response.text()
        console.error('❌ Failed to refresh:', response.status, errorText)
        setErrorMessage(`Server error: ${response.status}`)
        setActiveParkingSessions([])
      }
    } catch (err) {
      console.error('❌ Refresh error:', err)
      setErrorMessage('Cannot connect to backend')
      setActiveParkingSessions([])
    } finally {
      setRefreshing(false)
    }
  }

  // Update current time every second for live duration
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const calculateDuration = (entryTimeStr: string) => {
    const entryTime = new Date(entryTimeStr).getTime()
    const now = currentTime
    const durationMs = now - entryTime
    const totalSeconds = Math.floor(durationMs / 1000)
    const totalMinutes = Math.floor(totalSeconds / 60)
    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60
    const seconds = totalSeconds % 60
    return { hours, minutes, seconds, totalMinutes }
  }

  const calculateFee = (totalMinutes: number) => {
    const hours = totalMinutes / 60
    return Math.ceil(hours * HOURLY_RATE)
  }

  const getStatus = (totalMinutes: number): "Normal" | "Warning" | "Alert" => {
    if (totalMinutes >= 420) return "Alert" // 7+ hours
    if (totalMinutes >= 300) return "Warning" // 5+ hours
    return "Normal"
  }

  const handlePayment = (session: ActiveParking, totalMinutes: number, fee: number) => {
    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60
    const duration = `${hours}h ${minutes}m`
    
    const params = new URLSearchParams({
      slot: session.slot_id,
      duration: duration,
      fee: fee.toString(),
      vehicle: `V-${session.vehicle_id}`,
      area: session.parking_area || 'Main Area',
    })
    
    router.push(`/payment?${params.toString()}`)
  }

  // Group sessions by parking area
  const groupedSessions = activeParkingSessions.reduce((acc, session) => {
    const area = session.parking_area || 'Parking Area'
    if (!acc[area]) {
      acc[area] = []
    }
    acc[area].push(session)
    return acc
  }, {} as Record<string, ActiveParking[]>)

  const totalVehicles = activeParkingSessions.length
  const normalCount = activeParkingSessions.filter(s => {
    const { totalMinutes } = calculateDuration(s.entry_time)
    return getStatus(totalMinutes) === "Normal"
  }).length
  const warningCount = activeParkingSessions.filter(s => {
    const { totalMinutes } = calculateDuration(s.entry_time)
    return getStatus(totalMinutes) === "Warning"
  }).length
  const alertCount = activeParkingSessions.filter(s => {
    const { totalMinutes } = calculateDuration(s.entry_time)
    return getStatus(totalMinutes) === "Alert"
  }).length

  if (loading) {
    return (
      <div className="p-8">
        <h2 className="text-2xl font-bold mb-4">Duration Tracker by Area</h2>
        <p className="text-muted-foreground">Loading parking data...</p>
        <p className="text-xs text-muted-foreground mt-2">Connecting to {API_URL}</p>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">Duration Tracker by Area</h2>
          <p className="text-muted-foreground">
            Monitor vehicle parking duration across all parking areas
          </p>
          {errorMessage && (
            <p className="text-sm text-red-500 mt-1">⚠️ {errorMessage}</p>
          )}
        </div>
        <Button
          onClick={handleRefresh}
          disabled={refreshing}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="w-5 h-5 text-blue-500" />
            <span className="text-sm text-muted-foreground">Total Vehicles</span>
          </div>
          <div className="text-3xl font-bold">{totalVehicles}</div>
        </Card>

        <Card className="p-6 bg-green-50 dark:bg-green-950">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <span className="text-sm text-muted-foreground">Normal Status</span>
          </div>
          <div className="text-3xl font-bold text-green-600">{normalCount}</div>
        </Card>

        <Card className="p-6 bg-yellow-50 dark:bg-yellow-950">
          <div className="flex items-center gap-3 mb-2">
            <AlertCircle className="w-5 h-5 text-yellow-600" />
            <span className="text-sm text-muted-foreground">Warnings</span>
          </div>
          <div className="text-3xl font-bold text-yellow-600">{warningCount}</div>
        </Card>

        <Card className="p-6 bg-red-50 dark:bg-red-950">
          <div className="flex items-center gap-3 mb-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span className="text-sm text-muted-foreground">Alerts</span>
          </div>
          <div className="text-3xl font-bold text-red-600">{alertCount}</div>
        </Card>
      </div>

      {/* Parking Areas */}
      {Object.keys(groupedSessions).length === 0 ? (
        <Card className="p-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
            <Clock className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="text-xl font-bold text-foreground mb-2">No Active Parking Sessions</h3>
          <p className="text-muted-foreground mb-4">
            Start the video processing to track parking durations
          </p>
          <div className="text-sm text-muted-foreground bg-blue-50 p-4 rounded-lg inline-block">
            <p className="font-semibold mb-2">Quick Start:</p>
            <p>1. Run: <code className="bg-blue-100 px-2 py-1 rounded">python simple_server.py</code></p>
            <p>2. Run: <code className="bg-blue-100 px-2 py-1 rounded">python smart_parking_mvp.py</code></p>
            <p>3. Click Refresh button above</p>
          </div>
        </Card>
      ) : (
        Object.entries(groupedSessions).map(([areaName, sessions]) => (
          <Card key={areaName} className="p-6">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-semibold">{areaName}</h3>
                <Badge variant="secondary">{sessions.length} vehicles</Badge>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span>Active parking sessions</span>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b">
                  <tr className="text-left text-sm text-muted-foreground">
                    <th className="pb-3 font-medium">Slot ID</th>
                    <th className="pb-3 font-medium">Number Plate</th>
                    <th className="pb-3 font-medium">Vehicle Type</th>
                    <th className="pb-3 font-medium">Color</th>
                    <th className="pb-3 font-medium">Entry Time</th>
                    <th className="pb-3 font-medium">Duration</th>
                    <th className="pb-3 font-medium">Parking Fee</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.map((session) => {
                    const { hours, minutes, seconds, totalMinutes } = calculateDuration(session.entry_time)
                    const fee = calculateFee(totalMinutes)
                    const status = getStatus(totalMinutes)
                    const entryTime = new Date(session.entry_time)
                    
                    return (
                      <tr key={session.slot_id} className="border-b last:border-0">
                        <td className="py-4 font-medium">{session.slot_id}</td>
                        <td className="py-4">
                          <div className="flex items-center gap-2">
                            {session.license_plate && session.license_plate !== 'N/A' ? (
                              <span className="font-mono font-semibold text-blue-600">
                                {session.license_plate}
                              </span>
                            ) : (
                              <span className="font-mono text-gray-400">
                                V-undefined
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-4">
                          <div className="flex items-center gap-2">
                            <Car className="w-4 h-4 text-gray-500" />
                            <span className="capitalize">
                              {session.vehicle_type && session.vehicle_type !== 'unknown' ? session.vehicle_type : 'Unknown'}
                            </span>
                          </div>
                        </td>
                        <td className="py-4">
                          {session.color && session.color !== 'unknown' ? (
                            <Badge variant="outline" className="capitalize">
                              {session.color}
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-gray-400">
                              Unknown
                            </Badge>
                          )}
                        </td>
                        <td className="py-4">
                          {entryTime.toLocaleTimeString('en-US', { 
                            hour: '2-digit', 
                            minute: '2-digit',
                            hour12: true 
                          })}
                        </td>
                        <td className="py-4">
                          <div className="flex items-center gap-2">
                            <Timer className="w-4 h-4 text-blue-500" />
                            <span className="font-mono">
                              {hours}h {minutes}m {seconds}s
                            </span>
                          </div>
                        </td>
                        <td className="py-4">
                          <div className="flex items-center gap-1">
                            <span className="text-green-600">Nu.</span>
                            <span className="font-semibold">{fee}</span>
                          </div>
                        </td>
                        <td className="py-4">
                          {status === "Normal" && (
                            <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                              Normal
                            </Badge>
                          )}
                          {status === "Warning" && (
                            <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">
                              Warning
                            </Badge>
                          )}
                          {status === "Alert" && (
                            <Badge className="bg-red-100 text-red-700 hover:bg-red-100">
                              Alert
                            </Badge>
                          )}
                        </td>
                        <td className="py-4">
                          <Button
                            size="sm"
                            onClick={() => handlePayment(session, totalMinutes, fee)}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            <CreditCard className="w-4 h-4 mr-2" />
                            Pay Now
                          </Button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        ))
      )}
    </div>
  )
}
