<template>
  <div class="h-screen p-4 overflow-hidden page-container">
    <!-- Title -->
    <div class="flex flex-col items-center justify-center w-full mb-4">
      <h2 class="text-xl font-semibold text-gray-800 mb-2">
        Profile Detail: {{ profileName }}
      </h2>
      <hr class="border w-[90%] mb-2 border-solid border-[#808080]" />
    </div>

    <!-- Main Content Area -->
    <div
      class="flex gap-6 max-w-[1400px] h-[calc(60vh)] mx-auto main-content-flex justify-around items-center"
    >
      <!-- Left Side - Brain Map -->
      <div class="flex-1 max-w-[600px] content-panel">
        <div
          class="bg-white/95 backdrop-blur-md rounded-3xl shadow-[0_0_20px_rgba(0,0,0,0.3)] p-6 h-full flex flex-col"
        >
          <h3
            class="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2"
          >
            <svg
              class="w-5 h-5 text-purple-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              ></path>
            </svg>
            Brain Activity Map
          </h3>

          <!-- Brain Map Visualization -->
          <div
            class="flex-1 bg-gray-50 rounded-xl p-4 flex items-center justify-center"
          >
            <div class="w-full max-w-[400px] flex justify-center">
              <canvas
                ref="brainMapCanvas"
                width="400"
                height="200"
                class="border border-gray-200 rounded-lg bg-white"
              ></canvas>
            </div>
          </div>

          <!-- Simple Legend -->
          <div class="mt-4 flex flex-wrap gap-6 justify-center">
            <div
              v-for="action in actions"
              :key="`legend-${action}`"
              class="flex items-center gap-2"
            >
              <div
                :class="['w-4 h-4 rounded-full', getActionColor(action)]"
              ></div>
              <span class="text-sm font-medium text-gray-700">{{
                getActionDisplayName(action)
              }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Side - Training Status -->
      <div class="flex-1 max-w-[600px] content-panel">
        <div
          class="bg-white/95 backdrop-blur-md rounded-3xl shadow-[0_0_20px_rgba(0,0,0,0.3)] p-6 h-full flex flex-col"
        >
          <!-- Loading State -->
          <div v-if="loading" class="flex items-center justify-center flex-1">
            <div class="flex items-center gap-3 text-blue-600">
              <svg class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                ></circle>
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <span class="text-lg">Loading profile...</span>
            </div>
          </div>

          <!-- Profile Content -->
          <div v-else class="flex flex-col h-full">
            <!-- Training Status Section -->
            <div class="flex-1">
              <h3
                class="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2"
              >
                <svg
                  class="w-5 h-5 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  ></path>
                </svg>
                Training Status
              </h3>

              <div class="space-y-3">
                <div
                  v-for="action in actions"
                  :key="action"
                  class="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <div class="flex items-center justify-between">
                    <!-- Action Info -->
                    <div class="flex items-center gap-4 flex-1">
                      <div
                        :class="[
                          'w-3 h-8 rounded-full',
                          getActionColor(action),
                        ]"
                      ></div>
                      <div class="flex-1">
                        <h4
                          class="text-base font-medium text-gray-800 capitalize"
                        >
                          {{ getActionDisplayName(action) }}
                        </h4>
                        <p class="text-sm text-gray-500">
                          Trained {{ getTrainCount(action) }} times
                          <span
                            v-if="getTrainCount(action) === 0"
                            class="text-orange-500"
                            >• Not trained</span
                          >
                          <span v-else class="text-green-500">• Trained</span>
                        </p>
                      </div>

                      <!-- Train Count Badge -->
                      <div
                        class="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold min-w-[48px] text-center"
                      >
                        {{ getTrainCount(action) }}
                      </div>
                    </div>

                    <!-- Action Buttons -->
                    <div class="flex items-center gap-2 ml-4">
                      <button
                        @click="goTrain(action)"
                        :disabled="!canTrain(action)"
                        :class="[
                          'px-4 py-2 rounded-full font-medium transition-all duration-200 text-sm shadow-sm hover:shadow-md',
                          canTrain(action)
                            ? 'bg-pink-500 text-white hover:bg-pink-600'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed',
                        ]"
                      >
                        Train
                      </button>
                      <button
                        v-if="getTrainCount(action) > 0"
                        @click="confirmEraseTraining(action)"
                        class="p-2 bg-gray-200 hover:bg-gray-300 text-gray-600 rounded-full transition-all duration-200"
                        title="Erase training"
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
                  </div>

                  <!-- Training requirement notice -->
                  <div
                    v-if="!canTrain(action) && action !== 'neutral'"
                    class="mt-2 text-xs text-orange-600 bg-orange-50 px-3 py-1 rounded-lg"
                  >
                    ⚠️ Complete Neutral training first
                  </div>
                </div>
              </div>
            </div>

            <!-- Action Button -->
            <div class="mt-6">
              <button
                :disabled="!allTrained"
                @click="goNeuroFlip"
                :class="[
                  'w-full py-3 rounded-full font-semibold transition-all duration-200 shadow-md hover:shadow-lg',
                  allTrained
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-gray-400 cursor-not-allowed text-gray-600',
                ]"
              >
                <span v-if="allTrained">🚀 Go to NeuroFlip Action Page</span>
                <span v-else>⏳ Complete all training to continue</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Training Confirm Dialog -->
    <teleport to="body" v-if="showEraseDialog">
      <div
        class="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50"
      >
        <div
          class="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden"
        >
          <div class="px-6 py-4 border-b border-gray-200">
            <h3 class="text-lg font-semibold text-gray-800">
              Erase Training Data
            </h3>
          </div>
          <div class="px-6 py-4">
            <div class="flex items-center gap-3 mb-4">
              <div
                class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center"
              >
                <svg
                  class="w-6 h-6 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.996-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  ></path>
                </svg>
              </div>
              <div>
                <p class="text-gray-800 font-medium">
                  Are you sure you want to erase all training data?
                </p>
                <p class="text-gray-600 text-sm mt-1">
                  Action: "{{ getActionDisplayName(eraseAction) }}"
                </p>
                <p class="text-gray-600 text-sm">
                  Training times: {{ getTrainCount(eraseAction) }}
                </p>
              </div>
            </div>
            <p class="text-gray-600 text-sm">
              This will permanently delete all training data for this action.
              This action cannot be undone.
            </p>
          </div>
          <div
            class="px-6 py-4 border-t border-gray-200 flex justify-end gap-3"
          >
            <button
              @click="closeEraseDialog"
              class="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              @click="eraseTrainingConfirmed"
              class="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200 font-medium shadow-sm hover:shadow-md"
            >
              Erase Training
            </button>
          </div>
        </div>
      </div>
    </teleport>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch, nextTick } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { getProfileInfo } from "../api/profile";

const route = useRoute();
const router = useRouter();
const profileName = route.params.profileName; // 使用profileName而不是id
const loading = ref(true);
const profileData = ref(null);
const brainMapCanvas = ref(null);
const showEraseDialog = ref(false);
const eraseAction = ref(null);

// 固定的三个动作
const actions = ["neutral", "left", "right"];

// 计算brainmap数据
const brainMapData = computed(() => {
  if (!profileData.value?.result?.brainmap) {
    return null;
  }

  // 只返回系统中存在的三个动作的数据
  const filteredData = profileData.value.result.brainmap.filter((item) =>
    actions.includes(item.action)
  );

  return filteredData;
});

// Canvas绘制脑活动图
const drawBrainMap = () => {
  if (!brainMapCanvas.value || !brainMapData.value) return;

  const canvas = brainMapCanvas.value;
  const ctx = canvas.getContext("2d");
  const width = canvas.width;
  const height = canvas.height;
  const radius = width / 2;
  const centerX = width / 2;
  const centerY = height;

  // Clear the canvas
  ctx.clearRect(0, 0, width, height);

  // Draw the semi-circle (fan shape)
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, Math.PI, 0);
  ctx.lineTo(centerX, centerY);
  ctx.closePath();
  ctx.strokeStyle = "#d1d5db";
  ctx.lineWidth = 2;
  ctx.stroke();

  // Draw concentric arcs for scale
  for (let r = radius / 4; r < radius; r += radius / 4) {
    ctx.beginPath();
    ctx.arc(centerX, centerY, r, Math.PI, 0);
    ctx.strokeStyle = "#e5e7eb";
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // Draw radial lines for angular scale
  for (let angle = Math.PI; angle <= 2 * Math.PI; angle += Math.PI / 6) {
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(x, y);
    ctx.strokeStyle = "#e5e7eb";
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // Plot the points from brainMapData
  brainMapData.value.forEach((data) => {
    const [x, y] = data.coordinates;
    const action = data.action;

    // Map the coordinates to the canvas
    // x: -1 to 1 maps to -radius to radius
    // y: 0 to 1 maps to 0 to -radius (since y-axis is inverted in canvas)
    const canvasX = centerX + x * radius;
    const canvasY = centerY - y * radius;

    // Get color based on action
    let color = getActionColorHex(action);

    // Draw the point
    ctx.beginPath();
    ctx.arc(canvasX, canvasY, 8, 0, 2 * Math.PI);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 2;
    ctx.stroke();
  });
};

// 监听brainMapData变化，重新绘制
watch(
  brainMapData,
  () => {
    if (brainMapData.value) {
      nextTick(() => {
        drawBrainMap();
      });
    }
  },
  { immediate: true }
);

// 获取动作显示名称
const getActionDisplayName = (action) => {
  const displayNames = {
    neutral: "Neutral",
    left: "Flip Left",
    right: "Flip Right",
  };
  return displayNames[action] || action;
};

// 获取动作颜色类名
const getActionColor = (action) => {
  const colors = {
    neutral: "bg-pink-500",
    left: "bg-cyan-400",
    right: "bg-orange-400",
  };
  return colors[action] || "bg-gray-300";
};

// 获取动作颜色十六进制值
const getActionColorHex = (action) => {
  const colors = {
    neutral: "#ec4899", // pink-500
    left: "#22D3EE", // cyan-400
    right: "#fb923c", // orange-400
  };
  return colors[action] || "#9ca3af";
};

// 获取训练次数
const getTrainCount = (action) => {
  if (!profileData.value?.result?.trained_actions) return 0;

  const actionData = profileData.value.result.trained_actions.find(
    (item) => item.action === action
  );
  return actionData ? actionData.times : 0;
};

// 检查是否可以训练
const canTrain = (action) => {
  if (action === "neutral") return true;

  // left和right需要先完成neutral训练
  return getTrainCount("neutral") > 0;
};

// 检查是否所有动作都已训练
const allTrained = computed(() => {
  return actions.every((action) => getTrainCount(action) > 0);
});

// 获取profile信息
const fetchProfile = async () => {
  loading.value = true;
  try {
    const response = await getProfileInfo(profileName);
    if (response.status === 1) {
      profileData.value = response;
      ElMessage.success(`Profile "${profileName}" loaded successfully`);
    } else {
      ElMessage.error(`Failed to load profile: ${response.message}`);
      console.error("Failed to fetch profile:", response.message);
    }
  } catch (error) {
    console.error("Error fetching profile:", error);
    ElMessage.error("Network error occurred while loading profile");
  }
  loading.value = false;
};

// 前往训练页面
const goTrain = (action) => {
  if (!canTrain(action)) {
    ElMessage.warning("Complete Neutral training first!");
    return;
  }
  router.push(
    `/profile/${profileName}/train?action=${encodeURIComponent(action)}`
  );
};

// 确认删除训练
const confirmEraseTraining = (action) => {
  eraseAction.value = action;
  showEraseDialog.value = true;
};

// 关闭删除确认对话框
const closeEraseDialog = () => {
  showEraseDialog.value = false;
  eraseAction.value = null;
};

// 确认删除训练数据
const eraseTrainingConfirmed = async () => {
  if (!eraseAction.value) return;

  try {
    // TODO: 实现擦除训练的API调用
    // await eraseTrainingAPI(profileName, eraseAction.value);
    ElMessage.success(
      `All training data for ${getActionDisplayName(
        eraseAction.value
      )} has been erased`
    );

    // 模拟删除效果：将对应动作的训练次数重置为0
    if (profileData.value?.result?.trained_actions) {
      const actionIndex = profileData.value.result.trained_actions.findIndex(
        (item) => item.action === eraseAction.value
      );
      if (actionIndex !== -1) {
        profileData.value.result.trained_actions[actionIndex].times = 0;
      }
    }

    closeEraseDialog();
    // 重新获取数据
    // fetchProfile();
  } catch (error) {
    console.error("Error erasing training:", error);
    ElMessage.error("Network error occurred while erasing training data");
  }
};

// 前往NeuroFlip页面
const goNeuroFlip = () => {
  if (allTrained.value) {
    ElMessage.success("All training completed! Redirecting to NeuroFlip...");
    router.push(`/neuroflip?profileName=${encodeURIComponent(profileName)}`);
  } else {
    ElMessage.warning("Please complete all training first!");
  }
};

onMounted(() => {
  fetchProfile().then(() => {
    // 确保Canvas在数据加载后绘制
    nextTick(() => {
      drawBrainMap();
    });
  });
});
</script>

<style scoped>
/* 确保按钮动画效果 */
button:active {
  transform: scale(0.97);
}

/* 禁用状态样式 */
button:disabled {
  transform: none;
}

/* SVG text styling */
svg text {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

/* 响应式布局 */
@media (max-width: 1200px) {
  .main-content-flex {
    flex-direction: column !important;
    height: auto !important;
    max-height: calc(100vh - 120px);
    overflow-y: auto;
  }

  .content-panel {
    max-width: none !important;
    height: auto !important;
    min-height: 400px;
  }
}

@media (max-width: 768px) {
  .page-container {
    min-height: 100vh;
    height: auto !important;
    overflow: visible !important;
  }
}
</style>
