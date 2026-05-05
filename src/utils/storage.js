const KEY = 'tumbuh-bicara-history'

export function getRiwayat() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]')
  } catch {
    return []
  }
}

export function simpanRiwayat(entry) {
  const list = getRiwayat()
  list.unshift({ ...entry, id: Date.now() })
  localStorage.setItem(KEY, JSON.stringify(list.slice(0, 20)))
}

export function hapusRiwayat(id) {
  const list = getRiwayat().filter((r) => r.id !== id)
  localStorage.setItem(KEY, JSON.stringify(list))
}

export function clearRiwayat() {
  localStorage.removeItem(KEY)
}
