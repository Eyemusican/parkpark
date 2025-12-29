"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { MapPin, Navigation2, ArrowRight, Car, Clock, CheckCircle2, Shield, Map } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ParkingMap } from "@/components/parking-map"

interface ParkingArea {
  id: string
  name: string
  location: string
  coordinates: string
  slots: number
  occupied: number
  category: "outdoor" | "covered" | "underground"
  floor: string
}

export default function PublicParkingView() {
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [showMap, setShowMap] = useState(false)

  // Redirect authenticated users to admin dashboard
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push("/admin")
    }
  }, [isAuthenticated, isLoading, router])

  const areas: ParkingArea[] = [
    {
      id: "A1",
      name: "Main Entrance - North",
      location: "123 Main Street, North Wing",
      coordinates: "40.7128° N, 74.0060° W",
      slots: 24,
      occupied: 18,
      category: "outdoor",
      floor: "Ground",
    },
    {
      id: "A2",
      name: "Main Entrance - South",
      location: "123 Main Street, South Wing",
      coordinates: "40.7125° N, 74.0062° W",
      slots: 24,
      occupied: 12,
      category: "outdoor",
      floor: "Ground",
    },
    {
      id: "B1",
      name: "Building B - East Wing",
      location: "Building B, East Side",
      coordinates: "40.7130° N, 74.0058° W",
      slots: 32,
      occupied: 8,
      category: "covered",
      floor: "Level 1",
    },
    {
      id: "B2",
      name: "Building B - West Wing",
      location: "Building B, West Side",
      coordinates: "40.7132° N, 74.0065° W",
      slots: 32,
      occupied: 28,
      category: "covered",
      floor: "Level 1",
    },
    {
      id: "C1",
      name: "Underground Parking - Level 1",
      location: "Main Building Basement",
      coordinates: "40.7127° N, 74.0061° W",
      slots: 40,
      occupied: 15,
      category: "underground",
      floor: "B1",
    },
    {
      id: "C2",
      name: "Underground Parking - Level 2",
      location: "Main Building Basement",
      coordinates: "40.7127° N, 74.0061° W",
      slots: 40,
      occupied: 35,
      category: "underground",
      floor: "B2",
    },
  ]

  const filteredAreas = areas.filter((area) => {
    const matchesSearch =
      area.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      area.location.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || area.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const getOccupancyColor = (percentage: number) => {
    if (percentage < 50) return "text-green-500"
    if (percentage < 80) return "text-yellow-500"
    return "text-red-500"
  }

  const getAvailabilityBadge = (available: number) => {
    if (available > 10) return <Badge className="bg-green-500/20 text-green-400 border-green-500/50">High Availability</Badge>
    if (available > 5) return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/50">Moderate</Badge>
    if (available > 0) return <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/50">Limited</Badge>
    return <Badge className="bg-red-500/20 text-red-400 border-red-500/50">Full</Badge>
  }

  const totalSlots = areas.reduce((sum, area) => sum + area.slots, 0)
  const totalOccupied = areas.reduce((sum, area) => sum + area.occupied, 0)
  const totalAvailable = totalSlots - totalOccupied

  // Convert coordinates to lat/lng for map
  const parseCoordinates = (coords: string) => {
    const parts = coords.split(',')
    const lat = parseFloat(parts[0].replace('°', '').replace('N', '').replace('S', '').trim())
    const lng = parseFloat(parts[1].replace('°', '').replace('W', '').replace('E', '').trim())
    return { lat: lat, lng: lng * (coords.includes('W') ? -1 : 1) }
  }

  const mapLocations = filteredAreas.map((area) => {
    const coords = parseCoordinates(area.coordinates)
    return {
      id: area.id,
      name: area.name,
      lat: coords.lat,
      lng: coords.lng,
      available: area.slots - area.occupied,
      total: area.slots,
      category: area.category,
    }
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-100/50 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        {/* Header */}
        <header className="relative z-10 border-b border-gray-200 bg-white/90 backdrop-blur-xl shadow-sm">
          <div className="container mx-auto px-4 py-3 sm:py-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <Car className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg sm:text-2xl font-bold text-gray-900">Smart Parking</h1>
                <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">Find Your Perfect Spot</p>
              </div>
            </div>
            <Button
              onClick={() => router.push("/login")}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm px-3 sm:px-4"
            >
              <Shield className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Admin </span>Login
            </Button>
          </div>
        </header>

        {/* Stats Section */}
        <div className="relative z-10 container mx-auto px-4 py-8 sm:py-10">
          <div className="text-center mb-8">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
              Find Your Parking Spot
            </h2>
            <p className="text-base text-gray-600 max-w-2xl mx-auto">
              Real-time availability at your fingertips
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 max-w-4xl mx-auto">
            <Card className="bg-white border-none shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="pt-6 pb-6 text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                </div>
                <p className="text-xs font-medium text-gray-600 mb-1">Available Spaces</p>
                <p className="text-3xl font-bold text-gray-900">{totalAvailable}</p>
              </CardContent>
            </Card>

            <Card className="bg-white border-none shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="pt-6 pb-6 text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Car className="w-6 h-6 text-blue-600" />
                </div>
                <p className="text-xs font-medium text-gray-600 mb-1">Total Capacity</p>
                <p className="text-3xl font-bold text-gray-900">{totalSlots}</p>
              </CardContent>
            </Card>

            <Card className="bg-white border-none shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="pt-6 pb-6 text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Clock className="w-6 h-6 text-blue-600" />
                </div>
                <p className="text-xs font-medium text-gray-600 mb-1">Occupancy Rate</p>
                <p className="text-3xl font-bold text-gray-900">
                  {Math.round((totalOccupied / totalSlots) * 100)}%
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="max-w-4xl mx-auto mb-8">
            <Input
              type="text"
              placeholder="Search parking areas by name or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 h-11 text-sm rounded-lg shadow-sm mb-3"
            />
            <div className="flex flex-wrap gap-2 justify-center">
              <Button
                variant={selectedCategory === "all" ? "default" : "outline"}
                onClick={() => setSelectedCategory("all")}
                className={`px-4 py-1.5 text-sm rounded-full ${selectedCategory === "all" ? "bg-blue-600 hover:bg-blue-700 text-white" : "border-gray-300 text-gray-700 hover:bg-gray-50 bg-white"}`}
              >
                All Areas
              </Button>
              <Button
                variant={selectedCategory === "outdoor" ? "default" : "outline"}
                onClick={() => setSelectedCategory("outdoor")}
                className={`px-4 py-1.5 text-sm rounded-full ${selectedCategory === "outdoor" ? "bg-blue-600 hover:bg-blue-700 text-white" : "border-gray-300 text-gray-700 hover:bg-gray-50 bg-white"}`}
              >
                Outdoor
              </Button>
              <Button
                variant={selectedCategory === "covered" ? "default" : "outline"}
                onClick={() => setSelectedCategory("covered")}
                className={`px-4 py-1.5 text-sm rounded-full ${selectedCategory === "covered" ? "bg-blue-600 hover:bg-blue-700 text-white" : "border-gray-300 text-gray-700 hover:bg-gray-50 bg-white"}`}
              >
                Covered
              </Button>
              <Button
                variant={selectedCategory === "underground" ? "default" : "outline"}
                onClick={() => setSelectedCategory("underground")}
                className={`px-4 py-1.5 text-sm rounded-full ${selectedCategory === "underground" ? "bg-blue-600 hover:bg-blue-700 text-white" : "border-gray-300 text-gray-700 hover:bg-gray-50 bg-white"}`}
              >
                Underground
              </Button>
              <Button
                variant={showMap ? "default" : "outline"}
                onClick={() => setShowMap(!showMap)}
                className={`px-4 py-1.5 text-sm rounded-full ${showMap ? "bg-blue-600 hover:bg-blue-700 text-white" : "border-gray-300 text-gray-700 hover:bg-gray-50 bg-white"}`}
              >
                <Map className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                {showMap ? "Hide Map" : "Show Map"}
              </Button>
            </div>
          </div>

          {/* Map View */}
          {showMap && (
            <Card className="mb-8 max-w-4xl mx-auto bg-white border-none shadow-md overflow-hidden">
              <CardHeader className="pb-4">
                <CardTitle className="text-gray-900 flex items-center gap-2 text-lg font-semibold">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-blue-600" />
                  </div>
                  Parking Areas Map
                </CardTitle>
                <CardDescription className="text-gray-600 text-sm ml-10">
                  Click on markers to view parking area details
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[250px] sm:h-[350px] rounded-lg overflow-hidden">
                  <ParkingMap
                    locations={mapLocations}
                    onMarkerClick={(id) => router.push(`/parking/${id}`)}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Parking Areas Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto">
            {filteredAreas.map((area) => {
              const available = area.slots - area.occupied
              const occupancyPercentage = (area.occupied / area.slots) * 100

              return (
                <Card
                  key={area.id}
                  className="bg-white border-none shadow-md hover:shadow-lg transition-all cursor-pointer"
                  onClick={() => router.push(`/parking/${area.id}`)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-blue-600" />
                      </div>
                      {getAvailabilityBadge(available)}
                    </div>
                    <CardTitle className="text-gray-900 text-lg mb-1">{area.name}</CardTitle>
                    <CardDescription className="text-gray-600 text-xs">{area.location}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <p className="text-2xl font-bold text-green-600 mb-0.5">{available}</p>
                        <p className="text-xs font-medium text-gray-600">Available</p>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-2xl font-bold text-gray-900 mb-0.5">{area.slots}</p>
                        <p className="text-xs font-medium text-gray-600">Total Spaces</p>
                      </div>
                    </div>

                    <div className="pt-1">
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-xs font-medium text-gray-700">Occupancy</span>
                        <span className="text-xs font-bold text-gray-900">
                          {Math.round(occupancyPercentage)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500"
                          style={{ width: `${occupancyPercentage}%` }}
                        />
                      </div>
                    </div>

                    {/* Parking Slot Map */}
                    <div className="bg-gray-50 rounded-lg p-2 sm:p-3 border border-gray-200">
                      <div className="flex items-center justify-between mb-2 sm:mb-3">
                        <span className="text-xs font-semibold text-gray-900">Parking Map</span>
                        <div className="flex items-center gap-2 sm:gap-3 text-xs">
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 rounded-sm bg-green-500"></div>
                            <span className="text-gray-600 text-[10px] sm:text-xs">Free</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 rounded-sm bg-red-500"></div>
                            <span className="text-gray-600 text-[10px] sm:text-xs">Occupied</span>
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-6 gap-1.5 sm:gap-2">
                        {Array.from({ length: 12 }).map((_, i) => {
                          const slotNumber = i + 1
                          const isOccupied = i < Math.round((area.occupied / area.slots) * 12)
                          return (
                            <div
                              key={`${area.id}-slot-${i}`}
                              className={`relative aspect-[3/4] rounded-lg border-2 flex items-center justify-center text-xs font-bold transition-all cursor-pointer hover:scale-110 ${
                                isOccupied 
                                  ? 'bg-red-500/20 border-red-500/50 text-red-400 hover:bg-red-500/30' 
                                  : 'bg-green-500/20 border-green-500/50 text-green-400 hover:bg-green-500/30'
                              }`}
                              title={`Slot ${area.id}-${slotNumber}: ${isOccupied ? "Occupied" : "Available"}`}
                            >
                              <div className="absolute top-0.5 left-0.5 text-[8px] opacity-60">{area.id}</div>
                              <span>{slotNumber}</span>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <span className="text-sm text-gray-600">{area.floor}</span>
                      <Button
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4"
                        onClick={(e) => {
                          e.stopPropagation()
                          router.push(`/parking/${area.id}`)
                        }}
                      >
                        View Details
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {filteredAreas.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">No parking areas found matching your criteria.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}