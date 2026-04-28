import { Outlet, NavLink } from 'react-router-dom'
import { Radio, Settings, Archive } from 'lucide-react'
import styles from './AdminLayout.module.css'

export default function AdminLayout() {
  return (
    <div className={styles.container}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarLogo}>
          <Radio size={22} />
          <div>
            <span className={styles.sidebarTitle}>Radio</span>
            <span className={styles.sidebarSubtitle}>EPHEM7RE</span>
          </div>
        </div>

        <nav className={styles.nav}>
          <span className={styles.navLabel}>Administration</span>
          <NavLink
            to="/admin"
            end
            className={({ isActive }) =>
              `${styles.navItem} ${isActive ? styles.navActive : ''}`
            }
          >
            <Settings size={16} />
            Tableau de bord
          </NavLink>
          <NavLink
            to="/admin/archive"
            className={({ isActive }) =>
              `${styles.navItem} ${isActive ? styles.navActive : ''}`
            }
          >
            <Archive size={16} />
            Archives
          </NavLink>
        </nav>

        <div className={styles.sidebarFooter}>
          <a href="/" className={styles.publicLink}>
            ← Voir le player public
          </a>
        </div>
      </aside>

      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  )
}