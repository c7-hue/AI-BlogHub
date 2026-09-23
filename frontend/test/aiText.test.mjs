import test from 'node:test'
import assert from 'node:assert/strict'
import {
  buildTextDiff,
  parseMetaSuggestion,
  splitParagraphs,
  stripHtml,
  textToHtml,
} from '../src/utils/aiText.ts'

test('parseMetaSuggestion extracts structured AI metadata', () => {
  const result = parseMetaSuggestion('```json\n{"title":"Vue 实战","summary":"项目复盘","category":"前端开发","tags":["Vue","TypeScript","工程化","多余"]}\n```')
  assert.deepEqual(result, {
    title: 'Vue 实战',
    introduce: '项目复盘',
    categoryName: '前端开发',
    tags: ['Vue', 'TypeScript', '工程化'],
  })
})

test('parseMetaSuggestion rejects invalid output', () => {
  assert.equal(parseMetaSuggestion('这不是 JSON'), null)
})

test('textToHtml escapes unsafe text and preserves paragraphs', () => {
  assert.equal(textToHtml('<script>alert(1)</script>\n\n第二段'), '<p>&lt;script&gt;alert(1)&lt;/script&gt;</p><p>第二段</p>')
})

test('stripHtml returns readable editor text', () => {
  assert.equal(stripHtml('<h2>标题</h2><p>正文 <strong>重点</strong></p>'), '标题 正文 重点')
})

test('splitParagraphs removes blank paragraphs', () => {
  assert.deepEqual(splitParagraphs('第一段\n\n\n第二段\n\n'), ['第一段', '第二段'])
})

test('buildTextDiff can reconstruct both versions', () => {
  const diff = buildTextDiff('今天下雨', '今天下了一场雨')
  const before = diff.filter((item) => item.type !== 'add').map((item) => item.text).join('')
  const after = diff.filter((item) => item.type !== 'remove').map((item) => item.text).join('')
  assert.equal(before, '今天下雨')
  assert.equal(after, '今天下了一场雨')
  assert.ok(diff.some((item) => item.type === 'add'))
})
