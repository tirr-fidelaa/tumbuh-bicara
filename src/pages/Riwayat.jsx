import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getRiwayat, hapusRiwayat, clearRiwayat } from '../utils/storage'
import styles from './Riwayat.module.css'

const BADGE_MAP = {
  sesuai:     { cls: 'badge badge-sesuai',    dot: 'dot dot-sesuai' },
  perkiraan:  { cls: 'badge badge-perkiraan', dot: 'dot dot-perkiraan' },
  konsultasi: { cls: 'badge badge-konsultasi',dot: 'dot dot-konsultasi' },
}

export default function Riwayat() {
  const navigate = useNavigate()
  const [list, setList] = useState([])

  useEffect(() => { setList(getRiwayat()) }, [])

  function handleHapus(id) {
    hapusRiwayat(id)
    setList(getRiwayat())
  }

  function handleClearAll() {
    if (window.confirm('Hapus semua riwayat skrining?')) {
      clearRiwayat()
      setList([])
    }
  }

  return (
    <div className="page-wrap">
      <div className={`${styles.header} anim-fadeup`}>
        <div>
          <h2 className={styles.title}>Riwayat Skrining</h2>
          <p className={styles.sub}>Tersimpan di perangkat ini</p>
        </div>
        {list.length > 0 && (
          <button className={styles.clearBtn} onClick={handleClearAll}>Hapus semua</button>
        )}
      </div>

      {list.length === 0 ? (
        <div className={`${styles.empty} anim-fadein`}>
          <div className={styles.emptyIcon}>📋</div>
          <p>Belum ada riwayat skrining.</p>
          <p style={{ fontSize: 13, marginTop: 4 }}>Lakukan skrining pertama untuk melihat hasilnya di sini.</p>
          <button className={`btn btn-primary ${styles.emptyBtn}`} onClick={() => navigate('/')}>
            Mulai Skrining
          </button>
        </div>
      ) : (
        <div className={styles.list}>
          {list.map((item, i) => {
            const b = BADGE_MAP[item.kategori] || BADGE_MAP.sesuai
            return (
              <div
                key={item.id}
                className={`${styles.item} anim-fadeup`}
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <div className={styles.itemMain}>
                  <div className={styles.itemName}>{item.nama}</div>
                  <div className={styles.itemMeta}>
                    Usia {item.usiaLabel} · {item.tanggal} · Skor {item.persen}%
                  </div>
                  <span className={b.cls} style={{ marginTop: 8, display: 'inline-flex' }}>
                    <span className={b.dot} />
                    {item.label}
                  </span>
                </div>
                <button
                  className={styles.hapusBtn}
                  onClick={() => handleHapus(item.id)}
                  aria-label="Hapus"
                >
                  <TrashIcon />
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function TrashIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="2,4 14,4"/>
      <path d="M5 4V2h6v2"/>
      <rect x="3" y="4" width="10" height="10" rx="1.5"/>
      <line x1="6" y1="7" x2="6" y2="11"/>
      <line x1="10" y1="7" x2="10" y2="11"/>
    </svg>
  )
}
