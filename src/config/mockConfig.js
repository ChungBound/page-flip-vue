import { reactive } from 'vue';

// Mock Mode Configuration
// This is the central configuration file to control mock mode

export const mockConfig = reactive({
  // 🎛️ Main switch: Controls whether to use Mock mode
  // true: Force use Mock mode (regardless of environment)
  // false: Force use real APIs
  // 'auto': Use Mock only in development environment (default behavior)
  enabled: 'true', // Options: true | false | 'auto'

  // 🔧 Detailed control options
  options: {
    // API Mock control
    mockAPI: true,          // Whether to mock API calls
    mockWebSocket: true,    // Whether to mock WebSocket connection

    // Mock data configuration
    mockDataInterval: 2000, // Mock data update interval (milliseconds)
    mockBatteryLevel: 75,   // Initial battery level
    mockBatteryOverview: 3, // Initial battery status (0-4)

    // Debug options
    enableLogs: true,       // Whether to enable Mock-related logs
    showMockIndicator: true // Whether to show Mock mode indicator in UI
  }
});

// 🎯 Get whether Mock mode should be used
export function shouldUseMock() {
  // const isDev = import.meta.env.MODE === 'development';
  const isDev = true;

  switch (mockConfig.enabled) {
    case true:
      return true; // Force enable
    case false:
      return false; // Force disable
    case 'auto':
    default:
      return isDev; // Enable only in development environment
  }
}

// 📝 Get Mock status description
export function getMockStatus() {
  const isUsing = shouldUseMock();
  const mode = mockConfig.enabled;

  return {
    isUsing,
    mode,
    description: isUsing
        ? `Mock mode enabled (${mode === true ? 'Forced' : mode === 'auto' ? 'Auto' : 'Manual'})`
        : 'Real device mode'
  };
}

// 🔄 Toggle Mock mode at runtime
export function toggleMockMode(forceMode = null) {
  if (forceMode !== null) {
    mockConfig.enabled = forceMode;
  } else {
    // Cycle through: auto -> true -> false -> auto
    switch (mockConfig.enabled) {
      case 'auto':
        mockConfig.enabled = true;
        break;
      case true:
        mockConfig.enabled = false;
        break;
      case false:
        mockConfig.enabled = 'auto';
        break;
      default:
        mockConfig.enabled = 'auto';
    }
  }

  console.log('🎛️ Mock mode changed:', getMockStatus());
  return getMockStatus();
} 