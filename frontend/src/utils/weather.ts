// 1. 先引入图片 (根据你实际的图片路径调整，假设图片在 @/assets/images/weather 下)
import sun from '../assets/images/weather/sun.svg'
import cloudy from '../assets/images/weather/cloudy.svg'
import overcast from '../assets/images/weather/overcast.svg'
import pour from '../assets/images/weather/pour.svg'
import rain from '../assets/images/weather/rain.svg'
import thunderstorm from '../assets/images/weather/thunderstorm.svg'
import snow from '../assets/images/weather/snow.svg'
import wind from '../assets/images/weather/wind.svg'

// 2. 在数据中使用引入的变量
export const weather = [
  {
    id: 0,
    name: '晴天',
    icon: sun, // 直接使用变量，而不是字符串
  },
  {
    id: 1,
    name: '多云',
    icon: cloudy,
  },
  {
    id: 2,
    name: '阴天',
    icon: overcast,
  },
  {
    id: 3,
    name: '雾霾',
    icon: pour,
  },
  {
    id: 4,
    name: '下雨',
    icon: rain,
  },
  {
    id: 5,
    name: '雷雨',
    icon: thunderstorm,
  },
  {
    id: 6,
    name: '下雪',
    icon: snow,
  },
  {
    id: 7,
    name: '有风',
    icon: wind,
  },
]