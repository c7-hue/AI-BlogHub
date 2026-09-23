import { deleteFileApi } from '../api';
import { useCode } from "../hooks/code";
import { useUserStore } from "../store/user";
  
export function useFile() {
  const { tackleCode } = useCode()
  const userStore = useUserStore()

    //删除文件
    const deleteFile = (data?: { id: number | string, url: string | string[] }) => {
        if (!data) return
        let request = {
            token: userStore.token,
            filesId: data.id,
            filesUrl: data.url,
        }
        deleteFileApi(request).then((res: any) => {
            if (tackleCode(res.code)) {
                //前端数组静态删除
                console.log(res)
            }
        })
    }

    return { deleteFile }
}