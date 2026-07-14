<template>
  <div :style="{ height: chartHeight}" ref="chart" class="chart">

  </div>
</template>

<script lang="ts" setup>
import {ref,onMounted,onBeforeUnmount,markRaw,watch} from 'vue'
// import * as echarts from 'echarts';
import * as echarts from 'echarts/core';
// 引入提示框、标题、直角坐标系、数据集、内置数据转换器组件，组件后缀都为Component
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  DatasetComponent,
  TransformComponent,
  LegendComponent,
} from 'echarts/components';
// 引入折线、饼图组件
import { LineChart } from 'echarts/charts'
// 标签自动布局、全局过渡动画等特性
import {LabelLayout, UniversalTransition} from 'echarts/features';
// 引入 Canvas 渲染器，注意引入 CanvasRenderer 或者 SVGRenderer 是必然第一步
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([
  TitleComponent,
  TooltipComponent,
  GridComponent,
  DatasetComponent,
  TransformComponent,
  LegendComponent,
  LineChart,
  LabelLayout,
  UniversalTransition,
  CanvasRenderer
]);
// type EChartsOption = echarts.ComposeOption<
// GridComponentOption | LineSeriesOption>;
const chart =ref<HTMLDivElement>()

const myChart = ref()
// 接受父组件传过来的option,和echarts的高度

// 可以根据父组件传过来的option对象生成折线图、柱状图、饼图等等。
const props = defineProps(['data','chartHeight'])

const xAxisData = ref<string[]>([]);
const seriesD = ref<number[]>([]);
const option = ref();
const visit = (e: any) => {
  xAxisData.value = [];
  seriesD.value = [];
  for(let i = 0; i < e.length; i++){
    xAxisData.value.push(e[i].date)
    seriesD.value.push(e[i].count)
  }
  option.value = {
    color:['#2B5AED'],
    grid:{
      top:"4%",
      left:"0%",
      right:"0%",
      bottom:"0%",
      containLabel: true,
    },
    xAxis:{
      type:'category',
      data:xAxisData.value,
    },
    yAxis:{
      type:'value'
    },
    series:[{
      data: seriesD.value,
      type:'line',
      smooth:true
       }
    ]
  }
}

const handleResize = () => {
  myChart.value?.resize();
}

onMounted(()=>{
  visit(props.data);
  // ！！！这里必须用markRaw包裹，否则当页面宽度变化控制台会报错
  myChart.value = markRaw(echarts.init(chart.value as HTMLDivElement));
  myChart.value.setOption(option.value);
  // 监听页面视图变化echarts图的宽度变化
  window.addEventListener('resize', handleResize);
})

watch(
  ()=>props.data,
  (n) => {
    if (myChart.value) {
      visit(n);
      myChart.value.setOption(option.value);
    }
  }
)

// 组件销毁前一定要取消监听的事情，不然会影响性能和暂用内存
onBeforeUnmount(()=>{
  window.removeEventListener('resize', handleResize);
  if (myChart.value) {
    myChart.value.dispose();
  }
})
</script>

<style lang="less" scoped>
.chart{
  height: 100%;
}
</style>