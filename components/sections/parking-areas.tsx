"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { MapPin, ArrowRight, RefreshCw, Plus, Play, Square, Video } from "lucide-react"
import { API_ENDPOINTS, API_URL } from "@/lib/api-config"
import { CreateParkingAreaWizard } from "./create-parking-area-wizard"
import { Button } from "@/components/ui/button"

interface ParkingArea {
  id: number
  name: string
  total_slots: number
  occupied_slots: number
  available_slots: number
  occupancy_rate: number
}

interface SlotStatus {
  slot_id: number
  slot_number: number
  is_occupied: boolean
  vehicle_id?: string
  event_id?: number
  arrival_time?: string
}

interface DetectionStatus {
  running: boolean
  parking_id: number
}

export function ParkingAreas() {
  const router = useRouter()
  const [areas, setAreas] = useState<ParkingArea[]>([])
  const [slotStatuses, setSlotStatuses] = useState<Record<number, SlotStatus[]>>({})
  const [detectionStatuses, setDetectionStatuses] = useState<Record<number, DetectionStatus>>({})
  const [loading, setLoading] = useState(true)
  const [showWizard, setShowWizard] = useState(false)

  // Fetch functions defined outside useEffect for reuse
  const fetchSlotStatuses = async (areaId: number) => {
    try {
      const response = await fetch(`${API_URL}/api/parking-areas/${areaId}/slots`, {
        cache: 'no-store'
      })
      if (response.ok) {
        const slots: SlotStatus[] = await response.json()
        setSlotStatuses(prev => ({ ...prev, [areaId]: slots }))
      }
    } catch (error) {
      console.error(`Error fetching slots for area ${areaId}:`, error)
    }
  }

  const fetchDetectionStatus = async (areaId: number) => {
    try {
      const response = await fetch(API_ENDPOINTS.detectionStatus(areaId), {
        cache: 'no-store'
      })
      if (response.ok) {
        const status: DetectionStatus = await response.json()
        setDetectionStatuses(prev => ({ ...prev, [areaId]: status }))
      }
    } catch (error) {
      console.error(`Error fetching detection status for area ${areaId}:`, error)
    }
  }

  const fetchAreasData = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.parkingAreas, { cache: 'no-store' })
      if (response.ok) {
        const data: ParkingArea[] = await response.json()
        setAreas(data)
        return data
      }
    } catch (error) {
      console.error('Error fetching parking areas:', error)
    }
    return []
  }

  useEffect(() => {
    const initializeData = async () => {
      const areasData = await fetchAreasData()
      // Fetch slot statuses and detection status for each area
      for (const area of areasData) {
        fetchSlotStatuses(area.id)
        fetchDetectionStatus(area.id)
      }
      setLoading(false)
    }

    initializeData()

    // Poll all data every 3 seconds (matches UI claim)
    const interval = setInterval(async () => {
      const currentAreas = await fetchAreasData()
      for (const area of currentAreas) {
        fetchSlotStatuses(area.id)
        fetchDetectionStatus(area.id)
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  const toggleDetection = async (areaId: number, currentlyRunning: boolean) => {
    try {
      const endpoint = currentlyRunning
        ? API_ENDPOINTS.detectionStop(areaId)
        : API_ENDPOINTS.detectionStart(areaId)

      const response = await fetch(endpoint, { method: 'POST' })
      if (response.ok) {
        // Update local state
        setDetectionStatuses(prev => ({
          ...prev,
          [areaId]: { ...prev[areaId], running: !currentlyRunning, parking_id: areaId }
        }))
      }
    } catch (error) {
      console.error('Error toggling detection:', error)
    }
  }

  const refreshAreas = () => {
    setLoading(true)
    window.location.reload()
  }

  const handleWizardComplete = () => {
    setShowWizard(false)
    refreshAreas()
  }

  // Show wizard when requested
  if (showWizard) {
    return (
      <div className="p-4 sm:p-6">
        <CreateParkingAreaWizard
          onComplete={handleWizardComplete}
          onCancel={() => setShowWizard(false)}
        />
      </div>
    )
  }

  const getOccupancyColor = (occupancyRate: number) => {
    if (occupancyRate >= 80) return "bg-red-500"
    if (occupancyRate >= 60) return "bg-yellow-500"
    return "bg-green-500"
  }

  const getOccupancyBadgeColor = (occupancyRate: number) => {
    if (occupancyRate >= 80) return 'bg-red-500'
    if (occupancyRate >= 60) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <RefreshCw className="w-6 h-6 animate-spin text-blue-600 mr-2" />
        <span className="text-gray-600">Loading live parking data...</span>
      </div>
    )
  }

  if (areas.length === 0) {
    return (
      <div className="p-8">
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
            <MapPin className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">No parking areas yet</h3>
          <p className="text-gray-600 text-sm mb-6">Create your first parking area by uploading a video and defining parking slots.</p>
          <Button onClick={() => setShowWizard(true)} size="lg">
            <Plus className="w-4 h-4 mr-2" />
            Create Parking Area
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 border-b-2 border-gray-200 pb-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Parking Areas</h2>
          <p className="text-sm text-gray-600 mt-1">Live data from video feed • Updates every 3 seconds</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span>Live</span>
          </div>
          <Button onClick={() => setShowWizard(true)} size="sm">
            <Plus className="w-4 h-4 mr-1" />
            Create New
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 shadow-sm">
          <div className="text-sm font-medium text-gray-600 mb-1">Total Areas</div>
          <div className="text-4xl font-bold text-gray-900">{areas.length}</div>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 shadow-sm">
          <div className="text-sm font-medium text-gray-600 mb-1">Total Capacity</div>
          <div className="text-4xl font-bold text-gray-900">{areas.reduce((sum, a) => sum + a.total_slots, 0)}</div>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 shadow-sm">
          <div className="text-sm font-medium text-gray-600 mb-1">In Use</div>
          <div className="text-4xl font-bold text-gray-900">{areas.reduce((sum, a) => sum + a.occupied_slots, 0)}</div>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 shadow-sm">
          <div className="text-sm font-medium text-gray-600 mb-1">Available</div>
          <div className="text-4xl font-bold text-gray-900">
            {areas.reduce((sum, a) => sum + a.available_slots, 0)}
          </div>
        </div>
      </div>

      {/* Areas Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
        {areas.map((area) => {
          const occupancyRate = Math.round(area.occupancy_rate)
          const areaSlots = slotStatuses[area.id] || []
          
          return (
            <div
              key={area.id}
              className="bg-white rounded-2xl border-2 border-gray-200 overflow-hidden hover:shadow-2xl hover:border-blue-400 transition-all duration-300"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 sm:p-5 border-b-2 border-gray-200">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-gray-900">{area.name}</h3>
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-0.5">
                      <MapPin className="w-3 h-3" />
                      <span>Zone {area.id}</span>
                    </div>
                  </div>
                  <div className={`px-3 py-1.5 rounded-full text-xs font-bold text-white ${getOccupancyBadgeColor(occupancyRate)}`}>
                    {occupancyRate}%
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="p-4 sm:p-5">
                <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">{area.total_slots}</div>
                    <div className="text-xs text-gray-500 font-medium mt-1">Total</div>
                  </div>
                  <div className="text-center p-3 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">{area.occupied_slots}</div>
                    <div className="text-xs text-gray-500 font-medium mt-1">Occupied</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{area.available_slots}</div>
                    <div className="text-xs text-gray-500 font-medium mt-1">Free</div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mb-4">
                  <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${getOccupancyColor(occupancyRate)} transition-all duration-1000`}
                      style={{ width: `${occupancyRate}%` }}
                    />
                  </div>
                </div>

                {/* Slot Grid - RED for occupied, GREEN for vacant */}
                <div className="bg-gray-50 rounded-lg p-2 sm:p-3 border-2 border-gray-200">
                  <div className="grid grid-cols-4 sm:grid-cols-8 gap-1 sm:gap-1.5">
                    {areaSlots.length > 0 ? (
                      // Show actual slot statuses from backend (matches video detection)
                      areaSlots.map((slot) => {
                        const isOccupied = slot.is_occupied === true
                        return (
                          <div 
                            key={`${area.id}-slot-${slot.slot_number}`} 
                            title={isOccupied ? `Slot ${slot.slot_number} - Occupied ${slot.vehicle_id ? `(${slot.vehicle_id})` : ''}` : `Slot ${slot.slot_number} - Available`}
                          >
                            <div className={`w-full aspect-square rounded-md flex items-center justify-center font-bold text-xs transition-all shadow-sm ${
                              isOccupied 
                                ? 'bg-red-500 text-white border-2 border-red-600' 
                                : 'bg-green-500 text-white border-2 border-green-600'
                            }`}>
                              {slot.slot_number}
                            </div>
                          </div>
                        )
                      })
                    ) : (
                      // Fallback: approximate visualization based on occupied count
                      Array.from({ length: area.total_slots }).map((_, i) => {
                        const isOccupied = i < area.occupied_slots
                        const slotNumber = i + 1
                        return (
                          <div key={`${area.id}-slot-approx-${i}`}>
                            <div className={`w-full aspect-square rounded-md flex items-center justify-center font-bold text-xs shadow-sm ${
                              isOccupied 
                                ? 'bg-red-500 text-white border-2 border-red-600' 
                                : 'bg-green-500 text-white border-2 border-green-600'
                            }`}>
                              {slotNumber}
                            </div>
                          </div>
                        )
                      })
                    )}
                  </div>
                  <div className="flex items-center gap-4 mt-3 text-xs text-gray-600">
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-sm bg-green-500 border border-green-600"></div>
                      <span>Available</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-sm bg-red-500 border border-red-600"></div>
                      <span>Occupied</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-4 sm:px-5 py-3 bg-gray-50 border-t-2 border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* Detection Status */}
                  {detectionStatuses[area.id]?.running ? (
                    <div className="text-xs text-green-600 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                      Detection Active
                    </div>
                  ) : (
                    <div className="text-xs text-gray-500 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                      Detection Off
                    </div>
                  )}
                  {/* Detection Toggle Button */}
                  <button
                    onClick={() => toggleDetection(area.id, detectionStatuses[area.id]?.running || false)}
                    className={`p-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 ${
                      detectionStatuses[area.id]?.running
                        ? 'bg-red-100 text-red-600 hover:bg-red-200'
                        : 'bg-green-100 text-green-600 hover:bg-green-200'
                    }`}
                    title={detectionStatuses[area.id]?.running ? 'Stop Detection' : 'Start Detection'}
                  >
                    {detectionStatuses[area.id]?.running ? (
                      <Square className="w-3 h-3" />
                    ) : (
                      <Play className="w-3 h-3" />
                    )}
                  </button>
                  {/* Live Feed Button */}
                  {detectionStatuses[area.id]?.running && (
                    <button
                      onClick={() => window.open(API_ENDPOINTS.detectionFeed(area.id), '_blank')}
                      className="p-1.5 rounded-lg bg-purple-100 text-purple-600 hover:bg-purple-200 transition-colors"
                      title="View Live Feed"
                    >
                      <Video className="w-3 h-3" />
                    </button>
                  )}
                </div>
                <button
                  onClick={() => router.push(`/parking/${area.id}`)}
                  className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors flex items-center gap-1">
                  Details
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
