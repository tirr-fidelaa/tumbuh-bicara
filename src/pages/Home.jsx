import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { hitungUsiaBulan, formatUsia, getKelompokUsia } from '../utils/scoring'
import styles from './Home.module.css'

export default function Home() {
  const navigate = useNavigate()
  const [nama, setNama] = useState('')
  const [tglLahir, setTglLahir] = useState('')
  const [usiaBulan, setUsiaBulan] = useState(null)
  const [usiaLabel, setUsiaLabel] = useState('')
  const [error, setError] = useState('')

  const today = new Date().toISOString().split('T')[0]

  function handleTglChange(e) {
    const val = e.target.value
    setTglLahir(val)
    if (!val) { setUsiaBulan(null); setUsiaLabel(''); setError(''); return }
    const bulan = hitungUsiaBulan(val)
    if (bulan > 60) {
      setError('Sistem ini untuk anak usia 0–60 bulan (5 tahun).')
      setUsiaBulan(null); setUsiaLabel('')
    } else {
      setError('')
      setUsiaBulan(bulan)
      setUsiaLabel(formatUsia(bulan))
    }
  }

  const canStart = nama.trim().length > 0 && usiaBulan !== null && !error

  function handleMulai() {
    const kelompok = getKelompokUsia(usiaBulan)
    navigate('/checklist', {
      state: { nama: nama.trim(), usiaBulan, usiaLabel, kelompokId: kelompok.id },
    })
  }

  return (
    <div className={styles.wrap}>
      {/* Hero */}
      <div className={`${styles.hero} anim-fadeup`}>
        <div className={styles.badge}>
          <span className={styles.badgeDot} />
          Gratis · Tanpa daftar · 5 menit
        </div>
        <h1 className={styles.h1}>
          Cek perkembangan <em>bicara & bahasa</em> si kecil
        </h1>
        <p className={styles.sub}>
          Isi checklist sederhana berdasarkan usia anak. Sistem memberi gambaran
          apakah perkembangan bicara anak sesuai usianya.
        </p>
      </div>

      {/* Form Card */}
      <div className={`card ${styles.formCard} anim-fadeup`} style={{ animationDelay: '.08s' }}>
        <h3 className={styles.cardTitle}>Data anak</h3>

        <div className="field">
          <label htmlFor="nama">Nama anak</label>
          <input
            id="nama"
            type="text"
            placeholder="Contoh: Budi"
            value={nama}
            onChange={(e) => setNama(e.target.value)}
          />
        </div>

        <div className="field">
          <label htmlFor="tgl">Tanggal lahir</label>
          <input
            id="tgl"
            type="date"
            max={today}
            value={tglLahir}
            onChange={handleTglChange}
          />
        </div>

        <div className="field">
          <label>Usia saat ini</label>
          <div className={`${styles.usiaBox} ${usiaBulan !== null ? styles.usiaBoxFilled : ''}`}>
            {error
              ? <span style={{ color: 'var(--red)', fontSize: 13 }}>{error}</span>
              : usiaLabel || 'Masukkan tanggal lahir terlebih dahulu'}
          </div>
        </div>

        <button className="btn btn-primary" onClick={handleMulai} disabled={!canStart}>
          Mulai Skrining →
        </button>
      </div>

      {/* Disclaimer */}
      <div className={`notice notice-amber anim-fadeup`} style={{ animationDelay: '.14s' }}>
        <span className="notice-icon">💡</span>
        <span>
          Hasil skrining ini <strong>bukan diagnosis medis</strong>. Sistem hanya
          membantu orang tua memantau perkembangan secara mandiri.
        </span>
      </div>

      {/* Info chips */}
      <div className={`${styles.chips} anim-fadeup`} style={{ animationDelay: '.18s' }}>
        <Chip icon="⏱" label="5–7 menit" />
        <Chip icon="📱" label="Data tersimpan di HP kamu" />
        <Chip icon="🔄" label="Bisa diulang kapan saja" />
      </div>
    </div>
  )
}

function Chip({ icon, label }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 6,
      fontSize: 12, color: 'var(--muted)',
    }}>
      <span>{icon}</span>
      <span>{label}</span>
    </div>
  )
}
