<template>
  <Transition name="modal">
    <div
        v-if="visible"
        class="fixed inset-0 z-50 flex items-center justify-center"
    >
      <!-- Background overlay -->
      <div
          class="absolute inset-0 bg-black/30 backdrop-blur-sm"
          @click="$emit('close')"
      ></div>
      <!-- Modal content -->
      <div
          class="relative bg-white rounded-2xl shadow-xl w-full max-w-3xl mx-4 flex flex-col"
      >
        <!-- Header -->
        <div
            class="flex items-center justify-between px-6 py-4 border-b border-gray-100"
        >
          <h3 class="text-lg font-semibold text-gray-800">Device Status</h3>
          <button
              @click="$emit('close')"
              class="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg
                class="w-5 h-5 text-gray-500"
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
        <!-- Tabs -->
        <div class="px-6 pt-4">
          <div class="flex space-x-4 border-b border-gray-100">
            <button
                @click="activeTab = 'battery'"
                :class="[
                'px-4 py-2 text-sm font-medium transition-colors relative',
                activeTab === 'battery'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700',
              ]"
            >
              Battery
            </button>
            <button
                @click="activeTab = 'contact'"
                :class="[
                'px-4 py-2 text-sm font-medium transition-colors relative',
                activeTab === 'contact'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700',
              ]"
            >
              Contact Quality
            </button>
            <button
                @click="activeTab = 'eeg'"
                :class="[
                'px-4 py-2 text-sm font-medium transition-colors relative',
                activeTab === 'eeg'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700',
              ]"
            >
              EEG Quality
            </button>
          </div>
        </div>
        <!-- Main content -->
        <div class="flex flex-1 px-6 py-6 gap-8 min-h-[340px]">
          <!-- Battery Tab Content - 只显示电池信息 -->
          <div
              v-if="activeTab === 'battery'"
              class="w-full flex justify-center"
          >
            <div class="w-96 flex flex-col gap-6">
              <!-- 电池状态卡片 -->
              <div
                  class="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100"
              >
                <div
                    class="text-xl font-semibold text-gray-800 mb-4 text-center"
                >
                  Battery Status
                </div>

                <!-- 电池电量显示 -->
                <div class="bg-white rounded-xl p-4 mb-4 shadow-sm">
                  <div class="flex items-center justify-between mb-3">
                    <span class="text-sm text-gray-600">Current Level:</span>
                    <span
                        class="text-2xl font-bold"
                        :class="
                        deviceStore.batteryOverview !== null &&
                        deviceStore.batteryOverview >= 2
                          ? 'text-green-600'
                          : 'text-red-600'
                      "
                    >
                      {{ batteryLevel !== null ? batteryLevel + "%" : "N/A" }}
                    </span>
                  </div>

                  <!-- 电池进度条 -->
                  <div class="w-full bg-gray-200 rounded-full h-3 mb-2">
                    <div
                        class="h-3 rounded-full transition-all duration-300"
                        :class="getBatteryColor()"
                        :style="{ width: (batteryLevel || 0) + '%' }"
                    ></div>
                  </div>

                  <!-- 电池状态文字 -->
                  <div class="text-center text-sm text-gray-500">
                    {{ getBatteryStatusText() }}
                  </div>
                </div>

                <!-- 电池使用建议 -->
                <div class="bg-blue-50 rounded-lg p-4 mb-4">
                  <div class="text-base font-medium text-gray-800 mb-2">
                    Usage Tips
                  </div>
                  <div class="text-sm text-gray-600 mb-3">
                    Please ensure the device is fully charged before use.
                    Monitor the battery level during experiments and recharge
                    promptly for optimal performance.
                  </div>
                </div>

                <!-- 低电量警告 -->
                <div
                    class="flex items-center gap-3 text-red-600 bg-red-50 rounded-lg p-3"
                    v-if="
                    deviceStore.batteryOverview !== null &&
                    deviceStore.batteryOverview <= 1
                  "
                >
                  <svg
                      class="w-5 h-5 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                  >
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    ></path>
                  </svg>
                  <span class="text-sm font-medium"
                  >Low battery detected. Please recharge immediately.</span
                  >
                </div>
              </div>
            </div>
          </div>

          <!-- Contact/EEG Tab Content - 显示传感器图 -->
          <template v-else>
            <!-- Left: EEGSensorMap -->
            <div
                class="flex-1 flex flex-col items-center justify-center relative"
            >
              <EEGSensorMap
                  :sensors="sensors"
                  :sensorLinks="sensorLinks"
                  :activeTab="activeTab"
                  :useImageBackground="true"
                  headImagePath="/images/head.svg"
              />
            </div>

            <!-- Right info area -->
            <div class="w-72 flex flex-col gap-4">
              <div v-if="activeTab === 'contact'">
                <div class="text-lg font-semibold text-gray-800 mb-3">
                  How to ensure good Contact Quality?
                </div>
                <div class="text-gray-600 mb-3">
                  Make sure each electrode is in good contact with the scalp. If
                  all points are black, first adjust the reference electrodes to
                  green, then adjust the others.
                </div>
                <div class="flex items-center gap-2 text-red-500">
                  <svg
                      class="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                  >
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M18.364 5.636l-1.414 1.414A9 9 0 105.636 18.364l1.414-1.414"
                    ></path>
                  </svg>
                  If contact is poor, please adjust the electrode position.
                </div>
              </div>
              <div v-else-if="activeTab === 'eeg'">
                <div class="text-lg font-semibold text-gray-800 mb-3">
                  How to ensure good EEG Quality?
                </div>
                <div class="text-gray-600 mb-3">
                  Pay attention to the signal quality of each electrode. Adjust
                  the electrode position and scalp contact until all points turn
                  green.
                </div>
                <div class="flex items-center gap-2 text-red-500">
                  <svg
                      class="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                  >
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M18.364 5.636l-1.414 1.414A9 9 0 105.636 18.364l1.414-1.414"
                    ></path>
                  </svg>
                  If the signal is poor, please keep still and adjust the
                  electrodes.
                </div>
              </div>
            </div>
          </template>
        </div>
        <!-- Footer buttons -->
        <div class="flex justify-end gap-3 px-6 py-4 bg-gray-50 rounded-b-2xl">
          <button
              @click="$emit('close')"
              class="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Close
          </button>
          <button
              @click="refreshDeviceData"
              class="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, computed, defineProps, defineEmits, watch } from "vue";
import EEGSensorMap from "./EEGSensorMap.vue";
import { useDeviceStore } from "@/stores/deviceStore";
import { wsManager } from "@/utils/websocket";
import { shouldUseMock } from "@/config/mockConfig";

const deviceStore = useDeviceStore();

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  activeTab: {
    type: String,
    default: "battery",
  },
  isConnected: {
    type: Boolean,
    default: false,
  },
  batteryLevel: {
    type: Number,
    default: null,
  },
});

defineEmits(["close"]);

const activeTab = ref(props.activeTab);
watch(
    () => props.activeTab,
    (v) => (activeTab.value = v)
);

// 使用store中的实时传感器数据
const sensors = computed(() => deviceStore.sensorsWithData);

// 传感器连接线配置 - 与DeviceConnectionPage保持一致
const sensorLinks = [
  ["AF3", "T7"],
  ["AF4", "T8"],
  ["F7", "T7"],
  ["F8", "T8"],
  ["F3", "T7"],
  ["F4", "T8"],
  ["FC5", "T7"],
  ["FC6", "T8"],
  ["T7", "P7"],
  ["T8", "P8"],
  ["T7", "O1"],
  ["T8", "O2"],
];

// 刷新设备数据 - 与DeviceConnectionPage的refreshSignal逻辑保持一致
const refreshDeviceData = () => {
  console.log("Refreshing device data...");

  // 如果设备已连接，重新建立WebSocket连接
  if (deviceStore.isConnected) {
    wsManager.close();
    setTimeout(() => {
      // 使用配置系统确定WebSocket URL
      const useMock = shouldUseMock();
      const wsUrl = useMock
          ? "/ws/mock/all-device-data"
          : "/ws/client/all-device-data";

      console.log(
          `🌐 Refreshing WebSocket connection: ${wsUrl} (Mock: ${useMock})`
      );

      wsManager.connect(
          wsUrl,
          (data) => {
            // 使用store更新设备数据
            deviceStore.updateDeviceData(data);
          },
          (wsError) => {
            console.error("WebSocket refresh error:", wsError);
          }
      );
    }, 500); // 短暂延迟后重连
  }
};

const getBatteryColor = () => {
  // 根据battery_overview (0-4) 确定颜色
  switch (deviceStore.batteryOverview) {
    case 0:
      return "bg-red-600"; // 大红色 - 严重低电量
    case 1:
      return "bg-red-500"; // 红色 - 低电量
    case 2:
      return "bg-orange-500"; // 橙色 - 中等电量
    case 3:
      return "bg-yellow-400"; // 黄绿色 - 良好电量
    case 4:
      return "bg-green-500"; // 绿色 - 满电
    default:
      return "bg-gray-400"; // 默认灰色
  }
};

const getBatteryStatusText = () => {
  // 根据battery_overview (0-4) 确定电池状态文字
  switch (deviceStore.batteryOverview) {
    case 0:
      return "Critical: Please recharge immediately";
    case 1:
      return "Low: Charge recommended before use";
    case 2:
      return "Fair: Monitor during extended use";
    case 3:
      return "Good: Ready for operation";
    case 4:
      return "Excellent: Fully charged";
    default:
      return "Battery status unknown";
  }
};
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
.modal-enter-to,
.modal-leave-from {
  opacity: 1;
  transform: scale(1);
}
</style>
