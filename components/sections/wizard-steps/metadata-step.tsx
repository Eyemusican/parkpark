"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Save, MapPin, Trash2 } from "lucide-react"
import dynamic from "next/dynamic"

// Dynamic import for Leaflet (avoid SSR issues)
const MapContainer = dynamic(
  () => import("react-leaflet").then(mod => mod.MapContainer),
  { ssr: false }
)
const TileLayer = dynamic(
  () => import("react-leaflet").then(mod => mod.TileLayer),
  { ssr: false }
)
const Polygon = dynamic(
  () => import("react-leaflet").then(mod => mod.Polygon),
  { ssr: false }
)
const Marker = dynamic(
  () => import("react-leaflet").then(mod => mod.Marker),
  { ssr: false }
)
// MapClickHandler must be dynamically imported as a component (not the hook itself)
const MapClickHandler = dynamic(
  () => import("./map-click-handler").then(mod => mod.MapClickHandler),
  { ssr: false }
)

interface MetadataStepProps {
  onComplete: (data: { name: string; boundary: number[][] }) => void
  onBack: () => void
  isSubmitting: boolean
}

export function MetadataStep({ onComplete, onBack, isSubmitting }: MetadataStepProps) {
  const [name, setName] = useState("")
  const [boundaryPoints, setBoundaryPoints] = useState<number[][]>([])
  const [mapReady, setMapReady] = useState(false)
  const [mapCenter, setMapCenter] = useState<[number, number]>([27.4728, 89.6393]) // Default: Thimphu

  useEffect(() => {
    // Import leaflet CSS
    import("leaflet/dist/leaflet.css")
    setMapReady(true)

    // Auto-detect user location
    if (typeof window !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setMapCenter([position.coords.latitude, position.coords.longitude])
        },
        (error) => {
          console.warn('Geolocation failed, using default:', error.message)
        },
        { timeout: 5000 }
      )
    }
  }, [])

  const handleAddPoint = (lat: number, lng: number) => {
    setBoundaryPoints([...boundaryPoints, [lat, lng]])
  }

  const handleClearBoundary = () => {
    setBoundaryPoints([])
  }

  const handleRemoveLastPoint = () => {
    setBoundaryPoints(boundaryPoints.slice(0, -1))
  }

  const handleSubmit = () => {
    if (!name.trim() || boundaryPoints.length < 3) return
    onComplete({ name: name.trim(), boundary: boundaryPoints })
  }

  const isValid = name.trim() && boundaryPoints.length >= 3

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold">Parking Area Details</h2>
          <p className="text-sm text-muted-foreground">
            Name your parking area and draw its boundary on the map
          </p>
        </div>

        {/* Name input */}
        <div className="space-y-2">
          <Label htmlFor="name">Parking Area Name *</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Building A - North Lot"
            disabled={isSubmitting}
          />
        </div>

        {/* Map with polygon drawing */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              Boundary Polygon * ({boundaryPoints.length} points)
            </Label>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRemoveLastPoint}
                disabled={boundaryPoints.length === 0 || isSubmitting}
              >
                Undo Point
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearBoundary}
                disabled={boundaryPoints.length === 0 || isSubmitting}
              >
                <Trash2 className="w-4 h-4 mr-1" /> Clear
              </Button>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Click on the map to add boundary points. Minimum 3 points required to form a polygon.
          </p>

          <div className="h-[350px] rounded-lg overflow-hidden border">
            {mapReady && (
              <MapContainer
                center={mapCenter}
                zoom={16}
                className="h-full w-full"
                key={mapCenter.join(',')} // Force re-render when center changes
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                />
                <MapClickHandler onPointAdd={handleAddPoint} />
                {boundaryPoints.length >= 3 && (
                  <Polygon
                    positions={boundaryPoints as [number, number][]}
                    pathOptions={{
                      color: '#3b82f6',
                      fillColor: '#3b82f6',
                      fillOpacity: 0.3,
                      weight: 2
                    }}
                  />
                )}
              </MapContainer>
            )}
          </div>

          {boundaryPoints.length > 0 && boundaryPoints.length < 3 && (
            <p className="text-sm text-amber-600">
              Add {3 - boundaryPoints.length} more point{3 - boundaryPoints.length > 1 ? 's' : ''} to complete the polygon
            </p>
          )}
          {boundaryPoints.length >= 3 && (
            <p className="text-sm text-green-600">
              Polygon complete! You can add more points to refine the boundary.
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t">
          <Button variant="outline" onClick={onBack} disabled={isSubmitting}>
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </Button>
          <Button onClick={handleSubmit} disabled={!isValid || isSubmitting}>
            <Save className="w-4 h-4 mr-1" />
            {isSubmitting ? 'Creating...' : 'Create Parking Area'}
          </Button>
        </div>
      </div>
    </Card>
  )
}
