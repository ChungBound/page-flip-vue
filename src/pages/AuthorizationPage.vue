<template>
  <PageLayout>
    <!-- 初始状态 -->
    <template v-if="step === 'init'">
      <button
        class="w-[25vh] h-[25vh] rounded-full bg-[#F5E6E0] shadow shadow-[0_0_20px] flex items-center justify-center text-sm text-gray-400 border border-gray-200 hover:bg-[#EFD9D1] transition"
        @click="startAuth"
      >
        Click Here to Start
      </button>
    </template>

    <!-- 等待授权 -->
    <template v-else-if="step === 'waiting'">
      <div
        class="mt-12 w-96 h-48 flex items-center justify-center text-xl text-blue-600"
      >
        Waiting for authorization...
      </div>
    </template>

    <!-- 授权失败 -->
    <template v-else-if="step === 'fail'">
      <StatusCard
        type="error"
        message="Not authorized. Please retry..."
        button-text="Retry"
        @button-click="startAuth"
      />
    </template>

    <!-- 授权成功 -->
    <template v-else-if="step === 'success'">
      <StatusCard
        type="success"
        message="Authorization granted"
        button-text="Continue to Device Connection"
        @button-click="goNext"
      />
    </template>
  </PageLayout>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { trueRequestAccess } from "../api/auth";
import { useAuthStore } from "../stores/auth";
import { useLoadingStore } from "@/stores/loadingStore";
import PageLayout from "@/components/PageLayout.vue";
import StatusCard from "@/components/StatusCard.vue";

const router = useRouter();
const authStore = useAuthStore();
const loadingStore = useLoadingStore();

const step = ref("init"); // 'init' | 'waiting' | 'fail' | 'success'

const startAuth = async () => {
  step.value = "waiting";
  loadingStore.showLoading(
    "waiting for authorization, Please authorize this app in Emotiv Launcher ..."
  );

  try {
    const res = await trueRequestAccess();

    if (res.status === 1) {
      // 授权成功
      step.value = "success";
      authStore.setAuthorized(true);
    } else {
      // 授权失败
      step.value = "fail";
    }
  } catch (e) {
    // 请求异常，显示失败状态
    step.value = "fail";
  } finally {
    loadingStore.hideLoading();
  }
};

const goNext = () => {
  router.push("/device");
};
</script>
