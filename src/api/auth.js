import request from '@/utils/request';
import { shouldUseMock } from '@/config/mockConfig';

// Mocked auth API
export function hasAccessRight() {
  const useMock = shouldUseMock();
  
  if (useMock) {
    console.log('🎭 Using Mock API for hasAccessRight');
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ accessGranted: false }); // Change to true to simulate already authorized
      }, 500);
    });
  }
  
  // Real API call (if implemented)
  console.log('🔌 Using real API for hasAccessRight');
  return request.get('/auth/check-access');
}

export function requestAccess(callback) {
  const useMock = shouldUseMock();
  
  if (useMock) {
    console.log('🎭 Using Mock API for requestAccess');
    // Simulate polling for authorization
    let granted = false;
    const interval = setInterval(() => {
      if (!granted) {
        // Simulate user authorizing after 2 seconds
        granted = true;
        clearInterval(interval);
        callback({ accessGranted: true });
      }
    }, 500);
    return;
  }
  
  // Real API polling (if implemented)
  console.log('🔌 Using real API for requestAccess');
  // Implementation for real API polling
}

export function trueRequestAccess() {
  const useMock = shouldUseMock();
  
  if (useMock) {
    console.log('🎭 Using Mock API for trueRequestAccess');
    return Promise.resolve({
      status: 1,
      message: 'Mock authorization request successful',
      data: {
        access_token: 'MOCK_TOKEN_' + Date.now(),
        expires_in: 3600
      }
    });
  }
  
  console.log('🔌 Using real API for trueRequestAccess');
  return request.post('/authorisation-page/request-access');
}

// 连接设备接口
export function connectHeadset(forceMock = null) {
  // 使用新的配置系统判断是否使用Mock
  const useMock = forceMock !== null ? forceMock : shouldUseMock();
  
  if (useMock) {
    console.log('🎭 Using Mock API for device connection');
    // 模拟模式：返回成功响应
    return Promise.resolve({
      status: 1,
      message: 'Mock device connected successfully',
      data: {
        device_id: 'MOCK_DEVICE_001',
        connection_time: new Date().toISOString()
      }
    });
  }
  
  console.log('🔌 Using real API for device connection');
  // 真实API调用
  return request({
    url: '/headset-connection-page/connect-headset-button',
    method: 'POST'
  });
}