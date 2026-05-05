import { NavLink } from 'react-router-dom'
import styles from './Navbar.module.css'

const links = [
  { to: '/', label: 'Beranda' },
  { to: '/riwayat', label: 'Riwayat' },
]

export default function Navbar() {
  return (
    <nav className={styles.nav}>
      <div className={styles.logo}>
        Tumbuh<span>Bicara</span>
      </div>
      <div className={styles.pills}>
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end
            className={({ isActive }) =>
              `${styles.pill} ${isActive ? styles.active : ''}`
            }
          >
            {l.label}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
