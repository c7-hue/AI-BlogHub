// interface 接口

//回复内容
export type ReplyData={
  id:number;
  article?:{
    id:number;
    title:string;
  };
  user_id:string|number;
  user_name:string;
  comment:string;//内容
  moment:string;//时间
  complaint?:number;//举报数
  isread?:number;//是否已读
}

// 分组
export interface SubsetData{
  id:number | string;
  name:string|number;
  subset_name?: string | number;
  value:number;
  moment?:string;
}

//文件
export interface FileData{
  id:number;
  url:string;//地址路径
  file_name:string;//文件名
  format:string;//格式
  subset_id:number;//所属类型
  selected?:boolean;//是否选择
  moment:Date;//时间
}

// 标签
export interface LabelData{
  id:number | string;
  label_name:string|number;
  moment?:Date;
}

// 文章
export interface ArticleData{
  id: number;
  title: string;
  subsetId?: number;
  moment:Date;//时间
  label?: string[];
  introduce?:string;//简介
  cover?:string;//封面地址
  views:number;//查看次数
  state:number;//状态0未发布
  comment:number;
  praise:number;//点赞次数
  content?:string;//内容
}

// 日记
export interface DiaryDate {
  id: number;
  title?: string;
  moment: Date; //时间
  weather_id: number; //天气
  content?: string;
  picture?: string;
}

// 表单数据
export interface FormData {
  classify?:number;//分类
  title?:string;//标题
  subset_id?:number;//分组id
  label?:string[];//标签   
  introduce?:string;//简介
  cover?:string;//封面地址  
}
