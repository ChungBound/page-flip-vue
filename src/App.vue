<template>
  <div class="app-bg min-h-screen flex flex-col h-screen overflow-hidden">
    <!-- 全局loading -->
    <div
      v-loading="loadingStore.loading"
      :element-loading-text="loadingStore.loadingText"
      element-loading-background="rgba(255, 255, 255, 0.8)"
      class="global-loading"
    ></div>

    <!-- Header with rounded corners -->
    <header class="px-8 pt-6">
      <div
        class="header-card bg-white/95 backdrop-blur-md shadow-2xl rounded-full"
      >
        <div
          class="h-20 px-5 flex justify-between items-center max-w-[1920px] mx-auto"
        >
          <div class="flex items-center justify-between">
            <!-- 左侧圆形占位 -->
            <div
              class="w-12 h-12 rounded-full bg-white shadow flex items-center justify-center mr-6 border border-gray-200"
            ></div>
            <!-- Project name on the left -->
            <div
              class="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent cursor-pointer"
              @click="goHome"
            >
              NeuroFlip Reader
            </div>
          </div>

          <!-- Device info in the center -->
          <template v-if="deviceStore.isConnected">
            <div class="flex items-center gap-8">
              <!-- Mock模式指示器 -->
              <div
                v-if="shouldUseMock()"
                class="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium border border-orange-200"
              >
                🎭 Mock Mode
              </div>

              <button
                @click="showDeviceStatus('battery')"
                class="device-status-card hover:bg-gray-100/50 active:bg-gray-200/50 transition-colors cursor-pointer"
                :disabled="!deviceStore.isConnected"
              >
                <div class="flex items-center gap-2">
                  <template v-if="deviceStore.isConnected">
                    <div
                      class="w-2.5 h-2.5 rounded-full animate-pulse"
                      :class="batteryPulseColor"
                    ></div>
                    <span class="text-gray-600 text-sm"
                      >Battery:
                      {{
                        deviceStore.batteryLevel !== null
                          ? deviceStore.batteryLevel + "%"
                          : "N/A"
                      }}</span
                    >
                  </template>
                  <svg
                    v-if="deviceStore.isConnected"
                    class="w-4 h-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M19 9l-7 7-7-7"
                    ></path>
                  </svg>
                </div>
              </button>
              <button
                @click="showDeviceStatus('eeg')"
                class="device-status-card hover:bg-gray-100/50 active:bg-gray-200/50 transition-colors cursor-pointer"
                :disabled="!deviceStore.isConnected"
              >
                <div class="flex items-center gap-2">
                  <template v-if="deviceStore.isConnected">
                    <div
                      class="w-2.5 h-2.5 rounded-full animate-pulse"
                      :class="eegPulseColor"
                    ></div>
                    <span class="text-gray-600 text-sm"
                      >EEG: {{ eegStatusDisplay }}</span
                    >
                  </template>

                  <svg
                    v-if="deviceStore.isConnected"
                    class="w-4 h-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M19 9l-7 7-7-7"
                    ></path>
                  </svg>
                </div>
              </button>
            </div>
          </template>
          <template v-else>
            <span class="device-status-card text-gray-500 text-sm"
              >Emotiv device not connected</span
            >
          </template>

          <!-- Navigation on the right -->
          <button @click="goPrev" class="btn-primary ml-6">
            <span class="mr-2">←</span>{{ backButtonText }}
          </button>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="flex-1 px-8 py-3 min-h-0">
      <div
        class="main-card bg-white/95 backdrop-blur-md rounded-3xl shadow-xl w-full h-full p-4 flex flex-col max-w-[1920px] mx-auto"
      >
        <router-view></router-view>
      </div>
    </main>

    <!-- Footer -->
    <footer class="px-6 pb-4">
      <div
        class="footer-card bg-white/95 backdrop-blur-md shadow-lg rounded-xl max-w-[1920px] mx-auto"
      >
        <div class="h-12 flex items-center justify-between px-8">
          <p class="text-gray-500 font-medium text-sm tracking-wide">
            Created with ❤️ by LY1 team
          </p>
          <div class="flex items-center gap-4 text-xs text-gray-500">
            <span>Version 1.0.0</span>
            <span>|</span>
            <span>© 2025 All Rights Reserved</span>
          </div>
        </div>
      </div>
    </footer>

    <!-- Device status modal -->
    <SignalStatusModal
      :visible="signalModalVisible"
      :activeTab="activeDeviceTab"
      :is-connected="deviceStore.isConnected"
      :battery-level="deviceStore.batteryLevel"
      @close="signalModalVisible = false"
    />

    <!-- Mock Controller (仅开发环境) -->
    <MockController />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import SignalStatusModal from "./components/SignalStatusModal.vue";
import MockController from "./components/MockController.vue";
import { useDeviceStore } from "./stores/deviceStore";
import { useLoadingStore } from "./stores/loadingStore";
import { wsManager } from "./utils/websocket";
import { shouldUseMock } from "./config/mockConfig";

const deviceStore = useDeviceStore();
const loadingStore = useLoadingStore();
const signalModalVisible = ref(false);
const activeDeviceTab = ref("battery"); // 'battery' 或 'eeg'
const router = useRouter();
const route = useRoute();

// 计算后退按钮的显示文本
const backButtonText = computed(() => {
  const currentPath = route.path;
  const currentName = route.name;

  if (currentPath === "/auth") {
    return "Refresh";
  }

  if (currentPath === "/device") {
    return "Auth";
  }

  if (currentPath === "/test-mock" || currentPath === "/test-system") {
    return "Auth";
  }

  if (currentPath === "/profiles") {
    return "Device";
  }

  if (currentName === "ProfileDetail") {
    return "Profiles";
  }

  if (currentName === "ActionTraining") {
    return "Profile";
  }

  if (currentPath === "/neuroflip") {
    return "Profile";
  }

  if (currentPath === "/signal") {
    return "Profiles";
  }

  return "Back";
});

function goHome() {
  router.push("/");
}

function goPrev() {
  const currentPath = route.path;
  const currentName = route.name;

  // 根据当前路由定义后退逻辑
  if (currentPath === "/auth") {
    // auth页面刷新当前页面，不后退
    window.location.reload();
    return;
  }

  if (currentPath === "/device") {
    // device页面后退到auth页面
    router.push("/auth");
    return;
  }

  if (currentPath === "/test-mock" || currentPath === "/test-system") {
    // 测试页面后退到auth页面
    router.push("/auth");
    return;
  }

  if (currentPath === "/profiles") {
    // profiles页面后退到device页面
    router.push("/device");
    return;
  }

  if (currentName === "ProfileDetail") {
    // 个人详情页后退到profiles页面
    router.push("/profiles");
    return;
  }

  if (currentName === "ActionTraining") {
    // 训练页面后退到对应的个人详情页
    const profileName = route.params.profileName;
    if (profileName) {
      router.push(`/profile/${profileName}`);
    } else {
      router.push("/profiles");
    }
    return;
  }

  if (currentPath === "/neuroflip") {
    // neuroflip页面后退到对应的个人详情页
    const profileName = route.query.profileName;
    if (profileName) {
      router.push(`/profile/${profileName}`);
    } else {
      router.push("/profiles");
    }
    return;
  }

  if (currentPath === "/signal") {
    // signal页面后退到profiles页面
    router.push("/profiles");
    return;
  }

  // 其他页面使用默认后退逻辑
  if (window.history.length > 1) {
    router.back();
  } else {
    router.push("/auth");
  }
}

function showDeviceStatus(type) {
  if (!deviceStore.isConnected) return;
  activeDeviceTab.value = type;
  signalModalVisible.value = true;
}

const batteryPulseColor = computed(() => {
  if (!deviceStore.isConnected || deviceStore.batteryOverview === null)
    return "bg-gray-400";

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
});

// 使用store中的EEG状态
const eegStatusDisplay = computed(() => {
  // 临时测试 - 直接返回测试值
  if (!deviceStore.isConnected) return "N/A";

  const status = deviceStore.eegQualityStatus;
  console.log("🧠 EEG Status:", status, "Connected:", deviceStore.isConnected);

  return status || "Loading...";
});

// EEG状态脉冲颜色
const eegPulseColor = computed(() => {
  if (!deviceStore.isConnected) return "bg-gray-400";

  const status = deviceStore.eegQualityStatus;
  switch (status) {
    case "Excellent":
      return "bg-green-500"; // 绿色 - 优秀
    case "Good":
      return "bg-blue-500"; // 蓝色 - 良好
    case "Fair":
      return "bg-yellow-500"; // 黄色 - 一般
    case "Poor":
      return "bg-orange-500"; // 橙色 - 差
    case "No Signal":
      return "bg-red-500"; // 红色 - 无信号
    default:
      return "bg-gray-400"; // 灰色 - 未知
  }
});

// 全局WebSocket连接管理
let globalWsConnected = false;

const startGlobalWebSocket = () => {
  if (globalWsConnected) return;

  // 使用配置系统判断WebSocket URL
  const useMock = shouldUseMock();
  const wsUrl = useMock
    ? "/ws/mock/all-device-data"
    : "/ws/client/all-device-data";

  console.log("🌐 Starting global WebSocket:", wsUrl, "(Mock:", useMock, ")");

  wsManager.connect(
    wsUrl,
    (data) => {
      // console.log("📨 Global WebSocket received data:", data);
      deviceStore.updateDeviceData(data);
    },
    (error) => {
      console.error("Global WebSocket error:", error);
      globalWsConnected = false;
    },
    () => {
      console.log("✅ Global WebSocket connected");
      globalWsConnected = true;
    }
  );
};

const stopGlobalWebSocket = () => {
  if (globalWsConnected) {
    wsManager.close();
    globalWsConnected = false;
  }
};

onMounted(() => {
  // Always try to start global WebSocket if device is connected
  if (deviceStore.isConnected) {
    startGlobalWebSocket();
  }
});

// Simple watch for device connection changes
watch(
  () => deviceStore.isConnected,
  (newStatus) => {
    if (newStatus) {
      startGlobalWebSocket();
    } else {
      stopGlobalWebSocket();
    }
  }
);

onUnmounted(() => {
  stopGlobalWebSocket();
});

// 监听路由变化和设备连接状态
router.beforeEach((to, from, next) => {
  // 如果离开device页面，保持WebSocket连接以更新header
  if (from.path === "/device" && deviceStore.isConnected) {
    // 保持全局WebSocket连接
    if (!globalWsConnected) {
      startGlobalWebSocket();
    }
  }
  next();
});
</script>

<style>
html,
body,
#app {
  height: 100vh;
  margin: 0;
  padding: 0;
  overflow: hidden;
}

#app {
  display: flex;
  flex-direction: column;
}

.app-bg {
  background: linear-gradient(135deg, #e0e7ff 0%, #f0fdfa 100%);
}

.header-card,
.footer-card,
.main-card {
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.device-status-card {
  @apply px-3 py-1.5 bg-gray-50/50 rounded-lg border border-gray-100 flex items-center;
  backdrop-filter: blur(8px);
}

.main-card {
  overflow-y: auto;
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.12);
}

.btn-primary {
  @apply px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-500 
         text-white font-semibold rounded-full shadow-md 
         hover:shadow-lg transition-all duration-200 
         flex items-center text-base;
}

.btn-primary:active {
  transform: scale(0.97);
}

/* 自定义滚动条样式 */
.main-card::-webkit-scrollbar {
  width: 6px;
}

.main-card::-webkit-scrollbar-track {
  background: transparent;
}

.main-card::-webkit-scrollbar-thumb {
  background-color: rgba(156, 163, 175, 0.5);
  border-radius: 3px;
}

.main-card::-webkit-scrollbar-thumb:hover {
  background-color: rgba(156, 163, 175, 0.7);
}

/* 响应式布局 */
@media (max-width: 768px) {
  .header-card > div {
    @apply flex-col gap-4 py-4;
  }

  .device-status-card {
    @apply w-full;
  }
}

.header-card {
  /* 圆角更大，阴影更柔和 */
  border-radius: 1.5rem; /* rounded-3xl */
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.btn-primary {
  @apply px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-500 
         text-white font-semibold rounded-full shadow-md 
         hover:shadow-lg transition-all duration-200 
         flex items-center text-base;
}

.btn-primary:active {
  transform: scale(0.97);
}

/* 全局loading样式 */
.global-loading {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
  pointer-events: none;
}

/* 自定义loading样式 */
:root {
  --el-loading-spinner-size: 42px;
  --el-loading-spinner-color: grey;
}

.el-loading-spinner .circular {
  width: var(--el-loading-spinner-size);
  height: var(--el-loading-spinner-size);
}

.el-loading-spinner .path {
  stroke: grey;
}
.el-loading-spinner .el-loading-text {
  color: var(--el-loading-spinner-color);
  margin: 3px 0;
  font-size: 1.25rem;
}
</style>
