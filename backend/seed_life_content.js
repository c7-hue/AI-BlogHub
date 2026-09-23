const fs = require('fs')
const path = require('path')
const db = require('./model/db')

const ROOT = path.resolve(__dirname, '..')
const IMAGE_ROOT = path.join(ROOT, '图片')
const FILE_ROOT = path.join(__dirname, 'data/files')
const BASE_IMG_URL = 'http://127.0.0.1:3001/files'

const now = () => {
  const d = new Date()
  const pad = (value) => String(value).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

const ensureCopiedImage = (sourceSegments, targetName) => {
  const source = path.join(IMAGE_ROOT, ...sourceSegments)
  const target = path.join(FILE_ROOT, targetName)

  if (!fs.existsSync(source)) {
    throw new Error(`Image not found: ${source}`)
  }

  if (!fs.existsSync(FILE_ROOT)) {
    fs.mkdirSync(FILE_ROOT, { recursive: true })
  }

  if (!fs.existsSync(target)) {
    fs.copyFileSync(source, target)
  }

  return targetName
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

const findOrCreateLabel = async (labelName) => {
  const rows = await db.query2('select id from label where label_name=? limit 1', [labelName])
  if (rows[0]?.id) return rows[0].id

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

const diaryPicture = (...urls) => urls.map((url) => JSON.stringify({ url })).join(' ')

const main = async () => {
  const imageMap = {
    flower: ensureCopiedImage(['风景', '繁花.jpg'], 'life_flower.jpg'),
    mountain: ensureCopiedImage(['风景', '南天门.jpg'], 'life_mountain.jpg'),
    sun: ensureCopiedImage(['风景', '手捏太阳.jpg'], 'life_sun.jpg'),
    cat: ensureCopiedImage(['猫猫', '小黑.jpg'], 'life_cat_xiaohei.jpg'),
    food: ensureCopiedImage(['美食', '鸡公煲.jpg'], 'life_food_chicken_pot.jpg'),
    yogurt: ensureCopiedImage(['美食', '酸奶碗.jpg'], 'life_food_yogurt.jpg'),
  }

  const lifeSubsetId = await findOrCreateSubset('生活日常', 0)
  const travelSubsetId = await findOrCreateSubset('旅行记录', 0)
  const foodSubsetId = await findOrCreateSubset('美食随记', 0)

  await Promise.all(['生活', '旅行', '美食', '猫猫', '日常'].map(findOrCreateLabel))

  const articles = [
    {
      title: '周末去看了一场很轻的春天',
      subset_id: lifeSubsetId,
      label: '生活,日常',
      cover: `${BASE_IMG_URL}/${imageMap.flower}`,
      introduce:
        '周末没有安排很满，只是出门散步、看花、晒太阳。回来的路上突然觉得，普通的一天也值得认真记录。',
      content:
        '<p>这个周末没有做什么特别厉害的事情，只是慢慢走了一段路，看路边的花开得很热闹。</p><p>以前总觉得博客应该写一些很完整、很有用的内容，现在发现生活本身也可以被认真写下来。比如一阵风、一次散步、一个刚好抬头看到的天空。</p><p>回来的时候买了一杯冰饮，坐在路边发了会儿呆。那一刻突然觉得，普通日子里也有很多很轻的春天。</p>',
      views: 186,
    },
    {
      title: '爬到南天门那天，风把人吹醒了',
      subset_id: travelSubsetId,
      label: '旅行,生活',
      cover: `${BASE_IMG_URL}/${imageMap.mountain}`,
      introduce:
        '一次有点累但很值得的爬山记录。到山顶以后，风很大，腿很酸，但心里突然变得特别安静。',
      content:
        '<p>爬山之前我以为最难的是路，真正开始以后才发现，难的是一直和自己的“算了吧”拉扯。</p><p>走到南天门的时候风特别大，吹得人清醒。回头看下面的路，突然觉得很多事情也是这样，走的时候很累，走完以后才知道自己其实可以。</p><p>照片拍得不算专业，但我很喜欢。它提醒我，有些风景必须靠自己走过去。</p>',
      views: 241,
    },
    {
      title: '今天的晚饭是热乎乎的鸡公煲',
      subset_id: foodSubsetId,
      label: '美食,日常',
      cover: `${BASE_IMG_URL}/${imageMap.food}`,
      introduce:
        '晚上和朋友去吃鸡公煲，热气、米饭和聊天声混在一起，普通但很治愈。',
      content:
        '<p>今天晚上去吃了鸡公煲。店里人很多，锅一端上来，热气一下子把一天的疲惫盖住了。</p><p>我很喜欢这种需要配米饭的食物，酱汁拌进去的时候，会有一种“今天也算好好吃饭了”的踏实感。</p><p>朋友说最近大家都很忙，但能坐下来一起吃一顿饭，就已经很好了。</p>',
      views: 164,
    },
    {
      title: '小黑今天又霸占了我的椅子',
      subset_id: lifeSubsetId,
      label: '猫猫,生活',
      cover: `${BASE_IMG_URL}/${imageMap.cat}`,
      introduce:
        '家里的猫总能精准找到最舒服的位置。今天它霸占了我的椅子，我只好坐旁边继续写代码。',
      content:
        '<p>小黑今天又趴在我的椅子上睡觉。我刚站起来倒了杯水，回来以后位置就没了。</p><p>它睡得很理直气壮，好像这把椅子本来就是它的。我在旁边看了半天，最后还是搬了另一个凳子继续写代码。</p><p>有时候觉得猫很神奇，它什么都不说，但能让房间突然变得很有生活气。</p>',
      views: 203,
    },
  ]

  const articleIds = []
  for (const article of articles) {
    articleIds.push(await createArticle(article))
  }

  const diaries = [
    {
      title: '今天的太阳很好',
      content:
        '下午出门的时候，阳光刚好落在路边。没有做什么特别的事，只是觉得天气很好，就想把这一刻留下来。',
      picture: diaryPicture(imageMap.sun),
      mood: 1,
      weather_id: 1,
    },
    {
      title: '酸奶碗和慢一点的早晨',
      content:
        '早上给自己做了酸奶碗，水果铺上去的时候心情会变好。今天决定慢一点开始，不急着打开电脑。',
      picture: diaryPicture(imageMap.yogurt),
      mood: 1,
      weather_id: 1,
    },
    {
      title: '小黑睡了一整个下午',
      content:
        '小黑今天从中午睡到傍晚，中间只换了三个姿势。看它睡觉会让人产生一种错觉：好像生活没有那么赶。',
      picture: diaryPicture(imageMap.cat),
      mood: 2,
      weather_id: 2,
    },
  ]

  for (const diary of diaries) {
    await createDiary(diary)
  }

  const comments = [
    {
      user_id: '2001',
      user_type: 1,
      user_name: '阿宁',
      article_id: articleIds[0],
      content: '这种日常感很好，看完也想出去走走。',
    },
    {
      user_id: '2002',
      user_type: 1,
      user_name: '小周',
      article_id: articleIds[0],
      content: '普通的一天被写得很温柔。',
    },
    {
      user_id: '2003',
      user_type: 1,
      user_name: '山里有风',
      article_id: articleIds[1],
      content: '南天门那段太有画面感了，爬山真的会让人清醒。',
    },
    {
      user_id: '2004',
      user_type: 1,
      user_name: '今天吃什么',
      article_id: articleIds[2],
      content: '看到鸡公煲三个字已经饿了。',
    },
    {
      user_id: '2005',
      user_type: 1,
      user_name: '猫猫观察员',
      article_id: articleIds[3],
      content: '小黑也太会挑位置了，猫猫才是家里的主人。',
    },
    {
      user_id: '2006',
      user_type: 1,
      user_name: '路过',
      article_id: articleIds[3],
      content: '这篇好可爱，生活气一下就出来了。',
    },
  ]

  for (const comment of comments) {
    await createComment(comment)
  }

  const [articleCount] = await db.query2('select count(*) as count from article')
  const [diaryCount] = await db.query2('select count(*) as count from diary')
  const [commentCount] = await db.query2('select count(*) as count from comment')

  console.log('Life content inserted.')
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
