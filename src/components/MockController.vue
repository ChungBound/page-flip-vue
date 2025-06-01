<template>
  <div class="fixed bottom-4 right-4 z-50" v-if="showController">
    <div class="bg-white rounded-lg shadow-lg border p-4 min-w-[300px]">
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-sm font-semibold text-gray-800">🛠️ Mock Controller</h3>
        <button
            @click="showController = false"
            class="text-gray-400 hover:text-gray-600"
        >
          <svg
              class="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
          >
            <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
            ></path>
          </svg>
        </button>
      </div>

      <!-- Current Status -->
      <div class="mb-4 p-3 bg-gray-50 rounded">
        <div class="text-xs text-gray-600 mb-1">Current Status:</div>
        <div
            class="text-sm font-medium"
            :class="status.isUsing ? 'text-orange-600' : 'text-green-600'"
        >
          {{ status.description }}
        </div>
      </div>

      <!-- Control Buttons -->
      <div class="space-y-2">
        <button
            @click="setMockMode('auto')"
            :class="
            mockState.enabled === 'auto'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-700'
          "
            class="w-full px-3 py-2 text-sm rounded hover:opacity-80 transition"
        >
          🔄 Auto (Dev Environment Only)
        </button>
        <button
            @click="setMockMode(true)"
            :class="
            mockState.enabled === true
              ? 'bg-orange-500 text-white'
              : 'bg-gray-100 text-gray-700'
          "
            class="w-full px-3 py-2 text-sm rounded hover:opacity-80 transition"
        >
          🎭 Force Mock (Always Use Mock)
        </button>
        <!-- <button
          @click="setMockMode(false)"
          :class="
            mockState.enabled === false
              ? 'bg-green-500 text-white'
              : 'bg-gray-100 text-gray-700'
          "
          class="w-full px-3 py-2 text-sm rounded hover:opacity-80 transition"
        >
          🔌 Real Device (Always Use Real APIs)
        </button> -->
        <button
            @click="setMockMode(false)"
            :class="buttonClasses"
            class="w-full px-3 py-2 text-sm rounded hover:opacity-80 transition"
        >
          🔌 Real Device (Always Use Real APIs)
        </button>
      </div>

      <!-- Notice -->
      <div class="mt-3 p-2 bg-blue-50 rounded text-xs text-blue-700">
        <strong>Note:</strong> Changes will take effect after page reload or
        reconnection
      </div>

      <!-- Quick Actions -->
      <div class="mt-3 flex gap-2">
        <button
            @click="reloadPage"
            class="flex-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded hover:bg-blue-200 transition"
        >
          🔄 Reload Page
        </button>
        <button
            @click="clearData"
            class="flex-1 px-2 py-1 bg-red-100 text-red-700 text-xs rounded hover:bg-red-200 transition"
        >
          🗑️ Clear Data
        </button>
      </div>
    </div>
  </div>

  <!-- Show/Hide Button -->
  <button
      v-if="!showController && isDev"
      @click="showController = true"
      class="fixed bottom-4 right-4 w-12 h-12 bg-orange-500 text-white rounded-full shadow-lg hover:bg-orange-600 transition z-40"
      title="Mock Controller"
  >
    🛠️
  </button>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from "vue";
import { mockConfig, getMockStatus, toggleMockMode } from "@/config/mockConfig";
import { useDeviceStore } from "@/stores/deviceStore";
import { wsManager } from "@/utils/websocket";

const deviceStore = useDeviceStore();
const showController = ref(false);

// Use reactive for better reactivity
const mockState = reactive(mockConfig);
const buttonClasses = computed(() => ({
  "bg-green-500 text-white": mockState.enabled === false,
  "bg-gray-100 text-gray-700": mockState.enabled !== false,
}));
const isDev = computed(() => import.meta.env.MODE === "development");

// 基于mockState的本地状态计算
const status = computed(() => {
  const isDev = import.meta.env.MODE === "development";

  let isUsing;
  switch (mockState.enabled) {
    case true:
      isUsing = true;
      break;
    case false:
      isUsing = false;
      break;
    case "auto":
    default:
      isUsing = isDev;
  }

  const mode = mockState.enabled;

  return {
    isUsing,
    mode,
    description: isUsing
        ? `Mock mode enabled (${
            mode === true ? "Forced" : mode === "auto" ? "Auto" : "Manual"
        })`
        : "Real device mode",
  };
});

const setMockMode = (mode) => {
  console.log("🎛️ Setting mock mode to:", mode);

  // 直接更新响应式状态
  mockState.enabled = mode;

  // 同时更新原始配置（保证其他地方的一致性）
  toggleMockMode(mode);

  console.log("✅ Mock mode updated:", getMockStatus());
};

const reloadPage = () => {
  window.location.reload();
};

const clearData = () => {
  deviceStore.clearDeviceData();
  wsManager.close();
};

// Keyboard shortcut: Ctrl+M to show/hide controller
onMounted(() => {
  const handleKeydown = (e) => {
    if (e.ctrlKey && e.key === "m" && isDev.value) {
      e.preventDefault();
      showController.value = !showController.value;
    }
  };

  document.addEventListener("keydown", handleKeydown);

  // Cleanup function
  return () => {
    document.removeEventListener("keydown", handleKeydown);
  };
});
</script>
