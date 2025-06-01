// 模拟设备数据生成器
export class MockDataGenerator {
  constructor() {
    this.sensors = ['AF3', 'F7', 'F3', 'FC5', 'T7', 'P7', 'O1', 'O2', 'P8', 'T8', 'FC6', 'F4', 'F8', 'AF4'];
    this.batteryLevel = 55;
    this.batteryOverview = 3;
    this.isRunning = false;
    this.callbacks = [];
  }

  // 生成随机的传感器质量值 (0-4)
  generateSensorQuality() {
    const quality = {};
    this.sensors.forEach(sensor => {
      // 生成0-4之间的随机值，偶尔会有不同的值
      quality[sensor] = Math.floor(Math.random() * 5);
    });
    quality.overall = Math.floor(Math.random() * 5);
    return quality;
  }

  // 生成模拟数据
  generateData() {
    // 电池电量缓慢变化
    if (Math.random() < 0.1) { // 10%概率变化
      this.batteryLevel = Math.max(0, Math.min(100, this.batteryLevel + (Math.random() - 0.5) * 2));
      
      // 根据电池电量更新batteryOverview
      if (this.batteryLevel >= 80) this.batteryOverview = 4;
      else if (this.batteryLevel >= 60) this.batteryOverview = 3;
      else if (this.batteryLevel >= 40) this.batteryOverview = 2;
      else if (this.batteryLevel >= 20) this.batteryOverview = 1;
      else this.batteryOverview = 0;
    }

    const contactQuality = this.generateSensorQuality();
    const eegQuality = this.generateSensorQuality();
    
    // EEG质量数据格式稍有不同
    eegQuality.batteryPercent = Math.round(this.batteryLevel);
    eegQuality.sampleRateQuality = Math.floor(Math.random() * 5);

    return {
      timestamp: Date.now() / 1000,
      connection_signal: 1,
      headset_status: "connected",
      battery_overview: this.batteryOverview,
      battery_level: Math.round(this.batteryLevel),
      contact_quality: contactQuality,
      EEG_quality: eegQuality,
      current_action: ["neutral", Math.floor(Math.random() * 3)]
    };
  }

  // 开始生成数据
  start(callback, interval = 1000) {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.callbacks.push(callback);
    
    const generateAndSend = () => {
      if (!this.isRunning) return;
      
      const data = this.generateData();
      this.callbacks.forEach(cb => cb(data));
      
      setTimeout(generateAndSend, interval);
    };
    
    // 立即发送第一个数据
    setTimeout(generateAndSend, 100);
  }

  // 停止生成数据
  stop() {
    this.isRunning = false;
    this.callbacks = [];
  }

  // 添加回调
  addCallback(callback) {
    if (!this.callbacks.includes(callback)) {
      this.callbacks.push(callback);
    }
  }

  // 移除回调
  removeCallback(callback) {
    this.callbacks = this.callbacks.filter(cb => cb !== callback);
  }
}

export const mockDataGenerator = new MockDataGenerator(); 