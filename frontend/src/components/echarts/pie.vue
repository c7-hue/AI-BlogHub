<!--  -->
<template>
  <div :style="{ height: chartHeight }" ref="chart" class="chart"></div>

</template>

<script lang="ts" setup>
import {ref,onMounted,onBeforeUnmount,markRaw,watch} from 'vue'
// import * as echarts from 'echarts/core'
import * as echarts from 'echarts/core'
// 引入提示框、标题、直角坐标系、数据集、内置数据转换器组件，组件后缀为Component
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  DatasetComponent,
  TransformComponent,
} from 'echarts/components'
import { PieChart } from 'echarts/charts';
// 引入折线、饼图组件
import { LineChart } from 'echarts/charts';
// 标签自动布局、全局过渡动画等特性
import { LabelLayout, UniversalTransition } from 'echarts/features';
// 引入 Canvas 渲染器，注意引入 CanvasRenderer 或者 SVGRenderer 是必须的一步
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  DatasetComponent,
  TransformComponent,
  PieChart,
  LineChart,
  LabelLayout,
  UniversalTransition,
  CanvasRenderer
]);

// type EChartsOption = echarts.EChartsOption;
// GridComponentOpiton | LineSeriesOption
const chart = ref<HTMLDivElement>();

const myChart = ref()
// 接受父组件传过来的option,和echarts的高度

// 可以根据父组件传过来的option对象生成折线图、柱状图、饼图等等
const props = defineProps(['data','title','chartHeight'])

const option =ref();
const survey = (e: any)=>{
  let total:number = 0;
  for(let i=0;i<e.length;i++){
    total += e[i].value;
  }
  option.value={
    color:['#2B5AED','#FA5247','#1CCBB6','#F625AF','#FFB435'],
    title:{
      text:total,//主标题文本
      subtext:props.title,//副标题文本
      left:"center",
      top:"34%",
      textStyle:{
        fontSize:32,
        color:"#686B73",
      },
      subtextStyle:{
        fontSize:14,
        color:"#686B73",
      },
    },
    tooltip:{
      trigger:"item",
    },
    legend:{
      show:false,
      // orient:'vertical',
      bottom:0,
      // right:0,
      icon:'circle'
    },
    series:[
      {
        // name:'设备总数
        type:'pie',
        radius:['60%','76%'],
        avoidLabelOverlap:true,

        label:{
          show:true,  //默认显示关闭，如果此处是true,则数据重叠
        },
        emphasis:{
          label:{
            show:true,
            fontSize:40,
            fontWeight:"bold",
          }
        },
        data: e,
      }
    ]
  }
}

onMounted(()=>{
  // 初始化图表
  myChart.value = markRaw(echarts.init(chart.value as HTMLDivElement));
  // 监听页面视图变化echarts图的宽度变化
  window.addEventListener('resize', handleResize);
  
  // 确保数据存在才设置图表选项
  if (props.data && props.data.length > 0) {
    survey(props.data);
    myChart.value.setOption(option.value);
  }
})

watch(
  ()=>props.data,
  (n) => {
    if (n && n.length > 0) {
      survey(n);
      if (myChart.value) {
        myChart.value.setOption(option.value);
      }
    }
  },
  { immediate: true } // 立即执行一次
)

// 组件销毁前一定要取消监听的事情，不然会影响性能和暂用内存
const handleResize = () => {
  myChart.value?.resize();
}

onBeforeUnmount(()=>{
  window.removeEventListener('resize', handleResize);
  if (myChart.value) {
    myChart.value.dispose();
  }
})

</script>

<style lang="less" scoped>
.chart{
  width: 100%;
}
</style>
