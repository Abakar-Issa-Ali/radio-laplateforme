import { useState } from 'react'
import { Play, Pause, Volume2, VolumeX, Music, Clock, Loader } from 'lucide-react'
import { useNowPlaying } from '../../hooks/useNowPlaying'
import { useAudioPlayer } from '../../hooks/useAudioPlayer'
import styles from './PublicPlayer.module.css'

/* ---- Vagues SVG background ---- */
const WavePath = () => (
  <>
    <path
      d="M0,80 C150,20 350,140 500,80 C650,20 850,140 1000,80
         C1150,20 1350,140 1500,80 C1650,20 1850,140 2000,80 L2000,200 L0,200 Z"
      fill="white"
    />
  </>
)

const WaveBg = () => (
  <div className={styles.waveBg}>
    <svg viewBox="0 0 2000 200" preserveAspectRatio="none">
      <WavePath />
    </svg>
    <svg viewBox="0 0 2000 200" preserveAspectRatio="none" className={styles.wave2}>
      <path
        d="M0,100 C200,40 400,160 600,100 C800,40 1000,160 1200,100
           C1400,40 1600,160 1800,100 C1900,70 1950,130 2000,100 L2000,200 L0,200 Z"
        fill="white"
      />
    </svg>
    <svg viewBox="0 0 2000 200" preserveAspectRatio="none" className={styles.wave3}>
      <path
        d="M0,120 C250,60 450,180 700,120 C950,60 1150,180 1400,120
           C1600,70 1800,160 2000,120 L2000,200 L0,200 Z"
        fill="white"
      />
    </svg>
  </div>
)

/* ---- Animation barres audio ---- */
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

  const song = data?.now_playing?.song
  const isLive = data?.live?.is_live ?? false
  const streamerName = data?.live?.streamer_name ?? ''
  const history = data?.song_history ?? []

  return (
    <div className={styles.container}>
      {/* Background vagues */}
      <WaveBg />

      <div className={styles.content}>

        {/* Header : logo + auditeurs */}
        <header className={styles.header}>
          <div className={styles.logoBox}>
            <span className={styles.logoTitle}>Radio EPHEM7RE</span>
            <span className={styles.logoSub}>Marseille · Web Radio</span>
          </div>

          <div className={styles.listeners}>
            {isLive && (
              <div className={styles.liveBadge}>
                <span className={styles.liveDot} />
                En direct
              </div>
            )}

          </div>
        </header>

        {/* Label section */}
        <div className={styles.sectionLabel}>À l'antenne</div>

        {/* Player card */}
        <main className={styles.playerCard}>

          {/* Pochette */}
          <div className={styles.artContainer}>
            {song?.art ? (
              <img src={song.art} alt="Pochette" className={styles.art} />
            ) : (
              <div className={styles.artPlaceholder}>
                <Music size={40} strokeWidth={1.5} />
                <span className={styles.artPlaceholderText}>En diffusion</span>
              </div>
            )}
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
                  {song?.title || 'Radio La Plateforme'}
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
              <Loader size={26} className={styles.spinner} />
            ) : isPlaying ? (
              <Pause size={26} />
            ) : (
              <Play size={26} />
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
                {item.song.art && (
                  <img src={item.song.art} alt="" className={styles.historyArt} />
                )}
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
          <span>·</span>
          <span>AzuraCast</span>
        </footer>
      </div>
    </div>
  )
}