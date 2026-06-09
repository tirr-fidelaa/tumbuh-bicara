import { NavLink } from 'react-router-dom'
import styles from './Navbar.module.css'

export default function Navbar() {
  return (
    <nav className={styles.nav}>
      <div className={styles.logo}>Tumbuh<span>Bicara</span></div>
      <div className={styles.pills}>
        {[['/', 'Beranda'], ['/riwayat', 'Riwayat']].map(([to, label]) => (
          <NavLink key={to} to={to} end
            className={({ isActive }) => `${styles.pill} ${isActive ? styles.active : ''}`}>
            {label}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
