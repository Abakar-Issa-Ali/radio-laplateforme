import axios from 'axios'

const STATION_ID = 1
const API_KEY = 'a4e30cfb3133a9d7:6b3101ddec208bdb77ab4c6925b89de1'
const PUBLIC_BASE = 'http://167.99.214.245'

// API via proxy Vite (évite les problèmes CORS)
const api = axios.create({
  baseURL: '/api',
  headers: {
    'X-API-Key': API_KEY,
    'Content-Type': 'application/json',
  },
  withCredentials: false,
  validateStatus: (status) => status < 600,
})

export interface NowPlaying {
  now_playing: {
    song: {
      title: string
      artist: string
      art: string
    }
    elapsed: number
    duration: number
  }
  listeners: {
    current: number
    unique: number
  }
  live: {
    is_live: boolean
    streamer_name: string
  }
  song_history: Array<{
    song: {
      title: string
      artist: string
      art: string
    }
    played_at: number
  }>
  station: {
    name: string
    description: string
    public_player_url: string
    listen_url: string
  }
}

export interface StationStatus {
  backend_running: boolean
  frontend_running: boolean
}

// Public endpoint (direct, pas de clé API nécessaire)
export const getNowPlaying = async (): Promise<NowPlaying> => {
  const { data } = await axios.get(`/api/nowplaying/${STATION_ID}`)
  return data
}

// Admin endpoints via proxy
export const getStationStatus = async (): Promise<StationStatus> => {
  const { data } = await api.get(`/station/${STATION_ID}/status`)
  return data
}

export const restartStation = async () => {
  const { data } = await api.post(`/station/${STATION_ID}/restart`)
  return data
}

export const startFrontend = async () => {
  const { data } = await api.post(`/station/${STATION_ID}/frontend/start`)
  return data || { success: true }
}

export const stopFrontend = async () => {
  const { data } = await api.post(`/station/${STATION_ID}/frontend/stop`)
  return data || { success: true }
}

export const startBackend = async () => {
  try {
    const { data } = await api.post(`/station/${STATION_ID}/backend/start`)
    return data || { success: true }
  } catch {
    return { success: true, message: 'Commande envoyée' }
  }
}

export const stopBackend = async () => {
  try {
    const { data } = await api.post(`/station/${STATION_ID}/backend/stop`)
    return data || { success: true }
  } catch {
    return { success: true, message: 'Commande envoyée' }
  }
}

export interface Recording {
  filename: string
  date: string
  size: number
  downloadUrl: string
}

export const getRecordings = async (): Promise<Recording[]> => {
  const { data } = await api.get(`/station/${STATION_ID}/streamers`)
  return data
}

export const skipSong = async () => {
  const { data } = await api.post(`/station/${STATION_ID}/backend/skip`)
  return data || { success: true }
}

export const getStreamUrl = () =>
  `${PUBLIC_BASE}/listen/radio_la_plateforme/radio.mp3`

export const STATION_NAME = 'Radio La Plateforme'
export { STATION_ID, PUBLIC_BASE }

export interface StationStatus {
  backendRunning: boolean
  frontendRunning: boolean
}