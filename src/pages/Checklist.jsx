import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import data from '../data/milestones.json'
import { hitungSkor, tentukanKategori } from '../utils/scoring'
import styles from './Checklist.module.css'

const TAG_COLOR = {
  Reseptif:  { bg: '#EDF5F0', color: '#2C5040' },
  Ekspresif: { bg: '#FDF0E0', color: '#8A5A1A' },
  Sosial:    { bg: '#EEF2FF', color: '#3730A3' },
}

// Fase 0 = red flags, fase 1..n = milestone pertanyaan
export default function Checklist() {
  const navigate = useNavigate()
  const { state: navState } = useLocation()

  // Guard: jika user buka langsung tanpa data
  useEffect(() => {
    if (!navState?.nama) navigate('/')
  }, [navState, navigate])

  const { nama, usiaBulan, usiaLabel, kelompokId } = navState || {}
  const kelompok = data.kelompokUsia.find((k) => k.id === kelompokId)
  const milestones = kelompok?.milestones || []
  const redFlags = data.redFlags

  const [fase, setFase] = useState('redflag') // 'redflag' | number (index milestone)
  const [rfAnswers, setRfAnswers] = useState({})   // { rf_id: bool }
  const [answers, setAnswers] = useState({})        // { milestone_id: bool }
  const [currentIdx, setCurrentIdx] = useState(0)

  const isRedFlagFase = fase === 'redflag'
  const currentMilestone = !isRedFlagFase ? milestones[currentIdx] : null
  const totalQ = milestones.length
  const progress = isRedFlagFase ? 0 : Math.round(((currentIdx + 1) / totalQ) * 100)

  function toggleRf(id) {
    setRfAnswers((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  function handleNext() {
    if (isRedFlagFase) {
      setFase('milestone')
      setCurrentIdx(0)
      return
    }
    if (currentIdx < totalQ - 1) {
      setCurrentIdx((i) => i + 1)
    } else {
      selesai()
    }
  }

  function handleBack() {
    if (isRedFlagFase) { navigate('/'); return }
    if (currentIdx === 0) { setFase('redflag'); return }
    setCurrentIdx((i) => i - 1)
  }

  function pilihJawaban(val) {
    setAnswers((prev) => ({ ...prev, [currentMilestone.id]: val }))
  }

  function selesai() {
    const hasRedFlag = Object.values(rfAnswers).some(Boolean)
    const { ya, total, skor } = hitungSkor(milestones, answers)
    const hasil = tentukanKategori({ hasRedFlag, skor, usiaAktual: usiaLabel, usiabulan: usiaBulan })
    navigate('/hasil', {
      state: { nama, usiaLabel, usiaBulan, kelompokId, ya, total, skor, hasil, answers, rfAnswers },
    })
  }

  const canNextRedflag = true // red flag selalu bisa lanjut (tidak wajib diisi)
  const canNextMilestone = currentMilestone && answers[currentMilestone.id] !== undefined
  const isLastMilestone = currentIdx === totalQ - 1

  if (!kelompok) return null

  return (
    <div className="page-wrap">

      {/* Progress header */}
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={handleBack} aria-label="Kembali">
          <ArrowLeft />
        </button>
        <div className={styles.progressWrap}>
          <div className={styles.progressMeta}>
            {isRedFlagFase
              ? <span>Tanda penting</span>
              : <span>Pertanyaan {currentIdx + 1} dari {totalQ}</span>}
            <span className={styles.usiaTag}>{kelompok.label}</span>
          </div>
          <div className={styles.progressTrack}>
            <div
              className={styles.progressFill}
              style={{ width: isRedFlagFase ? '2%' : `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* ── RED FLAG FASE ── */}
      {isRedFlagFase && (
        <div className="anim-fadeup">
          <div className={`notice notice-amber ${styles.rfNotice}`}>
            <span className="notice-icon">⚠️</span>
            <span>
              Sebelum mulai, perhatikan tiga tanda berikut pada anak. Centang jika ada.
              Tanda ini tidak perlu semuanya ada untuk lanjut.
            </span>
          </div>

          <div className={styles.rfList}>
            {redFlags.map((rf) => {
              const checked = !!rfAnswers[rf.id]
              return (
                <button
                  key={rf.id}
                  className={`${styles.rfItem} ${checked ? styles.rfChecked : ''}`}
                  onClick={() => toggleRf(rf.id)}
                >
                  <div className={`${styles.rfCircle} ${checked ? styles.rfCircleChecked : ''}`}>
                    {checked && <CheckIcon />}
                  </div>
                  <div className={styles.rfText}>
                    <span className={styles.rfLabel}>{rf.deskripsi}</span>
                    <span className={styles.rfSub}>{rf.contoh}</span>
                  </div>
                </button>
              )
            })}
          </div>

          <button className="btn btn-primary" onClick={handleNext}>
            Lanjut ke Checklist →
          </button>
        </div>
      )}

      {/* ── MILESTONE FASE ── */}
      {!isRedFlagFase && currentMilestone && (
        <div key={currentMilestone.id} className="anim-fadeup">
          <div className={`card ${styles.questionCard}`}>
            <div
              className={styles.tag}
              style={TAG_COLOR[currentMilestone.kategori]}
            >
              {currentMilestone.kategori}
            </div>
            <p className={styles.questionText}>{currentMilestone.deskripsi}</p>

            <div className={styles.optGroup}>
              <AnswerOpt
                label="Sudah bisa"
                sub="Anak sudah melakukan ini"
                selected={answers[currentMilestone.id] === true}
                variant="ya"
                onClick={() => pilihJawaban(true)}
              />
              <AnswerOpt
                label="Belum bisa"
                sub="Anak belum melakukan ini"
                selected={answers[currentMilestone.id] === false}
                variant="belum"
                onClick={() => pilihJawaban(false)}
              />
            </div>
          </div>

          <button
            className="btn btn-primary"
            onClick={handleNext}
            disabled={!canNextMilestone}
            style={{ marginTop: 12 }}
          >
            {isLastMilestone ? 'Lihat Hasil →' : 'Lanjut →'}
          </button>
        </div>
      )}
    </div>
  )
}

function AnswerOpt({ label, sub, selected, variant, onClick }) {
  return (
    <button
      className={`${styles.opt} ${selected ? (variant === 'ya' ? styles.optYa : styles.optBelum) : ''}`}
      onClick={onClick}
    >
      <div className={`${styles.optCircle} ${selected ? (variant === 'ya' ? styles.optCircleYa : styles.optCircleBelum) : ''}`}>
        {selected && variant === 'ya' && <CheckIcon color="white" />}
        {selected && variant === 'belum' && <MinusIcon />}
      </div>
      <div>
        <div className={styles.optLabel}>{label}</div>
        <div className={styles.optSub}>{sub}</div>
      </div>
    </button>
  )
}

function ArrowLeft() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 3L5 8l5 5"/>
    </svg>
  )
}
function CheckIcon({ color = 'var(--sage)' }) {
  return (
    <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="1.5,5.5 4.2,8.5 9.5,2.5"/>
    </svg>
  )
}
function MinusIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="var(--muted)" strokeWidth="2.2" strokeLinecap="round">
      <line x1="2" y1="5" x2="8" y2="5"/>
    </svg>
  )
}
