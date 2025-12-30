"use client"

import { useEffect, useState } from "react"
import { Camera, RefreshCw, Plus, Wifi, WifiOff, AlertTriangle, Settings, Play, Square, Trash2 } from "lucide-react"
import { API_ENDPOINTS } from "@/lib/api-config"

interface CameraData {
  camera_id: number
  camera_name: string
  rtsp_url: string
  parking_id: number | null
  parking_name: string | null
  has_auth: boolean
  buffer_size: number
  timeout_seconds: number
  retry_interval_seconds: number
  max_retries: number
  is_active: boolean
  db_status: string
  live_status: string
  fps: number
  last_connected_at: string | null
  created_at: string | null
}

interface CameraHealthSummary {
  total: number
  connected: number
  disconnected: number
  error: number
  reconnecting: number
  cameras: CameraData[]
}

export function CameraManagement() {
  const [cameras, setCameras] = useState<CameraData[]>([])
  const [healthSummary, setHealthSummary] = useState<CameraHealthSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAddDialog, setShowAddDialog] = useState(false)

  // Form state for adding camera
  const [newCamera, setNewCamera] = useState({
    camera_name: "",
    rtsp_url: "",
    parking_id: "",
    username: "",
    password: "",
  })

  useEffect(() => {
    fetchCameras()
    const interval = setInterval(fetchCameras, 5000) // Refresh every 5 seconds
    return () => clearInterval(interval)
  }, [])

  const fetchCameras = async () => {
    try {
      const [camerasRes, healthRes] = await Promise.all([
        fetch(API_ENDPOINTS.cameras, { cache: "no-store" }),
        fetch(API_ENDPOINTS.camerasHealthSummary, { cache: "no-store" }),
      ])

      if (camerasRes.ok) {
        const data = await camerasRes.json()
        setCameras(data)
      }

      if (healthRes.ok) {
        const health = await healthRes.json()
        setHealthSummary(health)
      }

      setError(null)
    } catch (err) {
      console.error("Error fetching cameras:", err)
      setError("Failed to load camera data")
    } finally {
      setLoading(false)
    }
  }

  const handleConnect = async (cameraId: number) => {
    try {
      const response = await fetch(API_ENDPOINTS.cameraConnect(cameraId), {
        method: "POST",
      })
      if (response.ok) {
        fetchCameras()
      }
    } catch (err) {
      console.error("Error connecting camera:", err)
    }
  }

  const handleDisconnect = async (cameraId: number) => {
    try {
      const response = await fetch(API_ENDPOINTS.cameraDisconnect(cameraId), {
        method: "POST",
      })
      if (response.ok) {
        fetchCameras()
      }
    } catch (err) {
      console.error("Error disconnecting camera:", err)
    }
  }

  const handleDelete = async (cameraId: number) => {
    if (!confirm("Are you sure you want to delete this camera?")) return

    try {
      const response = await fetch(API_ENDPOINTS.cameraById(cameraId), {
        method: "DELETE",
      })
      if (response.ok) {
        fetchCameras()
      }
    } catch (err) {
      console.error("Error deleting camera:", err)
    }
  }

  const handleAddCamera = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.cameras, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          camera_name: newCamera.camera_name,
          rtsp_url: newCamera.rtsp_url,
          parking_id: newCamera.parking_id ? parseInt(newCamera.parking_id) : null,
          username: newCamera.username || null,
          password: newCamera.password || null,
        }),
      })

      if (response.ok) {
        setShowAddDialog(false)
        setNewCamera({ camera_name: "", rtsp_url: "", parking_id: "", username: "", password: "" })
        fetchCameras()
      }
    } catch (err) {
      console.error("Error adding camera:", err)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "CONNECTED":
        return <Wifi className="h-4 w-4 text-green-500" />
      case "DISCONNECTED":
        return <WifiOff className="h-4 w-4 text-gray-400" />
      case "CONNECTING":
      case "RECONNECTING":
        return <RefreshCw className="h-4 w-4 text-yellow-500 animate-spin" />
      case "ERROR":
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      default:
        return <WifiOff className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      CONNECTED: "bg-green-100 text-green-800 border-green-200",
      DISCONNECTED: "bg-gray-100 text-gray-800 border-gray-200",
      CONNECTING: "bg-yellow-100 text-yellow-800 border-yellow-200",
      RECONNECTING: "bg-yellow-100 text-yellow-800 border-yellow-200",
      ERROR: "bg-red-100 text-red-800 border-red-200",
    }
    return styles[status] || "bg-gray-100 text-gray-800 border-gray-200"
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 text-blue-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Camera className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Camera Management</h2>
            <p className="text-sm text-gray-500">Manage RTSP cameras and video sources</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchCameras}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 border rounded-lg hover:bg-gray-50"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
          <button
            onClick={() => setShowAddDialog(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Add Camera
          </button>
        </div>
      </div>

      {/* Health Summary Cards */}
      {healthSummary && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white p-4 rounded-xl border shadow-sm">
            <div className="text-2xl font-bold text-gray-900">{healthSummary.total}</div>
            <div className="text-sm text-gray-500">Total Cameras</div>
          </div>
          <div className="bg-white p-4 rounded-xl border shadow-sm">
            <div className="text-2xl font-bold text-green-600">{healthSummary.connected}</div>
            <div className="text-sm text-gray-500">Connected</div>
          </div>
          <div className="bg-white p-4 rounded-xl border shadow-sm">
            <div className="text-2xl font-bold text-gray-400">{healthSummary.disconnected}</div>
            <div className="text-sm text-gray-500">Disconnected</div>
          </div>
          <div className="bg-white p-4 rounded-xl border shadow-sm">
            <div className="text-2xl font-bold text-yellow-500">{healthSummary.reconnecting}</div>
            <div className="text-sm text-gray-500">Reconnecting</div>
          </div>
          <div className="bg-white p-4 rounded-xl border shadow-sm">
            <div className="text-2xl font-bold text-red-500">{healthSummary.error}</div>
            <div className="text-sm text-gray-500">Error</div>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      )}

      {/* Camera List */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b bg-gray-50">
          <h3 className="font-medium text-gray-900">Cameras ({cameras.length})</h3>
        </div>

        {cameras.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Camera className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>No cameras configured</p>
            <p className="text-sm">Click &quot;Add Camera&quot; to add an RTSP camera</p>
          </div>
        ) : (
          <div className="divide-y">
            {cameras.map((camera) => (
              <div key={camera.camera_id} className="p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {/* Status Icon */}
                    <div className="p-2 bg-gray-100 rounded-lg">
                      {getStatusIcon(camera.live_status)}
                    </div>

                    {/* Camera Info */}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">{camera.camera_name}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${getStatusBadge(camera.live_status)}`}>
                          {camera.live_status}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded">
                          {camera.rtsp_url.length > 50 ? camera.rtsp_url.substring(0, 50) + "..." : camera.rtsp_url}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                        {camera.parking_name && (
                          <span>Area: {camera.parking_name}</span>
                        )}
                        {camera.fps > 0 && (
                          <span>FPS: {camera.fps}</span>
                        )}
                        {camera.has_auth && (
                          <span className="text-yellow-600">Auth enabled</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {camera.live_status === "CONNECTED" ? (
                      <button
                        onClick={() => handleDisconnect(camera.camera_id)}
                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
                        title="Disconnect"
                      >
                        <Square className="h-4 w-4" />
                      </button>
                    ) : (
                      <button
                        onClick={() => handleConnect(camera.camera_id)}
                        className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg"
                        title="Connect"
                      >
                        <Play className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(camera.camera_id)}
                      className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Camera Dialog */}
      {showAddDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
            <div className="px-6 py-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Add New Camera</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Camera Name</label>
                <input
                  type="text"
                  value={newCamera.camera_name}
                  onChange={(e) => setNewCamera({ ...newCamera, camera_name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Parking Lot A - Entrance"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">RTSP URL</label>
                <input
                  type="text"
                  value={newCamera.rtsp_url}
                  onChange={(e) => setNewCamera({ ...newCamera, rtsp_url: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                  placeholder="rtsp://192.168.1.100:554/stream"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Parking Area ID (optional)</label>
                <input
                  type="number"
                  value={newCamera.parking_id}
                  onChange={(e) => setNewCamera({ ...newCamera, parking_id: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="1"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Username (optional)</label>
                  <input
                    type="text"
                    value={newCamera.username}
                    onChange={(e) => setNewCamera({ ...newCamera, username: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="admin"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password (optional)</label>
                  <input
                    type="password"
                    value={newCamera.password}
                    onChange={(e) => setNewCamera({ ...newCamera, password: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="******"
                  />
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-3 rounded-b-xl">
              <button
                onClick={() => setShowAddDialog(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
              >
                Cancel
              </button>
              <button
                onClick={handleAddCamera}
                disabled={!newCamera.camera_name || !newCamera.rtsp_url}
                className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Camera
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
