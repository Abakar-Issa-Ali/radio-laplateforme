import { useState, useEffect, useRef } from 'react'
import { Play, Pause, Volume2, VolumeX, Clock, Loader } from 'lucide-react'
import { useNowPlaying } from '../../hooks/useNowPlaying'
import { useAudioPlayer } from '../../hooks/useAudioPlayer'
import styles from './PublicPlayer.module.css'

// Image (utilisée dans la pochette)
const RADIO_LOGO = '/image.gif'

// Canvas vagues dans le logo box
const LogoWaveCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let phaseH = 0
    let phaseV = 0
    let animId: number

    const draw = () => {
      const w = canvas.width
      const h = canvas.height
      // Fond bleu
      ctx.fillStyle = '#3fabff'
      ctx.fillRect(0, 0, w, h)
      // Vagues blanches denses
      ctx.strokeStyle = '#ffffff'
      ctx.lineWidth = 2.2

      const spacing = 18
      const amplitude = 10
      const wavelength = 80
      const numWaves = Math.ceil(h / spacing) + 2

      for (let i = 0; i < numWaves; i++) {
        const baseY = i * spacing + Math.sin(phaseV * 0.025 + i * 0.6) * 5
        ctx.beginPath()
        for (let x = 0; x <= w; x += 1.5) {
          const y = baseY + Math.sin((x / wavelength) * Math.PI * 2 + (i * 0.9) - phaseH) * amplitude
          if (x === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        }
        ctx.stroke()
      }
      phaseH += 0.022
      phaseV += 0.5
      animId = requestAnimationFrame(draw)
    }
    draw()

    return () => { cancelAnimationFrame(animId) }
  }, [])

  return <canvas ref={canvasRef} width={0} height={100} className={styles.logoCanvas} />
}

// Canvas vagues de fond pleine page
const WaveCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let phaseH = 0
    let phaseV = 0
    let animId: number

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    window.addEventListener('resize', resize)
    resize()

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.strokeStyle = '#ffffff'
      ctx.lineWidth = 2.5

      const spacing = 60
      const amplitude = 26
      const wavelength = 320
      const numWaves = Math.ceil(canvas.height / spacing) + 2

      for (let i = 0; i < numWaves; i++) {
        const baseY = i * spacing + Math.sin(phaseV * 0.03 + i * 0.5) * 8
        ctx.beginPath()
        for (let x = 0; x <= canvas.width; x += 2) {
          const y = baseY + Math.sin((x / wavelength) * Math.PI * 2 + (i * 0.7) - phaseH) * amplitude
          if (x === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        }
        ctx.stroke()
      }
      phaseH += 0.018
      phaseV += 0.6
      animId = requestAnimationFrame(draw)
    }
    draw()

    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(animId)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className={styles.waveBg}
      style={{ opacity: 0.13 }}
    />
  )
}

// Animation barres audio
const WaveAnimation = ({ active }: { active: boolean }) => (
  <div className={`${styles.wave} ${active ? styles.waveActive : ''}`}>
    {[1, 2, 3, 4, 5].map((i) => (
      <span
        key={i}
        style={{
          height: `${8 + i * 3}px`,
          animationDelay: `${i * 0.12}s`,
        }}
      />
    ))}
  </div>
)

const formatTime = (timestamp: number) => {
  const date = new Date(timestamp * 1000)
  return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

export default function PublicPlayer() {
  const { data, loading, error } = useNowPlaying(5000)
  const { isPlaying, isLoading, volume, isMuted, togglePlay, setVolume, toggleMute } =
    useAudioPlayer()
  const [showHistory, setShowHistory] = useState(false)

  const isLive = data?.live?.is_live ?? false
  const streamerName = data?.live?.streamer_name ?? ''
  const history = data?.song_history ?? []
  const song = data?.now_playing?.song

  return (
    <div className={styles.container}>
      <WaveCanvas />

      <div className={styles.content}>

        {/* Logo texte avec fond vagues animées */}
        <header className={styles.header}>
          <div className={styles.logoBox}>
            <LogoWaveCanvas />
            <div className={styles.logoOverlay}>
              <span className={styles.logoTitle}>Radio EPHEM7RE</span>
              <span className={styles.logoSub}>MARSEILLE · WEB RADIO</span>
            </div>
          </div>
          {isLive && (
            <div className={styles.liveBadge}>
              <span className={styles.liveDot} />
              En direct
            </div>
          )}
        </header>

        {/* Séparateur */}
        <div className={styles.sectionLabel}>À l'antenne</div>

        {/* Player card */}
        <main className={styles.playerCard}>

          {/* Pochette — toujours le logo radio */}
          <div className={styles.artContainer}>
            <div className={styles.artPlaceholder}>
              <img
                src={RADIO_LOGO}
                alt="Radio EPHEM7RE"
                className={styles.radioLogoArt}
              />
            </div>
            <WaveAnimation active={isPlaying} />
          </div>

          {/* Infos titre */}
          <div className={styles.songInfo}>
            {loading ? (
              <>
                <div className={styles.shimmer} style={{ width: '65%', height: '26px', marginBottom: '10px' }} />
                <div className={styles.shimmer} style={{ width: '42%', height: '18px' }} />
              </>
            ) : error ? (
              <div className={styles.errorInfo}>Radio temporairement indisponible</div>
            ) : isLive ? (
              <>
                <h1 className={styles.songTitle}>{streamerName || 'DJ Live'}</h1>
                <p className={styles.songArtist}>Émission en direct</p>
              </>
            ) : (
              <>
                <h1 className={styles.songTitle}>
                  {song?.title || 'Radio EPHEM7RE'}
                </h1>
                <p className={styles.songArtist}>
                  {song?.artist || 'En diffusion'}
                </p>
              </>
            )}
          </div>

          {/* Bouton play */}
          <button
            className={styles.playBtn}
            onClick={togglePlay}
            disabled={!!error}
            aria-label={isPlaying ? 'Pause' : 'Écouter'}
          >
            {isLoading ? (
              <Loader size={28} className={styles.spinner} />
            ) : isPlaying ? (
              <Pause size={28} />
            ) : (
              <Play size={28} />
            )}
          </button>

          {/* Volume */}
          <div className={styles.volumeControl}>
            <button className={styles.iconBtn} onClick={toggleMute} aria-label="Mute">
              {isMuted || volume === 0
                ? <VolumeX size={18} />
                : <Volume2 size={18} />
              }
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={isMuted ? 0 : volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className={styles.volumeSlider}
              aria-label="Volume"
            />
          </div>
        </main>

        {/* Historique toggle */}
        {history.length > 0 && (
          <button
            className={styles.historyToggle}
            onClick={() => setShowHistory(!showHistory)}
          >
            <Clock size={14} />
            {showHistory ? "Masquer l'historique" : 'Historique des titres'}
          </button>
        )}

        {/* Historique */}
        {showHistory && history.length > 0 && (
          <div className={styles.history}>
            {history.slice(0, 8).map((item, i) => (
              <div key={i} className={styles.historyItem}>
                {item.song.art
                  ? <img src={item.song.art} alt="" className={styles.historyArt} />
                  : <img src={RADIO_LOGO} alt="" className={styles.historyArt} />
                }
                <div className={styles.historyInfo}>
                  <span className={styles.historyTitle}>{item.song.title}</span>
                  <span className={styles.historyArtist}>{item.song.artist}</span>
                </div>
                <span className={styles.historyTime}>{formatTime(item.played_at)}</span>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <footer className={styles.footer}>
          <span className={styles.footerLogo}>La Plateforme</span>
          <span>·</span>
          <span>Institut Français</span>
          {/* <span>·</span> */}
          {/* <span>AzuraCast</span> */}
        </footer>

      </div>
    </div>
  )
}