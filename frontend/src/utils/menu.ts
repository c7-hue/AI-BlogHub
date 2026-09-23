// 导入所有需要的图标组件
import { 
  IconHomepageFill, 
  IconFolderCloseFill, 
  IconFileFill, 
  IconImageFill, 
  IconFillFill, 
  IconSettingsFill 
} from '@yike-design/ui/es/components/svg-icon';

// 总览总数
export const navList = [
  {
    name: '总览',
    path: '/overview',
    icon: IconHomepageFill,//图标
    bgColor:'180deg,#2b5aedcc 0%,#2B5AED 100%',
  },{
    name: '本地文件',
    path: '/localfile',
    icon: IconFolderCloseFill,  
    bgColor:'180deg,#2b5aedcc 0%,#2B5AED 100%',//背景渐变颜色
  },{
    name: '博客文章',
    path: '/article',
    icon: IconFileFill,
    bgColor:'180deg,#2b5aedcc 0%,#2B5AED 100%',//背景渐变颜色
  },{
    name: '摄影图库',
    path: '/gallery',
    icon: IconImageFill,
    bgColor:'180deg,#2b5aedcc 0%,#2B5AED 100%',//背景渐变颜色
  },{
    name: '随笔随记',
    path: '/diary',
    icon: IconFillFill,
    bgColor:'180deg,#2b5aedcc 0%,#2B5AED 100%',//背景渐变颜色
  },{
    name: '设置',
    path: '/setting',
    icon: IconSettingsFill,
    bgColor:'180deg,#2b5aedcc 0%,#2B5AED 100%',//背景渐变颜色
  }
  
]

// 总览数据
// total	该模块的数据总量（如文章数、图片数等）。
// • null：表示尚未加载或无法获取总数（可能需异步请求）
// • 0：表示已知总数为 0（数据已加载，但确实没有内容）
export const overLink = [
  {
    path:'',
    name:'本地文件',
    total:'0M',
    bgColor:'180deg,#2b5aedcc 0%,#2B5AED 100%',
  },
  {
    path:'/editarticle',
    name:'博客文章',
    total:0,
    bgColor:'180deg, #ff600829 0%, #ff60083d 100%',
  },
  {
    path:'/editgallery',
    name:'摄影图库',
    total:0,
    bgColor:'180deg, #25df0629 0%, #25df063d 100%',
  },
  {
    path:'/editdiary',
    name:'随笔随记',
    total:0,
    bgColor:'180deg, #00c9f529 0%, #00c9f53d 100%',
  }
]