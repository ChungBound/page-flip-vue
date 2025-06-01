/**
 * NeuroFlip脑控WebSocket API
 * 处理与后端脑控系统的实时通信
 */

// WebSocket配置
const WS_CONFIG = {
  url: 'ws://localhost:8080/neuroflip',
  reconnectInterval: 3000,
  maxReconnectAttempts: 5,
};

/**
 * 创建NeuroFlip WebSocket连接
 * @param {Function} onMessage - 接收消息的回调函数
 * @param {Function} onStatusChange - 连接状态变化回调
 * @param {string} profileName - 当前训练用户名
 * @returns {Object} WebSocket连接对象和控制方法
 */
export function createNeuroFlipConnection(onMessage, onStatusChange, profileName = null) {
  let ws = null;
  let reconnectAttempts = 0;
  let reconnectTimer = null;
  let isManualClose = false;

  const connect = () => {
    try {
      onStatusChange?.('connecting');
      
      ws = new WebSocket(WS_CONFIG.url);
      
      ws.onopen = () => {
        console.log(`NeuroFlip WebSocket connected for profile: ${profileName}`);
        onStatusChange?.('connected');
        reconnectAttempts = 0;
        
        // 发送初始化消息，包含用户信息
        send({
          type: 'init',
          timestamp: Date.now(),
          clientType: 'neuroflip-web',
          profileName: profileName || 'Unknown User'
        });
      };
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('NeuroFlip message received:', data);
          onMessage?.(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
      
      ws.onclose = (event) => {
        console.log('NeuroFlip WebSocket closed:', event);
        
        if (!isManualClose && reconnectAttempts < WS_CONFIG.maxReconnectAttempts) {
          onStatusChange?.('disconnected');
          reconnectAttempts++;
          console.log(`Attempting to reconnect (${reconnectAttempts}/${WS_CONFIG.maxReconnectAttempts})...`);
          
          reconnectTimer = setTimeout(() => {
            connect();
          }, WS_CONFIG.reconnectInterval);
        } else {
          onStatusChange?.('disconnected');
        }
      };
      
      ws.onerror = (error) => {
        console.error('NeuroFlip WebSocket error:', error);
        onStatusChange?.('disconnected');
      };
      
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      onStatusChange?.('disconnected');
    }
  };

  const send = (data) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(data));
      return true;
    }
    return false;
  };

  const disconnect = () => {
    isManualClose = true;
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
    if (ws) {
      ws.close();
      ws = null;
    }
    onStatusChange?.('disconnected');
  };

  const getStatus = () => {
    if (!ws) return 'disconnected';
    
    switch (ws.readyState) {
      case WebSocket.CONNECTING:
        return 'connecting';
      case WebSocket.OPEN:
        return 'connected';
      case WebSocket.CLOSING:
      case WebSocket.CLOSED:
      default:
        return 'disconnected';
    }
  };

  return {
    connect,
    disconnect,
    send,
    getStatus,
  };
}

/**
 * 模拟脑控信号生成器（用于开发测试）
 * @param {Function} onAction - 动作回调函数
 * @param {Object} options - 配置选项
 * @returns {Object} 模拟器控制对象
 */
export function createMockBrainSignals(onAction, options = {}) {
  const {
    interval = 3000,
    actions = ['neutral', 'left', 'right', 'neutral', 'neutral'],
    signalQualities = ['Excellent', 'Good', 'Fair'],
    profileName = 'Unknown User',
  } = options;

  let timer = null;
  let actionIndex = 0;
  let isRunning = false;

  const start = () => {
    if (isRunning) return;
    
    isRunning = true;
    
    const generateSignal = () => {
      if (!isRunning) return;
      
      const action = actions[actionIndex % actions.length];
      const signalQuality = signalQualities[Math.floor(Math.random() * signalQualities.length)];
      const confidence = Math.random() * 0.3 + 0.7; // 0.7-1.0
      
      actionIndex++;
      
      const signalData = {
        type: 'brain_action',
        action,
        signalQuality,
        confidence,
        timestamp: Date.now(),
        profileName,
        rawSignal: generateMockEEGData(),
      };
      
      onAction(signalData);
      
      timer = setTimeout(generateSignal, interval);
    };
    
    // 首次信号延迟一点时间
    timer = setTimeout(generateSignal, 1000);
  };

  const stop = () => {
    isRunning = false;
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
  };

  const generateMockEEGData = () => {
    return Array.from({ length: 8 }, (_, i) => ({
      channel: `C${i + 1}`,
      amplitude: (Math.random() - 0.5) * 100,
      frequency: Math.random() * 30 + 8, // 8-38 Hz
    }));
  };

  return {
    start,
    stop,
    isRunning: () => isRunning,
  };
}

/**
 * 动作类型定义
 */
export const ACTION_TYPES = {
  NEUTRAL: 'neutral',
  LEFT: 'left',
  RIGHT: 'right',
};

/**
 * 信号质量等级
 */
export const SIGNAL_QUALITY = {
  EXCELLENT: 'Excellent',
  GOOD: 'Good',
  FAIR: 'Fair',
  POOR: 'Poor',
};

/**
 * 连接状态
 */
export const CONNECTION_STATUS = {
  DISCONNECTED: 'disconnected',
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
}; 