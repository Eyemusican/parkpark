"use client"

import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, MapPin, AlertCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { useEffect, useState } from "react"
import { API_URL } from "@/lib/api-config"

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
  duration_minutes?: number
}

export default function ParkingAreaDetailPage() {
  const params = useParams()
  const router = useRouter()
  const areaId = params.areaId as string
  
  const [area, setArea] = useState<ParkingArea | null>(null)
  const [slots, setSlots] = useState<SlotStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch area details
        const areaResponse = await fetch(`${API_URL}/api/parking-areas/${areaId}`, {
          cache: 'no-store'
        })
        
        if (!areaResponse.ok) {
          throw new Error('Parking area not found')
        }
        
        const areaData: ParkingArea = await areaResponse.json()
        setArea(areaData)
        
        // Fetch slot statuses
        const slotsResponse = await fetch(`${API_URL}/api/parking-areas/${areaId}/slots`, {
          cache: 'no-store'
        })
        
        if (slotsResponse.ok) {
          const slotsData: SlotStatus[] = await slotsResponse.json()
          setSlots(slotsData)
        }
        
        setError(null)
      } catch (err) {
        console.error('Error fetching parking data:', err)
        setError(err instanceof Error ? err.message : 'Failed to load parking area')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
    const interval = setInterval(fetchData, 3000) // Refresh every 3 seconds

    return () => clearInterval(interval)
  }, [areaId])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <Card className="bg-white border-none shadow-lg">
          <CardContent className="p-8 flex flex-col items-center">
            <RefreshCw className="w-12 h-12 text-blue-600 animate-spin mb-4" />
            <p className="text-gray-600">Loading parking area...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !area) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <Card className="bg-white border-none shadow-lg">
          <CardContent className="p-6 text-center">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
            <p className="text-gray-900 font-semibold mb-2">Parking area not found</p>
            <p className="text-sm text-gray-600 mb-4">{error || 'The requested parking area does not exist'}</p>
            <Button onClick={() => router.back()} className="w-full bg-blue-600 hover:bg-blue-700">
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const occupancyRate = Math.round(area.occupancy_rate)
  const getOccupancyColor = () => {
    if (occupancyRate >= 80) return 'text-red-600 bg-red-50 border-red-200'
    if (occupancyRate >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    return 'text-green-600 bg-green-50 border-green-200'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/90 backdrop-blur-xl shadow-sm">
        <div className="container mx-auto px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <Button
              onClick={() => router.back()}
              variant="ghost"
              className="text-gray-700 hover:text-blue-600 hover:bg-blue-50"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="border-blue-500 text-blue-600 bg-blue-50">
                Zone {area.id}
              </Badge>
              <Badge className={`${getOccupancyColor()} border font-semibold`}>
                {occupancyRate}% Full
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 sm:py-8 max-w-7xl">
        {/* Area Info Card */}
        <Card className="bg-white border-none shadow-lg mb-6">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{area.name}</h1>
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">Zone {area.id}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-xs text-gray-600">Live</span>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-gray-900">{area.total_slots}</div>
                <div className="text-sm text-gray-600 mt-1">Total</div>
              </div>
              <div className="bg-red-50 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-red-600">{area.occupied_slots}</div>
                <div className="text-sm text-gray-600 mt-1">Occupied</div>
              </div>
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-green-600">{area.available_slots}</div>
                <div className="text-sm text-gray-600 mt-1">Free</div>
              </div>
            </div>

            {/* Occupancy Bar */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Occupancy</span>
                <span className="text-sm font-bold text-gray-900">{occupancyRate}%</span>
              </div>
              <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-1000 ${
                    occupancyRate >= 80 ? 'bg-red-500' : occupancyRate >= 60 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${occupancyRate}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Parking Slots Grid */}
        <Card className="bg-white border-none shadow-lg">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Parking Slots</h2>
            
            {slots.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <AlertCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No slot data available</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3 mb-4">
                  {slots.map((slot) => {
                    const isOccupied = slot.is_occupied === true
                    return (
                      <div
                        key={slot.slot_id}
                        className={`aspect-square rounded-lg flex flex-col items-center justify-center font-bold text-sm cursor-pointer transition-all hover:scale-105 shadow-md ${
                          isOccupied
                            ? 'bg-red-500 text-white border-2 border-red-600'
                            : 'bg-green-500 text-white border-2 border-green-600'
                        }`}
                        title={
                          isOccupied
                            ? `Slot ${slot.slot_number} - Occupied ${slot.vehicle_id ? `(${slot.vehicle_id})` : ''} - ${slot.duration_minutes || 0} min`
                            : `Slot ${slot.slot_number} - Available`
                        }
                      >
                        <div className="text-lg">{slot.slot_number}</div>
                        {isOccupied && slot.duration_minutes && (
                          <div className="text-xs opacity-90">{slot.duration_minutes}m</div>
                        )}
                      </div>
                    )
                  })}
                </div>

                {/* Legend */}
                <div className="flex items-center justify-center gap-6 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-green-500 border-2 border-green-600" />
                    <span>Available</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-red-500 border-2 border-red-600" />
                    <span>Occupied</span>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Occupied Slots Details */}
        {slots.filter(s => s.is_occupied).length > 0 && (
          <Card className="bg-white border-none shadow-lg mt-6">
            <CardContent className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Active Parking Sessions</h2>
              <div className="space-y-3">
                {slots.filter(s => s.is_occupied).map((slot) => (
                  <div
                    key={slot.slot_id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-red-500 flex items-center justify-center text-white font-bold">
                        {slot.slot_number}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">
                          {slot.vehicle_id || `Vehicle at Slot ${slot.slot_number}`}
                        </div>
                        <div className="text-sm text-gray-600">
                          Duration: {slot.duration_minutes || 0} minutes
                        </div>
                      </div>
                    </div>
                    <Badge className="bg-red-100 text-red-700 border-red-200">Occupied</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
