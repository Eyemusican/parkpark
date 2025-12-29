"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Video, AlertCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { API_ENDPOINTS } from "@/lib/api-config"

interface SlotData {
  slot_id: string
  vehicle_id: number | null
  status: "free" | "occupied"
  entry_time: string | null
  duration_seconds: number
  duration_minutes: number
  free_since?: number // timestamp when slot became free
  is_green?: boolean // whether slot is green (3 seconds after free)
  time_until_green?: number // seconds until slot turns green
  // Vehicle details
  license_plate?: string
  color?: string
  vehicle_type?: string
}

interface ParkingArea {
  area_id: number
  area_name: string
  zone: string
  total_slots: number
  occupied_slots: number
  available_slots: number
  occupancy_rate: number
}

export default function LiveParkingPage() {
  const router = useRouter()
  const [slots, setSlots] = useState<SlotData[]>([])
  const [parkingArea, setParkingArea] = useState<ParkingArea | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const retryCountRef = useRef(0)
  const maxRetries = 10
  const videoRef = useRef<HTMLImageElement>(null)

  // Fetch parking area details
  useEffect(() => {
    let isMounted = true

    const fetchParkingAreas = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.parkingAreas, {
          cache: 'no-store'
        })

        if (response.ok && isMounted) {
          const areas: ParkingArea[] = await response.json()
          // Get the first area (should be Norzinlam)
          if (areas.length > 0) {
            setParkingArea(areas[0])
          }
        }
      } catch (err) {
        console.error('Error fetching parking areas:', err)
      }
    }

    fetchParkingAreas()

    // Refresh area data every 3 seconds
    const areaInterval = setInterval(fetchParkingAreas, 3000)

    return () => {
      isMounted = false
      clearInterval(areaInterval)
    }
  }, [])

  // Persistent polling to prevent data vanishing
  useEffect(() => {
    let intervalId: NodeJS.Timeout
    let isMounted = true

    const fetchParkingData = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.parkingSlotsStatus, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          // Add keep-alive header
          keepalive: true,
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        
        if (isMounted) {
          // Data already includes all slots with correct status
          setSlots(data)
          setIsConnected(true)
          setError(null)
          retryCountRef.current = 0
        }
      } catch (err) {
        console.error('Error fetching parking data:', err)
        
        if (isMounted) {
          retryCountRef.current++
          
          if (retryCountRef.current >= maxRetries) {
            setError(`Failed to connect after ${maxRetries} attempts. Please check if the server is running.`)
            setIsConnected(false)
          } else {
            setError(`Connection error. Retrying... (${retryCountRef.current}/${maxRetries})`)
          }
        }
      }
    }

    // Initial fetch
    fetchParkingData()

    // Set up polling every 500ms for real-time updates
    intervalId = setInterval(fetchParkingData, 500)

    // Cleanup function
    return () => {
      isMounted = false
      if (intervalId) {
        clearInterval(intervalId)
      }
    }
  }, [])

  // Video stream handling
  useEffect(() => {
    const updateVideoFrame = () => {
      if (videoRef.current) {
        // Add timestamp to prevent caching
        videoRef.current.src = `${API_ENDPOINTS.videoFeed}?t=${Date.now()}`
      }
    }

    // Update video frame source
    updateVideoFrame()

    // Refresh video stream periodically
    const videoInterval = setInterval(updateVideoFrame, 100)

    return () => {
      clearInterval(videoInterval)
    }
  }, [])

  const handleRetry = () => {
    retryCountRef.current = 0
    setError(null)
    window.location.reload()
  }

  // Calculate stats from actual slot data
  const totalSlots = slots.length // Get actual slot count from video feed
  const occupiedSlots = slots.filter(s => s.status === 'occupied').length
  const freeSlots = slots.filter(s => s.status === 'free').length
  const occupancyRate = totalSlots > 0 ? Math.round((occupiedSlots / totalSlots) * 100) : 0

  // Format duration for display
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`
    } else {
      return `${secs}s`
    }
  }

  // Check if slot should be green (using server-provided is_green flag)
  const isSlotGreen = (slot: SlotData) => {
    if (slot.status === 'free') {
      // Use server-provided is_green flag if available
      if (slot.is_green !== undefined) {
        return slot.is_green
      }
      // Fallback: check if 3 seconds have passed since free
      if (slot.free_since) {
        const timeSinceFree = (Date.now() / 1000) - slot.free_since
        return timeSinceFree >= 3
      }
      return true // Default to green if no timestamp
    }
    return false
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-blue-500/20 bg-gradient-to-r from-slate-900/80 via-blue-900/20 to-slate-900/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <Button
              onClick={() => router.back()}
              variant="ghost"
              className="text-slate-300 hover:text-blue-400 hover:bg-blue-500/10 text-sm"
            >
              <ArrowLeft className="w-4 h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Back</span>
            </Button>
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className={`${
                  isConnected
                    ? 'border-green-500/50 text-green-400'
                    : 'border-red-500/50 text-red-400'
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full mr-2 ${
                    isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
                  }`}
                />
                {isConnected ? 'Live' : 'Disconnected'}
              </Badge>
              <Badge
                className={`${
                  occupancyRate >= 80
                    ? 'bg-red-500'
                    : occupancyRate >= 60
                    ? 'bg-yellow-500'
                    : 'bg-green-500'
                }`}
             div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-white flex items-center gap-2">
                  {parkingArea ? (
                    <>
                      <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center font-bold text-white">
                        {parkingArea.zone}
                      </div>
                      <div>
                        <div className="text-xl">{parkingArea.area_name}</div>
                        <div className="text-sm text-slate-400 font-normal">Zone {parkingArea.zone}</div>
                      </div>
                    </>
                  ) : (
                    <>
                      <Video className="w-5 h-5" />
                      Live Parking Status
                    </>
                  )}
                </CardTitle>
              </div>
              <Badge
                variant="outline"
                className={`${
                  occupancyRate < 50
                    ? 'border-green-500/50 bg-green-500/10 text-green-400'
                    : occupancyRate < 80
                    ? 'border-yellow-500/50 bg-yellow-500/10 text-yellow-400'
                    : 'border-red-500/50 bg-red-500/10 text-red-400'
                }`}
              >
                Available
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-slate-700/30 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-white">{totalSlots}</div>
                <div className="text-sm text-slate-400 mt-1">Total</div>
              </div>
              <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-red-400">{occupiedSlots}</div>
                <div className="text-sm text-slate-400 mt-1">Occupied</div>
              </div>
              <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-green-400">{freeSlots}</div>
                <div className="text-sm text-slate-400 mt-1">Free</div>
              </div>
            </div>
            
            {/* Occupancy Progress Bar */}
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-400">Occupancy</span>
                <span className="text-sm font-bold text-white">{occupancyRate}%</span>
              </div>
              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${
                    occupancyRate >= 80
                      ? 'bg-red-500'
                      : occupancyRate >= 60
                      ? 'bg-yellow-500'
                      : 'bg-green-500'
                  }`}
                  style={{ width: `${occupancyRate}%` }}
                /
                onClick={handleRetry}
                size="sm"
                variant="outline"
                className="border-red-500 text-red-400 hover:bg-red-500/10"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Stats Card */}
        <Card className="mb-6 bg-slate-800/50 border-slate-700 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Video className="w-5 h-5" />
              Live Parking Monitoring
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-slate-700/30 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-white">{totalSlots}</div>
                <div className="text-sm text-slate-400 mt-1">Total Slots</div>
              </div>
              <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-green-400">{freeSlots}</div>
                <div className="text-sm text-slate-400 mt-1">Available</div>
              </div>
              <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-red-400">{occupiedSlots}</div>
                <div className="text-sm text-slate-400 mt-1">Occupied</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Video Feed */}
          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Video className="w-5 h-5" />
                Live Camera Feed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative bg-black rounded-lg overflow-hidden" style={{ paddingBottom: '56.25%' }}>
                <img
                  ref={videoRef}
                  alt="Live parking feed"
                  className="absolute top-0 left-0 w-full h-full object-contain"
                  onError={(e) => {
                    console.error('Video stream error')
                    setError('Video stream unavailable')
                  }}
                />
              </div>
              <p className="text-xs text-slate-400 mt-2 text-center">
                Real-time vehicle detection with YOLO
              </p>
            </CardContent>
          </Card>

          {/* Parking Grid */}
          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-white">Parking Grid</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500 rounded"></div>
                  <span className="text-slate-300">Free (3s+)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                  <span className="text-slate-300">Becoming Free</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-500 rounded"></div>
                  <span className="text-slate-300">Occupied</span>
                </div>
              </div>
              
              {slots.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <AlertCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No parking slots detected from video feed</p>
                  <p className="text-sm mt-2">Make sure the backend video processing is running</p>
                </div>
              ) : (
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                  {slots.map((slot) => {
                    const bgColor = slot.status === 'occupied'
                      ? 'bg-red-500'
                      : isSlotGreen(slot)
                      ? 'bg-green-500'
                      : 'bg-yellow-500'
                    
                    return (
                      <div
                        key={slot.slot_id}
                        className={`aspect-square rounded-lg flex flex-col items-center justify-center font-bold text-sm cursor-pointer transition-all hover:scale-105 ${bgColor} text-white`}
                        title={
                          slot.status === 'occupied'
                            ? `Slot ${slot.slot_id} - Vehicle ${slot.vehicle_id} - ${formatDuration(slot.duration_seconds)}${slot.vehicle_type ? `\n${slot.vehicle_type.toUpperCase()}` : ''}${slot.color ? ` | ${slot.color.toUpperCase()}` : ''}${slot.license_plate && slot.license_plate !== 'N/A' ? ` | ${slot.license_plate}` : ''}`
                            : slot.time_until_green && slot.time_until_green > 0
                            ? `Slot ${slot.slot_id} - Free in ${slot.time_until_green.toFixed(1)}s`
                            : `Slot ${slot.slot_id} - Available`
                        }
                      >
                        <div className="text-base">{slot.slot_id.split('-').pop()}</div>
                        {slot.status === 'occupied' && (
                          <>
                            <div className="text-xs opacity-90">#{slot.vehicle_id}</div>
                            {slot.license_plate && slot.license_plate !== 'N/A' && (
                              <div className="text-[10px] opacity-80 font-mono">{slot.license_plate}</div>
                            )}
                          </>
                        )}
                        {slot.status === 'free' && slot.time_until_green && slot.time_until_green > 0 && (
                          <div className="text-xs opacity-90">{slot.time_until_green.toFixed(0)}s</div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Detailed Slot List */}
        <Card className="mt-6 bg-slate-800/50 border-slate-700 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-white">Detailed Slot Status</CardTitle>
          </CardHeader>
          <CardContent>
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {slots.length === 0 && isConnected && (
                  <div className="text-center py-8 text-slate-400">
                    <AlertCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Loading parking data...</p>
                  </div>
                )}
                
                {slots.filter(s => s.status === 'occupied').length === 0 && slots.length > 0 && (
                  <div className="text-center py-4 text-green-400">
                    <p>✅ All slots are available!</p>
                  </div>
                )}
                
                {slots.filter(s => s.status === 'occupied').map((slot) => (
                  <div
                    key={slot.slot_id}
                    className="p-4 rounded-lg border bg-red-500/10 border-red-500/30"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg flex items-center justify-center font-bold bg-red-500 text-white">
                          {slot.slot_id}
                        </div>
                        <div>
                          <div className="font-semibold text-white">
                            Slot {slot.slot_id}
                          </div>
                          <div className="text-sm text-slate-400">
                            Vehicle ID: {slot.vehicle_id}
                          </div>
                          {/* Vehicle Details */}
                          <div className="flex gap-2 mt-1 text-xs">
                            {slot.vehicle_type && slot.vehicle_type !== 'unknown' && (
                              <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded">
                                {slot.vehicle_type.toUpperCase()}
                              </span>
                            )}
                            {slot.color && slot.color !== 'unknown' && (
                              <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded">
                                {slot.color.toUpperCase()}
                              </span>
                            )}
                            {slot.license_plate && slot.license_plate !== 'N/A' && (
                              <span className="px-2 py-0.5 bg-green-500/20 text-green-300 rounded font-mono">
                                {slot.license_plate}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className="bg-red-500">OCCUPIED</Badge>
                        <div className="text-sm text-slate-400 mt-1">
                          {formatDuration(slot.duration_seconds)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
