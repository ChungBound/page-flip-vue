// Mocked training API
const trainedActions = {};

export function getTrainedSignatureActions(profileId) {
  if (!trainedActions[profileId]) {
    trainedActions[profileId] = {
      Neutral: false,
      'Flip Left': false,
      'Flip Right': false,
    };
  }
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ ...trainedActions[profileId] });
    }, 300);
  });
}

export function training(profileId, action, status) {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (!trainedActions[profileId]) {
        trainedActions[profileId] = {
          Neutral: false,
          'Flip Left': false,
          'Flip Right': false,
        };
      }
      if (status === 'erase') {
        trainedActions[profileId][action] = false;
      } else if (status === 'save') {
        trainedActions[profileId][action] = true;
      }
      resolve({ success: true });
    }, 400);
  });
}

// 新的训练API函数

/**
 * 开始训练会话
 * @param {string} profileName - 用户配置文件名称
 * @param {string} action - 训练动作 (left, right, neutral)
 * @returns {Promise} 返回训练会话ID
 */
export function startTrainingSession(profileName, action) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        console.log('Starting training session:', { profileName, action, sessionId });
        
        resolve({
          status: 1,
          message: 'Training session started successfully',
          result: {
            sessionId,
            profileName,
            action,
            startTime: new Date().toISOString(),
          }
        });
      } catch (error) {
        reject({
          status: 0,
          message: 'Failed to start training session',
          error
        });
      }
    }, 500);
  });
}

/**
 * 停止训练会话
 * @param {string} sessionId - 训练会话ID
 * @param {string} reason - 停止原因 ('completed', 'cancelled', 'interrupted')
 * @returns {Promise} 返回训练结果
 */
export function stopTrainingSession(sessionId, reason = 'completed') {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        // 模拟训练结果数据
        const trainingResults = {
          sessionId,
          endTime: new Date().toISOString(),
          reason,
          signalQuality: Math.random() > 0.3 ? 'good' : 'fair', // 70%概率为good
          dataPoints: Math.floor(Math.random() * 50) + 100, // 100-150个数据点
          accuracy: Math.floor(Math.random() * 20) + 80, // 80-100%准确率
          snr: (Math.random() * 10 + 15).toFixed(1), // 15-25 dB信噪比
          artifacts: Math.floor(Math.random() * 5), // 0-4个伪影
          duration: 8000, // 固定8秒训练时长
        };

        console.log('Training session stopped:', trainingResults);

        resolve({
          status: 1,
          message: 'Training session completed',
          result: trainingResults
        });
      } catch (error) {
        reject({
          status: 0,
          message: 'Failed to stop training session',
          error
        });
      }
    }, 300);
  });
}

/**
 * 接受训练结果
 * @param {string} sessionId - 训练会话ID
 * @param {object} trainingResults - 训练结果数据
 * @returns {Promise} 返回保存状态
 */
export function acceptTrainingResults(sessionId, trainingResults) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        console.log('Training results accepted:', { sessionId, trainingResults });
        
        // 更新训练状态
        if (trainingResults.profileName && trainingResults.action) {
          const actionDisplayName = getActionDisplayName(trainingResults.action);
          if (!trainedActions[trainingResults.profileName]) {
            trainedActions[trainingResults.profileName] = {
              Neutral: false,
              'Flip Left': false,
              'Flip Right': false,
            };
          }
          trainedActions[trainingResults.profileName][actionDisplayName] = true;
        }

        resolve({
          status: 1,
          message: 'Training results saved successfully',
          result: {
            sessionId,
            saved: true,
            timestamp: new Date().toISOString(),
          }
        });
      } catch (error) {
        reject({
          status: 0,
          message: 'Failed to save training results',
          error
        });
      }
    }, 400);
  });
}

/**
 * 拒绝训练结果
 * @param {string} sessionId - 训练会话ID
 * @param {string} reason - 拒绝原因
 * @returns {Promise} 返回拒绝状态
 */
export function rejectTrainingResults(sessionId, reason = 'user_rejected') {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        console.log('Training results rejected:', { sessionId, reason });

        resolve({
          status: 1,
          message: 'Training results rejected',
          result: {
            sessionId,
            rejected: true,
            reason,
            timestamp: new Date().toISOString(),
          }
        });
      } catch (error) {
        reject({
          status: 0,
          message: 'Failed to reject training results',
          error
        });
      }
    }, 200);
  });
}

// 辅助函数
function getActionDisplayName(action) {
  const displayNames = {
    neutral: 'Neutral',
    left: 'Flip Left',
    right: 'Flip Right',
  };
  return displayNames[action] || action;
}