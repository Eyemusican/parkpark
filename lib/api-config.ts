/**
 * Centralized API Configuration
 * This file contains all API endpoints and configuration
 */

// Get API URL from environment variable or use default
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';
export const VIDEO_FEED_URL = process.env.NEXT_PUBLIC_VIDEO_FEED_URL || 'http://localhost:5000/video_feed';

// API Endpoints
export const API_ENDPOINTS = {
  // Parking Areas
  parkingAreas: `${API_BASE_URL}/parking-areas`,
  parkingAreaById: (id: number) => `${API_BASE_URL}/parking-areas/${id}`,
  
  // Parking Slots
  parkingSlots: `${API_BASE_URL}/parking-slots`,
  parkingSlotsByArea: (areaId: number) => `${API_BASE_URL}/parking-slots?parking_id=${areaId}`,
  parkingSlotById: (id: number) => `${API_BASE_URL}/parking-slots/${id}`,
  parkingSlotsStatus: `${API_BASE_URL}/parking/slots/status`,
  
  // Parking Events
  parkingEvents: `${API_BASE_URL}/parking-events`,
  parkingEventById: (id: number) => `${API_BASE_URL}/parking-events/${id}`,
  activeEvents: `${API_BASE_URL}/parking/active`,
  
  // Violations
  violations: `${API_BASE_URL}/violations`,
  violationsSummary: `${API_BASE_URL}/violations/summary`,
  violationById: (id: string) => `${API_BASE_URL}/violations/${id}`,
  violationsResolve: (id: string) => `${API_BASE_URL}/violations/${id}/resolve`,
  
  // Duration Tracking
  parkingDurations: `${API_BASE_URL}/parking/durations`,
  
  // Video Feed
  videoFeed: VIDEO_FEED_URL,
  videoStatus: `${API_URL}/video_status`,
  videoStart: `${API_URL}/start_video`,
  videoStop: `${API_URL}/stop_video`,
  
  // System
  health: `${API_URL}/`,
} as const;

/**
 * Fetch wrapper with error handling
 */
export async function apiFetch<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  try {
    const response = await fetch(endpoint, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API Fetch Error:', error);
    throw error;
  }
}

/**
 * Check if backend is reachable
 */
export async function checkBackendHealth(): Promise<boolean> {
  try {
    const response = await fetch(API_ENDPOINTS.health, {
      method: 'GET',
      cache: 'no-store',
    });
    return response.ok;
  } catch (error) {
    console.error('Backend health check failed:', error);
    return false;
  }
}
