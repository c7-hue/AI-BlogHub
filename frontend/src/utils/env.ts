let baseUrl=""
let baseImgUrl=""   //后端图片地址

if(import.meta.env.MODE==="development"){

  // 开发环境 - 直接连接后端
    baseUrl="http://127.0.0.1:3001";
    baseImgUrl="http://127.0.0.1:3001/files";
}else{
  // 服务器
    baseUrl="http://182.123.21:3001";
    baseImgUrl="http://182.123.21:3001/files";      
}

export {
  baseUrl,
  baseImgUrl
}