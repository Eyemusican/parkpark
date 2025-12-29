"use client"

import { Card } from "@/components/ui/card"
import { Clock, Car, MapPin, DollarSign, Calendar, Filter, CheckCircle, XCircle, RefreshCw } from "lucide-react"
import { useState, useEffect } from "react"
import { API_URL } from "@/lib/api-config"

interface ParkingEvent {
  event_id: number
  slot_id: number
  slot_number: number
  parking_name: string
  parking_id: number
  arrival_time: string
  departure_time: string | null
  parked_time_minutes: number
  duration_minutes: number
  status: "occupied" | "departed"
  vehicle_id: string
  license_plate: string
}

interface ParkingRecord {
  id: string
  plateNumber: string
  vehicleType: string
  color: string
  entryPoint: string
  entryTime: string
  exitTime: string
  duration: string
  fee: number
  status: "completed" | "active"
  paymentStatus: "paid" | "unpaid" | "pending"
}

function calculateFee(minutes: number): number {
  const hours = Math.ceil(minutes / 60)
  return hours * 20
}

function formatDuration(minutes: number): string {
  // Handle negative or invalid values
  if (!minutes || minutes < 0) return "0m"
  
  if (minutes < 60) return `${Math.round(minutes)}m`
  const hours = Math.floor(minutes / 60)
  const mins = Math.round(minutes % 60)
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
}

export function ParkingHistory() {
  const [filter, setFilter] = useState<"all" | "today" | "week">("today")
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0])
  const [parkingHistory, setParkingHistory] = useState<ParkingRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const fetchParkingHistory = async () => {
    try {
      setRefreshing(true)
      const response = await fetch(`${API_URL}/api/parking-events?limit=200`, {
        cache: 'no-store'
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch parking history')
      }
      
      const events: ParkingEvent[] = await response.json()
      
      // Transform backend data to frontend format
      const transformedData: ParkingRecord[] = events.map((event) => {
        const isActive = event.status === 'occupied'
        const durationMinutes = Math.max(0, event.duration_minutes || 0) // Ensure non-negative
        const fee = isActive ? 0 : calculateFee(durationMinutes)
        
        return {
          id: event.event_id.toString(),
          plateNumber: event.license_plate || event.vehicle_id,
          vehicleType: "Car",
          color: "N/A",
          entryPoint: event.parking_name,
          entryTime: event.arrival_time,
          exitTime: event.departure_time || "",
          duration: formatDuration(durationMinutes),
          fee: fee,
          status: isActive ? "active" : "completed",
          paymentStatus: isActive ? "pending" : "paid"
        }
      })
      
      setParkingHistory(transformedData)
      setError(null)
    } catch (err) {
      console.error('Error fetching parking history:', err)
      setError(err instanceof Error ? err.message : 'Failed to load parking history')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchParkingHistory()
  }, [])

  // Filter records based on selected date
  const filteredHistory = parkingHistory.filter((record) => {
    const recordDate = new Date(record.entryTime).toISOString().split('T')[0]
    if (filter === "today") {
      const today = new Date().toISOString().split('T')[0]
      return recordDate === today
    } else if (filter === "all" && selectedDate) {
      return recordDate === selectedDate
    }
    return true
  })

  const getVehicleIcon = (type: string) => {
    return "🚗"
  }

  const formatTime = (timestamp: string) => {
    if (!timestamp) return "Currently Parked"
    const date = new Date(timestamp)
    return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
  }

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  }

  return (
    <div className="space-y-4">
      {loading && (
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
          <span className="ml-3 text-gray-600">Loading parking history...</span>
        </div>
      )}

      {error && (
        <Card className="bg-red-50 border-red-200 p-4">
          <p className="text-red-600 text-center">
            <XCircle className="w-5 h-5 inline mr-2" />
            {error}
          </p>
        </Card>
      )}

      {!loading && !error && (
        <>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
            Parking History
          </h2>
          <p className="text-sm text-gray-600 mt-1">Complete record of all parking sessions</p>
        </div>
            
            <button
              onClick={fetchParkingHistory}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>

          {/* Filter Buttons */}
          <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => {
                setFilter("today")
                setSelectedDate(new Date().toISOString().split('T')[0])
              }}
              className={`px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-all ${
                filter === "today"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setFilter("week")}
              className={`px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-all ${
                filter === "week"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              This Week
            </button>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Card className="bg-gray-50 border-gray-200 p-4">
            <p className="text-xs text-gray-600 mb-2">Total Sessions</p>
            <p className="text-2xl font-bold text-gray-900">{filteredHistory.length}</p>
            <p className="text-xs text-gray-600 mt-1">Selected period</p>
          </Card>

          <Card className="bg-gray-50 border-gray-200 p-4">
            <p className="text-xs text-gray-600 mb-2">Total Revenue</p>
            <p className="text-2xl font-bold text-gray-900">
              Nu. {filteredHistory.reduce((sum, record) => sum + record.fee, 0)}
            </p>
            <p className="text-xs text-gray-600 mt-1">Selected period</p>
          </Card>

          <Card className="bg-gray-50 border-gray-200 p-4">
            <p className="text-xs text-gray-600 mb-2">Paid</p>
            <p className="text-2xl font-bold text-gray-900">
              {filteredHistory.filter(r => r.paymentStatus === "paid").length}
            </p>
            <p className="text-xs text-gray-600 mt-1">Nu. {filteredHistory.filter(r => r.paymentStatus === "paid").reduce((sum, r) => sum + r.fee, 0)}</p>
          </Card>

          <Card className="bg-gray-50 border-gray-200 p-4">
            <p className="text-xs text-gray-600 mb-2">Active/Unpaid</p>
            <p className="text-2xl font-bold text-gray-900">
              {filteredHistory.filter(r => r.paymentStatus === "unpaid" || r.paymentStatus === "pending").length}
            </p>
            <p className="text-xs text-gray-600 mt-1">Nu. {filteredHistory.filter(r => r.paymentStatus === "unpaid").reduce((sum, r) => sum + r.fee, 0)}</p>
          </Card>
        </div>

        {/* History Table */}
        <Card className="bg-white border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Vehicle
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Vehicle ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Entry Point
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Entry Time
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Exit Time
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Fee
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Payment
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredHistory.map((record) => (
                  <tr
                    key={record.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{record.vehicleType}</p>
                        <p className="text-xs text-gray-500">Slot {record.id}</p>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm font-mono font-semibold text-gray-900">{record.plateNumber}</p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm text-gray-900">{record.entryPoint}</p>
                    </td>
                    <td className="px-4 py-4">
                      <div>
                        <p className="text-sm text-gray-900">{formatTime(record.entryTime)}</p>
                        <p className="text-xs text-gray-500">{formatDate(record.entryTime)}</p>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div>
                        <p className="text-sm text-gray-900">{formatTime(record.exitTime)}</p>
                        {record.exitTime && (
                          <p className="text-xs text-gray-500">{formatDate(record.exitTime)}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm font-medium text-gray-900">{record.duration}</p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm font-semibold text-green-600">
                        {record.fee > 0 ? `Nu. ${record.fee}` : "-"}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      {record.paymentStatus === "paid" ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Paid
                        </span>
                      ) : record.paymentStatus === "unpaid" ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Unpaid
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      {record.status === "active" ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          Completed
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredHistory.length === 0 && (
            <div className="text-center py-12">
              <Car className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No parking records found for selected period</p>
            </div>
          )}
        </Card>
        </>
      )}
    </div>
  )
}
