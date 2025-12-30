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
