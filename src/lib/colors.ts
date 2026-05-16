export function extractColors(base64: string, count = 3): Promise<string[]> {
  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas')
        const size = 64
        canvas.width = size
        canvas.height = size
        const ctx = canvas.getContext('2d')
        if (!ctx) return resolve([])
        ctx.drawImage(img, 0, 0, size, size)
        const data = ctx.getImageData(0, 0, size, size).data

        const buckets = new Map<string, { count: number; r: number; g: number; b: number }>()
        for (let i = 0; i < data.length; i += 4) {
          if (data[i + 3] < 128) continue
          const r = Math.round(data[i] / 24) * 24
          const g = Math.round(data[i + 1] / 24) * 24
          const b = Math.round(data[i + 2] / 24) * 24
          // Skip near-white / near-black
          const max = Math.max(r, g, b)
          const min = Math.min(r, g, b)
          if (max < 30 || min > 230) continue
          const key = `${r},${g},${b}`
          const existing = buckets.get(key)
          if (existing) existing.count++
          else buckets.set(key, { count: 1, r, g, b })
        }

        const sorted = Array.from(buckets.values()).sort((a, b) => b.count - a.count)
        // De-dupe perceptually similar colors
        const picked: Array<{ r: number; g: number; b: number }> = []
        for (const c of sorted) {
          const tooClose = picked.some(
            (p) => Math.abs(p.r - c.r) + Math.abs(p.g - c.g) + Math.abs(p.b - c.b) < 80
          )
          if (!tooClose) picked.push(c)
          if (picked.length === count) break
        }

        resolve(
          picked.map(({ r, g, b }) =>
            '#' + [r, g, b].map((v) => Math.min(255, v).toString(16).padStart(2, '0')).join('')
          )
        )
      } catch {
        resolve([])
      }
    }
    img.onerror = () => resolve([])
    img.src = base64
  })
}

export function isValidHex(hex: string): boolean {
  return /^#[0-9a-f]{6}$/i.test(hex.trim())
}

export function normalizeHex(hex: string): string {
  let h = hex.trim().toLowerCase()
  if (!h.startsWith('#')) h = '#' + h
  if (h.length === 4) h = '#' + h.slice(1).split('').map((c) => c + c).join('')
  return h
}
