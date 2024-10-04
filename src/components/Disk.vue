<script setup lang="ts">
import { format2Size, getBaseColor, getBlankColor } from '../api/utils.ts';

const props = defineProps<{
  mountpoint: string;
  device: string;
  used: number;
  total: number;
  fstype: string;
}>();

const colorUsed = getBaseColor(props.used / props.total * 100);
const colorBlank = getBlankColor(props.used / props.total * 100);
</script>

<template>
  <div class="disk" :style="{ backgroundColor: colorBlank }">
    <div class="disk-used" :style="{ width: props.used / props.total * 100 + '%', backgroundColor: colorUsed }"></div>
    <div class="hover-text">
      <div class="left-text">
        <span class="disk-text">{{ props.mountpoint }}</span>
      </div>
      <div class="right-text">
        <span class="disk-text">{{ format2Size(props.used, props.total) }} [{{ props.fstype }}]</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
:host {
  --text-size: 2px;
}

.disk {
  margin-top: 0.5rem;
  height: 2rem;
  width: 100%;
  border-radius: 1rem;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden; /* Ensure the used part doesn't overflow */
}

.disk-used {
  height: 100%;
  position: absolute;
  left: 0;
  top: 0;
  clip-path: inset(0 0 0 0 round var(--border-radius)); /* Apply border-radius using clip-path */
}

.hover-text {
  position: absolute;
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  text-align: center;
  padding: 0 1rem;
}

.left-text {
  margin-left: 1rem;
  display: flex;
  justify-content: flex-start;
}

.right-text {
  margin-right: 1rem;
  display: flex;
  justify-content: flex-end;
}

.disk-text {
  font-size: var(--text-size);
  color: var(--text-color-2);
}
</style>