<template>
  <div class="w-full h-32 flex items-end gap-1">
    <div v-for="(val, idx) in data" :key="idx" class="flex-1 flex flex-col justify-end">
      <div :class="barColor(val)" :style="{height: barHeight(val)}" class="transition-all duration-300 rounded-t"></div>
      <div class="text-xs text-center mt-1">{{ val }}%</div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
const props = defineProps({
  data: {
    type: Array,
    default: () => []
  },
  type: {
    type: String,
    default: 'contact' // or 'eeg'
  }
});

const barColor = (val) => {
  if (props.type === 'contact') {
    return val === 100 ? 'bg-green-500' : 'bg-red-400';
  } else {
    return val > 80 ? 'bg-green-500' : 'bg-red-400';
  }
};

const barHeight = (val) => `${Math.max(10, val)}%`;
</script>