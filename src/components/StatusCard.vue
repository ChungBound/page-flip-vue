<template>
  <div
    class="flex flex-col items-center justify-center main-card bg-white/95 backdrop-blur-md rounded-3xl shadow-[0_0_20px_rgba(0,0,0,0.3)] w-full h-[50vh] max-w-[1920px] mx-auto"
  >
    <!-- 状态文字 -->
    <div class="text-xl mb-4" :class="statusTextClass">
      {{ message }}
    </div>

    <!-- 按钮插槽 -->
    <slot name="button">
      <button
        v-if="buttonText"
        class="mt-2 px-8 py-2 rounded-full border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 transition"
        @click="$emit('buttonClick')"
      >
        {{ buttonText }}
      </button>
    </slot>

    <!-- 额外内容插槽 -->
    <slot></slot>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  type: {
    type: String,
    default: "info",
    validator: (value) =>
      ["success", "error", "warning", "info"].includes(value),
  },
  message: {
    type: String,
    required: true,
  },
  buttonText: {
    type: String,
    default: "",
  },
});

const emit = defineEmits(["buttonClick"]);

const statusTextClass = computed(() => {
  const classes = {
    success: "text-green-600",
    error: "text-red-600",
    warning: "text-yellow-600",
    info: "text-blue-600",
  };
  return classes[props.type] || classes.info;
});
</script>
