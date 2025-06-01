// 模拟信号WebSocket逻辑
export function mockSignalWebSocket(onData) {
  let timer = null;
  function randomArr(len, min = 60, max = 100) {
    return Array.from({ length: len }, () => Math.floor(Math.random() * (max - min + 1)) + min);
  }
  function send() {
    const data = {
      contact: randomArr(8, 80, 100),
      eeg: randomArr(8, 60, 100)
    };
    onData(data);
    timer = setTimeout(send, 800);
  }
  send();
  return {
    close() {
      if (timer) clearTimeout(timer);
    }
  };
}