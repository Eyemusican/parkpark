"use client"

import { Card } from "@/components/ui/card"
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { TrendingUp, BarChart3, Car, DollarSign, Calendar, Wallet, ArrowUp, ArrowDown, AlertTriangle, Leaf } from "lucide-react"

export function AnalyticsSection() {
  const occupancyData = [
    { time: "6:00 AM", occupancy: 15 },
    { time: "8:00 AM", occupancy: 45 },
    { time: "10:00 AM", occupancy: 68 },
    { time: "12:00 PM", occupancy: 82 },
    { time: "2:00 PM", occupancy: 75 },
    { time: "4:00 PM", occupancy: 88 },
    { time: "6:00 PM", occupancy: 92 },
    { time: "8:00 PM", occupancy: 45 },
    { time: "10:00 PM", occupancy: 22 },
  ]

  const violationData = [
    { day: "Mon", violations: 12 },
    { day: "Tue", violations: 8 },
    { day: "Wed", violations: 15 },
    { day: "Thu", violations: 10 },
    { day: "Fri", violations: 18 },
    { day: "Sat", violations: 22 },
    { day: "Sun", violations: 9 },
  ]

  const revenueData = [
    { day: "Mon", revenue: 8500 },
    { day: "Tue", revenue: 9200 },
    { day: "Wed", revenue: 11000 },
    { day: "Thu", revenue: 10500 },
    { day: "Fri", revenue: 13800 },
    { day: "Sat", revenue: 15200 },
    { day: "Sun", revenue: 12850 },
  ]

  const parkingDistribution = [
    { name: "Short Term (<2h)", value: 45, color: "#3b82f6" },
    { name: "Medium (2-4h)", value: 35, color: "#8b5cf6" },
    { name: "Long Term (>4h)", value: 20, color: "#ec4899" },
  ]

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Analytics & Insights</h1>
        <p className="text-sm text-gray-600">Comprehensive parking system analytics and revenue tracking</p>
      </div>

      {/* Revenue & Parking Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="bg-gray-50 border-gray-200 p-5">
          <p className="text-xs text-gray-600 mb-1">Parking Today</p>
          <p className="text-3xl font-bold text-gray-900">127</p>
          <p className="text-xs text-gray-500 mt-2">Total sessions • vs 113 yesterday</p>
        </Card>

        <Card className="bg-gray-50 border-gray-200 p-5">
          <p className="text-xs text-gray-600 mb-1">Daily Revenue</p>
          <p className="text-3xl font-bold text-gray-900">₹12,850</p>
          <p className="text-xs text-gray-500 mt-2">Today's earnings • Avg ₹101/session</p>
        </Card>

        <Card className="bg-gray-50 border-gray-200 p-5">
          <p className="text-xs text-gray-600 mb-1">Monthly Revenue</p>
          <p className="text-3xl font-bold text-gray-900">₹3.8L</p>
          <p className="text-xs text-gray-500 mt-2">This month • 3,250 total sessions</p>
        </Card>

        <Card className="bg-gray-50 border-gray-200 p-5">
          <p className="text-xs text-gray-600 mb-1">Total Revenue</p>
          <p className="text-3xl font-bold text-gray-900">₹24.5L</p>
          <p className="text-xs text-gray-500 mt-2">All time • 21,847 sessions</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Card className="bg-white border-gray-200 p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
            Daily Occupancy Trend
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={occupancyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,100,100,0.1)" />
              <XAxis dataKey="time" stroke="rgba(100,100,100,0.5)" style={{ fontSize: "11px" }} />
              <YAxis stroke="rgba(100,100,100,0.5)" style={{ fontSize: "11px" }} />
              <Tooltip
                contentStyle={{ backgroundColor: "white", border: "1px solid #e5e7eb", borderRadius: "8px" }}
              />
              <Line type="monotone" dataKey="occupancy" stroke="rgb(59, 130, 246)" strokeWidth={3} dot={{ fill: "#3b82f6", r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
          <div className="mt-3 flex items-center justify-between text-xs">
            <span className="text-gray-600">Peak: 92% at 6PM</span>
            <span className="text-gray-600">Low: 15% at 6AM</span>
          </div>
        </Card>

        <Card className="bg-white border-gray-200 p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
            Weekly Revenue Trend
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,100,100,0.1)" />
              <XAxis dataKey="day" stroke="rgba(100,100,100,0.5)" style={{ fontSize: "11px" }} />
              <YAxis stroke="rgba(100,100,100,0.5)" style={{ fontSize: "11px" }} />
              <Tooltip
                contentStyle={{ backgroundColor: "white", border: "1px solid #e5e7eb", borderRadius: "8px" }}
                formatter={(value: any) => `₹${value.toLocaleString()}`}
              />
              <Bar dataKey="revenue" fill="rgb(34, 197, 94)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-3 flex items-center justify-between text-xs">
            <span className="text-gray-600">Best: Saturday ₹15,200</span>
            <span className="text-gray-600">Total: ₹81,050</span>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Card className="bg-white border-gray-200 p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
            Weekly Violations
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={violationData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,100,100,0.1)" />
              <XAxis dataKey="day" stroke="rgba(100,100,100,0.5)" style={{ fontSize: "11px" }} />
              <YAxis stroke="rgba(100,100,100,0.5)" style={{ fontSize: "11px" }} />
              <Tooltip
                contentStyle={{ backgroundColor: "white", border: "1px solid #e5e7eb", borderRadius: "8px" }}
              />
              <Bar dataKey="violations" fill="rgb(239, 68, 68)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-3 flex items-center justify-between text-xs">
            <span className="text-gray-600">Total: 94 violations</span>
            <span className="text-gray-600">Peak: Saturday (22)</span>
          </div>
        </Card>

        <Card className="bg-white border-gray-200 p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
            Parking Duration Distribution
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={parkingDistribution}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={5}
                dataKey="value"
                label={({ name, value }) => `${value}%`}
              >
                {parkingDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value: any) => `${value}%`} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-3 space-y-2">
            {parkingDistribution.map((item, index) => (
              <div key={index} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-gray-700">{item.name}</span>
                </div>
                <span className="font-semibold text-gray-900">{item.value}%</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="bg-gray-50 border-gray-200 p-4">
          <p className="text-xs text-gray-600 mb-2">Peak Occupancy</p>
          <p className="text-2xl font-bold text-gray-900">92%</p>
          <p className="text-xs text-gray-600 mt-2">6:00 PM - 7:00 PM</p>
        </Card>

        <Card className="bg-gray-50 border-gray-200 p-4">
          <p className="text-xs text-gray-600 mb-2">Lowest Occupancy</p>
          <p className="text-2xl font-bold text-gray-900">15%</p>
          <p className="text-xs text-gray-600 mt-2">6:00 AM - 7:00 AM</p>
        </Card>

        <Card className="bg-gray-50 border-gray-200 p-4">
          <p className="text-xs text-gray-600 mb-2">Total Violations</p>
          <p className="text-2xl font-bold text-gray-900">94</p>
          <p className="text-xs text-gray-600 mt-2">This week</p>
        </Card>

        <Card className="bg-gray-50 border-gray-200 p-4">
          <p className="text-xs text-gray-600 mb-2">CO₂ Saved</p>
          <p className="text-2xl font-bold text-gray-900">2.4T</p>
          <p className="text-xs text-gray-600 mt-2">This month</p>
        </Card>
      </div>
    </div>
  )
}
