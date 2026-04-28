import { useState, useEffect } from 'react'
import { Download, Music, Calendar, HardDrive, Loader, AlertCircle, RefreshCw, Trash2, Pencil, X, Check } from 'lucide-react'
import styles from './Archive.module.css'

interface Recording {
  name: string
  type: string
  mtime: string
  size: number
}

const formatSize = (bytes: number) => {
  const mb = bytes / (1024 * 1024)
  return mb >= 1 ? `${mb.toFixed(1)} MB` : `${(bytes / 1024).toFixed(0)} KB`
}

const formatDate = (mtime: string) => {
  const date = new Date(mtime)
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

const formatTime = (mtime: string) => {
  const date = new Date(mtime)
  return date.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

const formatDuration = (name: string, mtime: string) => {
  const isAutoName = /^stream_\d{8}-\d{6}\.mp3$/.test(name)
  if (!isAutoName) {
    return name.replace('.mp3', '')
  }
  const date = new Date(mtime)
  const day = date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
  const time = date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  return `Émission du ${day} à ${time}`
}

export default function Archive() {
  const [recordings, setRecordings] = useState<Recording[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deletingFile, setDeletingFile] = useState<string | null>(null)
  const [renamingFile, setRenamingFile] = useState<string | null>(null)
  const [newName, setNewName] = useState('')

  const fetchRecordings = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/recordings/?t=${Date.now()}`)
      const data = await res.json()
      const files = data.filter((f: Recording) => f.type === 'file' && f.name.endsWith('.mp3'))
      files.sort((a: Recording, b: Recording) => new Date(b.mtime).getTime() - new Date(a.mtime).getTime())
      setRecordings(files)
      setError(null)
    } catch {
      setError('Impossible de charger les enregistrements')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRecordings()
  }, [])

  const handleDelete = async (filename: string, mtime: string) => {
    if (!confirm(`Supprimer "${formatDuration(filename, mtime)}" ?`)) return
    setDeletingFile(filename)
    try {
      const res = await fetch(`http://167.99.214.245:3000/api-recordings/${encodeURIComponent(filename)}`, { method: 'DELETE' })
      if (res.ok) {
        setRecordings(prev => prev.filter(r => r.name !== filename))
      }
    } catch {
      alert('Erreur lors de la suppression')
    } finally {
      setDeletingFile(null)
    }
  }
const handleRename = async (filename: string) => {
  if (!newName.trim()) return
  const finalName = newName.endsWith('.mp3') ? newName : `${newName}.mp3`
  console.log('Renaming:', filename, '->', finalName)
  try {
    const res = await fetch(`http://167.99.214.245:3000/api-recordings/${encodeURIComponent(filename)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newName: finalName }),
    })
    console.log('Response status:', res.status)
    const data = await res.json()
    console.log('Response data:', data)
    if (res.ok) {
      setRenamingFile(null)
      setNewName('')
      setLoading(true)
      const r = await fetch(`/recordings/?t=${Date.now()}`)
      const listData = await r.json()
      const files = listData.filter((f: Recording) => f.type === 'file' && f.name.endsWith('.mp3'))
      files.sort((a: Recording, b: Recording) => new Date(b.mtime).getTime() - new Date(a.mtime).getTime())
      setRecordings(files)
      setLoading(false)
    }
  } catch (err) {
    console.log('Error:', err)
    alert('Erreur lors du renommage')
  }
}

  const totalSize = recordings.reduce((acc, r) => acc + r.size, 0)

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Archives</h1>
          <p className={styles.subtitle}>Enregistrements des émissions en direct</p>
        </div>
        <div className={styles.headerRight}>
          {recordings.length > 0 && (
            <div className={styles.stats}>
              <span className={styles.statItem}>
                <Music size={14} />
                {recordings.length} émission{recordings.length > 1 ? 's' : ''}
              </span>
              <span className={styles.statItem}>
                <HardDrive size={14} />
                {formatSize(totalSize)}
              </span>
            </div>
          )}
          <button className={styles.refreshBtn} onClick={fetchRecordings} disabled={loading}>
            <RefreshCw size={15} className={loading ? styles.spinning : ''} />
            Actualiser
          </button>
        </div>
      </div>

      {loading ? (
        <div className={styles.loadingState}>
          <Loader size={28} className={styles.spinning} />
          <span>Chargement des enregistrements...</span>
        </div>
      ) : error ? (
        <div className={styles.errorState}>
          <AlertCircle size={24} />
          <span>{error}</span>
        </div>
      ) : recordings.length === 0 ? (
        <div className={styles.emptyState}>
          <Music size={48} />
          <h3>Aucun enregistrement</h3>
          <p>Les émissions en direct seront automatiquement enregistrées ici.</p>
        </div>
      ) : (
        <div className={styles.list}>
           {recordings.map((recording) => (
             <div key={recording.name} className={styles.item}>
              <div className={styles.itemIcon}>
                <Music size={20} />
              </div>

              <div className={styles.itemInfo}>
                {renamingFile === recording.name ? (
                  <div className={styles.renameInput}>
                    <input
                      type="text"
                      value={newName}
                      onChange={e => setNewName(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') handleRename(recording.name)
                        if (e.key === 'Escape') { setRenamingFile(null); setNewName('') }
                      }}
                      placeholder="Nouveau nom..."
                      autoFocus
                      className={styles.input}
                    />
                    <button className={styles.iconBtnSuccess} onClick={() => handleRename(recording.name)}>
                      <Check size={14} />
                    </button>
                    <button className={styles.iconBtnDanger} onClick={() => { setRenamingFile(null); setNewName('') }}>
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <h3 className={styles.itemTitle}>{formatDuration(recording.name, recording.mtime)}</h3>
                )}
                <div className={styles.itemMeta}>
                  <span className={styles.metaItem}>
                    <Calendar size={13} />
                    {formatDate(recording.mtime)} à {formatTime(recording.mtime)}
                  </span>
                  <span className={styles.metaItem}>
                    <HardDrive size={13} />
                    {formatSize(recording.size)}
                  </span>
                </div>
              </div>

              <div className={styles.actions}>
                <button
                  className={styles.iconBtn}
                  title="Renommer"
                  onClick={() => {
                    setRenamingFile(recording.name)
                    setNewName(recording.name.replace('.mp3', ''))
                  }}
                >
                  <Pencil size={15} />
                </button>
                <a
                  href={`/recordings/${recording.name}`}
                  download={recording.name}
                  className={styles.downloadBtn}
                >
                  <Download size={15} />
                  Télécharger
                </a>
                <button
                  className={styles.deleteBtn}
                  title="Supprimer"
                  onClick={() => handleDelete(recording.name, recording.mtime)}
                  disabled={deletingFile === recording.name}
                >
                  {deletingFile === recording.name
                    ? <Loader size={15} className={styles.spinning} />
                    : <Trash2 size={15} />
                  }
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}