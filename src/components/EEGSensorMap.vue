<template>
  <div
    class="relative w-full flex flex-col items-center justify-center overflow-visible min-h-[280px]"
  >
    <svg
      :width="280"
      :height="280"
      viewBox="0 0 280 280"
      class="overflow-visible"
    >
      <!-- 定义图片模式 -->
      <defs>
        <pattern
          id="headPattern"
          patternUnits="objectBoundingBox"
          width="1"
          height="1"
        >
          <!-- 动态绑定图片路径 - 增大图片尺寸并居中 -->
          <image
            :href="headImagePath || '/images/head-default.png'"
            x="-340"
            y="-380"
            width="1000"
            height="1000"
            preserveAspectRatio="xMidYMid slice"
          />
        </pattern>
      </defs>

      <!-- 背景 - 可选择使用图片或简单圆形 -->
      <template v-if="useImageBackground">
        <!-- 使用图片背景 -->
        <circle
          cx="140"
          cy="150"
          r="140"
          fill="url(#headPattern)"
          stroke="#d1d5db"
          stroke-width="0"
        />
      </template>
      <template v-else>
        <!-- 使用简单圆形背景 -->
        <circle
          cx="140"
          cy="150"
          r="100"
          fill="#e5e7eb"
          stroke="#d1d5db"
          stroke-width="2"
        />
      </template>

      <!-- 连接线组 -->
      <g stroke="#4b5563" stroke-width="1.5" opacity="0.7" fill="none">
        <path
          v-for="(pair, idx) in sensorLinks"
          :key="idx"
          :d="createCurvePath(sensorsMap[pair[0]], sensorsMap[pair[1]])"
          class="sensor-connection-line"
        />
      </g>

      <!-- 传感器点组 -->
      <g v-for="sensor in sensors" :key="sensor.id">
        <!-- 传感器阴影 -->
        <circle
          :cx="sensor.x + 1"
          :cy="sensor.y + 1"
          :r="7"
          fill="rgba(0,0,0,0.2)"
        />
        <!-- 主传感器 - 移除悬停动画 -->
        <circle
          :cx="sensor.x"
          :cy="sensor.y"
          :r="6"
          :fill="
            getColor(activeTab === 'contact' ? sensor.contact : sensor.eeg)
          "
          :stroke="selectedSensor === sensor.id ? '#3b82f6' : '#fff'"
          stroke-width="2"
          @click.stop="selectSensor(sensor.id, $event)"
          class="sensor-node"
        />
        <!-- 传感器标签 -->
        <text
          :x="sensor.x"
          :y="sensor.y + 20"
          text-anchor="middle"
          class="text-xs font-medium fill-gray-600 sensor-label"
        >
          {{ sensor.label }}
        </text>
      </g>
    </svg>

    <!-- Info card overlay - 使用Portal到body避免布局影响 -->
    <teleport to="body" v-if="selectedSensorObj">
      <div class="fixed inset-0 z-30" @click="clearSelected"></div>
      <div
        class="fixed z-40 transform -translate-x-1/2"
        :style="popupPosition"
        @click.stop
      >
        <div
          class="bg-white rounded-2xl shadow-2xl px-6 py-4 border border-gray-100 min-w-[240px] max-w-[280px] flex flex-col gap-3 relative animate-fadein"
        >
          <div
            class="font-semibold text-gray-800 mb-1 text-base flex items-center gap-2"
          >
            <span>{{ selectedSensorObj.label }}</span>
            <span class="text-xs text-gray-400">Sensor</span>
          </div>
          <div class="flex items-center gap-4 text-sm">
            <span class="text-gray-600">Contact</span>
            <span
              :style="getDotStyle(selectedSensorObj.contact)"
              class="sensor-dot"
            ></span>
            <span class="text-gray-600 ml-2">EEG</span>
            <span
              :style="getDotStyle(selectedSensorObj.eeg)"
              class="sensor-dot"
            ></span>
          </div>
          <div class="flex items-center gap-2 text-xs text-gray-500 mt-1">
            <span>Contact:</span>
            <span>{{ getSensorStatus(selectedSensorObj, "contact") }}</span>
            <span class="ml-2">EEG:</span>
            <span>{{ getSensorStatus(selectedSensorObj, "eeg") }}</span>
          </div>
          <button
            class="absolute top-2 right-2 text-gray-400 hover:text-blue-500"
            @click="clearSelected"
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
    </teleport>

    <!-- 质量百分比显示 -->
    <div
      class="absolute left-1/2 bottom-[-3rem] -translate-x-1/2 text-2xl font-bold text-red-500 select-none pointer-events-none"
    >
      {{ qualityPercentage }}%
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from "vue";

const props = defineProps({
  sensors: Array,
  sensorLinks: Array,
  activeTab: {
    type: String,
    default: "contact",
  },
  // 新增：是否使用图片背景
  useImageBackground: {
    type: Boolean,
    default: false,
  },
  // 新增：自定义图片路径
  headImagePath: {
    type: String,
    default: "/path/to/your/head-image.png",
  },
});

const selectedSensor = ref(null);
const popupPosition = ref({ left: "50%", top: "50%" }); // 存储弹窗位置
const sensorsMap = computed(() =>
  Object.fromEntries(props.sensors.map((s) => [s.label, s]))
);
const selectedSensorObj = computed(() =>
  props.sensors.find((s) => s.id === selectedSensor.value)
);

// 计算质量百分比
const qualityPercentage = computed(() => {
  if (!props.sensors || props.sensors.length === 0) return 0;

  const qualityField = props.activeTab === "contact" ? "contact" : "eeg";
  const validSensors = props.sensors.filter((s) => s[qualityField] >= 0);
  if (validSensors.length === 0) return 0;

  const totalQuality = validSensors.reduce((sum, sensor) => {
    const quality = sensor[qualityField];
    return sum + (quality >= 0 ? (quality / 4) * 100 : 0);
  }, 0);

  return Math.round(totalQuality / validSensors.length);
});

function getColor(val) {
  switch (val) {
    case 0:
      return "#374151"; // 深灰色 - 无连接
    case 1:
      return "#ef4444"; // 红色 - 差
    case 2:
      return "#f59e0b"; // 橙色 - 一般
    case 3:
      return "#eab308"; // 黄色 - 良好
    case 4:
      return "#22c55e"; // 绿色 - 优秀
    default:
      return "#9ca3af"; // 灰色 - 未知
  }
}

function getDotStyle(val) {
  return {
    background: getColor(val),
    boxShadow: "0 2px 8px 0 rgba(0,0,0,0.15)",
    width: "18px",
    height: "18px",
    borderRadius: "50%",
    display: "inline-block",
    border: "2px solid #fff",
    outline: "1.5px solid #e5e7eb",
  };
}

function selectSensor(id, event) {
  selectedSensor.value = id;

  // 使用鼠标事件的实际坐标
  if (event) {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // 获取鼠标点击的客户端坐标（相对于视窗）
    let mouseX = event.clientX;
    let mouseY = event.clientY;

    // 弹窗尺寸估算
    const popupWidth = 240;
    const popupHeight = 140;

    let left = mouseX;
    let top = mouseY + 20; // 默认显示在鼠标下方

    // 水平位置调整 - 确保不超出视窗
    if (left + popupWidth / 2 > viewportWidth - 20) {
      left = viewportWidth - popupWidth / 2 - 20;
    } else if (left - popupWidth / 2 < 20) {
      left = popupWidth / 2 + 20;
    }

    // 垂直位置调整 - 如果下方空间不足，显示在上方
    if (top + popupHeight > viewportHeight - 20) {
      top = mouseY - popupHeight - 10;
    }

    // 确保顶部不超出视窗
    if (top < 20) {
      top = 20;
    }

    // 由于使用fixed定位，直接使用客户端坐标
    popupPosition.value = {
      left: `${left}px`,
      top: `${top}px`,
    };

    // console.log("🎯 Popup position:", { mouseX, mouseY, left, top });
  }
}

function clearSelected() {
  selectedSensor.value = null;
}

function getSensorStatus(sensor, type) {
  const value = type === "contact" ? sensor.contact : sensor.eeg;
  switch (value) {
    case 4:
      return "Excellent";
    case 3:
      return "Good";
    case 2:
      return "Fair";
    case 1:
      return "Poor";
    case 0:
      return type === "contact" ? "No Contact" : "No Signal";
    default:
      return "Unknown";
  }
}

function createCurvePath(start, end) {
  if (!start || !end) return "";

  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  // 计算中点
  const midX = start.x + dx / 2;
  const midY = start.y + dy / 2;

  // 弧度大小与距离成比例，根据距离调整
  const baseCurvature = Math.min(distance * 0.15, 25);

  // 根据头部中心点(140, 150)调整弧线方向
  const centerX = 140;
  const centerY = 150;

  // 计算中点到中心的方向
  const toCenterX = centerX - midX;
  const toCenterY = centerY - midY;
  const toCenterDistance = Math.sqrt(
    toCenterX * toCenterX + toCenterY * toCenterY
  );

  // 标准化到中心的方向向量
  const toCenterNormX = toCenterX / toCenterDistance;
  const toCenterNormY = toCenterY / toCenterDistance;

  // 控制点偏向头部外侧（远离中心方向弯曲）- 反向
  const controlX = midX - toCenterNormX * baseCurvature;
  const controlY = midY - toCenterNormY * baseCurvature;

  // 使用二次贝塞尔曲线
  return `M${start.x},${start.y} Q${controlX},${controlY} ${end.x},${end.y}`;
}
</script>

<style scoped>
.sensor-dot {
  box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border: 2px solid #fff;
  outline: 1.5px solid #e5e7eb;
  width: 18px;
  height: 18px;
  display: inline-block;
  vertical-align: middle;
}

/* 传感器连接线样式 */
.sensor-connection-line {
  transition: stroke-width 0.3s ease, opacity 0.3s ease;
}

.sensor-connection-line:hover {
  stroke-width: 2;
  opacity: 0.7;
}

/* 传感器节点样式 - 移除悬停动画 */
.sensor-node {
  cursor: pointer;
  transition: stroke-width 0.2s ease;
}

.sensor-node:hover {
  stroke-width: 3;
  /* 移除了 scale 变换，只保留描边变化 */
}

/* 传感器标签样式 */
.sensor-label {
  pointer-events: none;
  user-select: none;
}

/* 弹出卡片动画 */
.animate-fadein {
  animation: fadein 0.2s ease-out;
}

@keyframes fadein {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* SVG响应式 */
svg {
  max-width: 100%;
  height: auto;
}

/* 确保图片在SVG中正确显示 */
pattern image {
  opacity: 0.8;
}
</style>
