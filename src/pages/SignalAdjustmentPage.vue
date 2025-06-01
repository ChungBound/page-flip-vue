<template>
  <div class="flex flex-col items-center justify-center min-h-screen bg-gray-50" @click="clearSelected">
    <div class="bg-white p-8 rounded-2xl shadow-xl w-full max-w-4xl flex flex-col" @click.stop>
      <h2 class="text-2xl font-bold mb-4 text-center">Signal Adjustment</h2>
      <!-- Tabs -->
      <div class="flex space-x-4 border-b border-gray-100 mb-6">
        <button 
          @click="tab = 'contact'"
          :class="[
            'px-4 py-2 text-sm font-medium transition-colors relative',
            tab === 'contact' 
              ? 'text-blue-600 border-b-2 border-blue-600' 
              : 'text-gray-500 hover:text-gray-700'
          ]"
        >
          Contact Quality
        </button>
        <button 
          @click="tab = 'eeg'"
          :class="[
            'px-4 py-2 text-sm font-medium transition-colors relative',
            tab === 'eeg' 
              ? 'text-blue-600 border-b-2 border-blue-600' 
              : 'text-gray-500 hover:text-gray-700'
          ]"
        >
          EEG Quality
        </button>
      </div>
      <div class="flex gap-8 min-h-[340px]">
        <!-- Center: Head SVG + sensors -->
        <div class="flex-1 flex flex-col items-center justify-center relative">
          <svg :width="240" :height="260" viewBox="0 0 240 260">
            <!-- 头部轮廓 -->
            <ellipse cx="120" cy="130" rx="90" ry="120" fill="#e0e7ff" />
            <!-- 耳朵 -->
            <ellipse cx="30" cy="130" rx="16" ry="32" fill="#c7d2fe" />
            <ellipse cx="210" cy="130" rx="16" ry="32" fill="#c7d2fe" />
            <!-- 鼻子 -->
            <ellipse cx="120" cy="185" rx="10" ry="18" fill="#b4bcf8" />
            <ellipse cx="120" cy="200" rx="5" ry="8" fill="#a5b4fc" />
            <!-- 连线 -->
            <g stroke="#a5b4fc" stroke-width="2">
              <line v-for="(pair, idx) in sensorLinks" :key="idx"
                :x1="sensorsMap[pair[0]].x" :y1="sensorsMap[pair[0]].y"
                :x2="sensorsMap[pair[1]].x" :y2="sensorsMap[pair[1]].y" />
            </g>
            <!-- 电极点 -->
            <g v-for="sensor in sensors" :key="sensor.id">
              <circle
                :cx="sensor.x"
                :cy="sensor.y"
                :r="8"
                :fill="getColor(sensor.contact)"
                :stroke="selectedSensor === sensor.id ? '#6366f1' : '#fff'"
                stroke-width="2"
                @click.stop="selectSensor(sensor.id)"
                style="cursor:pointer;transition:stroke 0.2s;"
              />
            </g>
          </svg>
          <!-- 信息卡片遮罩和卡片本体 -->
          <div v-if="selectedSensorObj">
            <div class="fixed inset-0 z-30" @click="clearSelected"></div>
            <div class="absolute left-1/2 -translate-x-1/2 z-40" :style="{top: `${selectedSensorObj.y+30}px`}" @click.stop>
              <div class="bg-white rounded-2xl shadow-2xl px-7 py-4 border border-gray-100 min-w-[240px] flex flex-col gap-3 relative animate-fadein">
                <div class="font-semibold text-gray-800 mb-1 text-lg flex items-center gap-2">
                  <span>{{ selectedSensorObj.label }}</span>
                  <span class="text-xs text-gray-400">传感器</span>
                </div>
                <div class="flex items-center gap-4 text-base">
                  <span class="text-gray-600">Contact Quality</span>
                  <span :style="getDotStyle(selectedSensorObj.contact)" class="sensor-dot"></span>
                  <span class="text-gray-600 ml-4">EEG Quality</span>
                  <span :style="getDotStyle(selectedSensorObj.eeg)" class="sensor-dot"></span>
                </div>
                <div class="flex items-center gap-2 text-xs text-gray-500 mt-1">
                  <span>接触状态：</span>
                  <span>{{ getSensorStatus(selectedSensorObj, 'contact') }}</span>
                  <span class="ml-2">信号状态：</span>
                  <span>{{ getSensorStatus(selectedSensorObj, 'eeg') }}</span>
                </div>
                <button class="absolute top-2 right-2 text-gray-400 hover:text-blue-500" @click="clearSelected">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>
          <!-- 0%红色，仅质量页显示 -->
          <div class="absolute left-1/2 top-[90%] -translate-x-1/2 text-3xl font-bold text-red-500 select-none pointer-events-none">
            0%
          </div>
        </div>
        <!-- Right info area -->
        <div class="w-72 flex flex-col gap-4">
          <div v-if="tab==='contact'">
            <div class="text-base font-semibold mb-2">How to ensure good Contact Quality?</div>
            <div class="text-sm text-gray-600 mb-4">Make sure each electrode is in good contact with the scalp. If all points are black, first adjust the reference electrodes to green, then adjust the others.</div>
            <div class="flex items-center gap-2 text-red-500"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636l-1.414 1.414A9 9 0 105.636 18.364l1.414-1.414"></path></svg>If contact is poor, please adjust the electrode position.</div>
          </div>
          <div v-else>
            <div class="text-base font-semibold mb-2">How to ensure good EEG Quality?</div>
            <div class="text-sm text-gray-600 mb-4">Pay attention to the signal quality of each electrode. Adjust the electrode position and scalp contact until all points turn green.</div>
            <div class="flex items-center gap-2 text-red-500"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636l-1.414 1.414A9 9 0 105.636 18.364l1.414-1.414"></path></svg>If the signal is poor, please keep still and adjust the electrodes.</div>
          </div>
        </div>
      </div>
      <div class="mt-8 flex flex-col items-center">
        <button
          class="w-40 bg-blue-500 text-white py-2 rounded disabled:bg-gray-300 disabled:text-gray-500 transition"
          @click="goNext"
        >
          Next
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';

const tab = ref('contact');
const router = useRouter();

// mock 电极点数据（contact/eeg值为0-4）
const sensors = [
  { id: 1, label: 'F3', x: 60, y: 60, contact: 4, eeg: 3 },
  { id: 2, label: 'F4', x: 180, y: 60, contact: 2, eeg: 2 },
  { id: 3, label: 'C3', x: 70, y: 130, contact: 1, eeg: 1 },
  { id: 4, label: 'C4', x: 170, y: 130, contact: 0, eeg: 0 },
  { id: 5, label: 'P3', x: 80, y: 200, contact: 3, eeg: 4 },
  { id: 6, label: 'P4', x: 160, y: 200, contact: 4, eeg: 4 },
  { id: 7, label: 'O1', x: 110, y: 230, contact: 2, eeg: 2 },
  { id: 8, label: 'O2', x: 130, y: 230, contact: 1, eeg: 1 },
  { id: 9, label: 'F7', x: 35, y: 110, contact: 0, eeg: 0 },
  { id: 10, label: 'F8', x: 205, y: 110, contact: 1, eeg: 1 },
  { id: 11, label: 'T7', x: 40, y: 170, contact: 2, eeg: 2 },
  { id: 12, label: 'T8', x: 200, y: 170, contact: 3, eeg: 3 },
];

// 节点连接关系
const sensorLinks = [
  ['F3', 'C3'], ['C3', 'P3'], ['P3', 'O1'],
  ['F4', 'C4'], ['C4', 'P4'], ['P4', 'O2'],
  ['F3', 'F4'], ['C3', 'C4'], ['P3', 'P4'], ['O1', 'O2'],
  ['F7', 'F3'], ['F8', 'F4'], ['T7', 'C3'], ['T8', 'C4'],
  ['T7', 'P3'], ['T8', 'P4'],
  ['F7', 'T7'], ['F8', 'T8'],
];
const sensorsMap = Object.fromEntries(sensors.map(s => [s.label, s]));

const hoveredSensor = ref(null); // 兼容后续扩展
const selectedSensor = ref(null);
const selectedSensorObj = computed(() => sensors.find(s => s.id === selectedSensor.value));

function getColor(val) {
  switch(val) {
    case 0: return '#222'; // 黑色
    case 1: return '#ef4444'; // 红色
    case 2: return '#facc15'; // 黄色
    case 3: return '#86efac'; // 浅绿
    case 4: return '#22c55e'; // 深绿
    default: return '#aaa';
  }
}
function getDotStyle(val) {
  return {
    background: getColor(val),
    boxShadow: '0 2px 8px 0 rgba(0,0,0,0.10)',
    width: '18px',
    height: '18px',
    borderRadius: '50%',
    display: 'inline-block',
    border: '2px solid #fff',
    outline: '1.5px solid #e5e7eb',
  };
}
function selectSensor(id) {
  selectedSensor.value = id;
}
function clearSelected(e) {
  // 只在点击空白处时清除
  if (e.target === e.currentTarget) selectedSensor.value = null;
}
function getSensorStatus(sensor, type) {
  if (type === 'contact') return sensor.contact === 4 ? '接触极佳' : sensor.contact === 3 ? '接触良好' : sensor.contact === 2 ? '一般' : sensor.contact === 1 ? '较差' : '未接触';
  if (type === 'eeg') return sensor.eeg === 4 ? '信号极佳' : sensor.eeg === 3 ? '信号良好' : sensor.eeg === 2 ? '一般' : sensor.eeg === 1 ? '较差' : '无信号';
  return '正常';
}

const goNext = () => {
  router.push('/profiles');
};
</script>

<style scoped>
.sensor-dot {
  box-shadow: 0 2px 8px 0 rgba(0,0,0,0.10);
  border-radius: 50%;
  border: 2px solid #fff;
  outline: 1.5px solid #e5e7eb;
  width: 18px;
  height: 18px;
  display: inline-block;
  vertical-align: middle;
}
.animate-fadein {
  animation: fadein 0.2s;
}
@keyframes fadein {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>