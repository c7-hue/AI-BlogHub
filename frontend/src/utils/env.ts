let baseUrl=""
let baseImgUrl=""   //后端图片地址

if(import.meta.env.MODE==="development"){

  // 开发环境 - 直接连接本机后端
    baseUrl="http://127.0.0.1:3001";
    baseImgUrl="http://127.0.0.1:3001/files";
}else{
  // 生产环境 - 走同源 Nginx 反向代理
    baseUrl="/api";
    baseImgUrl="/api/files";
}

export {
  baseUrl,
  baseImgUrl
}
