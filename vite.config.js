import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';

export default defineConfig(({ command, mode }) => {
  // 根据当前工作目录中的 `mode` 加载 .env 文件
  const env = loadEnv(mode, process.cwd());
  
  return {
    plugins: [vue()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    // 环境变量配置
    define: {
      'process.env': env
    },
    // 开发服务器配置
    server: {
      host: '0.0.0.0',
      port: 3000,
      proxy: {
        // HTTP API 代理
        '/api': {
          target: 'http://127.0.0.1:8000',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, '')
        },
        // WebSocket 代理
        '/ws': {
          target: 'ws://127.0.0.1:8000',
          ws: true, // 启用websocket代理
          changeOrigin: true,
          // 不重写路径，保持/ws前缀
        }
      }
    }
  };
});