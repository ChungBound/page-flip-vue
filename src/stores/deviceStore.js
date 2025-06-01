import { defineStore } from 'pinia';

export const useDeviceStore = defineStore('device', {
  state: () => ({
    connectionStatus: -1, // -1: 断开, 0: 连接中, 1: 已连接
    batteryLevel: null,
    batteryOverview: null, // 0-4 电池状态等级，用于颜色显示
    // 新增：设备实时数据
    deviceData: null, // 原始WebSocket数据
    sensorData: {
      contact_quality: {},
      EEG_quality: {}
    },
    // 传感器基础配置
    sensors: [
      { id: 1, label: "AF3", x: 80, y: 95 },
      { id: 2, label: "AF4", x: 200, y: 95 },
      { id: 3, label: "F7", x: 60, y: 110 },
      { id: 4, label: "F3", x: 100, y: 150 },
      { id: 5, label: "F4", x: 180, y: 150 },
      { id: 6, label: "F8", x: 220, y: 110 },
      { id: 7, label: "FC5", x: 80, y: 150 },
      { id: 8, label: "FC6", x: 200, y: 150 },
      { id: 9, label: "T7", x: 40, y: 180 },
      { id: 10, label: "T8", x: 240, y: 180 },
      { id: 11, label: "P7", x: 70, y: 220 },
      { id: 12, label: "P8", x: 210, y: 220 },
      { id: 13, label: "O1", x: 90, y: 270 },
      { id: 14, label: "O2", x: 190, y: 270 },
    ]
  }),

  getters: {
    isConnected: (state) => state.connectionStatus > 0,
    
    // 获取包含实时数据的传感器
    sensorsWithData: (state) => {
      const result = state.sensors.map(sensor => ({
        ...sensor,
        contact: state.sensorData.contact_quality[sensor.label] ?? -1,
        eeg: state.sensorData.EEG_quality[sensor.label] ?? -1
      }));
      
      // 调试日志
      if (Object.keys(state.sensorData.contact_quality).length > 0 || Object.keys(state.sensorData.EEG_quality).length > 0) {
        // console.log('Sensor data mapping:', {
        //   contact_quality: state.sensorData.contact_quality,
        //   EEG_quality: state.sensorData.EEG_quality,
        //   mapped_sensors: result.slice(0, 3) // 只显示前3个传感器避免日志过长
        // });
      }
      
      return result;
    },
    
    // 计算整体信号质量百分比
    overallContactQuality: (state) => {
      const qualities = Object.values(state.sensorData.contact_quality);
      if (qualities.length === 0) return 0;
      const average = qualities.reduce((sum, q) => sum + (q >= 0 ? q : 0), 0) / qualities.length;
      return Math.round((average / 4) * 100);
    },
    
    overallEEGQuality: (state) => {
      const qualities = Object.values(state.sensorData.EEG_quality);
      if (qualities.length === 0) return 0;
      const average = qualities.reduce((sum, q) => sum + (q >= 0 ? q : 0), 0) / qualities.length;
      return Math.round((average / 4) * 100);
    },
    
    // EEG质量状态描述
    eegQualityStatus: (state) => {
      // 优先使用WebSocket数据中的overall字段
      if (state.sensorData.EEG_quality.overall !== undefined) {
        const overallValue = state.sensorData.EEG_quality.overall;
        switch (overallValue) {
          case 4: return 'Excellent';
          case 3: return 'Good';
          case 2: return 'Fair';
          case 1: return 'Poor';
          case 0: return 'No Signal';
          default: return 'Unknown';
        }
      }
      
      // 回退到计算平均值（排除overall和其他非传感器字段）
      const sensorKeys = ['AF3', 'F7', 'F3', 'FC5', 'T7', 'P7', 'O1', 'O2', 'P8', 'T8', 'FC6', 'F4', 'F8', 'AF4'];
      const sensorQualities = sensorKeys
        .map(key => state.sensorData.EEG_quality[key])
        .filter(q => q !== undefined && q >= 0);
      
      if (sensorQualities.length === 0) return 'N/A';
      
      const avg = sensorQualities.reduce((sum, q) => sum + q, 0) / sensorQualities.length;
      if (avg >= 3.5) return 'Excellent';
      if (avg >= 2.5) return 'Good';
      if (avg >= 1.5) return 'Fair';
      if (avg >= 0.5) return 'Poor';
      return 'No Signal';
    }
  },

  actions: {
    setConnectionStatus(status) {
      this.connectionStatus = status
    },

    setBatteryLevel(level) {
      this.batteryLevel = level
    },
    
    // 更新设备数据
    updateDeviceData(data) {
      this.deviceData = data;
      
      // 更新连接状态
      if (typeof data.connection_signal === 'number') {
        this.connectionStatus = data.connection_signal;
      }
      
      // 更新电池电量
      if (typeof data.battery_level === 'number' && data.battery_level >= 0) {
        this.batteryLevel = data.battery_level;
      }
      
      // 更新电池概览
      if (typeof data.battery_overview === 'number' && data.battery_overview >= 0 && data.battery_overview <= 4) {
        this.batteryOverview = data.battery_overview;
      }
      
      // 更新传感器数据
      if (data.contact_quality) {
        this.sensorData.contact_quality = { ...data.contact_quality };
      }
      
      if (data.EEG_quality) {
        this.sensorData.EEG_quality = { ...data.EEG_quality };
        // 调试：记录EEG overall值
        // console.log('EEG_quality updated:', {
        //   overall: data.EEG_quality.overall,
        //   batteryPercent: data.EEG_quality.batteryPercent,
        //   sampleRateQuality: data.EEG_quality.sampleRateQuality
        // });
      }
    },
    
    // 清除设备数据
    clearDeviceData() {
      this.deviceData = null;
      this.sensorData = {
        contact_quality: {},
        EEG_quality: {}
      };
      this.batteryLevel = null;
      this.batteryOverview = null;
      this.connectionStatus = -1;
    }
  }
}); 