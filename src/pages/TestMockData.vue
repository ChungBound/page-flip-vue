<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-6">Mock Data Test Page</h1>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- 连接状态 -->
      <div class="bg-white rounded-lg shadow p-4">
        <h2 class="text-lg font-semibold mb-4">Connection Status</h2>
        <div class="space-y-2">
          <div>Connection Status: {{ deviceStore.connectionStatus }}</div>
          <div>Is Connected: {{ deviceStore.isConnected }}</div>
          <div>Battery Level: {{ deviceStore.batteryLevel }}%</div>
          <div>Battery Overview: {{ deviceStore.batteryOverview }}</div>
        </div>
        <button
          @click="startMockConnection"
          class="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          :disabled="isConnecting"
        >
          {{ isConnecting ? "Connecting..." : "Start Mock Connection" }}
        </button>
        <button
          @click="stopMockConnection"
          class="mt-4 ml-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Stop Connection
        </button>
      </div>

      <!-- 原始数据 -->
      <div class="bg-white rounded-lg shadow p-4">
        <h2 class="text-lg font-semibold mb-4">Raw Data</h2>
        <pre class="text-xs bg-gray-100 p-3 rounded overflow-auto max-h-96">{{
          deviceStore.deviceData
        }}</pre>
      </div>

      <!-- Contact Quality -->
      <div class="bg-white rounded-lg shadow p-4">
        <h2 class="text-lg font-semibold mb-4">Contact Quality</h2>
        <div class="grid grid-cols-2 gap-2 text-sm">
          <div
            v-for="sensor in deviceStore.sensorsWithData"
            :key="'contact-' + sensor.id"
          >
            <span>{{ sensor.label }}:</span>
            <span :class="getQualityColor(sensor.contact)">{{
              sensor.contact
            }}</span>
          </div>
        </div>
      </div>

      <!-- EEG Quality -->
      <div class="bg-white rounded-lg shadow p-4">
        <h2 class="text-lg font-semibold mb-4">EEG Quality</h2>
        <div class="grid grid-cols-2 gap-2 text-sm">
          <div
            v-for="sensor in deviceStore.sensorsWithData"
            :key="'eeg-' + sensor.id"
          >
            <span>{{ sensor.label }}:</span>
            <span :class="getQualityColor(sensor.eeg)">{{ sensor.eeg }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useDeviceStore } from "@/stores/deviceStore";
import { connectHeadset } from "@/api/auth";
import { wsManager } from "@/utils/websocket";

const deviceStore = useDeviceStore();
const isConnecting = ref(false);

const startMockConnection = async () => {
  isConnecting.value = true;

  try {
    // 使用模拟模式连接
    const res = await connectHeadset(true);
    console.log("Mock connection result:", res);

    if (res.status === 1) {
      // 开始模拟WebSocket连接
      wsManager.connect(
        "/ws/mock/all-device-data",
        (data) => {
          deviceStore.updateDeviceData(data);
          console.log("Mock data received:", data);
        },
        (error) => {
          console.error("Mock WebSocket error:", error);
        },
        () => {
          console.log("Mock WebSocket connected");
          isConnecting.value = false;
        }
      );
    }
  } catch (error) {
    console.error("Mock connection failed:", error);
    isConnecting.value = false;
  }
};

const stopMockConnection = () => {
  wsManager.close();
  deviceStore.clearDeviceData();
  isConnecting.value = false;
};

const getQualityColor = (quality) => {
  switch (quality) {
    case 4:
      return "text-green-600 font-semibold";
    case 3:
      return "text-yellow-600 font-semibold";
    case 2:
      return "text-orange-600 font-semibold";
    case 1:
      return "text-red-600 font-semibold";
    case 0:
      return "text-gray-600 font-semibold";
    default:
      return "text-gray-400";
  }
};
</script>
