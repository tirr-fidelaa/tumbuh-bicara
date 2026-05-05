import data from '../data/milestones.json'

const { kelompokUsia } = data
const THRESHOLD_SESUAI = data.meta.threshold_sesuai
const THRESHOLD_KONSULTASI = data.meta.threshold_konsultasi

/**
 * Tentukan kelompok usia berdasarkan usia anak dalam bulan
 */
export function getKelompokUsia(usiabulan) {
  return kelompokUsia.find(
    (k) => usiabulan >= k.usia_min_bulan && usiabulan <= k.usia_max_bulan
  ) || kelompokUsia[kelompokUsia.length - 1]
}

/**
 * Hitung skor dari jawaban user
 * answers: { [milestoneId]: true | false }
 */
export function hitungSkor(milestones, answers) {
  const total = milestones.length
  const ya = milestones.filter((m) => answers[m.id] === true).length
  return { ya, total, skor: total > 0 ? ya / total : 0 }
}

/**
 * Tentukan kategori hasil berdasarkan red flag dan skor
 * Returns: { kategori, label, kalimat, usiaPerkiraan }
 */
export function tentukanKategori({ hasRedFlag, skor, usiaAktual, usiabulan }) {
  if (hasRedFlag) {
    return {
      kategori: 'konsultasi',
      label: 'Segera Konsultasi',
      kalimat: `Ditemukan tanda yang perlu perhatian segera. Disarankan segera berkonsultasi dengan dokter anak atau terapis wicara.`,
      usiaPerkiraan: null,
    }
  }

  if (skor >= THRESHOLD_SESUAI) {
    return {
      kategori: 'sesuai',
      label: 'Sesuai Usia',
      kalimat: `Perkembangan bicara dan bahasa berada sesuai dengan usianya (${usiaAktual}).`,
      usiaPerkiraan: null,
    }
  }

  if (skor >= THRESHOLD_KONSULTASI) {
    // Cari rentang usia perkiraan: usia tertinggi di bawah usia aktual
    const idxAktual = kelompokUsia.findIndex(
      (k) => usiabulan >= k.usia_min_bulan && usiabulan <= k.usia_max_bulan
    )
    let usiaPerkiraan = null
    for (let i = idxAktual - 1; i >= 0; i--) {
      usiaPerkiraan = kelompokUsia[i].label
      break
    }
    return {
      kategori: 'perkiraan',
      label: 'Perkiraan Usia',
      kalimat: `Perkembangan bicara dan bahasa saat ini berada di kisaran usia ${usiaPerkiraan || 'lebih awal'}.`,
      usiaPerkiraan,
    }
  }

  return {
    kategori: 'konsultasi',
    label: 'Segera Konsultasi',
    kalimat: `Skor pencapaian milestone sangat rendah. Disarankan untuk berkonsultasi dengan dokter anak atau terapis wicara.`,
    usiaPerkiraan: null,
  }
}

/**
 * Hitung usia dalam bulan dari tanggal lahir
 */
export function hitungUsiaBulan(tanggalLahir) {
  const birth = new Date(tanggalLahir)
  const now = new Date()
  let months =
    (now.getFullYear() - birth.getFullYear()) * 12 +
    (now.getMonth() - birth.getMonth())
  if (now.getDate() < birth.getDate()) months--
  return Math.max(0, months)
}

/**
 * Format usia bulan menjadi label yang mudah dibaca
 */
export function formatUsia(bulan) {
  if (bulan === 0) return 'Kurang dari 1 bulan'
  const tahun = Math.floor(bulan / 12)
  const sisa = bulan % 12
  const parts = []
  if (tahun > 0) parts.push(`${tahun} tahun`)
  if (sisa > 0) parts.push(`${sisa} bulan`)
  return parts.join(' ')
}
