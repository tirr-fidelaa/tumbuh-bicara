import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { simpanRiwayat } from '../utils/storage'
import styles from './Hasil.module.css'

const CFG = {
  sesuai:    { icon: '🌿', bg: 'var(--sage-lt)',  badge: 'badge badge-sesuai',     dot: 'dot dot-sesuai' },
  stimulasi: { icon: '🔄', bg: 'var(--amber-lt)', badge: 'badge badge-perkiraan',  dot: 'dot dot-perkiraan' },
  risiko:    { icon: '🔴', bg: 'var(--red-lt)',   badge: 'badge badge-konsultasi', dot: 'dot dot-konsultasi' },
}

export default function Hasil() {
  const navigate = useNavigate()
  const { state } = useLocation()

  useEffect(() => { if (!state?.nama) navigate('/') }, [state, navigate])
  if (!state?.nama) return null

  const { nama, usiaLabel, poinDapat, poinMaksimum, skor, hasil } = state
  const cfg    = CFG[hasil.kategori] ?? CFG.risiko
  const persen = Math.round(skor * 100)

  function simpan() {
    simpanRiwayat({
      nama, usiaLabel,
      kategori: hasil.kategori,
      label:    hasil.label,
      poinDapat, poinMaksimum, persen,
      tanggal: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
    })
    navigate('/riwayat')
  }

  return (
    <div className="page-wrap">

      {/* Hero */}
      <div className={`${styles.hero} anim-scalein`}>
        <div className={styles.iconWrap} style={{ background: cfg.bg }}>{cfg.icon}</div>
        <h2 className={styles.title}>{hasil.label}</h2>
        <p className={styles.sub}>Untuk {nama}, usia {usiaLabel}</p>
      </div>

      {/* Stat card */}
      <div className={`card anim-fadeup`} style={{ animationDelay: '.09s' }}>
        <p className="section-label">Ringkasan</p>

        {/* Skor: "9 / 11 poin · 82%" */}
        <div className={styles.skorWrap}>
          <span className={styles.skorPoin}>
            {poinDapat} / {poinMaksimum} poin
          </span>
          <span className={styles.skorSep}>·</span>
          <span className={styles.skorPersen}>{persen}%</span>
        </div>

        {/* Badge kategori */}
        <div style={{ marginTop: 14 }}>
          <span className={cfg.badge}>
            <span className={cfg.dot} />
            {hasil.label}
          </span>
        </div>

        {/* Kalimat hasil */}
        <p className={styles.statement}>{hasil.kalimat}</p>
      </div>

      {/* Catatan red flag usia — hanya muncul di kategori sesuai & stimulasi */}
      {hasil.adaCatatanRf && hasil.kategori !== 'risiko' && (
        <div className="notice notice-amber anim-fadeup" style={{ animationDelay: '.13s' }}>
          <span className="notice-icon">⚠️</span>
          <span>
            Meski skor cukup baik, ada tanda usia yang perlu diperhatikan.
            Pertimbangkan untuk mendiskusikannya dengan dokter anak saat kunjungan berikutnya.
          </span>
        </div>
      )}

      {/* Disclaimer */}
      <div className="notice notice-warm anim-fadeup" style={{ animationDelay: '.15s' }}>
        <span className="notice-icon">💡</span>
        <span>
          Hasil ini bukan diagnosis medis. Jika ada kekhawatiran, konsultasikan dengan
          <strong> dokter anak atau terapis wicara</strong>.
        </span>
      </div>

      {/* Actions */}
      <div className={`${styles.actions} anim-fadeup`} style={{ animationDelay: '.19s' }}>
        <button className="btn btn-primary" onClick={simpan}>Simpan hasil</button>
        <button className="btn btn-ghost"   onClick={() => navigate('/')}>Skrining ulang</button>
      </div>

    </div>
  )
}