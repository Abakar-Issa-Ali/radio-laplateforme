import { useState, useEffect, useCallback } from 'react'
import {
  Radio, Users, Music, Mic, Play, Square, SkipForward,
  RefreshCw, Circle, Loader, AlertCircle, CheckCircle,
  Headphones, Copy, Wifi, WifiOff
} from 'lucide-react'
import { useNowPlaying } from '../../hooks/useNowPlaying'
import {
  restartStation, startFrontend, stopFrontend,
  skipSong, getStationStatus
} from '../../services/azuracast'
import type { StationStatus } from '../../services/azuracast'
import styles from './AdminDashboard.module.css'

interface Toast {
  id: number
  message: string
  type: 'success' | 'error'
}

export default function AdminDashboard() {
  const { data, loading, error, refetch } = useNowPlaying(5000)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [toasts, setToasts] = useState<Toast[]>([])
  const [status, setStatus] = useState<StationStatus | null>(null)

  const fetchStatus = useCallback(async () => {
    try {
      const s = await getStationStatus()
      setStatus(s)
    } catch {
      // ignore
    }
  }, [])

  useEffect(() => {
    fetchStatus()
    const timer = setInterval(fetchStatus, 5000)
    return () => clearInterval(timer)
  }, [fetchStatus])

  const addToast = (message: string, type: 'success' | 'error') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000)
  }

  const runAction = async (key: string, fn: () => Promise<unknown>, label: string) => {
    setActionLoading(key)
    try {
      const result = await fn() as { success?: boolean, message?: string }
      if (result?.success === false) {
        addToast(`Erreur : ${result.message || label + ' a échoué'}`, 'error')
      } else {
        addToast(`${label} effectué avec succès`, 'success')
      }
      setTimeout(() => { refetch(); fetchStatus() }, 1500)
    } catch {
      addToast(`Erreur : ${label} a échoué.`, 'error')
    } finally {
      setActionLoading(null)
    }
  }

  const song = data?.now_playing?.song
  const listeners = data?.listeners?.current ?? 0
  const isLive = data?.live?.is_live ?? false
  const streamerName = data?.live?.streamer_name ?? ''

  return (
    <div className={styles.page}>
      {/* Toasts */}
      <div className={styles.toasts}>
        {toasts.map(t => (
          <div key={t.id} className={`${styles.toast} ${styles[t.type]}`}>
            {t.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
            {t.message}
          </div>
        ))}
      </div>

      {/* Top Bar */}
      <div className={styles.topBar}>
        <div>
          <h1 className={styles.pageTitle}>Tableau de bord</h1>
          <p className={styles.pageSubtitle}>Contrôle de la station en temps réel</p>
        </div>
        <button className={styles.refreshBtn} onClick={refetch} disabled={loading}>
          <RefreshCw size={16} className={loading ? styles.spinning : ''} />
          Actualiser
        </button>
      </div>

      {/* Stats Cards */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'rgba(3,172,173,0.1)', color: 'var(--turquoise)' }}>
            <Users size={20} />
          </div>
          <div>
            <p className={styles.statLabel}>Auditeurs</p>
            <p className={styles.statValue}>{listeners}</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: isLive ? 'rgba(239,68,68,0.1)' : 'rgba(20,62,110,0.1)', color: isLive ? '#ef4444' : 'var(--blue)' }}>
            <Mic size={20} />
          </div>
          <div>
            <p className={styles.statLabel}>Mode</p>
            <p className={styles.statValue}>{isLive ? 'Live DJ' : 'AutoDJ'}</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'rgba(20,62,110,0.1)', color: 'var(--blue)' }}>
            <Music size={20} />
          </div>
          <div>
            <p className={styles.statLabel}>En cours</p>
            <p className={styles.statValue} style={{ fontSize: '0.95rem' }}>
              {song?.title || '—'}
            </p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'rgba(3,172,173,0.1)', color: 'var(--turquoise)' }}>
            <Radio size={20} />
          </div>
          <div>
            <p className={styles.statLabel}>Streamer</p>
            <p className={styles.statValue}>{isLive ? streamerName || 'Connecté' : '—'}</p>
          </div>
        </div>
      </div>

      {/* Now Playing */}
      <div className={styles.nowPlayingCard}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>À l'antenne</h2>
          {isLive && (
            <span className={styles.liveBadge}>
              <Circle size={8} fill="currentColor" />
              En direct
            </span>
          )}
        </div>

        {loading ? (
          <div className={styles.loadingState}>
            <Loader size={24} className={styles.spinning} />
            <span>Chargement...</span>
          </div>
        ) : error ? (
          <div className={styles.errorState}>
            <AlertCircle size={24} />
            <span>{error}</span>
          </div>
        ) : (
          <div className={styles.nowPlayingContent}>
            {song?.art && <img src={song.art} alt="" className={styles.nowPlayingArt} />}
            <div>
              <p className={styles.nowPlayingTitle}>{song?.title || 'Station hors ligne'}</p>
              <p className={styles.nowPlayingArtist}>{song?.artist || '—'}</p>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className={styles.controlsGrid}>
        {/* Icecast */}
        <div className={styles.controlCard}>
          <h2 className={styles.cardTitle}>Icecast (Diffusion)</h2>
          <p className={styles.cardDesc}>
            Statut : {status ? (
              <span style={{ color: status.frontendRunning ? 'var(--success)' : 'var(--danger)', fontWeight: 600 }}>
                {status.frontendRunning ? '● En cours' : '● Arrêté'}
              </span>
            ) : '…'}
          </p>
          <div className={styles.btnGroup}>
            <button
              className={`${styles.actionBtn} ${styles.btnPrimary}`}
              onClick={() => runAction('restart', restartStation, 'Redémarrage')}
              disabled={!!actionLoading}
            >
              {actionLoading === 'restart' ? <Loader size={16} className={styles.spinning} /> : <RefreshCw size={16} />}
              Redémarrer la station
            </button>
            <button
              className={`${styles.actionBtn} ${styles.btnSuccess}`}
              onClick={() => runAction('startFront', startFrontend, 'Démarrage Icecast')}
              disabled={!!actionLoading || status?.frontendRunning === true}
            >
              {actionLoading === 'startFront' ? <Loader size={16} className={styles.spinning} /> : <Play size={16} />}
              Démarrer Icecast
            </button>
            <button
              className={`${styles.actionBtn} ${styles.btnDanger}`}
              onClick={() => runAction('stopFront', stopFrontend, 'Arrêt Icecast')}
              disabled={!!actionLoading || status?.frontendRunning === false}
            >
              {actionLoading === 'stopFront' ? <Loader size={16} className={styles.spinning} /> : <Square size={16} />}
              Arrêter Icecast
            </button>
          </div>
        </div>

        {/* AutoDJ */}
        <div className={styles.controlCard}>
          <h2 className={styles.cardTitle}>AutoDJ (Liquidsoap)</h2>
          <p className={styles.cardDesc}>
            Statut : {status ? (
              <span style={{ color: status.backendRunning ? 'var(--success)' : 'var(--danger)', fontWeight: 600 }}>
                {status.backendRunning ? '● En cours' : '● Arrêté'}
              </span>
            ) : '…'}
          </p>
          <div className={styles.btnGroup}>
            <button
              className={`${styles.actionBtn} ${styles.btnPrimary}`}
              onClick={() => runAction('restartBack', restartStation, 'Redémarrage station')}
              disabled={!!actionLoading}
            >
              {actionLoading === 'restartBack' ? <Loader size={16} className={styles.spinning} /> : <RefreshCw size={16} />}
              Redémarrer la station complète
            </button>
            <button
              className={`${styles.actionBtn} ${styles.btnSecondary}`}
              onClick={() => runAction('skip', skipSong, 'Passage chanson')}
              disabled={!!actionLoading || !status?.backendRunning}
            >
              {actionLoading === 'skip' ? <Loader size={16} className={styles.spinning} /> : <SkipForward size={16} />}
              Passer la chanson
            </button>
          </div>
        </div>
      </div>

      {/* DJ Panel */}
      <div className={styles.djPanel}>
        <div className={styles.djHeader}>
          <div className={styles.djHeaderLeft}>
            <div className={`${styles.djIcon} ${isLive ? styles.djIconLive : ''}`}>
              <Headphones size={22} />
            </div>
            <div>
              <h2 className={styles.cardTitle}>Panneau DJ</h2>
              <p className={styles.cardDesc} style={{ marginBottom: 0 }}>
                Connexion via BUTT (Broadcast Using This Tool)
              </p>
            </div>
          </div>
          <div className={`${styles.djStatusBadge} ${isLive ? styles.djStatusLive : styles.djStatusOff}`}>
            {isLive ? <Wifi size={14} /> : <WifiOff size={14} />}
            {isLive ? `En direct — ${streamerName || 'DJ connecté'}` : 'Hors antenne'}
          </div>
        </div>

        <div className={styles.djCredentials}>
          <h3 className={styles.djCredTitle}>Identifiants de connexion BUTT</h3>
          <div className={styles.djCredGrid}>
            {[
              { label: 'Serveur', value: '167.99.214.245' },
              { label: 'Port', value: '8005' },
              { label: 'Type', value: 'Icecast' },
              { label: 'Point de montage', value: '/' },
              { label: 'Utilisateur', value: 'abakarali025@gmail.com' },
              { label: 'Bitrate recommandé', value: '128 kbps' },
            ].map(({ label, value }) => (
              <div key={label} className={styles.djCredItem}>
                <span className={styles.djCredLabel}>{label}</span>
                <div className={styles.djCredValue}>
                  <code>{value}</code>
                  <button
                    className={styles.copyBtn}
                    onClick={() => {
                      navigator.clipboard.writeText(value)
                      addToast(`"${value}" copié !`, 'success')
                    }}
                  >
                    <Copy size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {isLive && (
          <div className={styles.djLiveInfo}>
            <Circle size={10} fill="#ef4444" color="#ef4444" />
            <span>Diffusion en direct active — {streamerName || 'DJ'} est à l'antenne</span>
          </div>
        )}
      </div>
    </div>
  )
}