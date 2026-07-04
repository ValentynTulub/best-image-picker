export const isImageFile = (f) =>
  /^image\//.test(f.type) || /\.(jpg|jpeg|png|webp|gif|bmp|tiff)$/i.test(f.name)

export const shuffle = (arr) => {
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export const estimateRounds = (n) => Math.ceil(Math.log2(Math.max(1, n)))

/** Load an object URL and natural size for layout decisions */
export function loadImageMeta(url) {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight })
    img.onerror = () => resolve({ width: 1, height: 1 })
    img.src = url
  })
}

/** Pair up ids randomly; any leftover id carries over to the next round untouched */
export function makeRound(ids) {
  const pool = shuffle(ids.filter((id) => id !== null && id !== undefined))
  const pairs = []
  const carry = []
  for (let i = 0; i < pool.length; i += 2) {
    const a = pool[i]
    const b = pool[i + 1]
    if (b === undefined) carry.push(a)
    else pairs.push([a, b])
  }
  return { pairs, carry }
}
