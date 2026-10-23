const dbModel = require('../model/db_model')
const jwt = require('../lib/jwt')
const mkdir = require('../lib/mkdir')
const aiIndex = require('../lib/aiIndex')

// 是否注册
exports.isRegister = async(req,res)=>{
  // 查询数据库是否有注册用户
  await dbModel.isRegister().then((result)=>{
    let code = 401
    if(result[0].count>0){
      // 已注册
      code=200
    }
    res.send({
      code:code,
     })
  })
}

// 管理员注册
exports.register = async(req,res)=>{
  let data=req.body
  console.log('注册请求数据：', data)
  // 将前端的password字段转换为数据库需要的password字段
  let userData = {
    name: data.name,
    password: data.password || data.psw,
    moment: function() { var d = new Date(); var Y = d.getFullYear(); var M = d.getMonth() + 1; var D = d.getDate(); var h = d.getHours(); var m = d.getMinutes(); var s = d.getSeconds(); if (M < 10) M = '0' + M; if (D < 10) D = '0' + D; if (h < 10) h = '0' + h; if (m < 10) m = '0' + m; if (s < 10) s = '0' + s; return Y + '-' + M + '-' + D + ' ' + h + ':' + m + ':' + s; }()
  }
  console.log('准备插入的用户数据：', userData)
  
  // 先检查用户是否已存在
  await dbModel.login(data.name).then(async (userResult) => {
    if (userResult.length > 0) {
      console.log('用户已存在：', data.name)
      res.send({
        code:400,
        message: '用户已存在'
       })
    } else {
      // 插入新用户
      await dbModel.insertUser(userData).then((result)=>{
        console.log('注册成功，结果：', result)
        res.send({
          code:200,
          message: '注册成功'
         })
      }).catch((error)=>{
        console.error('注册失败，错误：', error)
        res.send({
          code:500,
          message: '注册失败，请稍后重试'
         })
      })
    }
  }).catch((error)=>{
    console.error('检查用户存在失败，错误：', error)
    res.send({
      code:500,
      message: '注册失败，请稍后重试'
     })
  })
}

// 管理员登录
exports.login = async(req,res)=>{
  let data=req.body
  console.log('登录请求数据：', data)
  await dbModel.login(data.name).then((result)=>{
    console.log('登录查询结果：', result)
    if(result.length>0 && (data.psw || data.password) == result[0].password){
      let token = jwt.generateToken(data.name)
      let message={
        id:result[0].id,
        name:data.name,
        token:token
      }
      console.log('登录成功，返回数据：', message)
      res.send({ code:200, data:message,  })
    }else if(result.length>0){
      // 用户存在但密码错误
      console.log('密码错误：', data.name)
      res.send({  code:400,  data:{}, message: '密码错误'   })
    }else{
      // 用户不存在
      console.log('用户不存在：', data.name)
      res.send({code:401, data:{},message: '用户不存在' })
    }
  }).catch((error)=>{
    console.error('登录失败，错误：', error)
    res.send({  code:500,   data:{}, message: '登录失败，请稍后重试'  })
  })
}

// 获取用户资料
exports.getUserInfo = async(req,res)=>{
  const tokenInfo = jwt.verifyToken(req.authToken)
  if(!tokenInfo){
    res.send({code:300, message:'token无效'})
    return
  }
  await dbModel.getUserInfo(tokenInfo.id).then((result)=>{
    if(result.length==0){
      res.send({code:400, message:'用户不存在'})
      return
    }
    res.send({
      code:200,
      data:{
        id:result[0].id,
        name:result[0].name,
        nickname:result[0].nickname || '',
        avatar:result[0].avatar || '',
        email:result[0].email || ''
      }
    })
  }).catch(()=>{
    res.send({code:500, message:'获取用户资料失败'})
  })
}

// 修改用户资料（头像/昵称/邮箱，不涉及登录账号）
exports.updateUserInfo = async(req,res)=>{
  const data = req.body
  const tokenInfo = jwt.verifyToken(req.authToken)
  if(!tokenInfo){
    res.send({code:300, message:'token无效'})
    return
  }
  await dbModel.getUserInfo(tokenInfo.id).then(async (result)=>{
    if(result.length==0){
      res.send({code:400, message:'用户不存在'})
      return
    }
    const update = {}
    // 昵称：允许传空字符串（清空昵称，展示时回退账号名）
    if(typeof data.nickname == 'string'){
      update.nickname = data.nickname.trim()
    }
    // 头像：允许传空字符串（清空头像）
    if(typeof data.avatar == 'string'){
      update.avatar = data.avatar
    }
    // 邮箱：允许传空字符串
    if(typeof data.email == 'string'){
      update.email = data.email.trim()
    }
    if(Object.keys(update).length==0){
      res.send({code:400, message:'没有需要修改的内容'})
      return
    }
    await dbModel.updateUserInfo({id:result[0].id, data:update}).then(()=>{
      res.send({
        code:200,
        message:'修改成功',
        data:{
          id:result[0].id,
          name:result[0].name,
          nickname:update.nickname !== undefined ? update.nickname : (result[0].nickname || ''),
          avatar:update.avatar !== undefined ? update.avatar : (result[0].avatar || ''),
          email:update.email !== undefined ? update.email : (result[0].email || '')
        }
      })
    })
  }).catch(()=>{
    res.send({code:500, message:'修改用户资料失败'})
  })
}

//获取评论
exports.getComment = async (req, res) => {
    let data = req.body;
    let count = -1;
    await dbModel.getCommentPage(data.pageSize, data.nowPage).then(async (result) => {
        if (data.count) {
            let c = await dbModel.commentCount(-1, -1)
            count = c[0].count;
        }
        if (result.length > 0) {
            for (let i = 0; i < result.length; i++) {
              // 获取对应的文章
                let getArticTitle = await dbModel.getArticleTitle(result[i].article_id)
                if(getArticTitle.length>0){
                  result[i].atricle = {
                    id: result[i].article_id,
                    title: getArticTitle[0].title
                  } 
                }else {
                  result[i].atricle = {
                    id:-1,
                  }
                }
            }
        }
        res.send({
            code: 200,
            data: {
                count,
                result
            }
        })
    })
}

// 将评论转为已读
exports.commentIsread = async(req,res)=>{
  let data=req.body
  await dbModel.commentIsread(data.id).then((result)=>{
    res.send({
      code:200,
     })
  })
}

// 删除评论
exports.deleteComment = async(req,res)=>{
  let data=req.body
  await dbModel.deleteComment(data.id).then((result)=>{
    res.send({
      code:200,
     })
  })
}

//获取私信
exports.getMessage = async (req, res) => {
    let data = req.body;
    let count = -1;
    await dbModel.getMessagePage(data.pageSize, data.nowPage).then(async (result) => {
        if (data.count) {
            let c = await dbModel.messageCount(1)
            count = c[0].count;
        }
        if(result.length>0){
          // 将私信变为已读
          for(let i=0;i<result.length;i++){
            await dbModel.messageIsread(result[i].id)
          }
        }
        res.send({
            code: 200,
            data: {
                count,
                result
            }
        })
    })
}

// 获取私信未读总数
exports.NoreadMessage = async (req, res) => {
    await dbModel.messageCount(0).then(async (result) => {
        res.send({
            code: 200,
            data: result[0].count,
        })
    })
} 

// 删除私信
exports.deleteMessage = async (req, res) => {
    let data = req.body;
    await dbModel.deleteMessage(data.id).then(async (result) => {
        res.send({
            code: 200,
            data: result.affectedRows,
        })
    })
} 

//获取文章
exports.getArticle = async (req, res) => {
    let data = req.body;
    let count = -1;
    await dbModel.getArticlePage(data.pageSize, data.nowPage, data.state, data.subsetId, data.serchTerm,data.classify).then(async (result) => {
        if (data.count) {
            let c = await dbModel.articleCount(data.state,data.subsetId,data.serchTerm,data.classify)
            count = c[0].count;
        }
        if(result.length>0){
          for(let i=0;i<result.length;i++){
            let praise = await dbModel.praiseCount(result[i].id,-1)//点赞数
            let comment = await dbModel.commentCount(result[i].id,-1)//评论数
            result[i].comment= comment[0].count || 0
            result[i].praise= praise[0].count || 0
            if(result[i].label){
              result[i].label = result[i].label.split(',')
            }
          }
        }
        res.send({
            code: 200,
            data: {
                count,
                result
            }
        })
    })
}

// 修改文章发布状态
exports.changeArticleState = async(req,res)=>{
  let data=req.body
  await dbModel.changeArticleState(data.id,data.state).then((result)=>{
    aiIndex.indexArticle(data.id)
    res.send({
      code:200,
     })
  })
}

// 文章删除
exports.deleteArticle = async(req,res)=>{
  let data=req.body
  try {
    // 支持 articleId 和 id 两种参数名
    const articleId = data.articleId || data.id
    await dbModel.deleteArticle(articleId)
    aiIndex.removeArticleIndex(articleId)
    res.send({
      code:200,
     })
  } catch (error) {
    res.send({
      code:400,
      message: error.message
     })
  }
}

// 文章不同状态条数
exports.articleState = async (req,res)=>{
  let unpublish = await dbModel.articleCount(0,-1,'',0)
  let publish = await dbModel.articleCount(1,-1,'',0)
  let message =[{
    id:0,
    name:'未发布',
    value:unpublish[0].count,
  },{
    id:1,
    name:'已发布', 
    value:publish[0].count,
  }]
  res.send({
    code:200,
    data:message,
   })
}

//获取分组
exports.subset = async (req, res) => {
    let data = req.body
    let classify = data.classify;
    await dbModel.getSubset(data.classify).then(async (result) => {
        if (data.classify == 0 || data.classify == 1) {
            let count = await dbModel.articleCount(-1, -1, "", data.classify);
            let list = []
            if (result.length > 0) {
                for (let i = 0; i < result.length; i++) {
                    let value = await dbModel.articleCount(-1, result[i].id, "", data.classify);
                    list[i] = {
                        id: result[i].id,
                        value: value[0].count,
                        name: result[i].subset_name,
                    }
                }
            }
            res.send({
                code: 200,
                data: { count: count[0].count, list }
            })
        } else if (data.classify == 2) {
            let count = await dbModel.fileCount(-1);
            let list = []
            if (result.length > 0) {
                for (let i = 0; i < result.length; i++) {
                    let value = await dbModel.fileCount(result[i].id);
                    list[i] = {
                        id: result[i].id,
                        value: value[0].count,
                        name: result[i].subset_name,
                    }
                }
            }
            res.send({
                code: 200,
                data: { count: count[0].count, list }
            })
        }
    })
}

// 新建分组
exports.addSubset = async(req,res)=>{
  let data=req.body
  await dbModel.addSubset(data.value).then((result)=>{
    res.send({
      code:200,
      data:result.insertId,
     })
  })
}

// 修改分组名称updateSubset
exports.updateSubset = async(req,res)=>{
  let data=req.body
  await dbModel.updateSubset(data.subsetId,data.subsetName).then((result)=>{  
    res.send({
      code:200,
     })
  })
}

// 删除分组deleteSubset
exports.deleteSubset = async(req,res)=>{
  let data=req.body
  await dbModel.deleteSubset(data.subsetId).then((result)=>{
    res.send({
      code:200,
     })
  })
}

// 获取标签
exports.Label = async (req, res) => {
    await dbModel.Label().then(async (result) => {
        res.send({
            code: 200,
            data: result
        })
    })
}

// 新建标签
exports.addLabel = async(req,res)=>{
  let data=req.body
  await dbModel.addLabel(data.value).then((result)=>{
    res.send({
      code:200,
      data:result.insertId,
     })
  })
}

// 删除标签
exports.deleteLabel = async(req,res)=>{
  let data=req.body
  await dbModel.deleteLabel(data.labelId).then(()=>{
    res.send({
      code:200,
     })
  })
}

//获取文件
exports.getFile = async (req, res) => {
    let data = req.body;
    let count = -1;

    await dbModel.getFilePage(data.pageSize, data.nowPage, data.subsetId).then(async (result) => {
        if (data.count) {
            let c = await dbModel.fileCount(data.subsetId)
            count = c[0].count;
        }
        res.send({
            code: 200,
            data: {
                count,
                list:result
            }
        })
    })
}

// 移动文件removeFile
exports.removeFile = async(req,res)=>{
  let data=req.body
  await dbModel.removeFile(data.id,data.subsetId).then(()=>{
    res.send({
      code:200,
     })
  })
}

//获取日记
exports.getDiaryPage = async (req, res) => {
    let data = req.body;
    let count = -1;
    await dbModel.getDiaryPage(data.pageSize, data.nowPage, data.searchTerm).then(async (result) => {
        if (data.count) {
            let c = await dbModel.diaryCount(data.searchTerm)
            count = c[0].count;
        }
        // if (result.length > 0) {
        //     for (let i = 0; i < result.length; i++) {
        //         if (result[i].picture) {
        //             result[i].picture = result[i].picture.split(",")
        //         }
        //     }
        // }
        res.send({
            code: 200,
            data: {
                count,
                list:result
            }
        })
    })
}

// 删除日记
exports.deleteDiary = async(req,res)=>{
  let data=req.body
  if(!data.diaryId){
    res.send({
      code:400,
      message: '缺少日记ID'
     })
    return
  }
  await dbModel.deleteDiary(data.diaryId).then(()=>{
    res.send({
      code:200,
     })
  })
} 

// 新建文章图库
exports.createArticle = async(req,res)=>{
  try {
    let reqData=req.body
    // 只保留基本字段，避免数据库表中不存在的字段
    let data={
      title: reqData.title,
      subset_id: reqData.subset_id,
      classify: reqData.classify,
      label: reqData.label,
      introduce: reqData.introduce,
      cover: reqData.cover,
      state: reqData.state,
      moment: reqData.moment,
      content: reqData.content || ''
    }
    // 处理标签
    if(reqData.label){
      data.label = reqData.label.join(',')
    }
    await dbModel.createArticle(data).then((result)=>{
      aiIndex.indexArticle(result.insertId)
      res.send({
        code:200,
        data:result.insertId,
       })
    })
  } catch (error) {
    console.error('创建文章失败:', error)
    res.send({
      code:500,
      message: '创建文章失败'
     })
  }
}

// 获取文章gainArticle
exports.gainArticle = async(req,res)=>{
  let data=req.body
  await dbModel.gainArticle(data.articleId).then((result)=>{
    res.send({
      code:200,
      data:result[0],
     })
  })
}

// 修改文章图库updateArticle 
exports.updateArticle = async(req,res)=>{
  let data=req.body
  // 处理标签
  if(data.value.label){
    data.value.label = data.value.label.join(',')
  }
  await dbModel.updateArticle(data.articleId,data.value).then(()=>{
    aiIndex.indexArticle(data.articleId)
    res.send({
      code:200,
     })
  })
}

// 新建日记createDiary
exports.createDiary = async(req,res)=>{
  let data=req.body
  await dbModel.createDiary(data.value).then((result)=>{
    res.send({
      code:200,
      id:result.insertId,
     })
     
  })
}

// 新建文件
exports.upload = async(data,res)=>{
  await dbModel.upload(data).then((result)=>{
    let value={
      ...data,
      ...{id: result.insertId}  
    }
    res.send({
      code:200,
      data:value,
     })
  })
} 

// 删除文件
exports.deleteFile = async(req,res)=>{
  let data=req.body
  if(!data.filesId){
    res.send({
      code:400,
      message: '缺少文件ID'
     })
    return
  }
  await dbModel.deleteFile(data.filesId).then(async()=>{
    // 处理真实的文件删除
    if(data.filesUrl){
      mkdir.deleteFile(data.filesUrl)
    }
    res.send({
      code:200,
     })
  })
} 

//获取数据总览overview
exports.overview = async (req, res) => {
  let atricle = await dbModel.articleCount(-1, -1, "", 0)
  let gallery = await dbModel.articleCount(-1, -1, "", 1)
  let diary = await dbModel.diaryCount('')
  let file = await mkdir.getDirectorySize('data/files')
  let room = 0;
  if(file < 1024 * 1024){
    room = Math.round(file / 1024 * 1000) / 1000 + 'KB'
  } else {
    room = Math.round(file / 1024 / 1024 * 1000) / 1000 + 'MB'
  }
  let data = {
    article: atricle[0].count,
    gallery: gallery[0].count,
    diary: diary[0].count,
    file: room
  }
  res.send({
    code: 200,
    data: data,
  })
}














