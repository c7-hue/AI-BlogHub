export type MetaSuggestion = {
  title?: string
  introduce?: string
  tags?: string[]
  categoryName?: string
}

export type DiffSegment = {
  type: 'equal' | 'add' | 'remove'
  text: string
}

export const stripHtml = (html: string) =>
  html
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

const escapeHtml = (text: string) =>
  text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

export const textToHtml = (text: string) => {
  if (/<(h\d|p|ul|ol|li|blockquote|pre|code)\b/i.test(text)) return text

  return text
    .split(/\n{2,}/)
    .map((paragraph) => {
      const lines = paragraph.trim().split(/\n/)
      if (!lines[0]) return ''
      if (/^#{1,3}\s+/.test(lines[0])) {
        const level = Math.min(lines[0].match(/^#+/)?.[0].length || 2, 3)
        return `<h${level}>${escapeHtml(lines[0].replace(/^#{1,3}\s+/, ''))}</h${level}>`
      }
      return `<p>${lines.map(escapeHtml).join('<br>')}</p>`
    })
    .filter(Boolean)
    .join('')
}

export const parseMetaSuggestion = (text: string): MetaSuggestion | null => {
  const matched = text.match(/\{[\s\S]*\}/)
  if (!matched) return null

  try {
    const json = JSON.parse(matched[0]) as Record<string, unknown>
    const summary = typeof json.introduce === 'string' ? json.introduce : json.summary
    const category = typeof json.categoryName === 'string' ? json.categoryName : json.category
    return {
      title: typeof json.title === 'string' ? json.title : undefined,
      introduce: typeof summary === 'string' ? summary : undefined,
      categoryName: typeof category === 'string' ? category : undefined,
      tags: Array.isArray(json.tags)
        ? json.tags.map((tag) => String(tag).trim()).filter(Boolean).slice(0, 3)
        : undefined,
    }
  } catch {
    return null
  }
}

export const splitParagraphs = (text: string) =>
  text
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)

export const buildTextDiff = (before: string, after: string): DiffSegment[] => {
  const left = Array.from(before).slice(0, 800)
  const right = Array.from(after).slice(0, 800)
  const table = Array.from({ length: left.length + 1 }, () =>
    new Uint16Array(right.length + 1),
  )

  for (let i = left.length - 1; i >= 0; i -= 1) {
    for (let j = right.length - 1; j >= 0; j -= 1) {
      table[i]![j] = left[i] === right[j]
        ? table[i + 1]![j + 1]! + 1
        : Math.max(table[i + 1]![j]!, table[i]![j + 1]!)
    }
  }

  const segments: DiffSegment[] = []
  const append = (type: DiffSegment['type'], text: string) => {
    const last = segments[segments.length - 1]
    if (last?.type === type) last.text += text
    else segments.push({ type, text })
  }

  let i = 0
  let j = 0
  while (i < left.length && j < right.length) {
    if (left[i] === right[j]) {
      append('equal', left[i]!)
      i += 1
      j += 1
    } else if (table[i + 1]![j]! >= table[i]![j + 1]!) {
      append('remove', left[i]!)
      i += 1
    } else {
      append('add', right[j]!)
      j += 1
    }
  }
  while (i < left.length) append('remove', left[i++]!)
  while (j < right.length) append('add', right[j++]!)

  if (before.length > 800 || after.length > 800) {
    segments.push({ type: 'equal', text: '…' })
  }
  return segments
}
