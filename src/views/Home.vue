<script setup lang="ts">
import {onMounted, onUnmounted, Ref, ref} from "vue";
import {getStatuses, Status} from "../api";
import Host from "../components/Host.vue";

const statuses: Ref<Record<string, Status>> = ref({})
onMounted(async () => {
  statuses.value = await getStatuses()
  console.log("mounted")
  // 创建定时器，每隔 5 秒刷新一次数据
  const timer = setInterval(async () => {
    statuses.value = await getStatuses()
    console.log("refresh")
  }, 1000)
  onUnmounted(() => {
    clearInterval(timer)
    console.log("unmounted")
  })
})


</script>

<template>
  <div class="grid-container">
    <Host class="grid-item" v-for="(status, id) in statuses" :key="id" :status="status"/>
  </div>
</template>

<style scoped>
.grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 10px;
  padding: 10px;
}
</style>