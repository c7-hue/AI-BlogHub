import test from 'node:test'
import assert from 'node:assert/strict'
import {
  addArticleVersion,
  parseVersionHistory,
  snapshotFingerprint,
} from '../src/utils/versionHistory.ts'

const draft = { title: '周末记录', content: '<p>正文</p>', label: ['生活'] }

test('empty drafts are not saved', () => {
  assert.deepEqual(addArticleVersion([], {}, 'auto', 1), [])
})

test('automatic versions deduplicate unchanged content', () => {
  const first = addArticleVersion([], draft, 'auto', 1)
  const second = addArticleVersion(first, draft, 'auto', 2)
  assert.equal(second, first)
})

test('manual snapshots can preserve intentional duplicates', () => {
  const first = addArticleVersion([], draft, 'manual', 1)
  const second = addArticleVersion(first, draft, 'manual', 2)
  assert.equal(second.length, 2)
})

test('version history keeps the latest 20 entries', () => {
  let versions = []
  for (let index = 0; index < 25; index += 1) {
    versions = addArticleVersion(versions, { ...draft, content: String(index) }, 'manual', index)
  }
  assert.equal(versions.length, 20)
  assert.equal(versions[0].content, '24')
})

test('version history parsing tolerates broken storage', () => {
  assert.deepEqual(parseVersionHistory('{broken'), [])
  assert.equal(snapshotFingerprint(draft), snapshotFingerprint({ ...draft }))
})
