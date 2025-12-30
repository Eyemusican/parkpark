"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, Circle, X } from "lucide-react"
import { API_ENDPOINTS } from "@/lib/api-config"

// Step components
import { VideoUploadStep } from "./wizard-steps/video-upload-step"
import { SlotDrawingStep } from "./wizard-steps/slot-drawing-step"
import { MetadataStep } from "./wizard-steps/metadata-step"

interface WizardData {
  videoPath: string
  framePath: string
  frameUrl: string
  frameWidth: number
  frameHeight: number
  slots: Array<{
    slot_number: number
    polygon_points: number[][]
  }>
  parkingName: string
  boundaryPolygon: number[][]
}

interface StepIndicatorProps {
  step: number
  current: number
  label: string
}

function StepIndicator({ step, current, label }: StepIndicatorProps) {
  const isCompleted = current > step
  const isCurrent = current === step

  return (
    <div className="flex items-center gap-2">
      <div className={`
        w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
        ${isCompleted ? 'bg-green-500 text-white' : ''}
        ${isCurrent ? 'bg-blue-500 text-white' : ''}
        ${!isCompleted && !isCurrent ? 'bg-gray-200 text-gray-500' : ''}
      `}>
        {isCompleted ? <CheckCircle className="w-5 h-5" /> : step}
      </div>
      <span className={`text-sm ${isCurrent ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>
        {label}
      </span>
      {step < 3 && (
        <div className={`w-12 h-0.5 mx-2 ${current > step ? 'bg-green-500' : 'bg-gray-200'}`} />
      )}
    </div>
  )
}

interface CreateParkingAreaWizardProps {
  onComplete: () => void
  onCancel: () => void
}

export function CreateParkingAreaWizard({ onComplete, onCancel }: CreateParkingAreaWizardProps) {
  const [step, setStep] = useState(1)
  const [data, setData] = useState<Partial<WizardData>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleVideoUploaded = (videoData: {
    videoPath: string
    framePath: string
    frameUrl: string
    frameWidth: number
    frameHeight: number
  }) => {
    setData(prev => ({ ...prev, ...videoData }))
    setStep(2)
  }

  const handleSlotsDrawn = (slots: Array<{ slot_number: number; polygon_points: number[][] }>) => {
    setData(prev => ({ ...prev, slots }))
    setStep(3)
  }

  const handleMetadataComplete = async (metadata: { name: string; boundary: number[][] }) => {
    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch(API_ENDPOINTS.createParkingAreaWithSlots, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          parking_name: metadata.name,
          slots: data.slots,
          boundary_polygon: metadata.boundary,
          video_source: data.videoPath,
          video_source_type: 'file',
          reference_frame_path: data.framePath,
        })
      })

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error || 'Failed to create parking area')
      }

      const result = await response.json()
      console.log('Parking area created:', result)
      onComplete()
    } catch (err: any) {
      console.error('Error creating parking area:', err)
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header with cancel button */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Create New Parking Area</h1>
        <Button variant="ghost" size="sm" onClick={onCancel}>
          <X className="w-4 h-4 mr-1" /> Cancel
        </Button>
      </div>

      {/* Progress indicator */}
      <div className="flex items-center justify-center py-4">
        <StepIndicator step={1} current={step} label="Upload Video" />
        <StepIndicator step={2} current={step} label="Draw Slots" />
        <StepIndicator step={3} current={step} label="Set Details" />
      </div>

      {/* Error message */}
      {error && (
        <Card className="p-4 bg-red-50 border-red-200">
          <p className="text-red-600 text-sm">{error}</p>
        </Card>
      )}

      {/* Step content */}
      {step === 1 && (
        <VideoUploadStep onComplete={handleVideoUploaded} />
      )}
      {step === 2 && data.frameUrl && (
        <SlotDrawingStep
          frameUrl={data.frameUrl}
          frameWidth={data.frameWidth!}
          frameHeight={data.frameHeight!}
          onComplete={handleSlotsDrawn}
          onBack={() => setStep(1)}
        />
      )}
      {step === 3 && (
        <MetadataStep
          onComplete={handleMetadataComplete}
          onBack={() => setStep(2)}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  )
}
