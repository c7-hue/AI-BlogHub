const express = require('express')
const { loadEnv } = require('./lib/env')

loadEnv()

const app = express()
const config = require('./config/default')
const jwt = require('./lib/jwt')
//加入静态文件
app.use(express.static(__dirname + '/data'))

//设置跨域
app.use(function (req, res, next) {
    //允许访问ip *为所有
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    res.header("Access-Control-Allow-Credentials", true);
    res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
    res.header("X-Powered-By", ' 3.2.1')
    //这段仅仅为了方便返回json而已
    res.header("Content-Type", "application/json;charset=utf-8");
    if (req.method == 'OPTIONS') {
        //让options请求快速返回
        res.sendStatus(200);
    } else {
        next();
    }
});

// 解析前端数据
app.use(express.json())//解析位 request.body 格式为 json

// 引入路由
console.log('Loading all routes');
try {
  const indexRoutes = require('./routers/index');
  indexRoutes(app);
  console.log('Index routes loaded successfully');
  
  const filesRoutes = require('./routers/files');
  filesRoutes(app);
  console.log('Files routes loaded successfully');
} catch (error) {
  console.error('Error loading routes:', error);
}

// 测试路由
app.post('/test',(req,res)=>{
  console.log('test route called');
  console.log('req.body:', req.body);
  res.send({code: 200, data: 'test success'});
});

app.listen(config.port, '0.0.0.0', () => {
  console.log(`已经启动端口 ${config.port}`)
})
