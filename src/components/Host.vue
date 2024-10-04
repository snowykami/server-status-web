<script setup lang="ts">
import {Status} from "../api";
import {computed, onMounted, ref, watch} from "vue";
import * as echarts from "echarts";
import {
  format2Size,
  formatDate,
  formatSizeByUnit,
  formatUptime,
  getBaseColor,
  getBlankColor,
  getReleaseInfo,
  onlineTimeout
} from "../api/utils.ts";

import OutlineAnime from "./OutlineAnime.vue";
import Disk from "./Disk.vue";
import html2canvas from "html2canvas";

const props = defineProps<{
  status: Status
}>()

const status = computed(
    () => props.status
)

const uptime = ref(formatUptime(status.value.meta.uptime))
const cpuChartRef = ref(null);
const memoryChartRef = ref(null);
const swapChartRef = ref(null);

// 网络
const netChartRef = ref(null);
let netStats: [number, number, number][] = []
const isOnline = ref(true)
const statusColor = computed(
    () => isOnline.value ? '#22c55e' : '#ff4d4f'
)
const statusColor2 = computed(
    () => isOnline.value ? '#80ffb0' : '#fd8182'
)
const deltaTime = ref('0')
const os = computed(() => {
  return getReleaseInfo(status.value.meta.os.name, status.value.meta.os.version)
})

const memDetail = computed(() => {
  return format2Size(status.value.hardware.mem.used, status.value.hardware.mem.total)
})

const swapDetail = computed(() => {
  return status.value.hardware.swap.total > 0 ? format2Size(status.value.hardware.swap.used, status.value.hardware.swap.total) : 'N/A'
})

const gradientStyle = computed(() => {
  return {
    borderColor: `linear-gradient(90deg, ${statusColor.value}, ${statusColor2.value})`
  }
})

const hoverBorderColor = computed(() => {
  return statusColor.value
})


function onMountedFunc() {
  const cpuChart = echarts.init(cpuChartRef.value);
  const memoryChart = echarts.init(memoryChartRef.value);
  const swapChart = echarts.init(swapChartRef.value);
  const netChart = echarts.init(netChartRef.value);

  // style
  const titleStyle = {
    color: 'rgba(0, 0, 0, 0.8)',
    fontSize: 15,
  }
  const radius = ['65%', '90%']
  const netColor = ['#a2d8f4', '#0194e3'] // Tx Rx
  const pieLabelPosition = 'center'
  const emphasis = {
    label: {
      show: true,
      fontSize: 15,
      position: ['50%', '20%'] // 设置标签位置为圆环外部
    },
  }

  // 更新时间
  setInterval(() => {
    if (isOnline.value) {
      const deltaTime = (Date.now()) / 1000 - status.value.meta.observed_at
      uptime.value = formatUptime(status.value.meta.uptime + deltaTime)
    }
  }, 1000)

  function update() {
    const timeDiff = (Date.now()) / 1000 - status.value.meta.observed_at
    deltaTime.value = timeDiff.toFixed(1)
    // 判断该时间与上一个时间不同才push
    if (netStats.length === 0 || netStats[netStats.length - 1][0] !== status.value.meta.observed_at) {
      netStats.push([status.value.meta.observed_at, status.value.hardware.net.up, status.value.hardware.net.down])  // 时间 上行 下行
    }

    if (netStats.length > 20) {
      netStats.shift()
    }

    isOnline.value = timeDiff <= onlineTimeout;
    cpuChart.setOption(
        {
          color: [
            getBaseColor(status.value.hardware.cpu.percent),
            getBlankColor(status.value.hardware.cpu.percent)
          ],
          title: {
            text: status.value.hardware.cpu.percent + '%',
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
                position: pieLabelPosition
              },
              emphasis: emphasis,
              labelLine: {
                show: false
              },
              data: computed(
                  () => [
                    {value: status.value.hardware.cpu.percent, name: 'Used'},
                    {value: 100 - status.value.hardware.cpu.percent, name: 'Free'}
                  ]
              ).value
            }
          ]
        }
    )
    memoryChart.setOption(
        {
          color: [
            getBaseColor(status.value.hardware.mem.used / status.value.hardware.mem.total * 100),
            getBlankColor(status.value.hardware.mem.used / status.value.hardware.mem.total * 100)
          ],
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
                position: pieLabelPosition
              },
              emphasis: emphasis,
              labelLine: {
                show: false
              },
              data: [
                {value: status.value.hardware.mem.used, name: 'Used'},
                {value: status.value.hardware.mem.total - status.value.hardware.mem.used, name: 'Free'}
              ]
            }
          ]
        }
    )
    swapChart.setOption(
        {
          color: [
            getBaseColor(status.value.hardware.swap.used / status.value.hardware.swap.total * 100, status.value.hardware.swap.total <= 0),
            getBlankColor(status.value.hardware.swap.used / status.value.hardware.swap.total * 100, status.value.hardware.swap.total <= 0)
          ],
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
                position: pieLabelPosition
              },
              emphasis: emphasis,
              labelLine: {
                show: false
              },
              data: [
                {value: status.value.hardware.swap.total > 0 ? status.value.hardware.swap.used : 0, name: 'Used'},
                {
                  value: status.value.hardware.swap.total > 0 ? status.value.hardware.swap.total - status.value.hardware.swap.used : 100,
                  name: 'Free'
                }
              ]
            }
          ]
        }
    )

    netChart.setOption(
        {
          color: netColor,
          tooltip: {
            trigger: 'axis',
            axisPointer: {
              type: 'cross',
              label: {
                backgroundColor: '#0f7bc5',
                borderRadius: 50,
                formatter: function (params: any) {
                  if (params.axisDimension === 'y') {
                    return formatSizeByUnit(params.value * 8, null, 'bps');
                  } else {
                    return formatDate(params.value, true);
                  }
                }
              }
            },
            formatter: function (params: any) {
              let result = formatDate(params[0].name, true) + '<br/>';
              params.forEach(function (item: any) {
                result += item.marker + (item.seriesName == 'Tx' ? '↑' : '↓') + ': ' + formatSizeByUnit(item.value * 8, null, 'bps') + '<br/>';
              });
              return result;
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
                  return formatSizeByUnit(value * 8, null, 'b')
                }
              }
            }
          ],
          series: [
            {
              name: 'Tx',
              type: 'line',
              stack: 'Total',
              areaStyle: {},
              emphasis: {
                focus: 'series'
              },
              data: netStats.map(item => item[1]),
              showSymbol: false,
              lineStyle: {
                type: 'dashed'
              }
            },
            {
              name: 'Rx',
              type: 'line',
              stack: 'Total',
              areaStyle: {},
              emphasis: {
                focus: 'series'
              },
              data: netStats.map(item => item[2]),
              showSymbol: false
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


//      link.download = `screenshot-${status.value.meta.id}-${formatDate(Date.now(), false)}.svg`;

function downloadScreenshot() {
  const hostElement = document.querySelector(".host#"+status.value.meta.id);
  if (hostElement) {
    html2canvas(<HTMLElement>hostElement, { scale: 2 }).then((canvas) => {
      const dataURL = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = dataURL;
      link.download = `screenshot-${status.value.meta.id}-${formatDate(Date.now(), false)}.png`;
      link.click();
    });
  }
}

onMounted(
    () => {
      onMountedFunc()
    }
)

</script>

<template>
  <div class="host" :style="[gradientStyle, { '--hover-border-color': hoverBorderColor }]" :id="status.meta.id">
    <div class="meta-1" style="display: flex; justify-content: space-between">
      <div class="meta1-left" style="display: flex; justify-content: flex-start; align-items: center">
        <OutlineAnime class="outline-anime" :color="statusColor" :spreadColor="statusColor2" :is-online="isOnline"/>
        <span class="host-name" style="display: flex">{{ status.meta.name }}</span>
      </div>
      <div class="meta1-right" style="display: flex; justify-content: flex-end; align-items: center">
        <div class="uptime" style="margin-right: 5px"
             :style="{backgroundColor: statusColor2, borderColor: statusColor}">{{ uptime }}
        </div>&nbsp;
        <img @click="downloadScreenshot" class="icon" src="/svg/screenshots.svg" alt="download" style="width: 20px; height: 20px">
      </div>
    </div>
    <div class="meta-2">
      <div class="section">
        <img class="icon" :src="os.icon" alt="system">
        <span class="meta2-text">{{ os.name }}</span>
      </div>
      <div class="section">
        <img class="icon" src="/svg/timezone.svg" alt="location">
        <span class="meta2-text">{{ status.meta.location }} · {{ status.meta.timezone }}</span>
      </div>
      <div class="labels section" style="display: flex; justify-content: flex-start">
        <img class="icon" src="/svg/label.svg" alt="labels">
        <span class="label" v-for="label in status.meta.labels" :key="label">{{ label }}</span>
      </div>

    </div>
    <div class="section-name">
      Hardware
    </div>
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
      <div class="section-name">
        Network
      </div>
      <div class="net-chart" ref="netChartRef"></div>
    </div>
    <div class="disks">
      <div class="section-name">
        Storage
      </div>
      <Disk v-for="disk in status.hardware.disks" :key="disk.mountpoint" :mountpoint="disk.mountpoint"
            :device="disk.device" :used="disk.used" :total="disk.total" :fstype="disk.fstype"/>
    </div>
  </div>

</template>

<style scoped>

:root {

  --liteyuki-color-1: #d0e9ff;
  --liteyuki-color-2: #a2d8f4;
  --hover-border-color: #ccc;
}

.host {
  padding: 1em;
  border: 2px solid #ccc;
  border-radius: 20px;
  flex-direction: column;
  justify-content: space-between;
  transition: border-color 0.3s ease;
}

.host:hover {
  border-color: var(--hover-border-color); /* Change border color on hover */
}

.meta-1 {
  .outline-anime {
    margin-right: 0.5em;
  }

  .meta1-left {
    .host-name {
      text-align: center;
      font-size: 1.2rem;
      font-weight: bold;
    }
  }
}

.meta-2 {
  margin-top: 0.5em;

  .meta2-text {
    font-size: 0.9rem;
    color: var(--text-color-2);
  }

  .section {
    margin-bottom: 0.5rem;
  }
}

.labels {
  margin-top: 0.5em;

  .label {
    padding: 0.05rem 0.5rem;
    border: 1px dashed;
    border-color: var(--text-color-1);
    border-radius: 50px;
    margin-right: 10px;
    background-color: #dfdfdf;
    color: var(--text-color-1);
    font-size: 0.8rem;
  }
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

.uptime {
  padding: 0.1em 0.5rem;
  font-size: 0.8rem;
  border-radius: 50px;
  border: 1px dashed;
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

.section-name {
  font-size: 1rem;
  font-weight: bold;
  margin-top: 1rem;
}

.net {
  margin-top: 1rem;

  .net-chart {
    width: 100%;
    aspect-ratio: 2;
  }
}

.disks {
  margin-top: 1rem;
}

</style>