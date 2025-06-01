import { defineStore } from 'pinia';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    authorized: false,
  }),
  actions: {
    setAuthorized(val) {
      this.authorized = val;
    },
  },
});