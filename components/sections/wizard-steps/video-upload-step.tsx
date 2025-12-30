"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Upload, Video, CheckCircle } from "lucide-react"
import { API_ENDPOINTS, API_URL } from "@/lib/api-config"

interface VideoUploadData {
  videoPath: string
  framePath: string
  frameUrl: string
  frameWidth: number
  frameHeight: number
}

interface VideoUploadStepProps {
  onComplete: (data: VideoUploadData) => void
}

export function VideoUploadStep({ onComplete }: VideoUploadStepProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploadedData, setUploadedData] = useState<VideoUploadData | null>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setError(null)

    const formData = new FormData()
    formData.append('video', file)

    try {
      const response = await fetch(API_ENDPOINTS.videoUpload, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error || 'Upload failed')
      }

      const data = await response.json()
      const uploadData: VideoUploadData = {
        videoPath: data.video_path,
        framePath: data.frame_path,
        frameUrl: `${API_URL}${data.frame_url}`,
        frameWidth: data.width,
        frameHeight: data.height,
      }
      setUploadedData(uploadData)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsUploading(false)
    }
  }

  const handleContinue = () => {
    if (uploadedData) {
      onComplete(uploadedData)
    }
  }

  return (
    <Card className="p-8">
      <div className="text-center space-y-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100">
          <Video className="w-8 h-8 text-blue-600" />
        </div>

        <div>
          <h2 className="text-xl font-bold">Upload Parking Lot Video</h2>
          <p className="text-muted-foreground mt-2">
            Upload a video file of your parking lot. We&apos;ll extract a frame for slot mapping.
          </p>
        </div>

        {!uploadedData ? (
          <div className="border-2 border-dashed rounded-lg p-8 hover:border-blue-400 transition-colors">
            <input
              type="file"
              accept="video/*"
              onChange={handleFileSelect}
              className="hidden"
              id="video-upload"
              disabled={isUploading}
            />
            <label htmlFor="video-upload" className="cursor-pointer block">
              <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground">
                {isUploading ? 'Uploading...' : 'Click to select video file'}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Supported formats: MP4, AVI, MOV, MKV
              </p>
            </label>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-2 text-green-600">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">Video uploaded successfully</span>
            </div>
            <div className="border rounded-lg overflow-hidden bg-gray-100">
              <img
                src={uploadedData.frameUrl}
                alt="Preview frame"
                className="max-w-full mx-auto"
                style={{ maxHeight: '400px' }}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Frame size: {uploadedData.frameWidth} x {uploadedData.frameHeight}
            </p>
          </div>
        )}

        {error && (
          <p className="text-red-500 text-sm">{error}</p>
        )}

        {uploadedData && (
          <Button onClick={handleContinue} size="lg">
            Continue to Draw Slots
          </Button>
        )}
      </div>
    </Card>
  )
}
