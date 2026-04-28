import { useState, useEffect, useCallback } from 'react'
import { getNowPlaying } from '../services/azuracast'
import type { NowPlaying } from '../services/azuracast'

export const useNowPlaying = (interval = 5000) => {
  const [data, setData] = useState<NowPlaying | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    try {
      const result = await getNowPlaying()
      setData(result)
      setError(null)
    } catch {
      setError('Impossible de se connecter au serveur radio')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetch()
    const timer = setInterval(fetch, interval)
    return () => clearInterval(timer)
  }, [fetch, interval])

  return { data, loading, error, refetch: fetch }
}