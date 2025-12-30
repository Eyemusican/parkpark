"use client"

import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, MapPin, AlertCircle, RefreshCw, Car, Clock, History, Image as ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useEffect, useState } from "react"
import { API_URL } from "@/lib/api-config"
import { AreaLocationMap } from "@/components/area-location-map"

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

interface ParkingEvent {
  event_id: number
  slot_id: number
  slot_number: number
  arrival_time: string | null
  departure_time: string | null
  fee_amount: number | null
  entry_photo_url: string | null
  exit_photo_url: string | null
  vehicle_id: string | null
  duration_minutes: number
  status: 'active' | 'completed'
  hourly_rate: number
  currency: string
  parking_name: string
}

function formatDuration(minutes: number): string {
  // Handle negative or invalid values
  if (!minutes || minutes < 0) return "0m"
  
  if (minutes < 60) return `${Math.round(minutes)}m`
  const hours = Math.floor(minutes / 60)
  const mins = Math.round(minutes % 60)
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
}

function calculateParkingFee(minutes: number): number {
  // Handle negative or invalid values
  const validMinutes = Math.max(0, minutes || 0)
  const hours = Math.ceil(validMinutes / 60)
  return hours * 20
}

function formatTime(timeString?: string): string {
  if (!timeString) return "N/A"
  try {
    const date = new Date(timeString)
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
  } catch {
    return "N/A"
  }
}

export default function ParkingAreaDetailPage() {
  const params = useParams()
  const router = useRouter()
  const areaId = params.areaId as string
  
  const [area, setArea] = useState<ParkingArea | null>(null)
  const [slots, setSlots] = useState<SlotStatus[]>([])
  const [history, setHistory] = useState<ParkingEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [historyLoading, setHistoryLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const areaResponse = await fetch(`${API_URL}/api/parking-areas/${areaId}`, {
          cache: 'no-store'
        })
        
        if (!areaResponse.ok) {
          throw new Error('Parking area not found')
        }
        
        const areaData: ParkingArea = await areaResponse.json()
        setArea(areaData)
        
        const slotsResponse = await fetch(`${API_URL}/api/parking-areas/${areaId}/slots`, {
          cache: 'no-store'
        })
        
        if (slotsResponse.ok) {
          const slotsData: SlotStatus[] = await slotsResponse.json()
          setSlots(slotsData)
        }

        // Fetch parking history for this area
        const historyResponse = await fetch(`${API_URL}/api/parking-areas/${areaId}/events?limit=20`, {
          cache: 'no-store'
        })

        if (historyResponse.ok) {
          const historyData: ParkingEvent[] = await historyResponse.json()
          setHistory(historyData)
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
    const interval = setInterval(fetchData, 3000)

    return () => clearInterval(interval)
  }, [areaId])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="bg-white shadow-lg">
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="bg-white shadow-lg">
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

  // Separate active and completed sessions from history
  const activeSessions = history.filter(e => e.status === 'active')
  const completedSessions = history.filter(e => e.status === 'completed')

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-50 border-b bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <Button
            onClick={() => router.back()}
            variant="ghost"
            className="text-gray-700 hover:text-blue-600 hover:bg-blue-50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <Card className="bg-white shadow-sm mb-6">
          <CardContent className="p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                P
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900 mb-1">{area.name}</h1>
                <div className="flex items-center gap-2 text-gray-600 text-sm mb-2">
                  <MapPin className="w-4 h-4" />
                  <span>Clock Tower Square, Thimphu</span>
                </div>
                <Badge variant="outline" className="border-gray-300 text-gray-700">
                  Ground
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white border-2 border-gray-200 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-gray-900">{area.total_slots}</div>
                <div className="text-sm text-gray-600 mt-1">Total Slots</div>
              </div>
              <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-green-600">{area.available_slots}</div>
                <div className="text-sm text-gray-600 mt-1">Available</div>
              </div>
              <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-red-600">{area.occupied_slots}</div>
                <div className="text-sm text-gray-600 mt-1">Occupied</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm mb-6">
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Location Map
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <AreaLocationMap areaId={areaId} />
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm mb-6">
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-2">
              <Car className="w-5 h-5" />
              Parking Map
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 border-2 border-green-600 rounded" />
                <span className="text-gray-700">Free</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-500 border-2 border-red-600 rounded" />
                <span className="text-gray-700">Occupied</span>
              </div>
            </div>

            {slots.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <AlertCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No slot data available</p>
              </div>
            ) : (
              <div className="grid grid-cols-8 sm:grid-cols-8 md:grid-cols-12 gap-2">
                {slots.map((slot) => {
                  const isOccupied = slot.is_occupied === true
                  return (
                    <div
                      key={slot.slot_id}
                      className={`aspect-square rounded border-2 flex items-center justify-center font-bold text-sm cursor-pointer transition-all hover:scale-105 ${
                        isOccupied
                          ? 'bg-red-100 text-red-600 border-red-400'
                          : 'bg-green-100 text-green-600 border-green-400'
                      }`}
                      title={
                        isOccupied
                          ? `Slot ${slot.slot_number} - Occupied ${slot.vehicle_id ? `(${slot.vehicle_id})` : ''}`
                          : `Slot ${slot.slot_number} - Available`
                      }
                    >
                      {slot.slot_number}
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Unified Parking Sessions Section */}
        <Card className="bg-white shadow-sm">
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-2">
              <Car className="w-5 h-5" />
              Parking Sessions
              {activeSessions.length > 0 && (
                <Badge className="bg-blue-500 ml-2">{activeSessions.length} Active</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {history.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Car className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No parking sessions yet</p>
                <p className="text-sm mt-1">Sessions will appear here when vehicles enter and exit</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Active Sessions */}
                {activeSessions.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                      Currently Parked
                    </h3>
                    <div className="space-y-3">
                      {activeSessions.map((event) => (
                        <div
                          key={event.event_id}
                          className="flex items-center justify-between p-4 rounded-lg border-2 bg-green-50 border-green-200"
                        >
                          <div className="flex items-center gap-4">
                            {/* Screenshot thumbnail */}
                            {event.entry_photo_url ? (
                              <div className="w-16 h-16 rounded-lg overflow-hidden border-2 border-green-300 bg-white">
                                <img
                                  src={`${API_URL}${event.entry_photo_url}`}
                                  alt={`Slot ${event.slot_number} entry`}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = 'none'
                                  }}
                                />
                              </div>
                            ) : (
                              <div className="w-16 h-16 rounded-lg border-2 border-green-300 bg-white flex items-center justify-center">
                                <Car className="w-6 h-6 text-green-400" />
                              </div>
                            )}

                            {/* Session details */}
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-bold text-gray-900 text-lg">Slot {event.slot_number}</span>
                                <Badge className="bg-green-500">Parked</Badge>
                              </div>
                              <div className="text-sm text-gray-600">
                                <Clock className="w-3 h-3 inline mr-1" />
                                Entry: {formatTime(event.arrival_time || undefined)}
                              </div>
                              <div className="text-sm font-medium text-green-700">
                                Duration: {formatDuration(event.duration_minutes)}
                                {event.vehicle_id && <span className="text-gray-500"> • ID: {event.vehicle_id}</span>}
                              </div>
                            </div>
                          </div>

                          {/* Fee display */}
                          <div className="text-right">
                            <div className="text-2xl font-bold text-gray-900">
                              {event.currency} {calculateParkingFee(event.duration_minutes)}
                            </div>
                            <span className="text-xs text-gray-500">current fee</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Completed Sessions */}
                {completedSessions.length > 0 && (
                  <div className={activeSessions.length > 0 ? 'mt-6 pt-6 border-t' : ''}>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                      Recent History
                    </h3>
                    <div className="space-y-2">
                      {completedSessions.map((event) => (
                        <div
                          key={event.event_id}
                          className="flex items-center justify-between p-3 rounded-lg border bg-gray-50 border-gray-200"
                        >
                          <div className="flex items-center gap-3">
                            {/* Small thumbnail */}
                            {event.entry_photo_url ? (
                              <div className="w-10 h-10 rounded overflow-hidden border border-gray-300 bg-white">
                                <img
                                  src={`${API_URL}${event.entry_photo_url}`}
                                  alt={`Slot ${event.slot_number}`}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = 'none'
                                  }}
                                />
                              </div>
                            ) : (
                              <div className="w-10 h-10 rounded border border-gray-300 bg-white flex items-center justify-center">
                                <ImageIcon className="w-4 h-4 text-gray-400" />
                              </div>
                            )}

                            {/* Session details */}
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-gray-900">Slot {event.slot_number}</span>
                                <span className="text-xs text-gray-500">
                                  {formatTime(event.arrival_time || undefined)} - {formatTime(event.departure_time || undefined)}
                                </span>
                              </div>
                              <div className="text-xs text-gray-500">
                                {formatDuration(event.duration_minutes)}
                                {event.vehicle_id && <span> • {event.vehicle_id}</span>}
                              </div>
                            </div>
                          </div>

                          {/* Fee */}
                          <div className="text-right">
                            <span className="font-semibold text-gray-700">
                              {event.currency} {event.fee_amount?.toFixed(0) || '0'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
