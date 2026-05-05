import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { simpanRiwayat } from '../utils/storage'
import styles from './Hasil.module.css'

const CONFIG = {
  sesuai: {
    icon: '🌿',
    iconBg: 'var(--sage-lt)',
    badgeClass: 'badge badge-sesuai',
    dotClass: 'dot dot-sesuai',
  },
  perkiraan: {
    icon: '🔄',
    iconBg: 'var(--amber-lt)',
    badgeClass: 'badge badge-perkiraan',
    dotClass: 'dot dot-perkiraan',
  },
  konsultasi: {
    icon: '🔴',
    iconBg: 'var(--red-lt)',
    badgeClass: 'badge badge-konsultasi',
    dotClass: 'dot dot-konsultasi',
  },
}

export default function Hasil() {
  const navigate = useNavigate()
  const { state } = useLocation()

  useEffect(() => {
    if (!state?.nama) navigate('/')
  }, [state, navigate])

  if (!state?.nama) return null

  const { nama, usiaLabel, ya, total, skor, hasil } = state
  const cfg = CONFIG[hasil.kategori]
  const persen = Math.round(skor * 100)

  function handleSimpan() {
    simpanRiwayat({
      nama,
      usiaLabel,
      kategori: hasil.kategori,
      label: hasil.label,
      persen,
      ya,
      total,
      tanggal: new Date().toLocaleDateString('id-ID', {
        day: 'numeric', month: 'long', year: 'numeric',
      }),
    })
    navigate('/riwayat')
  }

  return (
    <div className="page-wrap">

      {/* Hero */}
      <div className={`${styles.hero} anim-scalein`}>
        <div className={styles.iconWrap} style={{ background: cfg.iconBg }}>
          {cfg.icon}
        </div>
        <h2 className={styles.title}>{hasil.label}</h2>
        <p className={styles.sub}>Untuk {nama}, usia {usiaLabel}</p>
      </div>

      {/* Stat card */}
      <div className={`card ${styles.statCard} anim-fadeup`} style={{ animationDelay: '.1s' }}>
        <p className="section-label">Ringkasan</p>

        <div className={styles.statRow}>
          <Stat num={ya}         label="Sudah bisa" />
          <Stat num={total - ya} label="Belum bisa" />
          <Stat num={`${persen}%`} label="Skor" />
        </div>

        <div style={{ marginTop: 16 }}>
          <span className={cfg.badgeClass}>
            <span className={cfg.dotClass} />
            {hasil.label}
          </span>
        </div>

        <p className={styles.statement}>{hasil.kalimat}</p>
      </div>

      {/* Disclaimer */}
      <div className={`notice notice-warm anim-fadeup`} style={{ animationDelay: '.16s' }}>
        <span className="notice-icon">💡</span>
        <span>
          Hasil ini bukan diagnosis medis. Jika kamu memiliki kekhawatiran,
          konsultasikan dengan <strong>dokter anak atau terapis wicara</strong>.
        </span>
      </div>

      {/* Actions */}
      <div className={`${styles.actions} anim-fadeup`} style={{ animationDelay: '.2s' }}>
        <button className="btn btn-primary" onClick={handleSimpan}>
          Simpan hasil
        </button>
        <button className="btn btn-ghost" onClick={() => navigate('/')}>
          Skrining ulang
        </button>
      </div>

    </div>
  )
}

function Stat({ num, label }) {
  return (
    <div style={{
      flex: 1, textAlign: 'center',
      background: 'var(--cream)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius-sm)', padding: '14px 8px',
    }}>
      <span style={{
        fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 300,
        display: 'block', lineHeight: 1, color: 'var(--ink)',
      }}>{num}</span>
      <span style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4, display: 'block' }}>{label}</span>
    </div>
  )
}
