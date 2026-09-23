const mysql=require('mysql2')
const config=require('../config/default')

//数据库连接
const connection = mysql.createConnection({
  host:config.database.HOST,
  user:config.database.USER,
  password:config.database.PASSWORD,
})

// 直接连接
let query = (sql,values) => {
  return new Promise((resolve,reject) => {
    connection.query(sql,values,(err,result) => {
      if(err){
        reject(err)
        return
      }else {
        resolve(result)
      }
    })
  }) 
}

// 链接指定数据库
const pool = mysql.createPool({
  connectionLimit:10, //连接池最大连接数
  host:config.database.HOST,
  user:config.database.USER,
  password:config.database.PASSWORD,
  database:config.database.DATABASE
})

// 通过pool.getConnection 获得链接
let query2 = (sql,values)=>{
  return new Promise((resolve,reject) => {
    pool.getConnection((err,connection) => {
      if(err){
        reject(err)
      }else {
        connection.query(sql,values,(err,result) => {
        if(err){
          reject(err)
        }else {
          resolve(result)
        }
        connection.release();//释放该链接，把该链接放回池里供其他人使用
        //connection.destory();  如果要关闭连接并将其从连接池中移除，需要调用该方法 
         })
      }
    })
  })
}

//数据库创建语句
let xxblog ='create database if not exists xxblog default charset utf8 collate utf8_general_ci'

//创建数据库
let createDatabases=(db)=>{
  return query(db,[])
}

// 数据表
let users =
      `create table if not exists users(
      id INT NOT NULL AUTO_INCREMENT,
      name VARCHAR(100) NOT NULL COMMENT '用户名',
      password varchar(100) not null comment '密码',
      moment varchar(100) not null comment '时间',
      primary key(id)
      );`

//用户
let subset =
    `create table if not exists subset(
    id int not null auto_increment,
    subset_name varchar(100) not null comment '分类名称',
    classify int not null comment '分类',
    moment varchar(100) not null comment '时间',
    primary key(id)
    );`

//用户
let file =
    `create table if not exists file(
    id int not null auto_increment,
    url varchar(100) not null comment '文件路径',
    file_name varchar(100) not null comment '文件名',
    format varchar(100) not null comment '文件格式',
    subset_id int not null comment '所属分类',
    moment varchar(100) not null comment '时间',
    primary key (id)
    );`

let article =
    `create table if not exists article(
    id int not null auto_increment,
    title varchar(200) not null comment '标题',
    subset_id int comment '所属分类',
    classify int not null comment '类型 0文章，1图片',
    label varchar(200) comment '标签',
    introduce varchar(5000) comment '简介',
    content varchar(5000) comment '内容',
    cover varchar(100) comment '封面地址',
    views int default 0 comment '查看次数',
    state int default 0 comment '文章状态',
    moment varchar(100) not null comment '时间',
    primary key(id)
    );`

//文章点赞
let praise =
     `create table if not exists praise(
     id int not null auto_increment,
     user_id varchar(100) not null comment '用户',
     user_type int not null comment '查看次数',
     article_id int not null comment '所属文章',
     moment varchar(100) not null comment '时间',
     primary key(id)
     );`

let comment =
    `create table if not exists comment(
    id int not null auto_increment,
    user_id varchar(100) not null comment '用户',
    user_type int not null comment '用户类型',
    user_name varchar(100) comment '用户名称',
    article_id int not null comment '所属文章',
    moment varchar(100) not null comment '时间',
    content varchar(100) not null comment '内容',
    complaint int default 0 comment '举报次数',
    isread int default 0 comment '是否已读',
    primary key (id)
    );`

let label =
    `create table if not exists label(
    id int not null auto_increment,
    label_name varchar(100) not null comment '名称',
    moment varchar(100) not null comment '时间',
    primary key(id)
    );`

let diary =
    `create table if not exists diary(
    id int not null auto_increment,
    title varchar(100) not null comment '标题',
    content varchar(5000) not null comment '内容',
    picture varchar(100) comment '图片地址',
    weather_id int comment '天气',
    mood int default 0 comment '心情',
    moment varchar(100) not null comment '时间',
    primary key (id)
    );`

let weather =
    `create table if not exists weather(
    id int not null auto_increment,
    weather_name varchar(32) not null comment '名称',
    icon varchar(100) comment '图标',
    primary key(id)    
    );`

let message =
    `create table if not exists message(
    id int not null auto_increment,
    user_id varchar(100) not null comment '用户',
    user_name varchar(100) comment '用户名称',
    moment varchar(100) not null comment '时间',
    content varchar(100) not null comment '内容',
    isread int default 0 comment '是否已读',
    primary key(id)
    );`

let record =
     `create table if not exists record(
     id int not null auto_increment,
     user_id varchar(100) not null comment '用户',
     user_type int not null comment '用户类型',
     position varchar(100) comment '位置',
     isread int default 0 comment '设备',
     moment varchar(100) not null comment '时间',
     primary key(id)
     );`

// 创建数据表
const createTable=(sql)=>{
  return query2(sql,[])
}

// 先创建数据库再创建表
async function create(){
  await createDatabases(xxblog)
  await createTable(users)
  await createTable(subset)
  await createTable(file)
  await createTable(article)
  await createTable(praise)
  await createTable(comment)
  await createTable(label)
  await createTable(diary)
  await createTable(weather)
  await createTable(message)
  await createTable(record)
}

// 开始连接数据库
connection.connect()


create() // 创建数据库

exports.query2 = query2
