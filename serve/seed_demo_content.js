const db = require('./model/db')

const now = () => {
  const d = new Date()
  const pad = (value) => String(value).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

const existsByField = async (table, field, value) => {
  const rows = await db.query2(`select id from ${table} where ${field}=? limit 1`, [value])
  return rows[0]?.id
}

const findOrCreateSubset = async (subsetName, classify) => {
  const rows = await db.query2(
    'select id from subset where subset_name=? and classify=? limit 1',
    [subsetName, classify],
  )

  if (rows[0]?.id) return rows[0].id

  const result = await db.query2('insert into subset set ?', {
    subset_name: subsetName,
    classify,
  })
  return result.insertId
}

const createLabel = async (labelName) => {
  const id = await existsByField('label', 'label_name', labelName)
  if (id) return id

  const result = await db.query2('insert into label set ?', {
    label_name: labelName,
    moment: now(),
  })
  return result.insertId
}

const createArticle = async (article) => {
  const id = await existsByField('article', 'title', article.title)
  if (id) return id

  const result = await db.query2('insert into article set ?', {
    ...article,
    classify: 0,
    state: 1,
    views: article.views || 0,
    moment: now(),
  })
  return result.insertId
}

const createDiary = async (diary) => {
  const id = await existsByField('diary', 'title', diary.title)
  if (id) return id

  const result = await db.query2('insert into diary set ?', {
    ...diary,
    picture: diary.picture || null,
    weather_id: diary.weather_id || null,
    moment: now(),
  })
  return result.insertId
}

const createComment = async (comment) => {
  const rows = await db.query2(
    'select id from comment where article_id=? and user_name=? and content=? limit 1',
    [comment.article_id, comment.user_name, comment.content],
  )

  if (rows[0]?.id) return rows[0].id

  const result = await db.query2('insert into comment set ?', {
    ...comment,
    moment: now(),
    complaint: 0,
    isread: 0,
  })
  return result.insertId
}

const main = async () => {
  const frontendSubsetId = await findOrCreateSubset('前端开发', 0)
  const aiSubsetId = await findOrCreateSubset('AI 创作', 0)

  await Promise.all([
    createLabel('Vue3'),
    createLabel('TypeScript'),
    createLabel('AI'),
    createLabel('Pinia'),
    createLabel('工程化'),
  ])

  const articles = [
    {
      title: 'Vue3 后台管理系统中的状态管理实践',
      subset_id: frontendSubsetId,
      label: 'Vue3,Pinia,TypeScript',
      introduce:
        '总结在博客后台中使用 Pinia 管理登录态、筛选条件和 AI 会话状态的实践，重点记录状态拆分和页面刷新后的数据恢复。',
      content:
        '<h2>为什么要拆分状态</h2><p>后台系统里，用户信息、文章筛选条件和 AI 会话状态的变化频率不同，如果全部放在组件内部，会导致跨页面传递变得混乱。</p><p>项目中将用户登录态、文章筛选条件、AI 对话上下文分别交给 Pinia 管理，让页面组件只负责展示和交互。</p><h2>实践收获</h2><p>状态管理不是为了把所有数据都放进 store，而是把真正需要共享、持久化或跨页面复用的数据沉淀下来。</p>',
      views: 128,
    },
    {
      title: '从普通聊天框到 AI 博客创作助手',
      subset_id: aiSubsetId,
      label: 'AI,Vue3,富文本',
      introduce:
        '记录如何把大模型能力接入博客创作流程，实现标题生成、大纲生成、内容润色、摘要提取和标签推荐。',
      content:
        '<h2>不只调用 API</h2><p>单纯把输入框接到模型接口上，项目亮点会比较弱。更好的方式是让 AI 参与真实业务流程，例如文章创作、内容分析和标签推荐。</p><h2>和编辑器联动</h2><p>在富文本编辑器中选择一段内容后，可以让 AI 进行润色、扩写或续写，再将结果一键插入到编辑区。</p><h2>简历表达</h2><p>这个功能可以体现接口封装、状态管理、异常处理和复杂交互设计能力。</p>',
      views: 216,
    },
    {
      title: 'Axios 请求封装与登录失效处理',
      subset_id: frontendSubsetId,
      label: 'Axios,JWT,工程化',
      introduce:
        '梳理后台管理系统中 Axios 实例、请求拦截器、响应拦截器、Token 携带和错误提示的封装思路。',
      content:
        '<h2>统一请求入口</h2><p>把 baseURL、超时时间、错误提示放在同一个 Axios 实例中，可以减少页面里的重复代码。</p><h2>Token 处理</h2><p>登录后将 Token 保存在状态管理中，请求时统一携带，接口返回登录失效时统一跳转登录页。</p><h2>接口联调体验</h2><p>封装后的请求层让页面组件只关心业务数据，错误处理和响应解析由公共层完成。</p>',
      views: 97,
    },
  ]

  const articleIds = []
  for (const article of articles) {
    articleIds.push(await createArticle(article))
  }

  const diaries = [
    {
      title: '今天把 AI 助手接进编辑器',
      content:
        '今天主要在想一个问题：AI 功能如果只是聊天框，简历上看起来会很薄。真正有价值的地方，是让它参与文章标题、大纲、润色和标签推荐。做完以后，项目终于不像简单调接口了。',
      mood: 1,
    },
    {
      title: '写项目经历比写代码还难',
      content:
        '整理简历的时候发现，功能做出来只是第一步。怎么把“我做了页面”表达成“我解决了什么问题”，才是真正能让面试官看懂能力的地方。',
      mood: 2,
    },
    {
      title: '后台系统也要注意细节',
      content:
        '今天改了表单、请求和编辑器之间的数据流。以前觉得后台页面能用就行，现在发现加载状态、错误提示、空数据展示这些细节会直接影响体验。',
      mood: 1,
    },
  ]

  for (const diary of diaries) {
    await createDiary(diary)
  }

  const comments = [
    {
      user_id: '1001',
      user_type: 1,
      user_name: '前端同学',
      article_id: articleIds[0],
      content: 'Pinia 这里讲得很清楚，状态拆分思路很实用。',
    },
    {
      user_id: '1002',
      user_type: 1,
      user_name: '小陈',
      article_id: articleIds[1],
      content: 'AI 和富文本编辑器联动这个方向挺有亮点。',
    },
    {
      user_id: '1003',
      user_type: 1,
      user_name: '面试准备中',
      article_id: articleIds[1],
      content: '这个功能写到简历里会比普通聊天框更有说服力。',
    },
    {
      user_id: '1004',
      user_type: 1,
      user_name: '路过的读者',
      article_id: articleIds[2],
      content: 'Axios 拦截器这块适合后台项目复用。',
    },
    {
      user_id: '1005',
      user_type: 1,
      user_name: '菜鸟前端',
      article_id: articleIds[0],
      content: '希望后面可以再写一篇路由权限控制。',
    },
  ]

  for (const comment of comments) {
    await createComment(comment)
  }

  const [articleCount] = await db.query2('select count(*) as count from article')
  const [diaryCount] = await db.query2('select count(*) as count from diary')
  const [commentCount] = await db.query2('select count(*) as count from comment')

  console.log('Seed content inserted.')
  console.log({
    article: articleCount.count,
    diary: diaryCount.count,
    comment: commentCount.count,
  })
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
