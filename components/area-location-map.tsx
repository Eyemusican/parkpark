"use client"

import { useEffect, useRef, useState, memo } from "react"
import { API_URL } from "@/lib/api-config"

interface AreaLocationMapProps {
  areaId: string | number
}

interface AreaData {
  id: number
  name: string
  boundary_polygon: [number, number][] | null
  center: [number, number]
  available_slots: number
  total_slots: number
}

function AreaLocationMapComponent({ areaId }: AreaLocationMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const [areaData, setAreaData] = useState<AreaData | null>(null)
  const initializedRef = useRef(false)

  // Fetch area data once on mount
  useEffect(() => {
    const fetchArea = async () => {
      try {
        const response = await fetch(`${API_URL}/api/parking-areas`)
        if (response.ok) {
          const areas = await response.json()
          const area = areas.find((a: any) => a.id === Number(areaId))
          if (area) {
            setAreaData(area)
          }
        }
      } catch (error) {
        console.error('Error fetching area:', error)
      }
    }
    fetchArea()
  }, [areaId])

  // Initialize map only once
  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current || initializedRef.current) return

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

        // Default center (Thimphu)
        const defaultCenter: [number, number] = [27.4728, 89.6393]

        const map = L.map(container, {
          center: defaultCenter,
          zoom: 17,
          zoomControl: true,
          scrollWheelZoom: true,
          doubleClickZoom: true,
          touchZoom: true,
          dragging: true,
          minZoom: 12,
          maxZoom: 19,
        })

        // Add tile layers
        const streetMap = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; OpenStreetMap contributors',
          maxZoom: 19,
        }).addTo(map)

        const satelliteMap = L.tileLayer(
          "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
          { attribution: 'Tiles &copy; Esri', maxZoom: 19 }
        )

        const hybridMap = L.tileLayer(
          "https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}",
          { attribution: '&copy; Google Maps', maxZoom: 20 }
        )

        L.control.layers({
          "Street Map": streetMap,
          "Satellite": satelliteMap,
          "Hybrid": hybridMap,
        }).addTo(map)

        mapInstanceRef.current = map
        initializedRef.current = true
      }
    }, 100)

    return () => {
      clearTimeout(timer)
    }
  }, [])

  // Add polygon and marker when area data is available
  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map || !areaData) return

    const addAreaToMap = async () => {
      const L = (await import("leaflet")).default

      const bounds: [number, number][] = []

      // Add polygon if boundary exists
      if (areaData.boundary_polygon && areaData.boundary_polygon.length > 0) {
        L.polygon(areaData.boundary_polygon, {
          color: "#3b82f6",
          fillColor: "#3b82f6",
          fillOpacity: 0.2,
          weight: 3,
        }).addTo(map)

        areaData.boundary_polygon.forEach(p => bounds.push(p))
      }

      // Add marker at center
      const center = areaData.center || [27.4728, 89.6393]

      const customIcon = L.divIcon({
        className: "custom-marker",
        html: `
          <div class="w-10 h-10 rounded-full flex items-center justify-center shadow-lg border-3 border-white bg-blue-600"
               style="margin-left: -20px; margin-top: -20px;">
            <span class="text-white text-sm font-bold">P</span>
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      })

      L.marker(center as [number, number], { icon: customIcon })
        .addTo(map)
        .bindPopup(`
          <div class="p-2">
            <h3 class="font-bold text-base">${areaData.name}</h3>
            <p class="text-sm">${areaData.available_slots} / ${areaData.total_slots} available</p>
          </div>
        `)

      bounds.push(center as [number, number])

      // Fit bounds
      if (bounds.length > 0) {
        map.fitBounds(bounds, { padding: [30, 30], maxZoom: 17 })
      }
    }

    addAreaToMap()
  }, [areaData])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove()
        } catch (e) {}
        mapInstanceRef.current = null
        initializedRef.current = false
      }
    }
  }, [])

  return (
    <div
      ref={mapRef}
      className="w-full rounded-lg overflow-hidden"
      style={{ height: '400px' }}
    />
  )
}

export const AreaLocationMap = memo(AreaLocationMapComponent)
