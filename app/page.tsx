// "use client"

// import { useState, useEffect } from "react"
// import { useRouter } from "next/navigation"
// import { useAuth } from "@/contexts/auth-context"
// import { MapPin, Navigation2, ArrowRight, Car, Clock, CheckCircle2, Shield, Map } from "lucide-react"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { Badge } from "@/components/ui/badge"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { ParkingMap } from "@/components/parking-map"

// interface ParkingArea {
//   id: string
//   name: string
//   location: string
//   coordinates: string
//   slots: number
//   occupied: number
//   category: "outdoor" | "covered" | "underground"
//   floor: string
// }

// export default function PublicParkingView() {
//   const router = useRouter()
//   const { isAuthenticated, isLoading } = useAuth()
//   const [searchTerm, setSearchTerm] = useState("")
//   const [selectedCategory, setSelectedCategory] = useState<string>("all")
//   const [showMap, setShowMap] = useState(false)

//   // Redirect authenticated users to admin dashboard
//   useEffect(() => {
//     if (!isLoading && isAuthenticated) {
//       router.push("/admin")
//     }
//   }, [isAuthenticated, isLoading, router])

//   const areas: ParkingArea[] = [
//     {
//       id: "A1",
//       name: "Main Entrance - North",
//       location: "123 Main Street, North Wing",
//       coordinates: "40.7128° N, 74.0060° W",
//       slots: 24,
//       occupied: 18,
//       category: "outdoor",
//       floor: "Ground",
//     },
//     {
//       id: "A2",
//       name: "Main Entrance - South",
//       location: "123 Main Street, South Wing",
//       coordinates: "40.7125° N, 74.0062° W",
//       slots: 24,
//       occupied: 12,
//       category: "outdoor",
//       floor: "Ground",
//     },
//     {
//       id: "B1",
//       name: "Building B - East Wing",
//       location: "Building B, East Side",
//       coordinates: "40.7130° N, 74.0058° W",
//       slots: 32,
//       occupied: 8,
//       category: "covered",
//       floor: "Level 1",
//     },
//     {
//       id: "B2",
//       name: "Building B - West Wing",
//       location: "Building B, West Side",
//       coordinates: "40.7132° N, 74.0065° W",
//       slots: 32,
//       occupied: 28,
//       category: "covered",
//       floor: "Level 1",
//     },
//     {
//       id: "C1",
//       name: "Underground Parking - Level 1",
//       location: "Main Building Basement",
//       coordinates: "40.7127° N, 74.0061° W",
//       slots: 40,
//       occupied: 15,
//       category: "underground",
//       floor: "B1",
//     },
//     {
//       id: "C2",
//       name: "Underground Parking - Level 2",
//       location: "Main Building Basement",
//       coordinates: "40.7127° N, 74.0061° W",
//       slots: 40,
//       occupied: 35,
//       category: "underground",
//       floor: "B2",
//     },
//   ]

//   const filteredAreas = areas.filter((area) => {
//     const matchesSearch =
//       area.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       area.location.toLowerCase().includes(searchTerm.toLowerCase())
//     const matchesCategory = selectedCategory === "all" || area.category === selectedCategory
//     return matchesSearch && matchesCategory
//   })

//   const getOccupancyColor = (percentage: number) => {
//     if (percentage < 50) return "text-green-500"
//     if (percentage < 80) return "text-yellow-500"
//     return "text-red-500"
//   }

//   const getAvailabilityBadge = (available: number) => {
//     if (available > 10) return <Badge className="bg-green-500/20 text-green-400 border-green-500/50">High Availability</Badge>
//     if (available > 5) return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/50">Moderate</Badge>
//     if (available > 0) return <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/50">Limited</Badge>
//     return <Badge className="bg-red-500/20 text-red-400 border-red-500/50">Full</Badge>
//   }

//   const totalSlots = areas.reduce((sum, area) => sum + area.slots, 0)
//   const totalOccupied = areas.reduce((sum, area) => sum + area.occupied, 0)
//   const totalAvailable = totalSlots - totalOccupied

//   // Convert coordinates to lat/lng for map
//   const parseCoordinates = (coords: string) => {
//     const parts = coords.split(',')
//     const lat = parseFloat(parts[0].replace('°', '').replace('N', '').replace('S', '').trim())
//     const lng = parseFloat(parts[1].replace('°', '').replace('W', '').replace('E', '').trim())
//     return { lat: lat, lng: lng * (coords.includes('W') ? -1 : 1) }
//   }

//   const mapLocations = filteredAreas.map((area) => {
//     const coords = parseCoordinates(area.coordinates)
//     return {
//       id: area.id,
//       name: area.name,
//       lat: coords.lat,
//       lng: coords.lng,
//       available: area.slots - area.occupied,
//       total: area.slots,
//       category: area.category,
//     }
//   })

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
//       {/* Hero Section */}
//       <div className="relative overflow-hidden">
//         {/* Animated background elements */}
//         <div className="absolute inset-0 overflow-hidden pointer-events-none">
//           <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
//           <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
//         </div>

//         {/* Header */}
//         <header className="relative z-10 border-b border-slate-700/50 bg-slate-900/50 backdrop-blur-xl">
//           <div className="container mx-auto px-4 py-3 sm:py-4 flex items-center justify-between gap-3">
//             <div className="flex items-center gap-2 sm:gap-3">
//               <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
//                 <Car className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
//               </div>
//               <div>
//                 <h1 className="text-lg sm:text-2xl font-bold text-white">Smart Parking</h1>
//                 <p className="text-xs sm:text-sm text-slate-400 hidden sm:block">Find Your Perfect Spot</p>
//               </div>
//             </div>
//             <Button
//               onClick={() => router.push("/login")}
//               variant="outline"
//               className="border-purple-500/50 text-purple-400 hover:bg-purple-500/10 text-xs sm:text-sm px-3 sm:px-4"
//             >
//               <Shield className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
//               <span className="hidden sm:inline">Admin </span>Login
//             </Button>
//           </div>
//         </header>

//         {/* Stats Section */}
//         <div className="relative z-10 container mx-auto px-4 py-8 sm:py-12">
//           <div className="text-center mb-8 sm:mb-12">
//             <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3 sm:mb-4">
//               Real-Time Parking Availability
//             </h2>
//             <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto px-4">
//               Find available parking spaces instantly with our smart monitoring system
//             </p>
//           </div>

//           {/* Stats Grid */}
//           <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12">
//             <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/5 border-green-500/30 backdrop-blur-xl transform hover:scale-105 transition-transform">
//               <CardContent className="pt-5 sm:pt-6">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <p className="text-xs sm:text-sm text-slate-400 mb-1">Available Spaces</p>
//                     <p className="text-3xl sm:text-4xl font-bold text-green-400">{totalAvailable}</p>
//                   </div>
//                   <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-500/20 rounded-2xl flex items-center justify-center">
//                     <CheckCircle2 className="w-6 h-6 sm:w-8 sm:h-8 text-green-400" />
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>

//             <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/5 border-blue-500/30 backdrop-blur-xl transform hover:scale-105 transition-transform">
//               <CardContent className="pt-5 sm:pt-6">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <p className="text-xs sm:text-sm text-slate-400 mb-1">Total Capacity</p>
//                     <p className="text-3xl sm:text-4xl font-bold text-blue-400">{totalSlots}</p>
//                   </div>
//                   <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center">
//                     <Car className="w-6 h-6 sm:w-8 sm:h-8 text-blue-400" />
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>

//             <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/5 border-purple-500/30 backdrop-blur-xl transform hover:scale-105 transition-transform">
//               <CardContent className="pt-5 sm:pt-6">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <p className="text-xs sm:text-sm text-slate-400 mb-1">Occupancy Rate</p>
//                     <p className="text-3xl sm:text-3xl sm:text-4xl font-bold text-purple-400">
//                       {Math.round((totalOccupied / totalSlots) * 100)}%
//                     </p>
//                   </div>
//                   <div className="w-12 h-12 sm:w-16 sm:h-16 bg-purple-500/20 rounded-2xl flex items-center justify-center">
//                     <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-purple-400" />
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>
//           </div>

//           {/* Filters */}
//           <div className="flex flex-col gap-3 sm:gap-4 mb-6 sm:mb-8">
//             <div className="flex-1">
//               <Input
//                 type="text"
//                 placeholder="Search parking areas..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 h-10 sm:h-12"
//               />
//             </div>
//             <div className="flex flex-wrap gap-2">
//               <Button
//                 variant={selectedCategory === "all" ? "default" : "outline"}
//                 onClick={() => setSelectedCategory("all")}
//                 className={`text-xs sm:text-sm flex-1 sm:flex-none ${selectedCategory === "all" ? "bg-purple-500 hover:bg-purple-600" : "border-slate-700 text-slate-300"}`}
//               >
//                 All Areas
//               </Button>
//               <Button
//                 variant={selectedCategory === "outdoor" ? "default" : "outline"}
//                 onClick={() => setSelectedCategory("outdoor")}
//                 className={`text-xs sm:text-sm flex-1 sm:flex-none ${selectedCategory === "outdoor" ? "bg-purple-500 hover:bg-purple-600" : "border-slate-700 text-slate-300"}`}
//               >
//                 Outdoor
//               </Button>
//               <Button
//                 variant={selectedCategory === "covered" ? "default" : "outline"}
//                 onClick={() => setSelectedCategory("covered")}
//                 className={`text-xs sm:text-sm flex-1 sm:flex-none ${selectedCategory === "covered" ? "bg-purple-500 hover:bg-purple-600" : "border-slate-700 text-slate-300"}`}
//               >
//                 Covered
//               </Button>
//               <Button
//                 variant={selectedCategory === "underground" ? "default" : "outline"}
//                 onClick={() => setSelectedCategory("underground")}
//                 className={`text-xs sm:text-sm flex-1 sm:flex-none ${selectedCategory === "underground" ? "bg-purple-500 hover:bg-purple-600" : "border-slate-700 text-slate-300"}`}
//               >
//                 Underground
//               </Button>
//               <Button
//                 variant={showMap ? "default" : "outline"}
//                 onClick={() => setShowMap(!showMap)}
//                 className={`text-xs sm:text-sm w-full sm:w-auto ${showMap ? "bg-purple-500 hover:bg-purple-600" : "border-slate-700 text-slate-300"}`}
//               >
//                 <Map className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
//                 {showMap ? "Hide Map" : "Show Map"}
//               </Button>
//             </div>
//           </div>

//           {/* Map View */}
//           {showMap && (
//             <Card className="mb-6 sm:mb-8 bg-slate-900/80 border-slate-700/50 backdrop-blur-xl overflow-hidden">
//               <CardHeader className="pb-3 sm:pb-6">
//                 <CardTitle className="text-white flex items-center gap-2 text-base sm:text-lg">
//                   <MapPin className="w-5 h-5" />
//                   Parking Areas Map
//                 </CardTitle>
//                 <CardDescription className="text-slate-400">
//                   Click on markers to see parking area information
//                 </CardDescription>
//               </CardHeader>
//               <CardContent>
//                 <div className="h-[300px] sm:h-[400px] md:h-[500px] rounded-lg overflow-hidden">
//                   <ParkingMap
//                     locations={mapLocations}
//                     onMarkerClick={(id) => router.push(`/parking/${id}`)}
//                   />
//                 </div>
//               </CardContent>
//             </Card>
//           )}

//           {/* Parking Areas Grid */}
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
//             {filteredAreas.map((area) => {
//               const available = area.slots - area.occupied
//               const occupancyPercentage = (area.occupied / area.slots) * 100

//               return (
//                 <Card
//                   key={area.id}
//                   className="bg-slate-900/80 border-slate-700/50 backdrop-blur-xl hover:border-purple-500/50 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20"
//                 >
//                   <CardHeader className="pb-3 sm:pb-6">
//                     <div className="flex items-start justify-between mb-2">
//                       <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
//                         <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
//                       </div>
//                       {getAvailabilityBadge(available)}
//                     </div>
//                     <CardTitle className="text-white text-lg sm:text-xl">{area.name}</CardTitle>
//                     <CardDescription className="text-slate-400 text-sm">{area.location}</CardDescription>
//                   </CardHeader>
//                   <CardContent className="space-y-3 sm:space-y-4">
//                     <div className="flex items-center justify-between p-3 sm:p-4 bg-slate-800/50 rounded-lg">
//                       <div className="text-center flex-1">
//                         <p className="text-2xl sm:text-3xl font-bold text-green-400">{available}</p>
//                         <p className="text-xs sm:text-sm text-slate-400 mt-1">Available</p>
//                       </div>
//                       <div className="w-px h-10 sm:h-12 bg-slate-700" />
//                       <div className="text-center flex-1">
//                         <p className="text-2xl sm:text-3xl font-bold text-slate-300">{area.slots}</p>
//                         <p className="text-xs sm:text-sm text-slate-400 mt-1">Total</p>
//                       </div>
//                     </div>

//                     <div className="space-y-2">
//                       <div className="flex justify-between text-sm">
//                         <span className="text-slate-400">Occupancy</span>
//                         <span className={`font-semibold ${getOccupancyColor(occupancyPercentage)}`}>
//                           {Math.round(occupancyPercentage)}%
//                         </span>
//                       </div>
//                       <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
//                         <div
//                           className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-500"
//                           style={{ width: `${occupancyPercentage}%` }}
//                         />
//                       </div>
//                     </div>

//                     {/* Parking Slot Map */}
//                     <div className="bg-slate-800/30 rounded-lg p-2 sm:p-3 border border-slate-700/50">
//                       <div className="flex items-center justify-between mb-2 sm:mb-3">
//                         <span className="text-xs font-semibold text-slate-300">Parking Map</span>
//                         <div className="flex items-center gap-2 sm:gap-3 text-xs">
//                           <div className="flex items-center gap-1">
//                             <div className="w-2 h-2 rounded-sm bg-green-500"></div>
//                             <span className="text-slate-400 text-[10px] sm:text-xs">Free</span>
//                           </div>
//                           <div className="flex items-center gap-1">
//                             <div className="w-2 h-2 rounded-sm bg-red-500"></div>
//                             <span className="text-slate-400 text-[10px] sm:text-xs">Occupied</span>
//                           </div>
//                         </div>
//                       </div>
//                       <div className="grid grid-cols-6 gap-1.5 sm:gap-2">
//                         {Array.from({ length: 12 }).map((_, i) => {
//                           const slotNumber = i + 1
//                           const isOccupied = i < Math.round((area.occupied / area.slots) * 12)
//                           return (
//                             <div
//                               key={`${area.id}-slot-${i}`}
//                               className={`relative aspect-[3/4] rounded-lg border-2 flex items-center justify-center text-xs font-bold transition-all cursor-pointer hover:scale-110 ${
//                                 isOccupied 
//                                   ? 'bg-red-500/20 border-red-500/50 text-red-400 hover:bg-red-500/30' 
//                                   : 'bg-green-500/20 border-green-500/50 text-green-400 hover:bg-green-500/30'
//                               }`}
//                               title={`Slot ${area.id}-${slotNumber}: ${isOccupied ? "Occupied" : "Available"}`}
//                             >
//                               <div className="absolute top-0.5 left-0.5 text-[8px] opacity-60">{area.id}</div>
//                               <span>{slotNumber}</span>
//                             </div>
//                           )
//                         })}
//                       </div>
//                     </div>

//                     <div className="flex items-center justify-between pt-2">
//                       <Badge variant="outline" className="border-slate-600 text-slate-300">
//                         {area.floor}
//                       </Badge>
//                       <Button
//                         variant="ghost"
//                         size="sm"
//                         className="text-purple-400 hover:text-purple-300 hover:bg-purple-500/10"
//                         onClick={() => router.push(`/parking/${area.id}`)}
//                       >
//                         <Navigation2 className="w-4 h-4 mr-1" />
//                         Navigate
//                         <ArrowRight className="w-4 h-4 ml-1" />
//                       </Button>
//                     </div>
//                   </CardContent>
//                 </Card>
//               )
//             })}
//           </div>

//           {filteredAreas.length === 0 && (
//             <div className="text-center py-12">
//               <p className="text-slate-400 text-lg">No parking areas found matching your criteria.</p>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   )
// }

"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Brain, 
  Cloud, 
  Video, 
  Wrench, 
  MapPin,
  CheckCircle2,
  ArrowRight,
  Phone,
  Mail,
  Menu,
  X,
  Car
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function LandingPage() {
  const [activeCategory, setActiveCategory] = useState("all")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const features = [
    {
      icon: Brain,
      title: "Real-Time Slot Detection",
      description: "Detects and displays real-time parking slot availability using AI-powered computer vision. Automatically identifies occupied and vacant slots across multiple parking zones in Thimphu."
    },
    {
      icon: CheckCircle2,
      title: "Violation Detection",
      description: "Automatically detects illegal parking activities including double parking, parking outside marked areas, and unauthorized roadside parking with instant alerts to enforcement officers."
    },
    {
      icon: Video,
      title: "Existing CCTV Integration",
      description: "Leverages existing CCTV infrastructure in public areas to monitor parking spaces. No need for specialized hardware - works with current camera systems across Norzin Lam, City Bus Terminal, and Changlimithang."
    },
    {
      icon: Cloud,
      title: "Data-Driven Insights",
      description: "Generate comprehensive analytics on parking usage, occupancy trends, and violation patterns. Provides data-driven insights for future traffic and urban planning in Bhutan's growing cities."
    }
  ]

  const works = [
    {
      category: "Thimphu City Center",
      image: "/parking-samples/thimphu1.jpg",
      alt: "Norzin Lam parking monitoring"
    },
    {
      category: "Government Offices",
      image: "/parking-samples/govt1.jpg",
      alt: "Government office parking detection"
    },
    {
      category: "Public Transport",
      image: "/parking-samples/bus-terminal1.jpg",
      alt: "City Bus Terminal parking"
    },
    {
      category: "Sports Complex",
      image: "/parking-samples/changlimithang1.jpg",
      alt: "Changlimithang area parking"
    },
    {
      category: "Thimphu City Center",
      image: "/parking-samples/thimphu2.jpg",
      alt: "Downtown Thimphu parking"
    },
    {
      category: "Government Offices",
      image: "/parking-samples/govt2.jpg",
      alt: "Ministry parking zones"
    }
  ]

  const filteredWorks = activeCategory === "all" 
    ? works 
    : works.filter(work => work.category.toLowerCase().replace(/\//g, "").replace(/\s/g, "") === activeCategory)

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2 cursor-pointer hover:opacity-80 transition-opacity">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-blue-600">SmartPark</span>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              <Link href="#about" className="text-gray-700 hover:text-blue-600 transition-colors">
                About
              </Link>
              <Link href="#works" className="text-gray-700 hover:text-blue-600 transition-colors">
                References
              </Link>
              <Link href="#contact" className="text-gray-700 hover:text-blue-600 transition-colors">
                Contact
              </Link>
            </div>

            {/* CTA */}
            <div className="hidden lg:flex items-center space-x-3">
              <Link href="/login">
                <Button variant="ghost">Login</Button>
              </Link>
              <Link href="/landing">
                <Button>Start for FREE</Button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 space-y-3">
              <Link href="#about" className="block py-2 text-gray-700 hover:text-blue-600">
                About
              </Link>
              <Link href="#works" className="block py-2 text-gray-700 hover:text-blue-600">
                References
              </Link>
              <Link href="#contact" className="block py-2 text-gray-700 hover:text-blue-600">
                Contact
              </Link>
              <div className="pt-4 space-y-2">
                <Link href="/login" className="block">
                  <Button variant="ghost" className="w-full">Login</Button>
                </Link>
                <Link href="/landing" className="block">
                  <Button className="w-full">Start for FREE</Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-gray-50 to-blue-50 py-20 lg:py-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-8">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
              Parking Occupancy Detection<br />
              <span className="text-blue-600">Using a Camera</span>
            </h1>
            
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
              A GovTech Agency Initiative - Transforming Urban Parking Management in Bhutan Through AI and Computer Vision
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/landing">
                <Button size="lg" className="px-8 py-6 text-lg">
                  Start for FREE
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="#contact">
                <Button size="lg" variant="outline" className="px-8 py-6 text-lg">
                  Contact us
                </Button>
              </Link>
            </div>
          </div>

          {/* Hero Image */}
          <div className="mt-16 relative">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="relative h-64 bg-gray-200 rounded-lg overflow-hidden shadow-lg">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Video className="w-16 h-16 text-gray-400" />
                </div>
                <Badge className="absolute top-4 right-4 bg-green-500 text-white">FREE</Badge>
              </div>
              <div className="relative h-64 bg-gray-200 rounded-lg overflow-hidden shadow-lg">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Car className="w-16 h-16 text-gray-400" />
                </div>
                <Badge className="absolute top-4 right-4 bg-green-500 text-white">FREE</Badge>
              </div>
              <div className="relative h-64 bg-gray-200 rounded-lg overflow-hidden shadow-lg">
                <div className="absolute inset-0 flex items-center justify-center">
                  <MapPin className="w-16 h-16 text-gray-400" />
                </div>
                <Badge className="absolute top-4 right-4 bg-green-500 text-white">FREE</Badge>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Solution Section */}
      <section id="about" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                Smart City Initiative<br />
                <span className="text-blue-600">for Bhutan</span>
              </h2>
              <div className="w-16 h-1 bg-blue-600"></div>
              <p className="text-lg text-gray-600 leading-relaxed">
                Urban areas in Bhutan, particularly Thimphu, face increasing traffic congestion due to inefficient parking management. This Proof of Concept by GovTech Agency demonstrates how AI and Computer Vision can automate parking monitoring, reduce illegal parking, and provide real-time data for better urban planning.
              </p>
              <Link href="#works">
                <Button variant="outline" size="lg">
                  Discover more
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {features.map((feature, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6 space-y-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <feature.icon className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {feature.title}
                    </h3>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Detail Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-xl transition-all hover:-translate-y-1">
                <CardContent className="p-6 space-y-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <feature.icon className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Our Works Section */}
      <section id="works" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Our works
            </h2>
            <div className="w-16 h-1 bg-blue-600 mx-auto"></div>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Explore real-life examples of how our smart parking solutions are making a difference in various locations.
            </p>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            <Button 
              variant={activeCategory === "all" ? "default" : "outline"}
              onClick={() => setActiveCategory("all")}
            >
              All
            </Button>
            <Button 
              variant={activeCategory === "thimphucitycenter" ? "default" : "outline"}
              onClick={() => setActiveCategory("thimphucitycenter")}
            >
              Thimphu City Center
            </Button>
            <Button 
              variant={activeCategory === "governmentoffices" ? "default" : "outline"}
              onClick={() => setActiveCategory("governmentoffices")}
            >
              Government Offices
            </Button>
            <Button 
              variant={activeCategory === "publictransport" ? "default" : "outline"}
              onClick={() => setActiveCategory("publictransport")}
            >
              Public Transport
            </Button>
            <Button 
              variant={activeCategory === "sportscomplex" ? "default" : "outline"}
              onClick={() => setActiveCategory("sportscomplex")}
            >
              Sports Complex
            </Button>
          </div>

          {/* Works Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredWorks.map((work, index) => (
              <Card key={index} className="overflow-hidden hover:shadow-xl transition-shadow group">
                <div className="relative h-64 bg-gradient-to-br from-blue-100 to-green-100">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center space-y-2">
                      <MapPin className="w-12 h-12 text-blue-600 mx-auto" />
                      <Badge className="bg-green-500 text-white">FREE</Badge>
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors"></div>
                </div>
                <CardContent className="p-4">
                  <Badge variant="secondary">{work.category}</Badge>
                  <p className="text-sm text-gray-600 mt-2">{work.alt}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-blue-800 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <h2 className="text-3xl md:text-4xl font-bold">
            Join Bhutan's Smart City Transformation
          </h2>
          <p className="text-lg text-blue-100">
            Part of GovTech Agency's initiative to leverage emerging technologies for solving real urban challenges in Bhutan
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/admin">
              <Button size="lg" variant="secondary" className="px-8 py-6 text-lg">
                Get Started FREE
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="#contact">
              <Button size="lg" variant="outline" className="px-8 py-6 text-lg border-white text-white hover:bg-white/10">
                Schedule a Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-white">SmartPark</span>
              </div>
              <p className="text-sm">
                GovTech Agency - Emerging Technology Division. Evaluating AI and Computer Vision solutions for urban parking management in Bhutan.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-white font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="#about" className="hover:text-blue-400 transition-colors">About</Link></li>
                <li><Link href="#works" className="hover:text-blue-400 transition-colors">References</Link></li>
                <li><Link href="/login" className="hover:text-blue-400 transition-colors">Login</Link></li>
              </ul>
            </div>

            {/* Pilot Sites */}
            <div>
              <h3 className="text-white font-semibold mb-4">Pilot Sites</h3>
              <ul className="space-y-2 text-sm">
                <li>Norzin Lam</li>
                <li>City Bus Terminal</li>
                <li>Changlimithang</li>
                <li>Government Offices</li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-white font-semibold mb-4">Contact</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center space-x-2">
                  <Mail className="w-4 h-4" />
                  <span>govtech@govtech.bt</span>
                </li>
                <li className="text-xs text-gray-300 mt-2">
                  GovTech Agency, Thimphu, Bhutan
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
            <p>&copy; {new Date().getFullYear()} GovTech Agency, Royal Government of Bhutan. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}