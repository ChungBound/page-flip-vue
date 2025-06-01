<template>
  <div class="h-full flex items-center justify-between w-full">
    <!-- 左侧文字部分 -->
    <div class="h-[25vh] pl-[10vh]">
      <h1 class="text-3xl font-bold text-gray-800">NeuroFlip Reader</h1>
      <p
        class="mt-2 font-normal not-italic text-[rgba(51,51,51,0.9921568627450981)]"
      >
        A Neural Signal-Powered Tool for Accessible Digital Reading
      </p>
      <p class="text-gray-600 mt-1">Team: LY 1</p>
      <p class="text-gray-600">Supervisor: Dr. Lin Yue</p>
    </div>

    <!-- 右侧内容插槽 -->
    <div
      class="rounded w-full max-w-[40vw] flex flex-row items-center justify-center"
    >
      <slot></slot>
    </div>
  </div>
</template>

<script setup>
// 这个组件不需要任何props或逻辑，只提供布局
</script>
