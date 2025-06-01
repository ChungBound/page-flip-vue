<template>
  <div
    class="h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex flex-col overflow-hidden"
  >
    <!-- Header -->
    <div class="bg-white/80 backdrop-blur-md shadow-sm flex-shrink-0">
      <div class="mx-auto flex items-center justify-between">
        <!-- Left Side - Navigation -->
        <div class="flex items-center gap-4 flex-1 p-4">
          <button
            @click="goBack"
            class="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors rounded-lg hover:bg-gray-100"
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
                d="M15 19l-7-7 7-7"
              ></path>
            </svg>
            Back to Profile
          </button>
          <div class="h-6 w-px bg-gray-300"></div>
          <div class="text-lg font-semibold text-gray-800">
            NeuroFlip Action
          </div>
          <!-- <div class="text-sm text-gray-600">
            Training: <span class="font-medium">{{ currentProfileName }}</span>
          </div> -->
        </div>

        <!-- Center - Connection Status -->
        <div class="flex-1 max-w-md mx-8 p-4">
          <div
            class="bg-white/90 backdrop-blur-md rounded-xl border border-gray-200 p-3 shadow-sm"
          >
            <!-- <div class="flex items-center justify-between mb-2">
              <h3 class="text-sm font-semibold text-gray-800">Brain Control</h3>
              <div class="flex items-center gap-2">
                <div
                  :class="[
                    'w-2 h-2 rounded-full',
                    connectionStatus === CONNECTION_STATUS.CONNECTED
                      ? 'bg-green-500 animate-pulse'
                      : connectionStatus === CONNECTION_STATUS.CONNECTING
                      ? 'bg-yellow-500 animate-pulse'
                      : 'bg-red-500',
                  ]"
                ></div>
                <span
                  class="text-xs font-medium"
                  :class="getConnectionStatusColor()"
                >
                  {{ getConnectionStatusText() }}
                </span>
              </div>
            </div> -->
            <div class="text-center">
              <div
                v-if="lastAction"
                class="flex items-center justify-center gap-2"
              >
                <span class="text-xs text-gray-600">Last Action:</span>
                <span
                  class="text-sm font-medium"
                  :class="getActionColor(lastAction)"
                >
                  {{ getActionDisplayName(lastAction) }}
                </span>
                <span v-if="confidence > 0" class="text-xs text-gray-500">
                  ({{ confidence }}%)
                </span>
              </div>
              <div v-else class="text-xs text-gray-500">
                Waiting for brain signals...
              </div>
            </div>
          </div>
        </div>

        <!-- Right Side - Signal Quality -->
        <div class="flex items-center gap-4 flex-1 justify-end p-4">
          <div class="text-sm text-gray-600">
            Training: <span class="font-medium">{{ currentProfileName }}</span>
          </div>
          <!-- <div class="text-sm text-gray-600">
            EEG Signal:
            <span
              class="font-medium"
              :class="getSignalQualityColor(signalQuality)"
              >{{ signalQuality }}</span
            >
          </div> -->
          <div
            class="flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium"
            :class="
              connectionStatus === CONNECTION_STATUS.CONNECTED
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-800'
            "
          >
            {{
              connectionStatus === CONNECTION_STATUS.CONNECTED
                ? "Active"
                : "Standby"
            }}
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div
      class="flex-1 flex flex-col items-center justify-center p-4 overflow-hidden"
    >
      <!-- FlipBook Component -->
      <div class="flex flex-col h-full w-full overflow-hidden">
        <!-- FlipBook居中容器 -->
        <div class="training-flipbook-wrapper" style="flex: 1">
          <FlipBook
            ref="flipBookRef"
            mode="manual"
            :showControls="false"
            :customPages="actionPages"
          />
        </div>

        <!-- Status Information -->
        <!-- <div class="flex-shrink-0 w-full max-w-lg mx-auto pb-4">
          <div
            class="bg-white/90 backdrop-blur-md rounded-xl p-4 shadow-lg text-center"
          >
            <div class="flex items-center justify-center gap-4 mb-3">
              <div class="flex items-center gap-2">
                <div class="w-3 h-3 bg-pink-500 rounded-full"></div>
                <span class="text-sm text-gray-600">Neutral</span>
              </div>
              <div class="flex items-center gap-2">
                <div class="w-3 h-3 bg-cyan-400 rounded-full"></div>
                <span class="text-sm text-gray-600">Flip Left</span>
              </div>
              <div class="flex items-center gap-2">
                <div class="w-3 h-3 bg-orange-400 rounded-full"></div>
                <span class="text-sm text-gray-600">Flip Right</span>
              </div>
            </div>
            <p class="text-sm text-gray-600">
              Focus on the book and use your trained brain patterns to control
              page turning
            </p>
          </div>
        </div> -->
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { ElMessage } from "element-plus";
import FlipBook from "@/components/FlipBook.vue";
import {
  createNeuroFlipConnection,
  createMockBrainSignals,
  ACTION_TYPES,
  CONNECTION_STATUS,
} from "@/api/neuroflip";

const router = useRouter();
const route = useRoute();
const flipBookRef = ref(null);

// 获取当前训练人信息
const currentProfileName = ref(route.query.profileName || "Unknown User");

// 连接状态
const connectionStatus = ref(CONNECTION_STATUS.DISCONNECTED);
const signalQuality = ref("Good");
const lastAction = ref(null);
const confidence = ref(0);

// WebSocket 和模拟器
let neuroConnection = null;
let mockSignals = null;

// 是否使用模拟模式（开发时为true，生产时为false）
const USE_MOCK_MODE = true;

// 书页内容
const actionPages = [
  {
    content:
      "Welcome to NeuroFlip! Use your brain to control the pages. Think about the trained actions to flip the book left or right.",
    pageNumber: 1,
  },
  {
    content:
      "Focus your mind and concentrate on the action you want to perform. The book will respond to your brain signals in real-time.",
    pageNumber: 2,
  },
  {
    content:
      "Left Page Turn: Think about the 'Flip Left' pattern you trained earlier. The book will turn pages from right to left.",
    pageNumber: 3,
  },
  {
    content:
      "Right Page Turn: Think about the 'Flip Right' pattern you trained earlier. The book will turn pages from left to right.",
    pageNumber: 4,
  },
  {
    content:
      "Neutral State: Relax your mind and think about the 'Neutral' pattern. The book will remain still and stable.",
    pageNumber: 5,
  },
  {
    content:
      "Practice makes perfect! The more you use NeuroFlip, the better the system becomes at recognizing your unique brain patterns.",
    pageNumber: 6,
  },
  {
    content:
      "Advanced Control: Try combining different mental states and observe how the book responds to your thoughts and intentions.",
    pageNumber: 7,
  },
  {
    content:
      "End of Demo: You have successfully demonstrated brain-controlled page turning. Continue practicing to improve accuracy!",
    pageNumber: 8,
  },
];

// 获取动作显示名称
const getActionDisplayName = (action) => {
  const displayNames = {
    neutral: "Neutral",
    left: "Flip Left",
    right: "Flip Right",
  };
  return displayNames[action] || action;
};

// 获取动作颜色
const getActionColor = (action) => {
  const colors = {
    neutral: "text-pink-600",
    left: "text-cyan-600",
    right: "text-orange-600",
  };
  return colors[action] || "text-gray-600";
};

// 获取连接状态颜色
const getConnectionStatusColor = () => {
  const colors = {
    connected: "text-green-600",
    connecting: "text-yellow-600",
    disconnected: "text-red-600",
  };
  return colors[connectionStatus.value] || "text-gray-600";
};

// 获取连接状态文本
const getConnectionStatusText = () => {
  const texts = {
    connected: "Connected",
    connecting: "Connecting...",
    disconnected: "Disconnected",
  };
  return texts[connectionStatus.value] || "Unknown";
};

// 获取信号质量颜色
const getSignalQualityColor = (quality) => {
  const colors = {
    Excellent: "text-green-600",
    Good: "text-green-600",
    Fair: "text-yellow-600",
    Poor: "text-red-600",
  };
  return colors[quality] || "text-gray-600";
};

// 执行翻页动作
const performAction = async (action) => {
  if (!flipBookRef.value) return;

  lastAction.value = action;

  try {
    switch (action) {
      case ACTION_TYPES.LEFT:
        // 触发向左翻页（向后翻页）
        await flipBookRef.value.goToPreviousPage();
        break;
      case ACTION_TYPES.RIGHT:
        // 触发向右翻页（向前翻页）
        await flipBookRef.value.goToNextPage();
        break;
      case ACTION_TYPES.NEUTRAL:
        // 中性状态，不执行任何动作
        break;
      default:
        console.warn("Unknown action:", action);
    }
  } catch (error) {
    console.error("Error performing action:", error);
  }
};

// 处理脑控信号
const handleBrainSignal = (data) => {
  console.log("Brain signal received:", data);

  if (data.type === "brain_action") {
    lastAction.value = data.action;

    // 更新信号质量
    if (data.signalQuality) {
      signalQuality.value = data.signalQuality;
    }

    // 更新置信度
    if (data.confidence !== undefined) {
      confidence.value = Math.round(data.confidence * 100);
    }

    // 只有置信度足够高才执行动作
    if (data.confidence && data.confidence > 0.6) {
      performAction(data.action);
    }
  }
};

// 连接状态变化处理
const handleStatusChange = (status) => {
  connectionStatus.value = status;

  switch (status) {
    case CONNECTION_STATUS.CONNECTED:
      ElMessage.success("Brain control system connected!");
      break;
    case CONNECTION_STATUS.DISCONNECTED:
      ElMessage.warning("Brain control system disconnected");
      break;
    case CONNECTION_STATUS.CONNECTING:
      // 不显示消息，避免过多提示
      break;
  }
};

// 建立连接
const connectWebSocket = () => {
  try {
    if (USE_MOCK_MODE) {
      // 使用模拟模式
      connectionStatus.value = CONNECTION_STATUS.CONNECTING;

      setTimeout(() => {
        connectionStatus.value = CONNECTION_STATUS.CONNECTED;
        ElMessage.success(
          `Brain control system connected for ${currentProfileName.value}! (Mock Mode)`
        );

        // 启动模拟信号
        mockSignals = createMockBrainSignals(handleBrainSignal, {
          interval: 4000, // 4秒间隔
          actions: [
            ACTION_TYPES.NEUTRAL,
            ACTION_TYPES.LEFT,
            ACTION_TYPES.RIGHT,
            ACTION_TYPES.NEUTRAL,
            ACTION_TYPES.NEUTRAL,
          ],
          profileName: currentProfileName.value, // 传递用户信息
        });
        mockSignals.start();
      }, 1500);
    } else {
      // 使用真实WebSocket连接
      neuroConnection = createNeuroFlipConnection(
        handleBrainSignal,
        handleStatusChange,
        currentProfileName.value // 传递用户信息
      );
      neuroConnection.connect();
    }
  } catch (error) {
    connectionStatus.value = CONNECTION_STATUS.DISCONNECTED;
    ElMessage.error("Failed to connect to brain control system");
    console.error("Connection error:", error);
  }
};

// 断开连接
const disconnectWebSocket = () => {
  if (neuroConnection) {
    neuroConnection.disconnect();
    neuroConnection = null;
  }

  if (mockSignals) {
    mockSignals.stop();
    mockSignals = null;
  }

  connectionStatus.value = CONNECTION_STATUS.DISCONNECTED;
};

// 返回上一页
const goBack = () => {
  if (currentProfileName.value && currentProfileName.value !== "Unknown User") {
    router.push(`/profile/${currentProfileName.value}`);
  } else {
    router.push("/profiles");
  }
};

// 组件挂载
onMounted(() => {
  // 检查是否有用户信息
  if (
    !currentProfileName.value ||
    currentProfileName.value === "Unknown User"
  ) {
    ElMessage.warning(
      "No profile information found, redirecting to profiles page"
    );
    console.warn("NeuroFlip: Missing profile information");
    router.push("/profiles");
    return;
  }

  console.log(
    `NeuroFlip Action Page mounted for profile: ${currentProfileName.value}`
  );
  connectWebSocket();
});

// 组件卸载
onUnmounted(() => {
  disconnectWebSocket();
});
</script>

<style scoped>
/* 与训练页面相同的样式 */
.animate-pulse {
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

/* FlipBook容器样式 */
.training-flipbook-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 0;
  padding: 1rem 0;
}

/* 响应式设计 */
@media (max-height: 700px) {
  .training-flipbook-wrapper {
    padding: 0.5rem 0;
  }
}

@media (max-height: 600px) {
  .training-flipbook-wrapper {
    padding: 0.25rem 0;
    min-height: 300px !important;
  }
}
</style>
