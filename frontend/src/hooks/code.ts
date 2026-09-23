import { useRouter } from "vue-router";
import { YkMessage } from "@yike-design/ui";

export function useCode(){
  const router = useRouter()
  //code验证
  const tackleCode=(e:number)=>{
    if(e===300){
      router.push('/login')
      YkMessage({type: 'warning', message: 'token验证失败🔐请重新登录🔑' })
      return false;
    }else if(e===400){
      YkMessage({type: 'error', message: '请求参数不正确' })
      return false;
    }else if(e===401){
      router.push('/register')
      return false;
    }else{
      return true;
    }
  }

  return{
    tackleCode
  }
}