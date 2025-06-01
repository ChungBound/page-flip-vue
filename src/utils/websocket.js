import { mockDataGenerator } from './mockData.js';

class WebSocketManager {
  constructor() {
    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectInterval = 3000; // 3秒
    this.isMockMode = false;
    this.mockCallback = null;
  }

  connect(url, onMessage, onError, onConnect) {
    // 检查是否为模拟模式
    if (url.includes('mock') || url.includes('MOCK')) {
      this.startMockMode(onMessage, onError, onConnect);
      return;
    }

    try {
      this.ws = new WebSocket(url);

      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.reconnectAttempts = 0;
        onConnect?.();
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          onMessage?.(data);
        } catch (e) {
          console.error('WebSocket message parse error:', e);
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        onError?.(error);
      };

      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
        this.reconnect(url, onMessage, onError, onConnect);
      };
    } catch (error) {
      console.error('WebSocket connection error:', error);
      onError?.(error);
    }
  }

  startMockMode(onMessage, onError, onConnect) {
    console.log('Starting mock WebSocket mode');
    this.isMockMode = true;
    
    // 模拟连接成功
    setTimeout(() => {
      onConnect?.();
    }, 500);

    // 开始生成模拟数据
    this.mockCallback = onMessage;
    mockDataGenerator.start(onMessage, 2000); // 每2秒更新一次
  }

  reconnect(url, onMessage, onError, onConnect) {
    if (this.isMockMode) return; // 模拟模式不需要重连
    
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      setTimeout(() => {
        this.connect(url, onMessage, onError, onConnect);
      }, this.reconnectInterval);
    } else {
      console.error('Max reconnection attempts reached');
      onError?.(new Error('Max reconnection attempts reached'));
    }
  }

  send(data) {
    if (this.isMockMode) {
      console.log('Mock mode: Cannot send data');
      return;
    }
    
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(typeof data === 'string' ? data : JSON.stringify(data));
    } else {
      console.error('WebSocket is not connected');
    }
  }

  close() {
    if (this.isMockMode) {
      console.log('Stopping mock mode');
      this.isMockMode = false;
      mockDataGenerator.stop();
      if (this.mockCallback) {
        mockDataGenerator.removeCallback(this.mockCallback);
        this.mockCallback = null;
      }
      return;
    }
    
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

export const wsManager = new WebSocketManager(); 