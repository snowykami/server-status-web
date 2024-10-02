<script setup lang="ts">
import {Status} from "../api";
import {computed, onMounted, ref, watch} from "vue";
import * as echarts from "echarts";

const props = defineProps<{
  status: Status
}>()

const status = computed(
    () => props.status
)

const cpuChartRef = ref(null);
const memoryChartRef = ref(null);
const swapChartRef = ref(null);
const diskChartRef = ref(null);

onMounted(
    () => {
      setOptions()
    }
)

function setOptions() {
  const cpuChart = echarts.init(cpuChartRef.value);
  const memoryChart = echarts.init(memoryChartRef.value);
  const swapChart = echarts.init(swapChartRef.value);
  const diskChart = echarts.init(diskChartRef.value);

  function setOption() {
    cpuChart.setOption(
        {
          title: {
            text: 'CPU',
            left: 'center',
            top: 'center',
            textStyle: {
              color: 'rgba(255, 255, 255, 0.8)',
              fontSize: 14,
            }
          },
          series: [
            {
              type: 'pie',
              radius: ['50%', '70%'],
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
              // data: [
              //   {value: status.value.hardware.cpu.percent, name: 'CPU'},
              //   {value: 100 - status.value.hardware.cpu.percent, name: '空闲'}
              // ]
              data: computed(
                  () => [
                    {value: status.value.hardware.cpu.percent, name: 'CPU'},
                    {value: 100 - status.value.hardware.cpu.percent, name: '空闲'}
                  ]
              ).value
            }
          ]
        }
    )
    memoryChart.setOption(
        {
          title: {
            text: 'Memory',
            left: 'center',
            top: 'center',
            textStyle: {
              color: 'rgba(255, 255, 255, 0.8)',
              fontSize: 14,
            }
          },
          series: [
            {
              type: 'pie',
              radius: ['50%', '70%'],
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
                {value: props.status.hardware.mem.used, name: 'Memory'},
                {value: props.status.hardware.mem.total - props.status.hardware.mem.used, name: '空闲'}
              ]
            }
          ]
        }
    )
    swapChart.setOption(
        {
          title: {
            text: 'Swap',
            left: 'center',
            top: 'center',
            textStyle: {
              color: 'rgba(255, 255, 255, 0.8)',
              fontSize: 14,
            }
          },
          series: [
            {
              type: 'pie',
              radius: ['50%', '70%'],
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
                {value: props.status.hardware.swap.used, name: 'Swap'},
                {value: props.status.hardware.swap.total - props.status.hardware.swap.used, name: '空闲'}
              ]
            }
          ]
        }
    )
    diskChart.setOption(
        {
          title: {
            text: 'Disk',
            left: 'center',
            top: 'center',
            textStyle: {
              color: 'rgba(255, 255, 255, 0.8)',
              fontSize: 14,
            }
          },
        }
    )
  }

  setOption()
  watch(
      () => status.value,
      () => {
        setOption()
      }
  )
}


</script>

<template>
  <div class="host">
    <div class="meta-1" style="display: flex; justify-content: flex-start">
      <span>{{ props.status.meta.name }}</span><span>{{ props.status.meta.id }}</span>
    </div>
    <div class="meta-2" style="display: flex">
      <div class="section">
        <img class="icon" src="/svg/location.svg" alt="system">
        <span>{{ props.status.meta.location }}</span>
      </div>
      <div class="section">
        <img class="icon" src="/svg/system.svg" alt="system">
        <span>{{ props.status.meta.os.name }}</span>
      </div>
    </div>
    <div class="labels" style="display: flex; justify-content: flex-start">
      <span class="label" v-for="label in props.status.meta.labels" :key="label">{{ label }}</span>
    </div>
    <div class="charts-container" style="display: flex">
      <div class="chart" ref="cpuChartRef"></div>
      <div class="chart" ref="memoryChartRef"></div>
      <div class="chart" ref="swapChartRef"></div>
      <div class="chart" ref="diskChartRef"></div>
    </div>
  </div>

</template>

<style scoped>
.host {
  padding: 1em;
  border: 1px solid #ccc;
  border-radius: 20px;
  margin: 0.5em;
  flex-direction: column;
  justify-content: space-between;
}

.icon {
  margin-right: 0.5em;
  height: 20px;
}

.section {
  display: flex;
  margin-right: 10px;
}

.label {
  background-color: #535bf2;
  padding: 2px 5px;
  border-radius: 5px;
  margin-right: 10px;
}

.chart {
  width: 150px;
  height: 150px;
}
</style>