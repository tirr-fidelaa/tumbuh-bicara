import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { hitungUsiaBulan, formatUsia, getKelompokUsia } from '../utils/scoring'
import styles from './Home.module.css'

export default function Home() {
  const navigate = useNavigate()
  const [nama, setNama]       = useState('')
  const [tglLahir, setTgl]    = useState('')
  const [usiaBulan, setUsia]  = useState(null)
  const [usiaLabel, setLabel] = useState('')
  const [error, setError]     = useState('')

  const today = new Date().toISOString().split('T')[0]

  function handleTgl(e) {
    const val = e.target.value
    setTgl(val)
    if (!val) { setUsia(null); setLabel(''); setError(''); return }
    const b = hitungUsiaBulan(val)
    if (b > 60) {
      setError('Sistem ini untuk anak usia 0–60 bulan (5 tahun).')
      setUsia(null); setLabel('')
    } else {
      setError(''); setUsia(b); setLabel(formatUsia(b))
    }
  }

  const canStart = nama.trim() && usiaBulan !== null && !error

  function mulai() {
    const kelompok = getKelompokUsia(usiaBulan)
    navigate('/checklist', {
      state: { nama: nama.trim(), usiaBulan, usiaLabel, kelompokId: kelompok.id },
    })
  }

  return (
    <div className={styles.wrap}>
      <div className={`${styles.hero} anim-fadeup`}>
        <div className={styles.badge}><span className={styles.dot} />Gratis · Tanpa daftar · 5 menit</div>
        <h1 className={styles.h1}>Cek perkembangan <em>bicara & bahasa</em> si kecil</h1>
        <p className={styles.sub}>
          Isi checklist sederhana berdasarkan usia anak. Sistem memberi gambaran
          apakah perkembangan bicara anak sesuai usianya.
        </p>
      </div>

      <div className={`card ${styles.formCard} anim-fadeup`} style={{ animationDelay: '.07s' }}>
        <h3 className={styles.cardTitle}>Data anak</h3>

        <div className="field">
          <label htmlFor="nama">Nama anak</label>
          <input id="nama" type="text" placeholder="Contoh: Budi"
            value={nama} onChange={(e) => setNama(e.target.value)} />
        </div>

        <div className="field">
          <label htmlFor="tgl">Tanggal lahir</label>
          <input id="tgl" type="date" max={today} value={tglLahir} onChange={handleTgl} />
        </div>

        <div className="field">
          <label>Usia saat ini</label>
          <div className={`${styles.usiaBox} ${usiaBulan !== null ? styles.filled : ''}`}>
            {error
              ? <span style={{ color: 'var(--red)', fontSize: 13 }}>{error}</span>
              : usiaLabel || 'Masukkan tanggal lahir terlebih dahulu'}
          </div>
        </div>

        <button className="btn btn-primary" onClick={mulai} disabled={!canStart}>
          Mulai Skrining →
        </button>
      </div>

      <div className="notice notice-amber anim-fadeup" style={{ animationDelay: '.13s' }}>
        <span className="notice-icon">💡</span>
        <span>Hasil skrining ini <strong>bukan diagnosis medis</strong>. Sistem hanya membantu orang tua memantau perkembangan secara mandiri.</span>
      </div>

      <div className={`${styles.chips} anim-fadeup`} style={{ animationDelay: '.17s' }}>
        {[['⏱','5–7 menit'],['📱','Data tersimpan di HP kamu'],['🔄','Bisa diulang kapan saja']].map(([icon, label]) => (
          <span key={label} className={styles.chip}>{icon} {label}</span>
        ))}
      </div>
    </div>
  )
}
