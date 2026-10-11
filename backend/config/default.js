const config ={
  // 环境变量优先(部署时由 docker-compose 注入),本地开发用默认值
  port: process.env.PORT || 3001,
  database:{//连接数据库
    HOST: process.env.DB_HOST || "localhost",
    USER: process.env.DB_USER || "root",
    PASSWORD: process.env.DB_PASSWORD || "123456",
    DATABASE: process.env.DB_NAME || "xxblog"
  }
}

module.exports = config
