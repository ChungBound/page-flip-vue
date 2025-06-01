# 🎭 Mock模式控制指南

这个指南将帮助您了解如何控制应用的Mock模式，在真实设备和模拟数据之间轻松切换。

## 🎯 什么是Mock模式？

Mock模式让您在没有真实EEG设备的情况下测试应用功能，系统会生成模拟的：
- 设备连接状态
- 电池电量变化
- 传感器数据（Contact Quality & EEG Quality）
- WebSocket实时数据流

## 🛠️ 如何控制Mock模式？

### 方法1：配置文件控制（推荐）

编辑 `src/config/mockConfig.js` 文件：

```javascript
export const mockConfig = {
  enabled: 'auto', // 改这里！
  // ...
};
```

**可选值：**
- `'auto'` - 仅在开发环境启用Mock（默认）
- `true` - 强制启用Mock（不管什么环境）
- `false` - 强制禁用Mock（使用真实设备）

### 方法2：可视化控制面板

**在开发环境下：**
1. 按 `Ctrl+M` 或点击右下角的 🛠️ 按钮
2. 选择Mock模式：
   - **🔄 Auto**: 开发环境启用，生产环境禁用
   - **🎭 Force Mock**: 强制使用模拟数据
   - **🔌 Real Device**: 强制使用真实设备

### 方法3：URL参数控制

在URL中添加参数（计划中的功能）：
- `?mock=true` - 启用Mock
- `?mock=false` - 禁用Mock

## 📱 如何识别当前模式？

1. **Header指示器**: 连接成功后，Header会显示 `🎭 Mock Mode` 标签
2. **控制台日志**: 查看DevTools控制台的连接日志
3. **控制面板**: 显示当前状态和描述

## 🔧 场景使用指南

### 场景1：我有真实设备，想要测试

```javascript
// src/config/mockConfig.js
export const mockConfig = {
  enabled: false, // 强制使用真实设备
};
```

### 场景2：我没有设备，想要开发/演示

```javascript
// src/config/mockConfig.js
export const mockConfig = {
  enabled: true, // 强制使用Mock
};
```

### 场景3：开发时用Mock，部署时用真实设备

```javascript
// src/config/mockConfig.js
export const mockConfig = {
  enabled: 'auto', // 智能模式（默认）
};
```

## 🚀 快速切换操作

### 从Mock切换到真实设备：
1. 修改 `mockConfig.enabled = false`
2. 使用控制面板点击 "🔄 重新连接"
3. 或手动断开重连设备

### 从真实设备切换到Mock：
1. 修改 `mockConfig.enabled = true`
2. 刷新页面或重新连接

## 🎛️ 高级配置

在 `mockConfig.js` 中还可以配置：

```javascript
export const mockConfig = {
  enabled: 'auto',
  options: {
    mockDataInterval: 2000,    // 数据更新频率
    mockBatteryLevel: 75,      // 初始电池电量
    mockBatteryOverview: 3,    // 初始电池状态
    enableLogs: true,          // 是否显示调试日志
    showMockIndicator: true    // 是否显示Mock指示器
  }
};
```

## 🔍 故障排除

**Q: 更改配置后没有生效？**
A: 需要重新连接设备或刷新页面

**Q: 看不到Mock控制面板？**
A: 确保在开发环境，按 `Ctrl+M` 或检查右下角按钮

**Q: 真实设备连接失败？**
A: 检查 `enabled: false`，确保后端API可用

**Q: Mock数据不变化？**
A: 检查控制台错误，确保WebSocket连接正常

## 📝 开发建议

- **开发阶段**: 使用 `enabled: 'auto'` 方便开发
- **演示阶段**: 使用 `enabled: true` 确保稳定
- **生产部署**: 使用 `enabled: false` 连接真实设备
- **调试问题**: 打开 `enableLogs: true` 查看详细日志

---

💡 **提示**: 按 `Ctrl+M` 快速打开Mock控制面板！ 