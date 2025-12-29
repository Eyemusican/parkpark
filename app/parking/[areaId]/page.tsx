"use client"

import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, MapPin, AlertCircle, RefreshCw, Car, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useEffect, useState } from "react"
import { API_URL } from "@/lib/api-config"
import { ParkingMap } from "@/components/parking-map"

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
  const [loading, setLoading] = useState(true)
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

  const occupiedSlots = slots.filter(s => s.is_occupied)

  const handlePayment = (slot: SlotStatus) => {
    const duration = slot.duration_minutes || 0
    const fee = calculateParkingFee(duration)
    const params = new URLSearchParams({
      slot: `A${slot.slot_number}`,
      slotId: slot.slot_id.toString(),
      duration: formatDuration(duration),
      fee: fee.toString(),
      vehicle: slot.vehicle_id || 'Unknown',
      area: area?.name || 'Parking Area',
      areaId: areaId
    })
    router.push(`/payment?${params.toString()}`)
  }

  // Norzinlam coordinates
  const norzinlamLocation = {
    id: areaId,
    name: area?.name || 'Norzinlam',
    lat: 27.4728,
    lng: 89.6393,
    available: area?.available_slots || 0,
    total: area?.total_slots || 8,
    category: 'Ground'
  }

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
            <div className="w-full h-64 rounded-b-lg overflow-hidden">
              <ParkingMap
                locations={[norzinlamLocation]}
                center={[norzinlamLocation.lat, norzinlamLocation.lng]}
                zoom={16}
                selectedLocation={areaId}
              />
            </div>
            <div className="p-3 bg-gray-50 border-t">
              <p className="text-xs text-gray-600 text-center">
                📍 Norzinlam, Thimphu • 27.4728° N, 89.6393° E
              </p>
            </div>
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

        {occupiedSlots.length > 0 && (
          <Card className="bg-white shadow-sm">
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Slot Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {occupiedSlots.map((slot) => {
                  const duration = Math.max(0, slot.duration_minutes || 0) // Ensure non-negative
                  const fee = calculateParkingFee(duration)
                  
                  return (
                    <Card key={slot.slot_id} className="border-2 border-gray-200 shadow-sm">
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-red-500 rounded flex items-center justify-center text-white font-bold">
                              {slot.slot_number}
                            </div>
                            <div>
                              <h3 className="font-bold text-gray-900 text-lg mb-1">
                                Slot A{slot.slot_number}
                              </h3>
                              <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                                <div className="flex items-center gap-1">
                                  <Car className="w-4 h-4" />
                                  <span>{slot.vehicle_id || 'Unknown'}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <span>•</span>
                                  <span>Car</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <Badge className="bg-red-500 hover:bg-red-600 text-white">
                            OCCUPIED
                          </Badge>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                          <Clock className="w-4 h-4" />
                          <span>Entry: {formatTime(slot.arrival_time)}</span>
                          <span>•</span>
                          <span>Duration: {formatDuration(duration)}</span>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">Parking Fee:</span>
                            <span className="text-xl font-bold text-gray-900">
                              Nu. {fee}
                            </span>
                            <span className="text-xs text-gray-500">
                              ({Math.ceil(duration / 3)}m)
                            </span>
                          </div>
                          <Button 
                            onClick={() => handlePayment(slot)}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            💳 Pay Now
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
