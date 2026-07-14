export interface StoredUser {
  id: number
  name: string
  token: string
}

const USER_STORAGE_KEY = 'user'

export const getStoredUser = (): StoredUser | null => {
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY)
    if (!raw) return null

    const value = JSON.parse(raw) as Partial<StoredUser>
    if (!value.token || typeof value.token !== 'string') return null

    return {
      id: typeof value.id === 'number' ? value.id : -1,
      name: typeof value.name === 'string' ? value.name : '',
      token: value.token,
    }
  } catch {
    return null
  }
}

export const getAccessToken = () => getStoredUser()?.token || ''

export const clearStoredUser = () => {
  localStorage.removeItem(USER_STORAGE_KEY)
  sessionStorage.removeItem(USER_STORAGE_KEY)
}

export const isAuthenticated = () => Boolean(getAccessToken())
