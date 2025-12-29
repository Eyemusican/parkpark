"use client"

import { useEffect, useState } from "react"
import { MapPin, RefreshCw } from "lucide-react"
import { API_ENDPOINTS, API_URL } from "@/lib/api-config"

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
}

export function RealTimeMonitoring() {
  const [parkingAreas, setParkingAreas] = useState<ParkingArea[]>([])
  const [slotStatuses, setSlotStatuses] = useState<Record<number, SlotStatus[]>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchParkingAreas = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.parkingAreas, { cache: 'no-store' })
        if (!response.ok) throw new Error('Failed to fetch parking areas')
        
        const data: ParkingArea[] = await response.json()
        setParkingAreas(data)
        
        // Fetch slot statuses for each area
        for (const area of data) {
          fetchSlotStatuses(area.id)
        }
        
        setError(null)
      } catch (err) {
        console.error('Error fetching parking areas:', err)
        setError('Failed to load parking data')
        setParkingAreas([])
      } finally {
        setLoading(false)
      }
    }

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

    fetchParkingAreas()
  }, [])

  const getProgressColor = (occupancyRate: number) => {
    if (occupancyRate >= 80) return "bg-gradient-to-r from-red-500 to-orange-500"
    if (occupancyRate >= 60) return "bg-gradient-to-r from-yellow-500 to-amber-500"
    return "bg-gradient-to-r from-green-500 to-emerald-500"
  }

  const getStatusText = (occupancyRate: number) => {
    if (occupancyRate >= 80) return { text: "Almost Full", color: "text-red-600", bg: "bg-red-50 border-red-200" }
    if (occupancyRate >= 60) return { text: "Filling Up", color: "text-yellow-600", bg: "bg-yellow-50 border-yellow-200" }
    return { text: "Available", color: "text-green-600", bg: "bg-green-50 border-green-200" }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading parking areas...</span>
      </div>
    )
  }

  if (error || parkingAreas.length === 0) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
        <p className="text-yellow-800">{error || 'No parking areas found. Please check if video feed is running.'}</p>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 border-b-2 border-gray-200 pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">Live Parking Status</h2>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">Real-time availability from video feed</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span>Updated now</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
        {parkingAreas.map((area) => {
          const occupancyRate = Math.round(area.occupancy_rate)
          const statusInfo = getStatusText(occupancyRate)
          const areaSlots = slotStatuses[area.id] || []

          return (
            <div
              key={area.id}
              className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-300"
            >
              <div className="p-5">
                {/* Header Section */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-lg">
                      {area.id}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-base">{area.name}</h3>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <MapPin className="w-3 h-3" />
                        <span>Zone {area.id}</span>
                      </div>
                    </div>
                  </div>
                  <div className={`px-3 py-1.5 rounded-md text-xs font-medium border ${statusInfo.bg} ${statusInfo.color}`}>
                    {statusInfo.text}
                  </div>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-gray-900">{area.total_slots}</div>
                    <div className="text-xs text-gray-600 mt-1">Total</div>
                  </div>
                  <div className="bg-red-50 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-red-600">{area.occupied_slots}</div>
                    <div className="text-xs text-gray-600 mt-1">Occupied</div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-green-600">{area.available_slots}</div>
                    <div className="text-xs text-gray-600 mt-1">Free</div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-gray-600">Occupancy</span>
                    <span className="text-sm font-bold text-gray-900">{occupancyRate}%</span>
                  </div>
                  <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${getProgressColor(occupancyRate)} transition-all duration-1000 rounded-full`}
                      style={{ width: `${occupancyRate}%` }}
                    ></div>
                  </div>
                </div>
                {/* Car Grid Visualization - RED for occupied, GREEN for vacant */}
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <div className="grid grid-cols-8 gap-1.5">
                    {areaSlots.length > 0 ? (
                      // Show actual slot statuses from video feed
                      areaSlots.slice(0, 16).map((slot) => {
                        const isOccupied = slot.is_occupied === true
                        return (
                          <div
                            key={`${area.id}-slot-${slot.slot_number}`}
                            title={isOccupied ? `Slot ${slot.slot_number} - Occupied ${slot.vehicle_id ? `(${slot.vehicle_id})` : ''}` : `Slot ${slot.slot_number} - Available`}
                          >
                            <div className={`w-full aspect-square rounded-md flex items-center justify-center font-bold text-xs border-2 transition-all ${
                              isOccupied ? 'bg-red-500 text-white border-red-600' : 'bg-green-500 text-white border-green-600'
                            }`}>
                              {slot.slot_number}
                            </div>
                          </div>
                        )
                      })
                    ) : (
                      // Fallback visualization
                      Array.from({ length: Math.min(area.total_slots, 16) }).map((_, i) => {
                        const isOccupied = i < area.occupied_slots
                        const slotNumber = i + 1
                        return (
                          <div
                            key={`${area.id}-slot-${i}`}
                            title={`Slot ${slotNumber}: ${isOccupied ? "Occupied" : "Available"}`}
                          >
                            <div className={`w-full aspect-square rounded-md flex items-center justify-center font-bold text-xs border-2 transition-all ${
                              isOccupied ? 'bg-red-500 text-white border-red-600' : 'bg-green-500 text-white border-green-600'
                            }`}>
                              {slotNumber}
                            </div>
                          </div>
                        )
                      })
                    )}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-5 py-3 bg-gray-50 border-t border-gray-200 flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                  <span className="text-gray-600">Available</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                  <span className="text-gray-600">Occupied</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
