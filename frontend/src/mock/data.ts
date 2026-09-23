import Mock from 'mockjs'
const Random = Mock.Random

// 总览数据
export const overview = Mock.mock({
  "code":200,
  "data":{
    // 文件总大小：生成一个 60 到 100 之间的浮点数（保留3位小数），单位为 MB
    "file":Random.float(60,100,3,3) + 'M',
    // 文章数量：随机生成 0 到 50 之间的整数，默认为0
    "article|0-50":0,
    "gallery|0-50":0,
    "diary|0-50":0,
  }
})

// 访问量
export const visit = Mock.mock({
  "code":200,
  "data|30":[
    {
      // 时间
      "date":"@datetime('MM-dd')",
      "count|10-100":12,
     }
   ]
})

// 数据监测
export const survey = Mock.mock({
  "data":{
    "device":[
      {
        "key":'mobile',
        "name":'移动端',
        "value|30-120":50,
      },
      {
        "key":'pc',
        "name":'电脑端',
        "value|30-120":40,
      }
    ],
    "website":[{
      "key":'home',
      "name":'首页',
      "value|30-120":50,
    },{
      "key":'project',
      "name":'项目',
      "value|30-120":40,
    },{
      "key":'diary',
      "name":'日记',
      "value|30-120":40,
    },{
      "key":'photo',
      "name":'摄影',
      "value|30-120":40,
    }
    ]
  }
})

// 评论
export const comment = Mock.mock({
  "data":{
    "count":123,
    "list|123":[{
      "id|+1":0,
      "article":{
        "id|+1":2,
        "title":"@ctitle(3,12)",
      },
      "user":{
        "id|+1":3,
        "name":"@ctitle(3,12)",
        "imgurl":"https://www.huohuo90.com:3003/user/6353b034dd4b583975e77fbe.png",
      },
    "comment":"@cparagraph(1,4)",
    "moment":"@datetime()",
    "complaint|0-12":0,
    }]
  }
})

// 文章状态
export const state = Mock.mock({
  "data":[
    {
      "id":0,
      "name":"已发布",
      "value|0-30":4,
    },
    {
      "id":1,
      "name":"未发布",
      "value|0-30":4,
    }
  ]
})

// 分组
export const subset = Mock.mock({
  "data":{
    "count":123,
    "list|4":[{
      "id|+1":0,
      "name":"@ctitle(2,4)",
      "value|0-30":4,
      "moment":"@datetime()",
    }]
  }
})

// 图片合集
const photos = [
  "a.jpg",
  "b.jpg",
  "c.jpg",
  "d.jpg",
  "e.jpg",
  "f.jpg",
  "g.jpg",
  "h.jpg",
  "i.jpg",
  "j.jpg",
  "k.jpg",
  "l.jpg",
  "m.jpg",
  "n.jpg",
  "o.jpg",
  "p.jpg",
  "q.jpg"
]

const photoarr=[
  ["a.jpg"],
  ["b.jpg","c.jpg"],
  ["d.jpg","e.jpg","f.jpg"],
  ["g.jpg","h.jpg","i.jpg"],
  ["j.jpg","k.jpg","l.jpg"],
]

// 文件数据
export const mkfile = Mock.mock({
  "count":64,
  "list|64":[
    {
      "id|+1":0,
      "url|1":photos,
      "fileName":"@ctitle(2,12)",
      "format":"jpeg",
      "subsetId|0-4":3,
    }
  ]
})

// 标签
export const mklabel = Mock.mock({
  "data":{
    "count":123,
    "list|12":[{
      "id|+1":0,
      "name":"@ctitle(2,4)",
      "moment":"@datetime()",
    }]
  }
})

// 文章数据
export const mkarticle = Mock.mock({
  "data":{
    "count":123,           // 文章总数，固定为123篇
    "list|123":[{          // 生成一个包含123篇文章的数组，与count一致
      "id|+1":0,           // 文章ID，从0开始自增
      "cover|1":photos,    // 文章封面图片，从photos数组中随机选择一张
      "title":"@ctitle(4,12)",  // 文章标题，随机生成4-12个中文字符
      "moment":"@datetime()",  // 发布时间，生成随机日期时间格式
      "label|0-3":["@ctitle(2,4)"],  // 文章标签，随机生成0-3个标签，每个标签2-4个中文字符
      "introduce":"@cparagraph(1,4)",  // 文章简介，随机生成1-4个中文段落
      "views|12-429":122,  // 浏览量，随机生成12-429之间的数字
      "comment|8-24":12,   // 评论数，随机生成8-24之间的数字
      "praise|8-123":42,   // 点赞数，随机生成8-123之间的数字
      "subsetId|0-4":0,    // 文章分组ID，随机生成0-4之间的数字
      "state|0-1":0,       // 文章状态，随机生成0或1（0可能表示草稿，1表示发布）
    }]
  }
})

// 图库数据
export const mkgallery = Mock.mock({
  "count":64,
  "list|64":[{
    "id|+1":0,
    "cover|1":photos,
    "title":"@ctitle(4,12)",
    "moment":"@datetime()",
    "label|0-3":["@ctitle(2,4)"],
    "introduce":"@cparagraph(1,4)",
    "views|12-429":122,
    "comment|8-24":12,
    "praise|8-123":42,
    "subsetId|0-4":0,
    "content|1":photoarr,
  }]
})

// 日记数据
export const mkdiary = Mock.mock({
  "count": 64,
  "list|64": [
    {
      "id|+1": 0,
      "title": "@ctitle(4, 12)",
      "moment": "@datetime()",
      "weatherId|0~7": 0,
      "content": "@cparagraph(2, 10)",
      "picture|1": photoarr,
    }
  ]
})

// 图片列表
export const mphoto = Mock.mock({
  "data|6":[// 生成一个包含6张图片的数组
    {
      "id|+1":0,
      "url|1":photos,
    }
  ]
})
