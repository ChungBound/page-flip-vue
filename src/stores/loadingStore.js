import { defineStore } from 'pinia';

export const useLoadingStore = defineStore('loading', {
  state: () => ({
    loading: false,
    loadingText: 'loading...'
  }),
  actions: {
    showLoading(text = 'loading...') {
      this.loading = true;
      this.loadingText = text;
    },
    hideLoading() {
      this.loading = false;
    }
  }
}); 