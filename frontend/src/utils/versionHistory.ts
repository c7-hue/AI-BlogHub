export type ArticleVersionSnapshot = {
  title?: string
  introduce?: string
  label?: string[]
  subset_id?: number
  cover?: string
  content?: string
}

export type ArticleVersion = Required<Pick<ArticleVersionSnapshot, 'title' | 'introduce' | 'label' | 'content'>> &
  Omit<ArticleVersionSnapshot, 'title' | 'introduce' | 'label' | 'content'> & {
    id: string
    createdAt: number
    source: 'auto' | 'manual'
  }

export const normalizeSnapshot = (snapshot: ArticleVersionSnapshot) => ({
  ...snapshot,
  title: snapshot.title || '',
  introduce: snapshot.introduce || '',
  label: Array.isArray(snapshot.label) ? snapshot.label : [],
  content: snapshot.content || '',
})

export const snapshotFingerprint = (snapshot: ArticleVersionSnapshot) => {
  const data = normalizeSnapshot(snapshot)
  return JSON.stringify({
    title: data.title,
    introduce: data.introduce,
    label: data.label,
    subset_id: data.subset_id,
    cover: data.cover,
    content: data.content,
  })
}

export const addArticleVersion = (
  versions: ArticleVersion[],
  snapshot: ArticleVersionSnapshot,
  source: ArticleVersion['source'],
  createdAt = Date.now(),
): ArticleVersion[] => {
  const normalized = normalizeSnapshot(snapshot)
  if (!normalized.title && !normalized.introduce && !normalized.content) return versions

  if (source === 'auto' && versions[0] && snapshotFingerprint(versions[0]) === snapshotFingerprint(normalized)) {
    return versions
  }

  const version: ArticleVersion = {
    ...normalized,
    id: `${createdAt}-${Math.random().toString(16).slice(2)}`,
    createdAt,
    source,
  }
  return [version, ...versions].slice(0, 20)
}

export const parseVersionHistory = (raw: string | null): ArticleVersion[] => {
  if (!raw) return []
  try {
    const value = JSON.parse(raw)
    return Array.isArray(value) ? value.slice(0, 20) : []
  } catch {
    return []
  }
}
