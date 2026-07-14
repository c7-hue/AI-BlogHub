const db = require('./model/db')

const now = () => {
  const d = new Date()
  const pad = (value) => String(value).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

const findArticleId = async (keyword) => {
  const rows = await db.query2('select id from article where title like ? order by id desc limit 1', [
    `%${keyword}%`,
  ])
  return rows[0]?.id || 1
}

const createComment = async (comment) => {
  const rows = await db.query2(
    'select id from comment where user_name=? and content=? limit 1',
    [comment.user_name, comment.content],
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
  await db.query2("delete from comment where content like '测试内容%'")

  const articleId = await findArticleId('AI')
  const lifeArticleId = await findArticleId('小黑')
  const foodArticleId = await findArticleId('鸡公煲')

  const comments = [
    {
      user_id: '3001',
      user_type: 1,
      user_name: '前端实习生',
      article_id: articleId,
      content: '这个后台系统功能挺完整的，文章、分类、评论和 AI 助手都串起来了。',
    },
    {
      user_id: '3002',
      user_type: 1,
      user_name: '产品体验官',
      article_id: articleId,
      content: 'AI 辅助写作很实用，能生成标题和摘要，写博客的时候省了不少时间。',
    },
    {
      user_id: '3003',
      user_type: 1,
      user_name: '代码审查员',
      article_id: articleId,
      content: '页面交互比较清楚，请求失败也有提示，后台管理体验比普通 demo 完整很多。',
    },
    {
      user_id: '3004',
      user_type: 1,
      user_name: '内容创作者',
      article_id: lifeArticleId,
      content: '富文本编辑和图片管理很好用，写生活记录的时候很方便。',
    },
    {
      user_id: '3005',
      user_type: 1,
      user_name: '访客小林',
      article_id: foodArticleId,
      content: '分类和标签很直观，找美食、旅行、日常文章都很快。',
    },
    {
      user_id: '3006',
      user_type: 1,
      user_name: '面试官视角',
      article_id: articleId,
      content: '这个项目能看出前端组件封装、接口联调和状态管理能力，适合放在简历里。',
    },
    {
      user_id: '3007',
      user_type: 1,
      user_name: '普通用户',
      article_id: lifeArticleId,
      content: '整体界面干净，评论、文章和随笔都像真实博客，不是空页面。',
    },
    {
      user_id: '3008',
      user_type: 1,
      user_name: 'AI 体验者',
      article_id: articleId,
      content: 'AI 助手如果再加上选中文本润色和标签推荐，就更像真正的创作工具了。',
    },
  ]

  for (const comment of comments) {
    await createComment(comment)
  }

  const [count] = await db.query2('select count(*) as count from comment')
  const latest = await db.query2(
    'select id,user_name,content,complaint,isread,moment from comment order by id desc limit 8',
  )

  console.log('System comments inserted.')
  console.log({ comment: count.count, latest })
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
