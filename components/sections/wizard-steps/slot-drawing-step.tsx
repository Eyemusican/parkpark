"use client"

import { useState, useRef, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Undo, Trash2, Check, ArrowLeft } from "lucide-react"

interface Point { x: number; y: number }
interface Slot {
  slot_number: number
  polygon_points: number[][]
}

interface SlotDrawingStepProps {
  frameUrl: string
  frameWidth: number
  frameHeight: number
  onComplete: (slots: Slot[]) => void
  onBack: () => void
}

export function SlotDrawingStep({
  frameUrl,
  frameWidth,
  frameHeight,
  onComplete,
  onBack
}: SlotDrawingStepProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [slots, setSlots] = useState<Slot[]>([])
  const [currentPoints, setCurrentPoints] = useState<Point[]>([])
  const [scale, setScale] = useState(1)
  const [image, setImage] = useState<HTMLImageElement | null>(null)

  // Load image and calculate scale
  useEffect(() => {
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => {
      setImage(img)
      // Scale to fit max 900px width
      const maxWidth = 900
      const s = Math.min(maxWidth / img.width, 1)
      setScale(s)
    }
    img.src = frameUrl
  }, [frameUrl])

  // Redraw canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !image) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = image.width * scale
    canvas.height = image.height * scale

    // Draw image
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height)

    // Draw completed slots
    slots.forEach((slot) => {
      ctx.beginPath()
      ctx.fillStyle = 'rgba(0, 255, 0, 0.3)'
      ctx.strokeStyle = '#00ff00'
      ctx.lineWidth = 2

      const points = slot.polygon_points
      ctx.moveTo(points[0][0] * scale, points[0][1] * scale)
      points.forEach(([x, y]) => ctx.lineTo(x * scale, y * scale))
      ctx.closePath()
      ctx.fill()
      ctx.stroke()

      // Draw slot number
      const centerX = points.reduce((sum, p) => sum + p[0], 0) / points.length * scale
      const centerY = points.reduce((sum, p) => sum + p[1], 0) / points.length * scale

      // Background for text
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'
      ctx.beginPath()
      ctx.arc(centerX, centerY, 15, 0, Math.PI * 2)
      ctx.fill()

      ctx.fillStyle = '#fff'
      ctx.font = 'bold 14px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(`${slot.slot_number}`, centerX, centerY)
    })

    // Draw current points (in progress)
    if (currentPoints.length > 0) {
      ctx.beginPath()
      ctx.strokeStyle = '#ffff00'
      ctx.lineWidth = 2
      ctx.setLineDash([5, 5])
      ctx.moveTo(currentPoints[0].x * scale, currentPoints[0].y * scale)
      currentPoints.forEach(p => ctx.lineTo(p.x * scale, p.y * scale))
      ctx.stroke()
      ctx.setLineDash([])

      // Draw point markers
      currentPoints.forEach((p, i) => {
        ctx.beginPath()
        ctx.fillStyle = '#ff0000'
        ctx.arc(p.x * scale, p.y * scale, 6, 0, Math.PI * 2)
        ctx.fill()
        ctx.strokeStyle = '#fff'
        ctx.lineWidth = 2
        ctx.stroke()

        ctx.fillStyle = '#fff'
        ctx.font = 'bold 10px sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(`${i + 1}`, p.x * scale, p.y * scale)
      })
    }
  }, [image, scale, slots, currentPoints])

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = Math.round((e.clientX - rect.left) / scale)
    const y = Math.round((e.clientY - rect.top) / scale)

    const newPoints = [...currentPoints, { x, y }]

    if (newPoints.length === 4) {
      // Complete the slot
      const newSlot: Slot = {
        slot_number: slots.length + 1,
        polygon_points: newPoints.map(p => [p.x, p.y])
      }
      setSlots([...slots, newSlot])
      setCurrentPoints([])
    } else {
      setCurrentPoints(newPoints)
    }
  }

  const handleUndo = () => {
    if (currentPoints.length > 0) {
      setCurrentPoints(currentPoints.slice(0, -1))
    } else if (slots.length > 0) {
      setSlots(slots.slice(0, -1))
    }
  }

  const handleClear = () => {
    setSlots([])
    setCurrentPoints([])
  }

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Draw Parking Slots</h2>
            <p className="text-sm text-muted-foreground">
              Click 4 corners to define each parking slot.
              <span className="ml-2 font-medium text-blue-600">
                {currentPoints.length}/4 points
              </span>
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleUndo} disabled={slots.length === 0 && currentPoints.length === 0}>
              <Undo className="w-4 h-4 mr-1" /> Undo
            </Button>
            <Button variant="outline" size="sm" onClick={handleClear} disabled={slots.length === 0 && currentPoints.length === 0}>
              <Trash2 className="w-4 h-4 mr-1" /> Clear All
            </Button>
          </div>
        </div>

        <div className="border rounded-lg overflow-auto bg-gray-100 flex justify-center p-2" style={{ maxHeight: '500px' }}>
          <canvas
            ref={canvasRef}
            onClick={handleCanvasClick}
            className="cursor-crosshair"
          />
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-4">
            <p className="text-sm font-medium">
              {slots.length} slot{slots.length !== 1 ? 's' : ''} defined
            </p>
            {slots.length > 0 && (
              <div className="flex gap-1">
                {slots.map(s => (
                  <span key={s.slot_number} className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                    {s.slot_number}
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </Button>
            <Button
              onClick={() => onComplete(slots)}
              disabled={slots.length === 0}
            >
              <Check className="w-4 h-4 mr-1" /> Continue ({slots.length} slots)
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
}
