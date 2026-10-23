const serve = require('../controller/serve')
const ai = require('../controller/ai')

module.exports = function(app){
  app.get('/', (req, res) => {
    res.send('Hello World!')
  })
  //验证是否注册
  app.post('/isRegister',(req,res )=>{
    serve.isRegister(req,res)//调用是否注册方法
    
  })

  // 管理员注册
  app.post('/register',(req,res)=>{
    serve.register(req,res)//调用管理员注册方法
  })

  // 管理员登录
  app.post('/login',(req,res)=>{
    serve.login(req,res)//调用管理员登录方法
  })

  // All routes registered below this point require a valid login token.
  app.use((req, res, next) => {
    const authorization = req.headers.authorization || ''
    const bearerToken = authorization.startsWith('Bearer ')
      ? authorization.slice(7)
      : ''
    const token = bearerToken || req.body?.token

    if (!token || !require('../lib/jwt').verifyToken(token)) {
      return res.status(401).send({ code: 300, message: 'Token invalid or expired' })
    }

    req.authToken = token
    next()
  })

  // AI聊天接口
  app.post('/ai/chat',(req,res)=>{
    ai.chatWithAI(req,res)//调用AI聊天方法
  })

  // 获取用户资料
  app.post('/getUserInfo',(req,res)=>{
    serve.getUserInfo(req,res)//调用获取用户资料方法
  })

  // 修改用户资料（头像/昵称/邮箱）
  app.post('/updateUserInfo',(req,res)=>{
    serve.updateUserInfo(req,res)//调用修改用户资料方法
  })

  // AI流式聊天接口
  app.post('/ai/chat-stream',(req,res)=>{
    ai.chatWithAIStream(req,res)//调用AI流式聊天方法
  })

  // 获取评论getComment
  app.post('/comment',(req,res)=>{
    if(typeof(req.body.token)!='undefined'){
    serve.getComment(req,res)//调用获取评论方法
    }else{
      res.send({
        code:400
       })
    }
  })

  // 将评论转为已读
  app.post('/commentIsread',(req,res)=>{
    if(typeof(req.body.token)!='undefined'){
      serve.commentIsread(req,res)//调用将评论转为已读方法
    }else {
      res.send({
        code:400
       })
    }
  })

  // 删除评论
  app.post('/deleteComment',(req,res) =>{
    if(typeof (req.body.token) != 'underfined'){
      serve.deleteComment(req,res)//调用删除评论方法
    }else {
      res.send({
        code:400
       })
    }
  } )

// 获取私信
app.post('/message',(req,res)=>{
  if(typeof(req.body.token)!='undefined'){
    serve.getMessage(req,res)//调用获取私信方法
  }else{
    res.send({
      code:400
     })
  }
})

// 获取私信未读总数
app.post('/noreadMessage',(req,res)=>{
  if(typeof(req.body.token)!='undefined'){
    serve.NoreadMessage(req,res)//调用获取私信未读总数方法
  }else{
    res.send({
      code:400
     })
  }
})

// 删除私信
app.post('/deleteMessage',(req,res)=>{
  if(typeof(req.body.token)!='undefined'){
    serve.deleteMessage(req,res)//调用删除私信方法
  }else{
    res.send({
      code:400
     })
  }
})

  // 获取文章getArticle
  app.post('/article',(req,res)=>{
    if(typeof(req.body.token)!='undefined'){
      serve.getArticle(req,res)//调用获取文章方法
    }else{
      res.send({
        code:400
       })
    }
  })
  // 修改文章发布状态
  app.post('/changeArticleState',(req,res)=>{
    if(typeof(req.body.token)!='undefined'){
      serve.changeArticleState(req,res)//调用修改文章发布状态方法
    }else{
      res.send({
        code:400
       })
    }
  })

  // 文章删除
  app.post('/deleteArticle',(req,res)=>{
    if(typeof(req.body.token)!='undefined'){
      serve.deleteArticle(req,res)//调用文章删除方法
    }else{
      res.send({
        code:400
       })
    }
  })
  // 文章不同状态条数
  app.post('/articleState',(req,res)=>{
    if(typeof(req.body.token)!='undefined'){
      serve.articleState(req,res)//调用文章不同状态条数方法
    }else{
      res.send({
        code:400
       })
    }
  })

  // 查找分组exports.subset
  app.post('/subset',(req,res)=>{
     if(typeof(req.body.token)!='undefined'){
      serve.subset(req,res)//调用查找分组方法  
    }else{
      res.send({
        code:400
       })
    }
  })

  // 新建分组
  app.post('/addSubset',(req,res)=>{
    if(typeof(req.body.token)!='undefined'){
      serve.addSubset(req,res)//调用新建分组方法
    }else{
      res.send({
        code:400
       })
    }
  })
  // 修改分组名称updateSubset
  app.post('/updateSubset',(req,res)=>{
    if(typeof(req.body.token)!='undefined'){
      serve.updateSubset(req,res)//调用修改分组名称方法
    }else{
      res.send({
        code:400
       })
    }
  })
  // 删除分组deleteSubset
  app.post('/deleteSubset',(req,res)=>{
    if(typeof(req.body.token)!='undefined'){
      serve.deleteSubset(req,res)//调用删除分组方法
    }else{
      res.send({
        code:400
       })
    }
  })
  // 获取标签
  app.post('/getLabel',(req,res)=>{
    if(typeof(req.body.token)!='undefined'){
      serve.Label(req,res)//调用获取标签方法
    }else{
      res.send({
        code:400
       })
    }
  })

  // 新建标签
  app.post('/addLabel',(req,res)=>{
    if(typeof(req.body.token)!='undefined'){
      serve.addLabel(req,res)//调用新建标签方法
    }else{
      res.send({
        code:400
       })
    }
  })

  // 删除标签
  app.post('/deleteLabel',(req,res)=>{
    if(typeof(req.body.token)!='undefined'){
      serve.deleteLabel(req,res)//调用删除标签方法
    }else{
      res.send({
        code:400
       })
    }
  })

  // 获取文件
  app.post('/getFile',(req,res)=>{
    if(typeof(req.body.token)!='undefined'){
      serve.getFile(req,res)//调用获取文件方法
    }else{
      res.send({
        code:400
       })
    }
  })

  // 移动文件removeFile
  app.post('/removeFile',(req,res)=>{
    if(typeof(req.body.token)!='undefined'){
      serve.removeFile(req,res)//调用移动文件方法
    }else{
      res.send({
       code:400
       })
    }
  })

  // 获取日记
  app.post('/diary',(req,res)=>{
    if(typeof(req.body.token)!='undefined'){
      serve.getDiaryPage(req,res)//调用获取日记方法
    }else{
      res.send({
        code:400
       })
    }
  })

  // 删除日记
  app.post('/deleteDiary',(req,res)=>{
    if(typeof(req.body.token)!='undefined'){
      serve.deleteDiary(req,res)//调用删除日记方法
    }else{
      res.send({
        code:400
       })
    }
  })  

  // 新建文章图库
  app.post('/createArticle',(req,res)=>{
    if(typeof(req.body.token)!='undefined'){
      serve.createArticle(req,res)//调用新建文章方法  
    }else{
      res.send({
        code:400
       })
    }
  })

  // 获取文章gainArticle
  app.post('/gainArticle',(req,res)=>{
    if(typeof(req.body.token)!='undefined'){
      serve.gainArticle(req,res)//调用获取文章方法
    }else{
      res.send({
        code:400
       })
    }
  })

  // 修改文章图库updateArticle 
  app.post('/updateArticle',(req,res)=>{
    if(typeof(req.body.token)!='undefined'){
      serve.updateArticle(req,res)//调用修改文章方法
    }else{
      res.send({
        code:400
       })
    }
  })

  // 新建日记createDiary
  app.post('/createDiary',(req,res)=>{
    if(typeof(req.body.token)!='undefined'){
      serve.createDiary(req,res)//调用新建日记方法
    }else{
      res.send({
        code:400
       })
    }
  })

  // 删除文件
  app.post('/deleteFile',(req,res)=>{
    if(typeof(req.body.token)!='undefined'){
      serve.deleteFile(req,res)//调用删除文件方法
    }else{
      res.send({
        code:400
       })
    }
  })

  // 获取数据总览overview
  app.post('/overview',(req,res)=>{
    if(typeof(req.body.token)!='undefined'){
      serve.overview(req,res)//调用获取数据总览方法
    }else{
      res.send({
        code:400
       })
    }
  })

}

