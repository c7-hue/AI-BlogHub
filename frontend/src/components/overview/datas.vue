<template>
  <yk-space dir="vertical" size="xl" style="width:100%;">
    <div class="data-card card">
      <div class="data-card__title">
        <p class="data-card__title-name">访问量</p>
        <div class="radio-group">
          <label class="radio-button" :class="{ active: visitRadio === 'week' }">
            <input type="radio" v-model="visitRadio" value="week" name="visitGroup">
            <span>近一周</span>
          </label>
          <label class="radio-button" :class="{ active: visitRadio === 'month' }">
            <input type="radio" v-model="visitRadio" value="month" name="visitGroup">
            <span>近一月</span>
          </label>
        </div>
      </div>
      <LineChart  chart-height="208px" :data="visitData"/>
    </div>
    <div class="data-card">
       <div class="data-card__title">
        <p class="data-card__title-name">数据监测</p>
        <div class="radio-group">
          <label class="radio-button" :class="{ active: checkRadio === 'checkWeek' }">
            <input type="radio" v-model="checkRadio" value="checkWeek" name="checkGroup">
            <span>近一周</span>
          </label>
          <label class="radio-button" :class="{ active: checkRadio === 'checkMonth' }">
            <input type="radio" v-model="checkRadio" value="checkMonth" name="checkGroup">
            <span>近一月</span>
          </label>
        </div>
      </div>
      <div style="display: flex;">
      <PieChart title="设备总数" :data="survey.data.device" chart-height="208px"/>
      <PieChart title="访问总数" :data="survey.data.website" chart-height="208px"/>
      </div>
    </div>
  </yk-space>
</template>

<script setup lang="ts">
import { ref ,onMounted,watch} from 'vue'

import {LineChart,PieChart} from '../echarts/index'
import { surveyData, visitData as dashboardVisitData } from '../../data/dashboard'

// 访问量
const visitData = ref(dashboardVisitData)

// 数据监测
const chartData = ref(surveyData.device)
const survey = { data: surveyData }

const getVisit=(e:string)=>{
  let data=dashboardVisitData;
  if(e==="week"){
    data=data.slice(0,7);
  } else if(e==="month") {
    // 假设一个月是30天
    data=data.slice(0,30);
  }
  visitData.value=data;

}

const getChartData=(e:string)=>{
  if(e==="checkWeek"){
    chartData.value = surveyData.device;
  } else if(e==="checkMonth") {
    chartData.value = surveyData.website;
  }
}
const visitRadio = ref('week')
const checkRadio = ref('checkWeek')

// 监听 visitRadio 的变化
watch(visitRadio, (newValue) => {
  getVisit(newValue);
});

// 监听 checkRadio 的变化
watch(checkRadio, (newValue) => {
  getChartData(newValue);
});

onMounted(()=>{
  getVisit(visitRadio.value);
  getChartData(checkRadio.value);
})
</script>

<style lang="less" scoped>
.radio-group {
  display: inline-flex;
  border-radius: 4px;
  overflow: hidden;
  border: 1px solid #d9d9d9;
}

.radio-button {
  position: relative;
  cursor: pointer;
  padding: 8px 16px;
  font-size: 14px;
  background-color: #fff;
  border-right: 1px solid #d9d9d9;
  transition: all 0.3s;
  margin: 0;
  
  &:last-child {
    border-right: none;
  }
  
  &.active {
    background-color: #1890ff;
    color: #fff;
  }
  
  input[type="radio"] {
    position: absolute;
    opacity: 0;
    width: 0;
    height: 0;
  }
}
</style>
