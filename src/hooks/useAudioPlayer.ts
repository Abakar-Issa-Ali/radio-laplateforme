import { useState, useRef, useCallback, useEffect } from 'react'
import { getStreamUrl } from '../services/azuracast'

export const useAudioPlayer = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolumeState] = useState(0.8)
  const [isMuted, setIsMuted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const audio = new Audio()
    audio.preload = 'none'
    audio.volume = volume

    audio.addEventListener('playing', () => {
      setIsPlaying(true)
      setIsLoading(false)
    })
    audio.addEventListener('waiting', () => setIsLoading(true))
    audio.addEventListener('pause', () => setIsPlaying(false))
    audio.addEventListener('error', () => {
      setIsPlaying(false)
      setIsLoading(false)
    })

    audioRef.current = audio

    return () => {
      audio.pause()
      audio.src = ''
    }
  }, [])

  const play = useCallback(() => {
    if (!audioRef.current) return
    setIsLoading(true)
    audioRef.current.src = `${getStreamUrl()}?t=${Date.now()}`
    audioRef.current.play().catch(() => setIsLoading(false))
  }, [])

  const pause = useCallback(() => {
    if (!audioRef.current) return
    audioRef.current.pause()
    audioRef.current.src = ''
    setIsPlaying(false)
  }, [])

  const togglePlay = useCallback(() => {
    if (isPlaying) {
      pause()
    } else {
      play()
    }
  }, [isPlaying, play, pause])

  const setVolume = useCallback((value: number) => {
    if (!audioRef.current) return
    audioRef.current.volume = value
    setVolumeState(value)
    if (value > 0) setIsMuted(false)
  }, [])

  const toggleMute = useCallback(() => {
    if (!audioRef.current) return
    const newMuted = !isMuted
    audioRef.current.muted = newMuted
    setIsMuted(newMuted)
  }, [isMuted])

  return {
    isPlaying,
    isLoading,
    volume,
    isMuted,
    togglePlay,
    setVolume,
    toggleMute,
    play,
    pause,
  }
}