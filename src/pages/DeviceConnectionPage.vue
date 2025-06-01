<template>
  <PageLayout>
    <!-- Initial state - Display connect button -->
    <template v-if="!hasAttemptedConnection">
      <StatusCard
        type="info"
        message="Ready to connect EEG device"
        button-text="Connect Device"
        @button-click="startConnection"
      />
    </template>

    <!-- Connecting state -->
    <template v-else-if="connecting">
      <div class="flex items-center justify-center text-xl text-blue-600">
        Connecting to device...
      </div>
    </template>

    <!-- Connection failed state -->
    <template v-else-if="error && !isDeviceConnected">
      <StatusCard
        type="error"
        :message="error"
        button-text="Retry"
        @button-click="startConnection"
      />
    </template>

    <!-- Connection successful - Display signal adjustment interface -->
    <template v-else-if="isDeviceConnected">
      <!-- Title -->
      <div class="flex flex-col items-center justify-center w-full">
        <h2 class="text-xl font-semibold text-gray-800 mb-2">
          Signal Adjustment
        </h2>
        <hr class="border w-[90%] mb-4 border-solid border-[#808080]" />
        <div
          class="flex flex-col items-center justify-center main-card bg-white/95 backdrop-blur-md rounded-3xl shadow-[0_0_20px_rgba(0,0,0,0.3)] w-full max-w-[1920px] mx-auto p-4"
        >
          <!-- Tab switching -->
          <div class="flex mb-4 bg-gray-100 rounded-lg p-1">
            <button
              class="px-4 py-2 rounded-md transition-all"
              :class="
                activeTab === 'contact'
                  ? 'bg-white text-gray-800 shadow-sm'
                  : 'text-gray-600'
              "
              @click="activeTab = 'contact'"
            >
              Contact Quality
            </button>
            <button
              class="px-4 py-2 rounded-md transition-all"
              :class="
                activeTab === 'eeg'
                  ? 'bg-white text-gray-800 shadow-sm'
                  : 'text-gray-600'
              "
              @click="activeTab = 'eeg'"
            >
              EEG Quality
            </button>
          </div>

          <!-- Content area -->
          <div class="flex-1 flex items-center justify-between w-full">
            <!-- Left side - EEG sensor map -->
            <div class="flex-1 flex items-center justify-center">
              <EEGSensorMap
                :sensors="displaySensors"
                :sensorLinks="sensorLinks"
                :activeTab="activeTab"
                :useImageBackground="true"
                headImagePath="/images/head.svg"
              />
            </div>

            <!-- Right side - Instructions (consistent with SignalStatusModal) -->
            <div class="flex-1 pl-6">
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
              <div v-else>
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
          </div>

          <!-- Bottom buttons -->
          <div class="mt-4 flex justify-end w-full gap-3">
            <button
              class="px-6 py-2 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 transition"
              @click="refreshSignal"
            >
              Refresh
            </button>
            <button
              class="px-8 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition"
              @click="goNext"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </template>
  </PageLayout>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, computed } from "vue";
import { useRouter } from "vue-router";
import { connectHeadset } from "../api/auth";
import { useDeviceStore } from "../stores/deviceStore";
import { wsManager } from "../utils/websocket";
import { shouldUseMock } from "@/config/mockConfig";
import PageLayout from "@/components/PageLayout.vue";
import StatusCard from "@/components/StatusCard.vue";
import EEGSensorMap from "@/components/EEGSensorMap.vue";

const router = useRouter();
const deviceStore = useDeviceStore();

const connecting = ref(false);
const error = ref("");
const hasAttemptedConnection = ref(false);
const activeTab = ref("contact"); // 'contact' | 'eeg'
const stableConnectionStatus = ref(-1); // Stable connection status
let connectionStatusTimeout = null; // Debounce timer

// Sensor link configuration
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

// Use global store sensor data
const displaySensors = computed(() => deviceStore.sensorsWithData);

// Use stable connection status to avoid flickering
const isDeviceConnected = computed(() => {
  return stableConnectionStatus.value === 1;
});

// Debounce update connection status
const updateConnectionStatus = (newStatus) => {
  // Clear previous timer
  if (connectionStatusTimeout) {
    clearTimeout(connectionStatusTimeout);
  }

  // If status actually changes, use debounce
  if (newStatus !== stableConnectionStatus.value) {
    // If connection successful, update immediately (avoid delay)
    if (newStatus === 1) {
      stableConnectionStatus.value = newStatus;
      connecting.value = false;
    } else {
      // If disconnected, update with delay (avoid brief disconnection flicker)
      connectionStatusTimeout = setTimeout(() => {
        stableConnectionStatus.value = newStatus;
        if (newStatus === -1) {
          if (hasAttemptedConnection.value) {
            error.value =
              "Device disconnected. Please check your device and try again.";
            connecting.value = false;
          }
        }
      }, 2000); // 2 seconds debounce delay
    }
  }
};

const startConnection = async () => {
  hasAttemptedConnection.value = true;
  connecting.value = true;
  error.value = "";

  try {
    // Use configuration system to determine if using mock mode
    const res = await connectHeadset();

    if (res.status === 1) {
      // Connection request successful, start listening to WebSocket
      startDeviceDataStream();
    } else {
      // Connection failed, display specific error message
      error.value = res.message || "Connection failed. Please try again.";
      connecting.value = false;
    }
  } catch (e) {
    error.value =
      e.message || "Network error. Please check your connection and try again.";
    connecting.value = false;
  }
};

const startDeviceDataStream = () => {
  // Use configuration system to determine WebSocket URL
  const useMock = shouldUseMock();
  const wsUrl = useMock
    ? "/ws/mock/all-device-data"
    : "/ws/client/all-device-data";

  console.log(`🌐 Starting WebSocket connection: ${wsUrl} (Mock: ${useMock})`);

  wsManager.connect(
    wsUrl,
    (data) => {
      // Use store to update device data
      deviceStore.updateDeviceData(data);
      // console.log("Device data received:", data);

      // Use debounce to update connection status
      const connectionSignal = data.connection_signal;
      if (typeof connectionSignal === "number") {
        updateConnectionStatus(connectionSignal);
      }
    },
    (wsError) => {
      console.error("WebSocket error:", wsError);
      // Only show error if not already connected successfully
      if (stableConnectionStatus.value !== 1) {
        error.value =
          "Failed to establish real-time connection. Please try again.";
        connecting.value = false;
      }
    }
  );
};

const refreshSignal = () => {
  // Refresh signal data (re-establish WebSocket connection)
  if (isDeviceConnected.value) {
    wsManager.close();
    setTimeout(() => {
      startDeviceDataStream();
    }, 500); // Short delay before reconnect
  }
};

const goNext = () => {
  router.push("/profiles");
};

onMounted(() => {
  // If device is already connected, directly display details interface and start data stream
  if (deviceStore.isConnected || deviceStore.connectionStatus === 1) {
    hasAttemptedConnection.value = true;
    stableConnectionStatus.value = 1;
    startDeviceDataStream();
  }
});

onUnmounted(() => {
  // Clean up WebSocket connection and timer
  wsManager.close();
  if (connectionStatusTimeout) {
    clearTimeout(connectionStatusTimeout);
    connectionStatusTimeout = null;
  }

  // If user leaves device connection page, clean up device data
  // deviceStore.clearDeviceData();
});

// Listen for device connection status change (removed, because now using internal status management)
// watch(() => deviceStore.connectionStatus, (newStatus) => {
//   if (newStatus === -1 && hasAttemptedConnection.value) {
//     error.value = "Device connection lost. Please reconnect.";
//   }
// });
</script>
