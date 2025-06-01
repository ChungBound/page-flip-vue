import { useDeviceStore } from '../stores/deviceStore';
import { wsManager } from '../utils/websocket';

// Mocked device API and battery WebSocket
export function connectDevice() {
  // Simulate device connection (success after 1s)
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true }); // Change to false to simulate failure
    }, 1000);
  });
}

export function connectBatteryWebSocket(callback, onError) {
  const deviceStore = useDeviceStore();
  const socketUrl = 'ws://127.0.0.1:8000/ws/client/battery';
  // let ws = new WebSocket(socketUrl);

  // 使用WebSocket管理类连接
  wsManager.connect(
    socketUrl,
    (messageData) => {
      if (messageData && typeof messageData.battery_level === 'number') {
        const batteryLevel = messageData.battery_level;
        callback(batteryLevel);
        deviceStore.setBatteryLevel(batteryLevel);
      } else {
        console.error('Received data does not contain a valid battery_level:', messageData);
      }
    },
    (error) => {
      console.error('Battery WebSocket error:', error);
      deviceStore.setConnected(false);
      if (onError) onError();
    }
  );

  return {
    close() {
      wsManager.close();
    },
    _rawWs: wsManager.ws
  };
}