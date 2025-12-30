"use client"

import { useEffect, useRef, useState, memo } from "react"
import { API_URL } from "@/lib/api-config"

interface ParkingArea {
  id: number
  name: string
  total_slots: number
  occupied_slots: number
  available_slots: number
  occupancy_rate: number
  boundary_polygon: [number, number][] | null
  center: [number, number]
}

interface ZoneMapProps {
  onAreaClick?: (id: number) => void
}

function ZoneMapComponent({ onAreaClick }: ZoneMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const [areas, setAreas] = useState<ParkingArea[]>([])
  const areasRef = useRef<ParkingArea[]>([])

  // Fetch parking areas once on mount
  useEffect(() => {
    const fetchAreas = async () => {
      try {
        const response = await fetch(`${API_URL}/api/parking-areas`)
        if (response.ok) {
          const data = await response.json()
          setAreas(data)
          areasRef.current = data
        }
      } catch (error) {
        console.error('Error fetching parking areas:', error)
      }
    }
    fetchAreas()
  }, [])

  // Initialize map only once
  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current) return

    const timer = setTimeout(async () => {
      const L = (await import("leaflet")).default

      // Fix for default marker icon
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
      })

      if (mapRef.current && !mapInstanceRef.current) {
        const container = mapRef.current
        if ((container as any)._leaflet_id) return

        const map = L.map(container, {
          center: [27.4728, 89.6393],
          zoom: 14,
          zoomControl: true,
          scrollWheelZoom: true,
          doubleClickZoom: true,
          touchZoom: true,
          dragging: true,
          minZoom: 10,
          maxZoom: 19,
        })

        // Add tile layer
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; OpenStreetMap contributors',
          maxZoom: 19,
        }).addTo(map)

        // Add layer control
        const satelliteMap = L.tileLayer(
          "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
          { attribution: 'Tiles &copy; Esri', maxZoom: 19 }
        )
        const hybridMap = L.tileLayer(
          "https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}",
          { attribution: '&copy; Google Maps', maxZoom: 20 }
        )

        L.control.layers({
          "Street Map": L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"),
          "Satellite": satelliteMap,
          "Hybrid": hybridMap,
        }).addTo(map)

        mapInstanceRef.current = map
      }
    }, 100)

    return () => {
      clearTimeout(timer)
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove()
        } catch (e) {}
        mapInstanceRef.current = null
      }
    }
  }, [])

  // Update polygons and markers when areas change
  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map || areas.length === 0) return

    const addMarkersAndPolygons = async () => {
      const L = (await import("leaflet")).default

      const bounds: [number, number][] = []

      areas.forEach((area) => {
        const occupancyRate = area.occupancy_rate
        const color = occupancyRate >= 80 ? "#ef4444" : occupancyRate >= 50 ? "#f59e0b" : "#22c55e"

        // Add polygon if boundary exists
        if (area.boundary_polygon && area.boundary_polygon.length > 0) {
          const polygon = L.polygon(area.boundary_polygon as [number, number][], {
            color: color,
            fillColor: color,
            fillOpacity: 0.3,
            weight: 3,
          }).addTo(map)

          polygon.bindPopup(`
            <div class="p-2">
              <h3 class="font-bold text-base mb-2">${area.name}</h3>
              <p><strong>Available:</strong> <span class="text-green-600">${area.available_slots}</span> / ${area.total_slots}</p>
              <p><strong>Occupancy:</strong> ${Math.round(area.occupancy_rate)}%</p>
            </div>
          `)

          if (onAreaClick) {
            polygon.on('click', () => onAreaClick(area.id))
          }

          area.boundary_polygon.forEach(p => bounds.push(p))
        }

        // Add marker at center
        if (area.center) {
          const customIcon = L.divIcon({
            className: "custom-marker",
            html: `
              <div class="w-8 h-8 rounded-full flex items-center justify-center shadow-lg border-2 border-white"
                   style="background-color: ${color}; margin-left: -16px; margin-top: -16px;">
                <span class="text-white text-xs font-bold">${area.available_slots}</span>
              </div>
            `,
            iconSize: [32, 32],
            iconAnchor: [16, 16],
          })

          const marker = L.marker(area.center, { icon: customIcon }).addTo(map)
          marker.bindPopup(`
            <div class="p-2">
              <h3 class="font-bold">${area.name}</h3>
              <p>${area.available_slots} / ${area.total_slots} available</p>
            </div>
          `)

          if (onAreaClick) {
            marker.on('click', () => onAreaClick(area.id))
          }

          bounds.push(area.center)
        }
      })

      // Fit bounds if we have areas
      if (bounds.length > 0) {
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 })
      }
    }

    addMarkersAndPolygons()
  }, [areas, onAreaClick])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Zone Map</h2>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-500" />
            <span>Low (&lt;50%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-yellow-500" />
            <span>Medium (50-80%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-red-500" />
            <span>High (&gt;80%)</span>
          </div>
        </div>
      </div>
      <div
        ref={mapRef}
        className="w-full rounded-lg overflow-hidden border border-gray-200"
        style={{ height: '600px' }}
      />
      {areas.length === 0 && (
        <p className="text-center text-gray-500 py-4">
          No parking areas found. Create one to see it on the map.
        </p>
      )}
    </div>
  )
}

export const ZoneMap = memo(ZoneMapComponent)
