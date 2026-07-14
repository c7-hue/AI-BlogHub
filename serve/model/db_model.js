const db = require('./db')

const toPositiveInt = (value, fallback = 0) => {
  const number = Number.parseInt(value, 10)
  return Number.isSafeInteger(number) && number >= 0 ? number : fallback
}

const toIdList = (value) => String(value ?? '')
  .split(',')
  .map((item) => Number.parseInt(item, 10))
  .filter((item) => Number.isSafeInteger(item) && item >= 0)

const inClause = (ids) => ids.map(() => '?').join(',')

// 查询数据库是否有注册用户
exports.isRegister = async(data)=>{
  let _sql = 'select count(*) as count from users'
  return db.query2(_sql)
}

// 管理员注册
exports.insertUser=(value)=>{
  let _sql = 'insert into users (name, password, moment) values (?, ?, ?)'
  return db.query2(_sql, [value.name, value.password, value.moment])
}

// 管理员登录
exports.login=(name)=>{
  let _sql = 'select * from users where name=?'
  return db.query2(_sql, [name])
}

// 获取评论
exports.getCommentPage = (pageSize,nowPage) => {
  console.log('getCommentPage called with pageSize:', pageSize, 'nowPage:', nowPage);
  // 确保pageSize和nowPage是有效的数字
  pageSize = Math.min(toPositiveInt(pageSize, 10), 100);
  nowPage = Math.max(toPositiveInt(nowPage, 1), 1);
  let _sql = 'select * from comment order by id desc limit ?, ?'
  console.log('SQL query:', _sql);
  return db.query2(_sql, [(nowPage - 1) * pageSize, pageSize])
}

// 查询评论总数
exports.commentCount = (articleId, userId)=>{
  let _sql;
  if(articleId == -1 && userId == -1){
    _sql = `select count(*) as count from comment`
  }else if(userId == -1){
    _sql = 'select count(*) as count from comment where article_id=?'
    return db.query2(_sql, [articleId])
  }else{
    _sql = 'select count(*) as count from comment where user_id=?'
    return db.query2(_sql, [userId])
  } 
  return db.query2(_sql)
}

// 评论变为已读
// 1. 先查询评论是否存在
// 2. 如果存在，更新 isread 为 1
// 3. 如果不存在，返回错误信息
exports.commentIsread = (id)=>{
  let _sql = 'update comment set isread=1 where id=?'
  return db.query2(_sql, [id])
}

// 删除评论
exports.deleteComment = (id)=>{
  let _sql = 'delete from comment where id=?'
  return db.query2(_sql, [id])
}



// 获取文章名称
exports.getArticleTitle = (id)=>{
  let _sql = 'select title from article where id=?'
  return db.query2(_sql, [id])
}

// 获取私信
exports.getMessagePage = (pageSize,nowPage)=>{
    // 确保pageSize和nowPage是有效的数字
    pageSize = Math.min(toPositiveInt(pageSize, 10), 100);
    nowPage = Math.max(toPositiveInt(nowPage, 1), 1);
  let _sql = 'select * from message order by id desc limit ?, ?'
  return db.query2(_sql, [(nowPage - 1) * pageSize, pageSize])
}

// 查询私信总数
exports.messageCount = (isread)=>{
    let _sql;
    if(isread == 0){
        _sql = `select count(*) as count from message where isread=0`
    }else{
        _sql = `select count(*) as count from message`
    }
  return db.query2(_sql)
}

// 删除私信
exports.deleteMessage = (id)=>{
  let _sql = 'delete from message where id=?'
  return db.query2(_sql, [id])
}
    


// 私信变为已读
// 1. 先查询私信是否存在
// 2. 如果存在，更新 isread 为 1
// 3. 如果不存在，返回错误信息
exports.messageIsread = (id)=>{
  let _sql = 'update message set isread=1 where id=?'
  return db.query2(_sql, [id])
}

//获取文章
exports.getArticlePage = (pageSize, nowPage, state, subsetId, serchTerm, classify) => {
    // 确保pageSize和nowPage是有效的数字
    pageSize = Math.min(toPositiveInt(pageSize, 10), 100);
    nowPage = Math.max(toPositiveInt(nowPage, 1), 1);
    let _sql;
    let values;
    const offset = (nowPage - 1) * pageSize;
    if(serchTerm){
        _sql = 'select * from article where concat(title,introduce) like ? and classify=? order by id desc limit ?, ?;'
        values = [`%${serchTerm}%`, classify, offset, pageSize]
    }else if( subsetId>-1 && typeof(state)=='number'){
        _sql = 'select * from article where subset_id=? and classify=? order by id desc limit ?, ?;'
        values = [subsetId, classify, offset, pageSize]
    }else if(typeof(state)=='string'){
        const ids = toIdList(subsetId)
        if (ids.length) {
          _sql = `select * from article where (subset_id is null or subset_id not in(${inClause(ids)})) and classify=? order by id desc limit ?, ?;`
          values = [...ids, classify, offset, pageSize]
        } else {
          _sql = 'select * from article where classify=? order by id desc limit ?, ?;'
          values = [classify, offset, pageSize]
        }
    }else if(state>-1){
        _sql = 'select * from article where state=? and classify=? order by id desc limit ?, ?;'
        values = [state, classify, offset, pageSize]
    }else{
        _sql = 'select * from article where classify=? order by id desc limit ?, ?;'
        values = [classify, offset, pageSize]
    }
    return db.query2(_sql, values)
}

//查询文章总数
exports.articleCount = (state, subsetId, serchTerm,classify) => {
    let _sql;
    let values;
    if (serchTerm) {
        _sql = 'select count(*) as count from article where concat(title,introduce) like ? and classify=?;'
        values = [`%${serchTerm}%`, classify]
    } else if (subsetId > -1 && typeof(subsetId)=='number') {
        _sql = 'select count(*) as count from article where subset_id=? and classify=?;'
        values = [subsetId, classify]
    } else if (typeof(subsetId)=='string') {
        const ids = toIdList(subsetId)
        if (ids.length) {
          _sql = `select count(*) as count from article where (subset_id is null or subset_id not in(${inClause(ids)})) and classify=?;`
          values = [...ids, classify]
        } else {
          _sql = 'select count(*) as count from article where classify=?;'
          values = [classify]
        }
    } else if (state > -1) {
        _sql = 'select count(*) as count from article where state=? and classify=?;'
        values = [state, classify]
    } else {
        _sql = 'select count(*) as count from article where classify=?;'
        values = [classify]
    }
    return db.query2(_sql, values)
}

// 修改文章发布状态
exports.changeArticleState = (id, state) => {
    let _sql = 'update article set state=? where id=?'
    return db.query2(_sql, [state, id])
}

// 文章删除
exports.deleteArticle = (id) => {
    if (id === undefined || id === null || isNaN(id)) {
        return Promise.reject(new Error('Invalid article id'))
    }
    let _sql = 'delete from article where id=?'
    return db.query2(_sql, [id])
}

// 新建文章点赞
exports.addPraise = (value) => {
    let _sql = 'insert into praise set ?'
    return db.query2(_sql, value)
}

// 获取文章点赞数
exports.praiseCount = (articleId, userId) => {
    let _sql;
    if(userId == -1){
        _sql = 'select count(*) as count from praise where article_id=?'
        return db.query2(_sql, [articleId])
    }else{
        _sql = 'select count(*) as count from praise where article_id=? and user_id=?'
        return db.query2(_sql, [articleId, userId])
    } 
    return db.query2(_sql)
}

// 新建分组
exports.addSubset = (value) => {
    let _sql = 'insert into subset set ?'
    return db.query2(_sql, value)
}



// 获取分类/分组
exports.getSubset = (classify)=>{
  let _sql = 'select * from subset where classify=?'
  return db.query2(_sql, [classify])
}

//获取文件总数
// 修改分组名称updateSubset
exports.updateSubset = (subsetId, subsetName) => {
    let _sql = 'update subset set subset_name=? where id=?'
    return db.query2(_sql, [subsetName, subsetId])
}

// 删除分组deleteSubset
exports.deleteSubset = (subsetId) => {
    let _sql = 'delete from subset where id=?'
    return db.query2(_sql, [subsetId])
}

// 获取标签
exports.Label = ()=>{
  let _sql = `select * from label order by id desc`     
  return db.query2(_sql)
}

// 新建标签
exports.addLabel = (value) => {
    let _sql = 'insert into label set ?'
    return db.query2(_sql, value)
}

// 删除标签
exports.deleteLabel = (labelId) => {
    let _sql = 'delete from label where id=?'
    return db.query2(_sql, [labelId])
}

//获取文件
exports.getFilePage = (pageSize, nowPage, subsetId) => {
    // 确保pageSize和nowPage是有效的数字
    pageSize = Math.min(toPositiveInt(pageSize, 10), 100);
    nowPage = Math.max(toPositiveInt(nowPage, 1), 1);
    let _sql;
    let values;
    const offset = (nowPage - 1) * pageSize;
    if (subsetId > -1 && typeof subsetId == 'number') {
        _sql = 'select * from file where subset_id=? order by id desc limit ?, ?;';
        values = [subsetId, offset, pageSize]
    } else if (typeof subsetId == 'string') {
       const ids = toIdList(subsetId)
       if (ids.length) {
         _sql = `select * from file where subset_id is null or subset_id not in (${inClause(ids)}) order by id desc limit ?, ?;`
         values = [...ids, offset, pageSize]
       } else {
         _sql = 'select * from file order by id desc limit ?, ?;'
         values = [offset, pageSize]
       }
    } else {
        _sql = 'select * from file order by id desc limit ?, ?;';
        values = [offset, pageSize]
    }
    return db.query2(_sql, values)
}

//查询文件总数
exports.fileCount = (subsetId) => {
    let _sql;
    let values;
    if (subsetId > -1 && typeof subsetId == 'number') {
        _sql = 'select count(*) as count from file where subset_id=?;';
        values = [subsetId]
    } else if (typeof subsetId == 'string') {
        const ids = toIdList(subsetId)
        if (ids.length) {
          _sql = `select count(*) as count from file where subset_id is null or subset_id not in (${inClause(ids)});`;
          values = ids
        } else {
          _sql = 'select count(*) as count from file;'
          values = []
        }
    } else {
        _sql = `select count(*) as count from file;`;
        values = []
    }
    return db.query2(_sql, values)
} 

// 移动文件removeFile
exports.removeFile = (id, subsetId) => {
    const ids = toIdList(id)
    if (!ids.length) return Promise.reject(new Error('Invalid file ids'))
    let _sql = `update file set subset_id=? where id in (${inClause(ids)})`
    return db.query2(_sql, [subsetId, ...ids])
} 

// 获取日记
exports.getDiaryPage = (pageSize, nowPage, searchTerm) => {
    // 确保pageSize和nowPage是有效的数字
    pageSize = Math.min(toPositiveInt(pageSize, 10), 100);
    nowPage = Math.max(toPositiveInt(nowPage, 1), 1);
    let _sql;
    if(searchTerm){
      _sql = 'select * from diary where concat(title,content) like ? order by id desc limit ?, ?;'
      return db.query2(_sql, [`%${searchTerm}%`, (nowPage - 1) * pageSize, pageSize])
    }else{
      _sql = 'select * from diary order by id desc limit ?, ?;'
      return db.query2(_sql, [(nowPage - 1) * pageSize, pageSize])
    }
    return db.query2(_sql)
}


// 查询日记总数
exports.diaryCount = (searchTerm) => {
    let _sql;
    if (searchTerm) {
        _sql = 'select count(*) as count from diary where concat(title,content) like ?'
        return db.query2(_sql, [`%${searchTerm}%`])
    } else {
        _sql = `select count(*) as count from diary `
    }
    return db.query2(_sql)
}

// 删除日记
exports.deleteDiary = (id) => {
    let _sql = 'delete from diary where id=?'
    return db.query2(_sql, [id])
} 

// 新建文章图库
exports.createArticle = (value) => {
    let _sql = 'insert into article set ?'
    return db.query2(_sql, value)
}

// 获取文章图库gainArticle
exports.gainArticle = (id) => {
    let _sql = 'select * from article where id=?'
    return db.query2(_sql, [id])
}

// 修改文章图库updateArticle 
exports.updateArticle = (id, value) => {
    let _sql = 'update article set ? where id=?'
    return db.query2(_sql, [value, id])
}

// 新建日记createDiary
exports.createDiary = (value) => {
    let _sql = 'insert into diary set ?'
    return db.query2(_sql, value)
}

// 新建文件
exports.upload= (value) => {
    let _sql = 'insert into file set ?'
    return db.query2(_sql, value)
}

// 删除文件
exports.deleteFile = (id) => {
    let _sql
    let values
    if(typeof id=='number' ){
        _sql = 'delete from file where id=?'
        values = [id]
    }else{
        const ids = toIdList(id)
        if (!ids.length) return Promise.reject(new Error('Invalid file ids'))
        _sql = `delete from file where id in (${inClause(ids)})`
        values = ids
    }
    return db.query2(_sql, values)
} 
// ����Աע�����
exports.register = exports.insertUser;


let aaa = async () => {
    const comments = [
        { user_id: '456', user_type: 1, user_name: '张三', article_id: 1, content: '测试内容1' ,complaint:1,isread:1},
        { user_id: '789', user_type: 1, user_name: '李四', article_id: 1, content: '测试内容2' ,complaint:2,isread:2},
        { user_id: '123', user_type: 1, user_name: '王五', article_id: 2, content: '测试内容3' ,complaint:3,isread:2},
        { user_id: '456', user_type: 1, user_name: '赵六', article_id: 2, content: '测试内容4' ,complaint:6,isread:4},
        { user_id: '789', user_type: 1, user_name: '钱七', article_id: 3, content: '测试内容5' ,complaint:4,isread:6}
    ];

    for (const comment of comments) {
        let time = (function() { var d = new Date(); var Y = d.getFullYear(); var M = d.getMonth() + 1; var D = d.getDate(); var h = d.getHours(); var m = d.getMinutes(); var s = d.getSeconds(); if (M < 10) M = '0' + M; if (D < 10) D = '0' + D; if (h < 10) h = '0' + h; if (m < 10) m = '0' + m; if (s < 10) s = '0' + s; return Y + '-' + M + '-' + D + ' ' + h + ':' + m + ':' + s; })();
        let _sql = 'insert into comment(user_id, user_type, user_name, article_id, moment, content, complaint, isread) values(?, ?, ?, ?, ?, ?, ?, ?)';
        try {
            const result = await db.query2(_sql, [comment.user_id, comment.user_type, comment.user_name, comment.article_id, time, comment.content, comment.complaint, comment.isread]);
            console.log('插入成功：', result);
        } catch (error) {
            console.error('插入失败：', error);
        }
        // 延迟 100ms，避免时间戳完全相同
        await new Promise(resolve => setTimeout(resolve, 100));
    }
};

let bbb = async () => {
  const message = [
    { id: 211, user_id: '456', user_name: '张三', content: '测试内容1' ,isread:1},
    { id: 221, user_id: '789', user_name: '李四', content: '测试内容2' ,isread:0},    
    { id: 123, user_id: '123', user_name: '王五', content: '测试内容3' ,isread:0},
    { id: 124, user_id: '456', user_name: '赵六', content: '测试内容4' ,isread:0},
    { id: 125, user_id: '789', user_name: '钱七', content: '测试内容5' ,isread:0}
  ];
  for(const msg of message){
    let time = (function() { var d = new Date(); var Y = d.getFullYear(); var M = d.getMonth() + 1; var D = d.getDate(); var h = d.getHours(); var m = d.getMinutes(); var s = d.getSeconds(); if (M < 10) M = '0' + M; if (D < 10) D = '0' + D; if (h < 10) h = '0' + h; if (m < 10) m = '0' + m; if (s < 10) s = '0' + s; return Y + '-' + M + '-' + D + ' ' + h + ':' + m + ':' + s; })();
    await db.query2('insert ignore into message(id, user_id, user_name, moment, content, isread) values(?, ?, ?, ?, ?, ?)', [msg.id, msg.user_id, msg.user_name, time, msg.content, msg.isread]);
  }
}
// aaa(); // 执行插入评论操作
// bbb(); // 执行插入私信操作
