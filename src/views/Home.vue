<script setup lang="ts">
import {computed, onMounted, onUnmounted, Ref, ref} from "vue";
import {getStatuses, Status} from "../api";
import Host from "../components/Host.vue";
import {onlineTimeout} from "../api/utils.ts";

const statuses: Ref<Record<string, Status>> = ref({})

const offline = ref(0)

const onlineNum = computed(
  () => {
    const nowTimestamp = Date.now() / 1000
    let online = 0
    for (const status of Object.values(statuses.value)) {
      if (nowTimestamp - status.meta.observed_at < onlineTimeout) {
        online++
      }
    }
    offline.value = Object.values(statuses.value).length - online
    return online
  }
)

const timer = setInterval(async () => {
  statuses.value = await getStatuses()
}, 1000)

onMounted(async () => {
  statuses.value = await getStatuses()
})

onUnmounted(() => {
  clearInterval(timer)
})


</script>

<template>
  <div class="overview" style="">
    <h2>Overview: {{onlineNum}} Online {{offline}} Offline</h2>
  </div>
  <div class="grid-container">
    <Host class="grid-item" v-for="(status, id) in statuses" :key="id" :status="status"/>
  </div>
</template>

<style scoped>
.overview {
  display: flex;
  justify-content: center;
  padding: 10px;
}

.grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
  padding: 10px;
}
</style>