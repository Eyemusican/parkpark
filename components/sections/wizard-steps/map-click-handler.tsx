"use client"

import { useMapEvents } from "react-leaflet"

interface MapClickHandlerProps {
  onPointAdd: (lat: number, lng: number) => void
}

export function MapClickHandler({ onPointAdd }: MapClickHandlerProps) {
  useMapEvents({
    click: (e) => {
      onPointAdd(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}
