import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import data from "../data/milestones.json";
import { hitungSkor, tentukanKategori } from "../utils/scoring";
import styles from "./Checklist.module.css";

const TAG_COLOR = {
  Memahami: { bg: "#EDF5F0", color: "#2C5040" },
  Mengungkapkan: { bg: "#FDF0E0", color: "#8A5A1A" },
  "Komunikasi Sosial": { bg: "#EEF2FF", color: "#3730A3" },
};

export default function Checklist() {
  const navigate = useNavigate();
  const { state: nav } = useLocation();

  // ── Semua hooks di atas, sebelum return apapun ──
  const [fase, setFase] = useState("rf-absolut");
  const [rfAbsAnswers, setRfAbs] = useState({});
  const [rfUsiaAnswer, setRfUsia] = useState(null);
  const [answers, setAnswers] = useState({});
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (!nav?.nama) navigate("/");
  }, [nav, navigate]);

  // Guard setelah semua hooks
  if (!nav?.nama) return null;

  const { nama, usiaBulan, usiaLabel, kelompokId } = nav;
  const kelompok = data.kelompokUsia.find((k) => k.id === kelompokId);
  if (!kelompok) return null
  const milestones = kelompok?.milestones || [];
  const rfAbsolut = data.redFlagsAbsolut;

  const isFaseRfAbs = fase === "rf-absolut";
  const isFaseRfUsia = fase === "rf-usia";
  const isFaseMilestone = fase === "milestone";
  const total = milestones.length;
  const progress = isFaseMilestone ? Math.round(((idx + 1) / total) * 100) : 0;

  function back() {
    if (isFaseRfAbs) {
      navigate("/");
      return;
    }
    if (isFaseRfUsia) {
      setFase("rf-absolut");
      return;
    }
    if (isFaseMilestone && idx === 0) {
      setFase("rf-usia");
      return;
    }
    setIdx((i) => i - 1);
  }

  function next() {
    if (isFaseRfAbs) {
      setFase("rf-usia");
      return;
    }
    if (isFaseRfUsia) {
      setFase("milestone");
      setIdx(0);
      return;
    }
    if (idx < total - 1) {
      setIdx((i) => i + 1);
      return;
    }
    selesai();
  }

  function selesai() {
    const hasRedFlagAbsolut = Object.values(rfAbsAnswers).some(Boolean);
    const hasRedFlagUsia = rfUsiaAnswer === true;
    const { poinDapat, poinMaksimum, skor } = hitungSkor(
      milestones,
      kelompok.poin_maksimum,
      answers,
    );
    const hasil = tentukanKategori({
      hasRedFlagAbsolut,
      hasRedFlagUsia,
      skor,
      usiaLabel,
      usiaBulan,
    });
    navigate("/hasil", {
      state: {
        nama,
        usiaLabel,
        usiaBulan,
        kelompokId,
        poinDapat,
        poinMaksimum,
        skor,
        hasil,
      },
    });
  }

  const cur = milestones[idx];
  const canNext =
    isFaseRfAbs || isFaseRfUsia || (cur && answers[cur.id] !== undefined);
  const isLast = isFaseMilestone && idx === total - 1;
  // Hitung skor berjalan (hanya milestone yang sudah dijawab Ya)
  const poinBerjalan = milestones.reduce((total, m) => {
    return answers[m.id] === true ? total + m.bobot : total;
  }, 0);
  const poinMaks = kelompok?.poin_maksimum ?? 0;
  // const persenBerjalan =
  //   poinMaks > 0 ? Math.round((poinBerjalan / poinMaks) * 100) : 0;

  return (
    <div className="page-wrap">
      {/* Progress header */}
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={back} aria-label="Kembali">
          <IconBack />
        </button>
        <div className={styles.progressWrap}>
          <div className={styles.progressMeta}>
            <span>
              {isFaseRfAbs && "Tanda umum"}
              {isFaseRfUsia && "Tanda usia"}
              {isFaseMilestone && `Pertanyaan ${idx + 1} dari ${total}`}
            </span>
            <span className={styles.usiaTag}>{kelompok?.label}</span>
          </div>
          <div className={styles.track}>
            <div
              className={styles.fill}
              style={{
                width: isFaseRfAbs
                  ? "2%"
                  : isFaseRfUsia
                    ? "6%"
                    : `${progress}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* FASE 1: Red flag absolut */}
      {isFaseRfAbs && (
        <div className="anim-fadeup">
          <div className={`notice notice-amber ${styles.noticeGap}`}>
            <span className="notice-icon">⚠️</span>
            <span>
              Sebelum mulai, perhatikan tiga tanda berikut. Centang jika ada
              pada anak.
            </span>
          </div>
          <div className={styles.rfList}>
            {rfAbsolut.map((rf) => {
              const checked = !!rfAbsAnswers[rf.id];
              return (
                <button
                  key={rf.id}
                  className={`${styles.rfItem} ${checked ? styles.rfChecked : ""}`}
                  onClick={() =>
                    setRfAbs((p) => ({ ...p, [rf.id]: !p[rf.id] }))
                  }
                >
                  <Circle checked={checked} danger />
                  <div>
                    <div className={styles.rfLabel}>{rf.deskripsi}</div>
                    <div className={styles.rfSub}>{rf.contoh}</div>
                  </div>
                </button>
              );
            })}
          </div>
          <button className="btn btn-primary" onClick={next}>
            Lanjut →
          </button>
        </div>
      )}

      {/* FASE 2: Red flag usia */}
      {isFaseRfUsia && (
        <div className="anim-fadeup">
          <div className={`notice notice-amber ${styles.noticeGap}`}>
            <span className="notice-icon">📋</span>
            <span>
              Satu pertanyaan khusus untuk usia{" "}
              <strong>{kelompok?.label}</strong>.
            </span>
          </div>
          <div className={`card ${styles.questionCard}`}>
            <div
              className={styles.tag}
              style={{ background: "#FFF3CD", color: "#856404" }}
            >
              Tanda Usia
            </div>
            <p className={styles.qText}>{kelompok?.redFlagUsia}</p>
            <div className={styles.optGroup}>
              <OptBtn
                label="Ya, ini terjadi pada anak saya"
                sub="Tanda ini ada"
                selected={rfUsiaAnswer === true}
                variant="danger"
                onClick={() => setRfUsia(true)}
              />
              <OptBtn
                label="Tidak, ini tidak terjadi"
                sub="Tidak ada tanda"
                selected={rfUsiaAnswer === false}
                variant="belum"
                onClick={() => setRfUsia(false)}
              />
            </div>
          </div>
          <button
            className="btn btn-primary"
            onClick={next}
            disabled={rfUsiaAnswer === null}
            style={{ marginTop: 12 }}
          >
            Lanjut →
          </button>
        </div>
      )}

      {/* FASE 3: Milestone per pertanyaan */}
      {isFaseMilestone && cur && (
        <div key={cur.id} className="anim-fadeup">
          <div className={`card ${styles.questionCard}`}>
            <div className={styles.cardTop}>
              <div className={styles.tag} style={TAG_COLOR[cur.kategori] ?? {}}>
                {cur.kategori}
              </div>
              <div className={styles.skorBerjalan}>
                {poinBerjalan} / {poinMaks} poin
              </div>
            </div>
            <p className={styles.qText}>{cur.deskripsi}</p>
            <div className={styles.optGroup}>
              <OptBtn
                label="Sudah bisa"
                sub="Anak sudah melakukan ini"
                selected={answers[cur.id] === true}
                variant="ya"
                onClick={() => setAnswers((p) => ({ ...p, [cur.id]: true }))}
              />
              <OptBtn
                label="Belum bisa"
                sub="Anak belum melakukan ini"
                selected={answers[cur.id] === false}
                variant="belum"
                onClick={() => setAnswers((p) => ({ ...p, [cur.id]: false }))}
              />
            </div>
          </div>
          <button
            className="btn btn-primary"
            onClick={next}
            disabled={!canNext}
            style={{ marginTop: 12 }}
          >
            {isLast ? "Lihat Hasil →" : "Lanjut →"}
          </button>
        </div>
      )}
    </div>
  );
}

function OptBtn({ label, sub, selected, variant, onClick }) {
  const isYa = variant === "ya";
  const isDanger = variant === "danger";
  return (
    <button
      onClick={onClick}
      className={`${styles.opt}
      ${selected && isYa ? styles.optYa : ""}
      ${selected && isDanger ? styles.optDanger : ""}
      ${selected && variant === "belum" ? styles.optBelum : ""}`}
    >
      <Circle checked={selected} danger={isDanger && selected} />
      <div>
        <div className={styles.optLabel}>{label}</div>
        <div className={styles.optSub}>{sub}</div>
      </div>
    </button>
  );
}

function Circle({ checked, danger }) {
  return (
    <div
      className={`${styles.circle}
      ${checked && !danger ? styles.circleYa : ""}
      ${checked && danger ? styles.circleDanger : ""}`}
    >
      {checked && <IconCheck />}
    </div>
  );
}

function IconBack() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <path d="M10 3L5 8l5 5" />
    </svg>
  );
}
function IconCheck() {
  return (
    <svg
      width="11"
      height="11"
      viewBox="0 0 11 11"
      fill="none"
      stroke="white"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="1.5,5.5 4.2,8.5 9.5,2.5" />
    </svg>
  );
}
