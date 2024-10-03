<script setup lang="ts">
import {Status} from "../api";
import {computed, onMounted, ref, watch} from "vue";
import * as echarts from "echarts";
import {format2Size, formatDate, formatSizeByUnit, getLinuxReleaseIcon} from "../api/utils.ts";

const props = defineProps<{
  status: Status
}>()

const status = computed(
    () => props.status
)

const cpuChartRef = ref(null);
const memoryChartRef = ref(null);
const swapChartRef = ref(null);

// 网络
const netChartRef = ref(null);
let netStats: [number, number, number][] = []

const dotColor = ref('#22c55e')
const deltaTime = ref('0')
// const isDiskCollapsed = ref(status.value.hardware.disks)
// const isDiskOpen = ref(false)
const os = computed(() => {
  return getLinuxReleaseIcon(status.value.meta.os.name, status.value.meta.os.version)
})

const memDetail = computed(() => {
  return format2Size(status.value.hardware.mem.used, status.value.hardware.mem.total)
})

const swapDetail = computed(() => {
  return status.value.hardware.swap.total > 0 ? format2Size(status.value.hardware.swap.used, status.value.hardware.swap.total) : 'N/A'
})


function onMountedFunc() {
  const cpuChart = echarts.init(cpuChartRef.value);
  const memoryChart = echarts.init(memoryChartRef.value);
  const swapChart = echarts.init(swapChartRef.value);
  const netChart = echarts.init(netChartRef.value);
  const titleStyle = {
    color: 'rgba(0, 0, 0, 0.8)',
    fontSize: 13,
  }
  const radius = ['65%', '90%']

  const hwColor = ['#4c4c4c', '#e3e3e3']
  const netColor = ['#4c4c4c', '#bababa']

  function update() {
    const timeDiff = (Date.now()) / 1000 - status.value.meta.observed_at
    deltaTime.value = timeDiff.toFixed(1)
    // 判断该时间与上一个时间不同才push
    if (netStats.length === 0 || netStats[netStats.length - 1][0] !== status.value.meta.observed_at){
      netStats.push([status.value.meta.observed_at, status.value.hardware.net.up, status.value.hardware.net.down])
    }

    if (netStats.length > 20) {
      netStats.shift()
    }

    if (timeDiff > 30) {
      dotColor.value = '#ff4d4f'
    }
    cpuChart.setOption(
        {
          color: hwColor,
          title: {
            text: status.value.hardware.cpu.percent + '%',
            left: 'center',
            top: 'center',
            textStyle: titleStyle
          },
          series: [
            {
              type: 'pie',
              radius: radius,
              avoidLabelOverlap: false,
              label: {
                show: false,
                position: 'center'
              },
              emphasis: {
                label: {
                  show: true,
                  fontSize: '20',
                  fontWeight: 'bold'
                }
              },
              labelLine: {
                show: false
              },
              data: computed(
                  () => [
                    {value: status.value.hardware.cpu.percent},
                    {value: 100 - status.value.hardware.cpu.percent}
                  ]
              ).value
            }
          ]
        }
    )
    memoryChart.setOption(
        {
          color: hwColor,
          title: {
            text: `${(status.value.hardware.mem.used / status.value.hardware.mem.total * 100).toFixed(1)}%`,
            left: 'center',
            top: 'center',
            textStyle: titleStyle
          },
          series: [
            {
              type: 'pie',
              radius: radius,
              avoidLabelOverlap: false,
              label: {
                show: false,
                position: 'center'
              },
              emphasis: {
                label: {
                  show: true,
                  fontSize: '20',
                  fontWeight: 'bold'
                }
              },
              labelLine: {
                show: false
              },
              data: [
                {value: status.value.hardware.mem.used},
                {value: status.value.hardware.mem.total - status.value.hardware.mem.used}
              ]
            }
          ]
        }
    )
    swapChart.setOption(
        {
          color: hwColor,
          title: {
            text: status.value.hardware.swap.total > 0 ? `${(status.value.hardware.swap.used / status.value.hardware.swap.total * 100).toFixed(1)}%` : 'N/A',
            left: 'center',
            top: 'center',
            textStyle: titleStyle,
          },
          series: [
            {
              type: 'pie',
              radius: radius,
              avoidLabelOverlap: false,
              label: {
                show: false,
                position: 'center'
              },
              emphasis: {
                label: {
                  show: true,
                  fontSize: '20',
                  fontWeight: 'bold'
                }
              },
              labelLine: {
                show: false
              },
              data: [
                {value: status.value.hardware.swap.total > 0 ? status.value.hardware.swap.used : 0},
                {
                  value: status.value.hardware.swap.total > 0 ? status.value.hardware.swap.total - status.value.hardware.swap.used : 100
                }
              ]
            }
          ]
        }
    )

    netChart.setOption(
        {
          color: netColor,
          title: {
            text: 'Network',
          },
          tooltip: {
            trigger: 'axis',
            axisPointer: {
              type: 'cross',
              label: {
                backgroundColor: '#6a7985'
              }
            }
          },
          toolbox: {
            feature: {
              saveAsImage: {}
            }
          },
          grid: {
            top: '25%',
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
          },
          xAxis: [
            {
              type: 'category',
              boundaryGap: false,
              data: netStats.map(item => item[0]),
              axisLabel: {
                formatter: function (value: number) {
                  return formatDate(value, true)
                }
              }
            }
          ],
          yAxis: [
            {
              type: 'value',
              axisLabel: {
                formatter: function (value: number) {
                  return formatSizeByUnit(value*8, null, 'b')
                }
              }
            }
          ],
          series: [
            {
              name: 'Up',
              type: 'line',
              stack: 'Total',
              areaStyle: {},
              emphasis: {
                focus: 'series'
              },
              data: netStats.map(item => item[1])
            },
            {
              name: 'Down',
              type: 'line',
              stack: 'Total',
              areaStyle: {},
              emphasis: {
                focus: 'series'
              },
              data: netStats.map(item => item[2])
            }
          ]
        }
    )

  }

  update()
  watch(
      () => status.value,
      () => {
        update()
      }
  )
}


onMounted(
    () => {
      onMountedFunc()
    }
)

</script>

<template>
  <div class="host">
    <div class="meta-1" style="display: flex; justify-content: space-between">
      <div class="meta1-left" style="display: flex; justify-content: flex-start">
        <span>{{ props.status.meta.name }}</span>
      </div>
      <div class="meta1-right" style="display: flex; justify-content: flex-end; align-items: center">
        <div style="margin-right: 5px">{{ deltaTime }}s ago</div>
        <div class="dot" :style="{backgroundColor: dotColor}"
             style="height: 15px; width: 15px; border-radius: 50%"></div>
      </div>
    </div>
    <div class="meta-2" style="display: flex">
      <div class="section">
        <img class="icon" :src="os.icon" alt="system">
        <span>{{ os.name }}</span>
      </div>
      <div class="section">
        <img class="icon" src="/svg/location.svg" alt="system">
        <span>{{ props.status.meta.location }}</span>
      </div>

    </div>
    <!--    <div class="labels" style="display: flex; justify-content: flex-start">-->
    <!--      <span class="label" v-for="label in props.status.meta.labels" :key="label">{{ label }}</span>-->
    <!--    </div>-->
    <div class="charts-container" style="display: flex; justify-content: space-between">
      <div class="cpu-info hw-info">
        <div class="chart" ref="cpuChartRef"></div>
        <div class="hw-title">CPU</div>
        <div class="hw-detail">{{ status.hardware.cpu.cores }}C {{ status.hardware.cpu.logics }}T</div>
      </div>
      <div class="memory-info hw-info">
        <div class="chart" ref="memoryChartRef"></div>
        <div class="hw-title">Mem</div>
        <div class="hw-detail">{{ memDetail }}</div>
      </div>
      <div class="swap-info hw-info">
        <div class="chart" ref="swapChartRef"></div>
        <div class="hw-title">Swap</div>
        <div class="hw-detail">{{ swapDetail }}</div>
      </div>
    </div>
    <div class="net">
      <div class="net-chart" ref="netChartRef"></div>
    </div>
  </div>

</template>

<style scoped>
.meta-2 {
  margin-top: 0.5em;
}

.labels {
  margin-top: 0.5em;

  .label {
    padding: 2px 5px;
    border-radius: 5px;
    margin-right: 10px;
    background-color: black;
    color: white;
  }
}

.host {
  padding: 1em;
  border: 1px solid #ccc;
  border-radius: 20px;
  margin: 0.5em;
  flex-direction: column;
  justify-content: space-between;
}

.icon {
  margin-right: 0.3em;
  height: 16px;
}

.section {
  display: flex;
  margin-right: 10px;
  align-items: center;
}


.charts-container {
  margin-top: 0.5rem;

  .hw-info {
    width: 30%;
    align-items: center;

    .chart {
      width: 100%;
      aspect-ratio: 1;
    }

    .hw-title {
      text-align: center;
      font-size: 0.9rem;
    }

    .hw-detail {
      text-align: center;
      font-size: 0.7rem;
    }
  }
}

.net{
  margin-top: 0.5rem;
  .net-title {
    font-size: 0.9rem;
  }
  .net-detail {
    font-size: 0.7rem;
  }
  .net-chart{
    width: 100%;
    aspect-ratio: 2;
  }
}

</style>