import test from 'node:test'
import assert from 'node:assert/strict'

class MemoryStorage {
  #data = new Map()
  getItem(key) { return this.#data.get(key) ?? null }
  setItem(key, value) { this.#data.set(key, String(value)) }
  removeItem(key) { this.#data.delete(key) }
}

globalThis.localStorage = new MemoryStorage()
globalThis.sessionStorage = new MemoryStorage()

const { clearStoredUser, getAccessToken, getStoredUser, isAuthenticated } = await import('../src/utils/auth.ts')

test('auth reads a valid persisted user', () => {
  localStorage.setItem('user', JSON.stringify({ id: 7, name: 'admin', token: 'token-123' }))
  assert.deepEqual(getStoredUser(), { id: 7, name: 'admin', token: 'token-123' })
  assert.equal(getAccessToken(), 'token-123')
  assert.equal(isAuthenticated(), true)
})

test('auth rejects corrupted storage', () => {
  localStorage.setItem('user', '{broken')
  assert.equal(getStoredUser(), null)
  assert.equal(isAuthenticated(), false)
})

test('clearStoredUser clears both previous persistence locations', () => {
  localStorage.setItem('user', '{}')
  sessionStorage.setItem('user', '{}')
  clearStoredUser()
  assert.equal(localStorage.getItem('user'), null)
  assert.equal(sessionStorage.getItem('user'), null)
})
