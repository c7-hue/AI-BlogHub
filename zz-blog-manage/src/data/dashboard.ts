const day = 24 * 60 * 60 * 1000

export const visitData = Array.from({ length: 30 }, (_, index) => {
  const date = new Date(Date.now() - (29 - index) * day)
  const baseline = 46 + Math.round(Math.sin(index / 3) * 18)
  return {
    date: `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`,
    count: baseline + (index % 5) * 4,
  }
})

export const surveyData = {
  device: [
    { key: 'mobile', name: '移动端', value: 86 },
    { key: 'pc', name: '电脑端', value: 64 },
  ],
  website: [
    { key: 'home', name: '首页', value: 72 },
    { key: 'project', name: '文章', value: 58 },
    { key: 'diary', name: '日记', value: 41 },
    { key: 'photo', name: '摄影', value: 36 },
  ],
}
