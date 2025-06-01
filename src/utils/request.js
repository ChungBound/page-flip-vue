import axios from 'axios';
import { ElMessage } from 'element-plus';
import { useLoadingStore } from '../stores/loadingStore';

// 创建axios实例
const service = axios.create({
  baseURL: '/api', // 统一用/api，开发环境由Vite代理，生产环境由nginx等代理
  timeout: 15000, // 请求超时时间
  headers: {
    'Content-Type': 'application/json',
  }
});

// 请求拦截器
service.interceptors.request.use(
  (config) => {
    // 显示loading
    const loadingStore = useLoadingStore();
    loadingStore.showLoading();
    return config;
  },
  (error) => {
    // 隐藏loading
    const loadingStore = useLoadingStore();
    loadingStore.hideLoading();
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器
service.interceptors.response.use(
  (response) => {
    // 隐藏loading
    const loadingStore = useLoadingStore();
    loadingStore.hideLoading();
    
    const res = response.data;
    
    // 只在明确失败时弹窗和抛错
    if (res.status === -1) {
      ElMessage.error(res.message || 'request failure');
      return Promise.reject(new Error(res.message || 'request failure'));
    }
    // 其他情况直接返回整个res对象
    return res;
  },
  (error) => {
    // 隐藏loading
    const loadingStore = useLoadingStore();
    loadingStore.hideLoading();
    
    console.error('Response error:', error);
    // 处理HTTP错误状态
    const message = error.response?.data?.message || error.message || '请求失败';
    ElMessage.error(message);
    return Promise.reject(error);
  }
);

export default service; 