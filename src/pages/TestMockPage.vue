<template>
  <PageLayout>
    <div class="flex flex-col h-full">
      <!-- Header -->
      <div class="flex-shrink-0 mb-6">
        <h1 class="text-2xl font-bold text-gray-800">Mock System Test Page</h1>

        <!-- Mock Status -->
        <div class="bg-white rounded-lg shadow p-4 mt-4">
          <h2 class="text-lg font-semibold mb-3">Current Mock Status</h2>
          <div class="flex items-center gap-6">
            <div>
              <span class="font-medium">Mode:</span>
              <span
                :class="
                  mockStatus.isUsing ? 'text-orange-600' : 'text-green-600'
                "
              >
                {{ mockStatus.description }}
              </span>
            </div>
            <div>
              <span class="font-medium">Configuration:</span>
              <code class="bg-gray-100 px-2 py-1 rounded">{{
                mockConfig.enabled
              }}</code>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="flex-1 flex gap-6 min-h-0">
        <!-- Left Panel - Test Controls -->
        <div class="w-1/3 flex-shrink-0">
          <div class="bg-white rounded-lg shadow p-6 h-full">
            <h2 class="text-lg font-semibold mb-4">API Test Controls</h2>

            <!-- Device Store Status -->
            <div class="mb-6 p-4 border rounded-lg bg-gray-50">
              <h3 class="font-medium mb-3 text-gray-700">
                Device Store Status
              </h3>
              <div class="space-y-2 text-sm">
                <div class="flex justify-between">
                  <span>Connected:</span>
                  <span
                    :class="
                      deviceStore.isConnected
                        ? 'text-green-600'
                        : 'text-red-600'
                    "
                  >
                    {{ deviceStore.isConnected }}
                  </span>
                </div>
                <div class="flex justify-between">
                  <span>Battery:</span>
                  <span>{{ deviceStore.batteryLevel || "N/A" }}%</span>
                </div>
                <div class="flex justify-between">
                  <span>Battery Overview:</span>
                  <span>{{ deviceStore.batteryOverview ?? "N/A" }}</span>
                </div>
                <div class="flex justify-between">
                  <span>EEG Status:</span>
                  <span>{{ deviceStore.eegQualityStatus || "N/A" }}</span>
                </div>
              </div>
            </div>

            <!-- Authorization APIs -->
            <div class="mb-6">
              <h3 class="font-medium mb-3 text-blue-700">Authorization APIs</h3>
              <div class="space-y-2">
                <button @click="testHasAccessRight" class="w-full btn-test">
                  Test hasAccessRight()
                </button>
                <button @click="testTrueRequestAccess" class="w-full btn-test">
                  Test trueRequestAccess()
                </button>
                <button @click="testConnectHeadset" class="w-full btn-test">
                  Test connectHeadset()
                </button>
              </div>
            </div>

            <!-- User APIs -->
            <div class="mb-6">
              <h3 class="font-medium mb-3 text-green-700">User APIs</h3>
              <div class="space-y-2">
                <button @click="testGetUserInfo" class="w-full btn-test">
                  Test getUserInfo()
                </button>
                <button @click="testGetUserProfiles" class="w-full btn-test">
                  Test getUserProfiles()
                </button>
                <button @click="testCreateProfile" class="w-full btn-test">
                  Test createProfile()
                </button>
              </div>
            </div>

            <!-- WebSocket Test -->
            <div class="mb-6">
              <h3 class="font-medium mb-3 text-purple-700">WebSocket Test</h3>
              <div class="space-y-2">
                <button @click="testWebSocket" class="w-full btn-test">
                  Connect WebSocket
                </button>
                <button
                  @click="disconnectWebSocket"
                  class="w-full btn-secondary"
                >
                  Disconnect WebSocket
                </button>
                <div class="text-sm text-gray-600 mt-2">
                  <span class="font-medium">Status:</span>
                  <span :class="getWsStatusColor()">{{ wsStatus }}</span>
                </div>
              </div>
            </div>

            <!-- Clear Results Button -->
            <div class="pt-4 border-t">
              <button @click="clearResults" class="w-full btn-danger">
                Clear All Results
              </button>
            </div>
          </div>
        </div>

        <!-- Right Panel - Test Results -->
        <div class="flex-1 min-w-0">
          <!-- Fixed height container for proper scrolling -->
          <div
            class="bg-white rounded-lg shadow"
            style="height: calc(100vh - 200px)"
          >
            <div class="h-full flex flex-col">
              <!-- Header - Fixed at top -->
              <div class="flex-shrink-0 p-4 border-b bg-white rounded-t-lg">
                <div class="flex items-center justify-between">
                  <h2 class="text-lg font-semibold">Test Results</h2>
                  <div class="text-sm text-gray-500">
                    Total: {{ testResults.length }} results
                  </div>
                </div>
              </div>

              <!-- Scrollable content container -->
              <div class="flex-1 overflow-hidden">
                <div class="h-full overflow-y-auto p-4">
                  <div
                    v-if="testResults.length === 0"
                    class="text-center text-gray-500 py-8"
                  >
                    <div class="text-lg">No test results yet</div>
                    <div class="text-sm mt-2">
                      Click any test button on the left to start testing
                    </div>
                  </div>

                  <div v-else class="space-y-3 pb-4">
                    <div
                      v-for="result in testResults"
                      :key="result.id"
                      class="border rounded-lg p-4 transition-all hover:shadow-md"
                      :class="
                        result.success
                          ? 'border-green-200 bg-green-50'
                          : 'border-red-200 bg-red-50'
                      "
                    >
                      <!-- Result Header -->
                      <div class="flex items-center justify-between mb-2">
                        <div class="flex items-center gap-2">
                          <div
                            class="w-3 h-3 rounded-full flex-shrink-0"
                            :class="
                              result.success ? 'bg-green-500' : 'bg-red-500'
                            "
                          ></div>
                          <span class="font-medium text-gray-800">{{
                            result.name
                          }}</span>
                        </div>
                        <span class="text-xs text-gray-500">{{
                          result.timestamp
                        }}</span>
                      </div>

                      <!-- Result Message -->
                      <div class="text-sm text-gray-600 mb-3">
                        {{ result.message }}
                      </div>

                      <!-- Result Data -->
                      <div v-if="result.data" class="mt-3">
                        <details class="group">
                          <summary
                            class="cursor-pointer text-xs text-blue-600 hover:text-blue-800 font-medium"
                          >
                            📄 Show Response Data
                          </summary>
                          <div
                            class="mt-2 text-xs bg-gray-100 p-3 rounded border overflow-auto max-h-60"
                          >
                            <pre class="whitespace-pre-wrap text-gray-700">{{
                              JSON.stringify(result.data, null, 2)
                            }}</pre>
                          </div>
                        </details>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </PageLayout>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { mockConfig, getMockStatus, shouldUseMock } from "@/config/mockConfig";
import { hasAccessRight, trueRequestAccess, connectHeadset } from "@/api/auth";
import { getUserInfo, getUserProfiles, createProfile } from "@/api/user";
import { useDeviceStore } from "@/stores/deviceStore";
import { wsManager } from "@/utils/websocket";
import PageLayout from "@/components/PageLayout.vue";

const deviceStore = useDeviceStore();
const testResults = ref([]);
const wsStatus = ref("Disconnected");

const mockStatus = computed(() => getMockStatus());

const addTestResult = (name, success, message, data = null) => {
  testResults.value.unshift({
    id: Date.now(),
    name,
    success,
    message,
    data,
    timestamp: new Date().toLocaleTimeString(),
  });

  // Keep only last 20 results for better performance
  if (testResults.value.length > 20) {
    testResults.value = testResults.value.slice(0, 20);
  }
};

const clearResults = () => {
  testResults.value = [];
  addTestResult("Clear Results", true, "All test results cleared");
};

const getWsStatusColor = () => {
  switch (wsStatus.value) {
    case "Connected":
    case "Connected & Receiving Data":
      return "text-green-600";
    case "Connecting...":
      return "text-yellow-600";
    case "Error":
      return "text-red-600";
    default:
      return "text-gray-600";
  }
};

// Test Functions
const testHasAccessRight = async () => {
  addTestResult("hasAccessRight", null, "Testing...", null);
  try {
    const result = await hasAccessRight();
    addTestResult("hasAccessRight", true, "API call successful", result);
  } catch (error) {
    addTestResult("hasAccessRight", false, error.message);
  }
};

const testTrueRequestAccess = async () => {
  addTestResult("trueRequestAccess", null, "Testing...", null);
  try {
    const result = await trueRequestAccess();
    addTestResult("trueRequestAccess", true, "API call successful", result);
  } catch (error) {
    addTestResult("trueRequestAccess", false, error.message);
  }
};

const testConnectHeadset = async () => {
  addTestResult("connectHeadset", null, "Testing...", null);
  try {
    const result = await connectHeadset();
    addTestResult("connectHeadset", true, "API call successful", result);
  } catch (error) {
    addTestResult("connectHeadset", false, error.message);
  }
};

const testGetUserInfo = async () => {
  addTestResult("getUserInfo", null, "Testing...", null);
  try {
    const result = await getUserInfo();
    addTestResult("getUserInfo", true, "API call successful", result);
  } catch (error) {
    addTestResult("getUserInfo", false, error.message);
  }
};

const testGetUserProfiles = async () => {
  addTestResult("getUserProfiles", null, "Testing...", null);
  try {
    const result = await getUserProfiles();
    addTestResult("getUserProfiles", true, "API call successful", result);
  } catch (error) {
    addTestResult("getUserProfiles", false, error.message);
  }
};

const testCreateProfile = async () => {
  addTestResult("createProfile", null, "Testing...", null);
  try {
    const result = await createProfile({
      name: "Test Profile",
      description: "Created from test page",
    });
    addTestResult("createProfile", true, "API call successful", result);
  } catch (error) {
    addTestResult("createProfile", false, error.message);
  }
};

const testWebSocket = () => {
  const useMock = shouldUseMock();
  const wsUrl = useMock
    ? "/ws/mock/all-device-data"
    : "/ws/client/all-device-data";

  wsStatus.value = "Connecting...";
  addTestResult("WebSocket Connect", null, "Connecting to WebSocket...", {
    url: wsUrl,
  });

  wsManager.connect(
    wsUrl,
    (data) => {
      wsStatus.value = "Connected & Receiving Data";
      deviceStore.updateDeviceData(data);
      addTestResult("WebSocket Data", true, "Received data successfully", {
        battery_level: data.battery_level,
        connection_signal: data.connection_signal,
        data_keys: Object.keys(data),
      });
    },
    (error) => {
      wsStatus.value = "Error";
      addTestResult(
        "WebSocket Error",
        false,
        error.message || "WebSocket connection failed"
      );
    },
    () => {
      wsStatus.value = "Connected";
      addTestResult(
        "WebSocket Connect",
        true,
        "WebSocket connected successfully"
      );
    }
  );
};

const disconnectWebSocket = () => {
  wsManager.close();
  wsStatus.value = "Disconnected";
  addTestResult("WebSocket Disconnect", true, "WebSocket disconnected");
};

onMounted(() => {
  addTestResult(
    "Page Load",
    true,
    `Mock system initialized. Mode: ${mockStatus.value.description}`
  );
});

onUnmounted(() => {
  disconnectWebSocket();
});
</script>

<style scoped>
.btn-test {
  @apply px-3 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition text-sm font-medium;
}

.btn-secondary {
  @apply px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition text-sm font-medium;
}

.btn-danger {
  @apply px-3 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition text-sm font-medium;
}

/* Enhanced scrollbar styling for better visibility */
.overflow-y-auto {
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 #f1f5f9;
}

.overflow-y-auto::-webkit-scrollbar {
  width: 8px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 4px;
  margin: 4px 0;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
  border: 1px solid #f1f5f9;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

.overflow-y-auto::-webkit-scrollbar-thumb:active {
  background: #64748b;
}

/* Smooth transitions for result cards */
.transition-all {
  transition: all 0.2s ease-in-out;
}

/* Details element styling */
details summary {
  list-style: none;
}

details summary::-webkit-details-marker {
  display: none;
}

details[open] summary {
  color: #1d4ed8;
}

/* Ensure proper height calculation */
.h-full {
  height: 100%;
}

/* Add some visual feedback for scroll area */
.overflow-y-auto:hover::-webkit-scrollbar-thumb {
  background: #94a3b8;
}
</style>
