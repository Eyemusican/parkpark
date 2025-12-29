"use client"

import { Card } from "@/components/ui/card"
import { AlertTriangle, Clock, MapPin, XCircle, Ban, Timer, ShieldAlert, Car, RefreshCw } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import { API_ENDPOINTS } from "@/lib/api-config"

interface Violation {
  slot: string
  slot_number?: string
  type: string
  violation_type?: string
  time: string
  detected_at?: string
  severity: "High" | "Medium" | "Low"
  license: string
  license_plate?: string
  description: string
  duration_minutes?: number
  vehicle_id?: string | number
}

interface AreaViolations {
  id: string
  name: string
  location: string
  violations: Violation[]
  totalViolations: number
}

interface ViolationSummary {
  total_violations: number
  high_severity: number
  medium_severity: number
  low_severity: number
  areas_affected: number
  affected_area_names: string[]
}

interface APIViolation {
  violation_id: string
  slot_id: number
  slot_number: string
  parking_name: string
  parking_id: number
  vehicle_id: string
  license_plate: string
  violation_type: string
  severity: "High" | "Medium" | "Low"
  description: string
  duration_minutes: number | null
  detected_at: string
  status: string
}

export function ViolationsPanel() {
  const [violations, setViolations] = useState<APIViolation[]>([])
  const [summary, setSummary] = useState<ViolationSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [isInitialLoad, setIsInitialLoad] = useState(true)

  // Fetch violations from API
  useEffect(() => {
    const fetchViolations = async (showLoading = false) => {
      if (showLoading) setLoading(true)
      
      try {
        const [violationsRes, summaryRes] = await Promise.all([
          fetch(API_ENDPOINTS.violations, { cache: 'no-store' }),
          fetch(API_ENDPOINTS.violationsSummary, { cache: 'no-store' })
        ])

        if (!violationsRes.ok || !summaryRes.ok) {
          throw new Error('Failed to fetch violations')
        }

        const violationsData = await violationsRes.json()
        const summaryData = await summaryRes.json()

        setViolations(violationsData)
        setSummary(summaryData)
        console.log('✓ Violations fetched:', violationsData.length, 'violations')
      } catch (err) {
        console.error('Error fetching violations:', err)
        // Set empty data on error
        setViolations([])
        setSummary({
          total_violations: 0,
          high_severity: 0,
          medium_severity: 0,
          low_severity: 0,
          areas_affected: 0,
          affected_area_names: []
        })
      } finally {
        setLoading(false)
        setIsInitialLoad(false)
      }
    }

    // Initial fetch with loading state
    fetchViolations(true)

    // Refetch when component becomes visible again (no loading state)
    const handleVisibilityChange = () => {
      if (!document.hidden && !isInitialLoad) {
        console.log('👁️ Violations visible - refetching data')
        fetchViolations(false)
      }
    }

    const handleFocus = () => {
      if (!isInitialLoad) {
        console.log('🔍 Window focused - refetching violations')
        fetchViolations(false)
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
      const [violationsRes, summaryRes] = await Promise.all([
        fetch(API_ENDPOINTS.violations, { cache: 'no-store' }),
        fetch(API_ENDPOINTS.violationsSummary, { cache: 'no-store' })
      ])

      if (!violationsRes.ok || !summaryRes.ok) {
        throw new Error('Failed to fetch violations')
      }

      const violationsData = await violationsRes.json()
      const summaryData = await summaryRes.json()

      setViolations(violationsData)
      setSummary(summaryData)
      console.log('✓ Violations refreshed:', violationsData.length, 'violations')
    } catch (err) {
      console.error('Error refreshing violations:', err)
      setViolations([])
      setSummary({
        total_violations: 0,
        high_severity: 0,
        medium_severity: 0,
        low_severity: 0,
        areas_affected: 0,
        affected_area_names: []
      })
    } finally {
      setRefreshing(false)
    }
  }

  // Group violations by parking area
  const groupedViolations = violations.reduce((acc, violation) => {
    const areaName = violation.parking_name || 'Unknown Area'
    if (!acc[areaName]) {
      acc[areaName] = []
    }
    acc[areaName].push(violation)
    return acc
  }, {} as Record<string, APIViolation[]>)

  // Convert to AreaViolations format
  const parkingAreas: AreaViolations[] = Object.entries(groupedViolations).map(([areaName, areaViolations]) => {
    const area = areaViolations[0]
    return {
      id: area.parking_id?.toString() || 'A1',
      name: areaName,
      location: `Parking Area ${area.parking_id || ''}`,
      totalViolations: areaViolations.length,
      violations: areaViolations.map(v => ({
        slot: `${areaName.split(' ')[0]}-${String(v.slot_number).padStart(3, '0')}`,
        type: v.violation_type,
        time: formatTimeAgo(v.detected_at),
        severity: v.severity,
        license: v.license_plate,
        description: v.description,
        duration_minutes: v.duration_minutes || undefined,
        vehicle_id: v.vehicle_id
      }))
    }
  })

  // Use only actual parking areas from violations
  const finalAreas = parkingAreas.filter(area => area.totalViolations > 0)

  // Format time ago helper function
  function formatTimeAgo(dateString: string): string {
    const now = new Date()
    const past = new Date(dateString)
    const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000)

    if (diffInSeconds < 60) return `${diffInSeconds}s ago`
    const diffInMinutes = Math.floor(diffInSeconds / 60)
    if (diffInMinutes < 60) return `${diffInMinutes} min ago`
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours}h ago`
    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays}d ago`
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "High":
        return "bg-red-100 text-red-700 border-red-300"
      case "Medium":
        return "bg-yellow-100 text-yellow-700 border-yellow-300"
      case "Low":
        return "bg-blue-100 text-blue-700 border-blue-300"
      default:
        return "bg-gray-100 text-gray-700 border-gray-300"
    }
  }

  const getViolationIcon = (type: string) => {
    switch (type) {
      case "Double Parking":
        return <Car className="w-4 h-4" />
      case "No Valid Permit":
        return <ShieldAlert className="w-4 h-4" />
      case "Expired Duration":
        return <Timer className="w-4 h-4" />
      case "Outside Boundary":
        return <Ban className="w-4 h-4" />
      default:
        return <AlertTriangle className="w-4 h-4" />
    }
  }

  const totalViolations = summary?.total_violations || 0
  const highSeverity = summary?.high_severity || 0
  const mediumSeverity = summary?.medium_severity || 0
  const areasWithViolations = summary?.areas_affected || 0

  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-2">Violations & Alerts by Area</h1>
          <p className="text-sm text-muted-foreground">
            Real-time monitoring of parking violations • Last updated: {new Date().toLocaleTimeString()}
          </p>
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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="bg-gradient-to-br from-red-50 to-white border-border p-3 sm:p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4 text-red-600" />
            <p className="text-xs text-muted-foreground">Active Violations</p>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-red-600">{totalViolations}</p>
        </Card>
        <Card className="bg-gradient-to-br from-orange-50 to-white border-border p-3 sm:p-4">
          <div className="flex items-center gap-2 mb-2">
            <XCircle className="w-3 h-3 sm:w-4 sm:h-4 text-orange-600" />
            <p className="text-xs text-muted-foreground">High Severity</p>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-orange-600">{highSeverity}</p>
        </Card>
        <Card className="bg-gradient-to-br from-yellow-50 to-white border-border p-3 sm:p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-600" />
            <p className="text-xs text-muted-foreground">Medium Severity</p>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-yellow-600">{mediumSeverity}</p>
        </Card>
        <Card className="bg-gradient-to-br from-blue-50 to-white border-border p-3 sm:p-4">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
            <p className="text-xs text-muted-foreground">Areas Affected</p>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-blue-600">{areasWithViolations}</p>
        </Card>
      </div>

      {/* All Clear Message or Violations by Area */}
      {totalViolations === 0 ? (
        <Card className="border-border overflow-hidden bg-white">
          <div className="p-8 sm:p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-green-100 mb-4">
              <span className="text-3xl sm:text-4xl">✓</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-2">All Clear!</h3>
            <p className="text-muted-foreground">No active violations detected across all parking areas</p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {finalAreas.map((area) => (
            <Card
            key={area.id}
            className={`border-border overflow-hidden transition-all ${
              area.violations.length > 0
                ? "bg-white hover:shadow-lg border-l-4 border-l-red-500"
                : "bg-gray-50 opacity-75"
            }`}
          >
            <div
              className={`p-4 sm:p-5 border-b border-border ${
                area.violations.length > 0
                  ? "bg-gradient-to-r from-red-50 to-transparent"
                  : "bg-gradient-to-r from-gray-100 to-transparent"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                    <h3 className="text-base sm:text-lg font-bold text-foreground">{area.name}</h3>
                    <Badge variant="outline" className="text-xs">
                      Area {area.id}
                    </Badge>
                    {area.violations.length > 0 ? (
                      <Badge className="bg-red-100 text-red-700 border-red-200 text-xs font-semibold gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        {area.violations.length} Active Violation{area.violations.length > 1 ? "s" : ""}
                      </Badge>
                    ) : (
                      <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">✓ No Violations</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{area.location}</span>
                  </div>
                </div>
              </div>
            </div>

            {area.violations.length > 0 ? (
              <div className="divide-y divide-border">
                {area.violations.map((violation, index) => (
                  <div
                    key={`${area.id}-${violation.slot}-${violation.vehicle_id || index}-${index}`}
                    className="p-4 sm:p-5 hover:bg-red-50/50 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-3 gap-3">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="p-2 bg-red-100 rounded-lg text-red-600 mt-1">
                          {getViolationIcon(violation.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <h4 className="font-bold text-foreground">{violation.type}</h4>
                            <Badge className={`border font-medium ${getSeverityColor(violation.severity)}`}>
                              {violation.severity}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{violation.description}</p>
                          
                          {/* Car Details Section */}
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                            <h5 className="text-xs font-semibold text-blue-900 mb-2 flex items-center gap-1">
                              <Car className="w-3.5 h-3.5" />
                              Vehicle Details
                            </h5>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                              <div>
                                <span className="text-muted-foreground">Vehicle ID:</span>
                                <p className="font-mono font-bold text-blue-700">{violation.vehicle_id || 'N/A'}</p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">License Plate:</span>
                                <p className="font-mono font-bold text-blue-700">{violation.license}</p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Parking Slot:</span>
                                <p className="font-mono font-bold text-blue-700">{violation.slot}</p>
                              </div>
                              {violation.duration_minutes && (
                                <div className="col-span-2 sm:col-span-3">
                                  <span className="text-muted-foreground">Duration:</span>
                                  <p className="font-bold text-orange-600">
                                    {Math.floor(violation.duration_minutes)} min 
                                    {violation.duration_minutes >= 60 && ` (${(violation.duration_minutes / 60).toFixed(1)} hrs)`}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5" />
                              <span>Detected: {violation.time}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-muted-foreground">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 mb-3">
                  <span className="text-2xl">✓</span>
                </div>
                <p className="text-sm">No violations in this area</p>
              </div>
            )}
          </Card>
        ))}
      </div>
      )}
    </div>
  )
}
