import { createRouter, createWebHashHistory } from 'vue-router';
import { useDeviceStore } from '../stores/deviceStore';
import { ElMessageBox } from 'element-plus';

const routes = [
  { path: '/', redirect: '/auth' },
  { path: '/auth', name: 'Authorization', component: () => import('../pages/AuthorizationPage.vue'), meta: { requiresAuth: false } },
  { path: '/device', name: 'DeviceConnection', component: () => import('../pages/DeviceConnectionPage.vue'), meta: { requiresAuth: false } },
  { path: '/test-mock', name: 'TestMockData', component: () => import('../pages/TestMockData.vue'), meta: { requiresAuth: false } },
  { path: '/test-system', name: 'TestMockSystem', component: () => import('../pages/TestMockPage.vue'), meta: { requiresAuth: false } },
  { path: '/profiles', name: 'ProfileManagement', component: () => import('../pages/ProfileManagementPage.vue'), meta: { requiresAuth: true } },
  { path: '/profile/:profileName', name: 'ProfileDetail', component: () => import('../pages/ProfileDetailPage.vue'), props: true, meta: { requiresAuth: true } },
  { path: '/profile/:profileName/train', name: 'ActionTraining', component: () => import('../pages/ActionTrainingPage.vue'), props: true, meta: { requiresAuth: true } },
  { path: '/signal', name: 'SignalAdjustment', component: () => import('../pages/SignalAdjustmentPage.vue'), meta: { requiresAuth: true } },
  { path: '/neuroflip', name: 'NeuroFlipAction', component: () => import('../pages/NeuroFlipActionPage.vue'), meta: { requiresAuth: true } },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

// Global route guard
router.beforeEach(async (to, from, next) => {
  const deviceStore = useDeviceStore();
  
  // If route requires authentication
  if (to.meta.requiresAuth) {
    // Check device connection status
    if (deviceStore.connectionStatus === -1) {
      // If device not connected, show alert
      try {
        await ElMessageBox.alert('Please authorize first', 'Notice', {
          confirmButtonText: 'OK',
          type: 'warning',
          callback: () => {
            // After user clicks OK, redirect to auth page
            next({ name: 'Authorization' });
          }
        });
      } catch (error) {
        // When user closes popup, also redirect to auth page
        next({ name: 'Authorization' });
      }
    } else {
      // Device connected, allow access
      next();
    }
  } else {
    // Routes that don't require authentication pass through directly
    next();
  }
});

export default router;