import data from "../data/milestones.json";

const { kelompokUsia } = data;
const THRESHOLD_SESUAI = data.meta.threshold_sesuai; // 0.8
const THRESHOLD_STIMULASI = data.meta.threshold_stimulasi; // 0.6

/** Cari kelompok usia sesuai usia anak dalam bulan */
export function getKelompokUsia(usiaBulan) {
  return (
    kelompokUsia.find(
      (k) => usiaBulan >= k.usia_min_bulan && usiaBulan <= k.usia_max_bulan,
    ) ?? kelompokUsia[kelompokUsia.length - 1]
  );
}

/**
 * Hitung skor berbasis poin.
 * answers = { milestoneId: true | false }
 * Returns: poinDapat, poinMaksimum, skor (0–1)
 */
export function hitungSkor(milestones, poinMaksimum, answers) {
  const poinDapat = milestones.reduce((total, m) => {
    return answers[m.id] === true ? total + m.bobot : total;
  }, 0);
  return {
    poinDapat,
    poinMaksimum,
    skor: poinMaksimum > 0 ? poinDapat / poinMaksimum : 0,
  };
}

/**
 * Tentukan kategori hasil.
 * hasRedFlagAbsolut : salah satu dari 3 red flag absolut dipilih
 * hasRedFlagUsia    : red flag spesifik usia dipilih
 *
 * Kategori:
 * - sesuai      : skor ≥ 80%
 * - stimulasi   : skor 60–79% → tampilkan perkiraan usia
 * - risiko      : skor < 60%  → arahkan konsultasi
 */
export function tentukanKategori({
  hasRedFlagAbsolut,
  hasRedFlagUsia,
  skor,
  usiaLabel,
  usiaBulan,
}) {
  // Prioritas tertinggi: red flag absolut → langsung risiko
  if (hasRedFlagAbsolut) {
    return {
      kategori: "risiko",
      label: "Risiko Keterlambatan",
      kalimat:
        "Ditemukan tanda yang perlu perhatian segera. Disarankan untuk segera berkonsultasi dengan dokter anak atau terapis wicara.",
      usiaPerkiraan: null,
      adaCatatanRf: false,
    };
  }

  // ≥80%: sesuai usia
  if (skor >= THRESHOLD_SESUAI) {
    return {
      kategori: "sesuai",
      label: "Sesuai Usia",
      kalimat: `Perkembangan bicara dan bahasa berada sesuai dengan usianya (${usiaLabel}).`,
      usiaPerkiraan: null,
      adaCatatanRf: hasRedFlagUsia,
    };
  }

  // 60–79%: perlu stimulasi → tampilkan perkiraan usia
  if (skor >= THRESHOLD_STIMULASI) {
    const idxAktual = kelompokUsia.findIndex(
      (k) => usiaBulan >= k.usia_min_bulan && usiaBulan <= k.usia_max_bulan,
    );
    const usiaPerkiraan =
      idxAktual > 0 ? kelompokUsia[idxAktual - 1].label : kelompokUsia[0].label;

    return {
      kategori: "stimulasi",
      label: "Perlu Stimulasi & Pemantauan",
      kalimat: `Perkembangan bicara dan bahasa perlu stimulasi lebih. Kemampuannya saat ini setara usia ${usiaPerkiraan}.`,
      usiaPerkiraan,
      adaCatatanRf: hasRedFlagUsia,
    };
  }

  // <60%: risiko keterlambatan → arahkan konsultasi, tanpa perkiraan usia
  return {
    kategori: "risiko",
    label: "Risiko Keterlambatan",
    kalimat:
      "Skor pencapaian sangat rendah. Disarankan untuk segera berkonsultasi dengan dokter anak atau terapis wicara.",
    usiaPerkiraan: null,
    adaCatatanRf: hasRedFlagUsia,
  };
}

/** Hitung usia dalam bulan dari string tanggal lahir */
export function hitungUsiaBulan(tanggalLahir) {
  const birth = new Date(tanggalLahir);
  const now = new Date();
  let months =
    (now.getFullYear() - birth.getFullYear()) * 12 +
    (now.getMonth() - birth.getMonth());
  if (now.getDate() < birth.getDate()) months--;
  return Math.max(0, months);
}

/** Format bulan → label bahasa Indonesia */
export function formatUsia(bulan) {
  if (bulan === 0) return "Kurang dari 1 bulan";
  const tahun = Math.floor(bulan / 12);
  const sisa = bulan % 12;
  const parts = [];
  if (tahun > 0) parts.push(`${tahun} tahun`);
  if (sisa > 0) parts.push(`${sisa} bulan`);
  return parts.join(" ");
}
