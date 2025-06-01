<template>
  <div class="flex w-[80%] h-full flex-col items-center">
    <div
      ref="bookRef"
      class="relative w-[100%] h-[60vh] max-h-[36rem] min-h-[18rem] max-w-4xl min-w-[18rem] bg-stone-800 rounded-lg shadow-2xl overflow-hidden book-container"
    >
      <!-- 书本封面背景 -->
      <div
        class="absolute inset-0 bg-gradient-to-r from-stone-700 via-stone-600 to-stone-700 z-0"
      ></div>

      <!-- 书页区域 -->
      <div class="relative w-full h-full flex items-center justify-center">
        <div
          class="absolute inset-0 m-4 bg-stone-100 rounded shadow-inner z-20 overflow-hidden"
        >
          <!-- 书脊 - 中间的分隔线 - 始终保持在最上层 -->
          <div
            class="absolute top-0 bottom-0 left-1/2 w-[2px] bg-stone-300 z-50"
          ></div>

          <!-- 静态页面 - 当前显示的页面 -->
          <div v-if="!isAnimating" class="absolute inset-0 flex">
            <!-- 左侧页面 -->
            <div class="w-1/2 h-full bg-stone-50 flex flex-col">
              <div v-if="leftPage" class="flex-1 p-6 pb-0 overflow-auto">
                <p class="text-lg leading-relaxed">{{ leftPage.content }}</p>
              </div>
              <div
                v-if="leftPage"
                class="text-center text-sm text-gray-500 p-2"
              >
                Page {{ leftPage.pageNumber }}
              </div>
              <div
                v-else
                class="flex-1 flex items-center justify-center text-stone-400"
              >
                Cover/Back Cover
              </div>
            </div>

            <!-- 右侧页面 -->
            <div class="w-1/2 h-full bg-stone-50 flex flex-col">
              <div v-if="rightPage" class="flex-1 p-6 pb-0 overflow-auto">
                <p class="text-lg leading-relaxed">{{ rightPage.content }}</p>
              </div>
              <div
                v-if="rightPage"
                class="text-center text-sm text-gray-500 p-2"
              >
                Page {{ rightPage.pageNumber }}
              </div>
              <div
                v-else
                class="flex-1 flex items-center justify-center text-stone-400"
              >
                Cover/Back Cover
              </div>
            </div>
          </div>

          <!-- 向前翻页动画 -->
          <template v-if="isAnimating && direction > 0">
            <!-- 当前左侧页面 - 静态 -->
            <div
              class="absolute top-0 left-0 bottom-0 w-1/2 bg-stone-50 flex flex-col z-20"
            >
              <div v-if="leftPage" class="flex-1 p-6 pb-0 overflow-auto">
                <p class="text-lg leading-relaxed">{{ leftPage.content }}</p>
              </div>
              <div
                v-if="leftPage"
                class="text-center text-sm text-gray-500 p-2"
              >
                Page {{ leftPage.pageNumber }}
              </div>
              <div
                v-else
                class="flex-1 flex items-center justify-center text-stone-400"
              >
                Cover/Back Cover
              </div>
            </div>

            <!-- 下一组右侧页面 - 静态 -->
            <div
              class="absolute top-0 right-0 bottom-0 w-1/2 bg-stone-50 flex flex-col z-20"
            >
              <div v-if="nextRightPage" class="flex-1 p-6 pb-0 overflow-auto">
                <p class="text-lg leading-relaxed">
                  {{ nextRightPage.content }}
                </p>
              </div>
              <div
                v-if="nextRightPage"
                class="text-center text-sm text-gray-500 p-2"
              >
                Page {{ nextRightPage.pageNumber }}
              </div>
              <div
                v-else
                class="flex-1 flex items-center justify-center text-stone-400"
              >
                Cover/Back Cover
              </div>
            </div>

            <!-- 当前右侧页面翻转 - 动画 -->
            <div
              ref="forwardAnimPage"
              class="absolute top-0 right-0 bottom-0 w-1/2 z-30 page-flip-container"
              :style="{
                transform: `rotateY(${forwardPageRotation}deg)`,
                transformStyle: 'preserve-3d',
                transformOrigin: 'left center',
                perspective: '1500px',
              }"
            >
              <!-- 正面 - 当前右侧页面 -->
              <div
                class="absolute inset-0 bg-stone-50 flex flex-col page-flip-front"
                :style="{
                  backfaceVisibility: 'hidden',
                  boxShadow: '0 0 15px rgba(0,0,0,0.1)',
                }"
              >
                <div v-if="rightPage" class="flex-1 p-6 pb-0 overflow-auto">
                  <p class="text-lg leading-relaxed">{{ rightPage.content }}</p>
                </div>
                <div
                  v-if="rightPage"
                  class="text-center text-sm text-gray-500 p-2"
                >
                  Page {{ rightPage.pageNumber }}
                </div>
                <div
                  v-else
                  class="flex-1 flex items-center justify-center text-stone-400"
                >
                  Cover/Back Cover
                </div>

                <!-- 页面阴影和光效 -->
                <div
                  class="absolute inset-0 pointer-events-none"
                  style="
                    background: linear-gradient(
                      to left,
                      rgba(0, 0, 0, 0.05),
                      transparent 20%,
                      transparent 80%,
                      rgba(0, 0, 0, 0.05)
                    );
                  "
                ></div>
                <div
                  class="absolute left-0 top-0 bottom-0 w-[20px] pointer-events-none"
                  style="box-shadow: inset 10px 0 10px -10px rgba(0, 0, 0, 0.2)"
                ></div>
              </div>

              <!-- 背面 - 下一组左侧页面 -->
              <div
                class="absolute inset-0 bg-stone-50 flex flex-col page-flip-back"
                :style="{
                  backfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)',
                  boxShadow: '0 0 15px rgba(0,0,0,0.1)',
                }"
              >
                <div v-if="nextLeftPage" class="flex-1 p-6 pb-0 overflow-auto">
                  <p class="text-lg leading-relaxed">
                    {{ nextLeftPage.content }}
                  </p>
                </div>
                <div
                  v-if="nextLeftPage"
                  class="text-center text-sm text-gray-500 p-2"
                >
                  Page {{ nextLeftPage.pageNumber }}
                </div>
                <div
                  v-else
                  class="flex-1 flex items-center justify-center text-stone-400"
                >
                  Cover/Back Cover
                </div>

                <!-- 页面阴影和光效 -->
                <div
                  class="absolute inset-0 pointer-events-none"
                  style="
                    background: linear-gradient(
                      to right,
                      rgba(0, 0, 0, 0.05),
                      transparent 20%,
                      transparent 80%,
                      rgba(0, 0, 0, 0.05)
                    );
                  "
                ></div>
                <div
                  class="absolute right-0 top-0 bottom-0 w-[20px] pointer-events-none"
                  style="
                    box-shadow: inset -10px 0 10px -10px rgba(0, 0, 0, 0.2);
                  "
                ></div>
              </div>
            </div>
          </template>

          <!-- 向后翻页动画 - 左侧页面从左向右翻转 -->
          <template v-if="isAnimating && direction < 0">
            <!-- 上一组左侧页面 - 静态 -->
            <div
              class="absolute top-0 left-0 bottom-0 w-1/2 bg-stone-50 flex flex-col z-20"
            >
              <div v-if="prevLeftPage" class="flex-1 p-6 pb-0 overflow-auto">
                <p class="text-lg leading-relaxed">
                  {{ prevLeftPage.content }}
                </p>
              </div>
              <div
                v-if="prevLeftPage"
                class="text-center text-sm text-gray-500 p-2"
              >
                Page {{ prevLeftPage.pageNumber }}
              </div>
              <div
                v-else
                class="flex-1 flex items-center justify-center text-stone-400"
              >
                Cover/Back Cover
              </div>
            </div>

            <!-- 当前右侧页面 - 静态 -->
            <div
              class="absolute top-0 right-0 bottom-0 w-1/2 bg-stone-50 flex flex-col z-20"
            >
              <div v-if="rightPage" class="flex-1 p-6 pb-0 overflow-auto">
                <p class="text-lg leading-relaxed">{{ rightPage.content }}</p>
              </div>
              <div
                v-if="rightPage"
                class="text-center text-sm text-gray-500 p-2"
              >
                Page {{ rightPage.pageNumber }}
              </div>
              <div
                v-else
                class="flex-1 flex items-center justify-center text-stone-400"
              >
                Cover/Back Cover
              </div>
            </div>

            <!-- 当前左侧页面翻转 - 动画 -->
            <div
              ref="backwardAnimPage"
              class="absolute top-0 left-0 bottom-0 w-1/2 z-30 page-flip-container"
              :style="{
                transform: `rotateY(${backwardPageRotation}deg)`,
                transformStyle: 'preserve-3d',
                transformOrigin: 'right center',
                perspective: '1500px',
              }"
            >
              <!-- 正面 - 当前左侧页面 -->
              <div
                class="absolute inset-0 bg-stone-50 flex flex-col page-flip-front"
                :style="{
                  backfaceVisibility: 'hidden',
                  boxShadow: '0 0 15px rgba(0,0,0,0.1)',
                }"
              >
                <div v-if="leftPage" class="flex-1 p-6 pb-0 overflow-auto">
                  <p class="text-lg leading-relaxed">{{ leftPage.content }}</p>
                </div>
                <div
                  v-if="leftPage"
                  class="text-center text-sm text-gray-500 p-2"
                >
                  Page {{ leftPage.pageNumber }}
                </div>
                <div
                  v-else
                  class="flex-1 flex items-center justify-center text-stone-400"
                >
                  Cover/Back Cover
                </div>

                <!-- 页面阴影和光效 -->
                <div
                  class="absolute inset-0 pointer-events-none"
                  style="
                    background: linear-gradient(
                      to right,
                      rgba(0, 0, 0, 0.05),
                      transparent 20%,
                      transparent 80%,
                      rgba(0, 0, 0, 0.05)
                    );
                  "
                ></div>
                <div
                  class="absolute right-0 top-0 bottom-0 w-[20px] pointer-events-none"
                  style="
                    box-shadow: inset -10px 0 10px -10px rgba(0, 0, 0, 0.2);
                  "
                ></div>
              </div>

              <!-- 背面 - 上一组右侧页面 -->
              <div
                class="absolute inset-0 bg-stone-50 flex flex-col page-flip-back"
                :style="{
                  backfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)',
                  boxShadow: '0 0 15px rgba(0,0,0,0.1)',
                }"
              >
                <div v-if="prevRightPage" class="flex-1 p-6 pb-0 overflow-auto">
                  <p class="text-lg leading-relaxed">
                    {{ prevRightPage.content }}
                  </p>
                </div>
                <div
                  v-if="prevRightPage"
                  class="text-center text-sm text-gray-500 p-2"
                >
                  Page {{ prevRightPage.pageNumber }}
                </div>
                <div
                  v-else
                  class="flex-1 flex items-center justify-center text-stone-400"
                >
                  Cover/Back Cover
                </div>

                <!-- 页面阴影和光效 -->
                <div
                  class="absolute inset-0 pointer-events-none"
                  style="
                    background: linear-gradient(
                      to left,
                      rgba(0, 0, 0, 0.05),
                      transparent 20%,
                      transparent 80%,
                      rgba(0, 0, 0, 0.05)
                    );
                  "
                ></div>
                <div
                  class="absolute left-0 top-0 bottom-0 w-[20px] pointer-events-none"
                  style="box-shadow: inset 10px 0 10px -10px rgba(0, 0, 0, 0.2)"
                ></div>
              </div>
            </div>
          </template>

          <!-- 翻页时的动态阴影效果 -->
          <div
            v-if="isAnimating"
            class="absolute page-shadow"
            :style="{
              width: '40px',
              height: '100%',
              left: 'calc(50% - 20px)',
              background:
                'linear-gradient(to right, rgba(0,0,0,0.05), transparent)',
              filter: 'blur(4px)',
              zIndex: 40,
              opacity: shadowOpacity,
            }"
          ></div>
        </div>
      </div>

      <!-- 书本边缘阴影 -->
      <div
        class="absolute inset-0 m-4 pointer-events-none z-30"
        style="
          box-shadow: inset 0 0 30px rgba(0, 0, 0, 0.2);
          border-radius: 4px;
        "
      ></div>
    </div>

    <!-- 导航控件 - 仅在手动模式或显示控制按钮时显示 -->
    <div
      v-if="mode === 'manual' & showControls"
      class="flex justify-center gap-4 mt-8"
    >
      <button
        class="px-4 py-2 border rounded-md flex items-center gap-2 disabled:opacity-50"
        @click="goToPreviousPage"
        :disabled="normalizedIndex === 0 || isAnimating"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="m15 18-6-6 6-6" />
        </svg>
        Previous
      </button>
      <button
        class="px-4 py-2 border rounded-md flex items-center gap-2 disabled:opacity-50"
        @click="goToNextPage"
        :disabled="normalizedIndex + 2 >= bookPages.length || isAnimating"
      >
        Next
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="m9 18 6-6-6-6" />
        </svg>
      </button>
    </div>

    <!-- 提示信息 -->
    <!-- <p v-if="mode === 'manual'" class="text-sm text-gray-500 mt-4">
      Tip: You can use left and right arrow keys to turn pages
    </p> -->
    <!-- <p v-if="mode === 'auto-left'" class="text-sm text-gray-500 mt-4">
      Automatic Left Page Turn Demo - Turning page every
      {{ autoTurnInterval / 1000 }} seconds
    </p> -->
    <!-- <p v-if="mode === 'auto-right'" class="text-sm text-gray-500 mt-4">
      Automatic Right Page Turn Demo - Turning page every
      {{ autoTurnInterval / 1000 }} seconds
    </p> -->
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from "vue";

// 示例书本内容
const defaultPages = [
  {
    content:
      "This is the first page of the book. Welcome to this interactive e-book experience! This realistic page-turning effect allows you to feel the reading experience of a physical book.",
    pageNumber: 1,
  },
  {
    content:
      "This is the second page, where we continue to explore the simulation effects of this digital book. Now each line can accommodate more text, just like a real book, making the reading experience more comfortable.",
    pageNumber: 2,
  },
  {
    content:
      "The third page demonstrates how we create a realistic page-turning effect. Through carefully designed animations and shadow effects, we can simulate the natural feel and visual effects of paper turning.",
    pageNumber: 3,
  },
  {
    content:
      "The fourth page shows how to navigate through the book using intuitive controls. You can use the buttons at the bottom of the screen or the left and right arrow keys on your keyboard to turn pages, just as simple and intuitive as reading a real book.",
    pageNumber: 4,
  },
  {
    content:
      "This is the fifth page, showcasing more content and interactive effects. The page width is now closer to the proportions of a real book, with each line accommodating more text, making the reading experience more natural and comfortable.",
    pageNumber: 5,
  },
  {
    content:
      "The sixth page continues our reading experience. Thank you for reading! The page width has been adjusted to a more reasonable size, with more beautiful text layout and a more comfortable, natural reading experience.",
    pageNumber: 6,
  },
  {
    content:
      "The seventh page contains additional content for testing multi-page turning effects. We can see that whether turning pages forward or backward, the animation effects are very smooth and natural, just like flipping through a real book.",
    pageNumber: 7,
  },
  {
    content:
      "The eighth page is the last page of our sample book. We hope you enjoy this demonstration! This e-book page-turning effect can be applied to various digital reading scenarios, providing users with a more immersive reading experience.",
    pageNumber: 8,
  },
];

export default {
  name: "BookComponent",
  props: {
    // 翻页模式：手动(manual)，自动向左(auto-left)，自动向右(auto-right)
    mode: {
      type: String,
      default: "manual",
      validator: (value) =>
        ["manual", "auto-left", "auto-right"].includes(value),
    },
    // 自动翻页间隔，单位毫秒
    autoTurnInterval: {
      type: Number,
      default: 2000,
    },
    // 是否显示控制按钮
    showControls: {
      type: Boolean,
      default: true,
    },
    // 可选的自定义页面内容
    customPages: {
      type: Array,
      default: null,
    },
  },
  setup(props) {
    // 使用自定义页面内容或默认页面内容
    const bookPages = computed(() => props.customPages || defaultPages);

    // 状态管理
    const currentPageIndex = ref(0);
    const isAnimating = ref(false);
    const direction = ref(0); // -1: 向左, 1: 向右
    const bookRef = ref(null);

    // 动画相关参数
    const forwardPageRotation = ref(0);
    const backwardPageRotation = ref(0);
    const shadowOpacity = ref(0);

    // 确保我们总是显示偶数页和奇数页的组合
    const normalizedIndex = computed(() =>
      currentPageIndex.value % 2 === 0
        ? currentPageIndex.value
        : currentPageIndex.value - 1
    );

    // 获取当前显示的两页
    const leftPage = computed(
      () => bookPages.value[normalizedIndex.value] || null
    );
    const rightPage = computed(
      () => bookPages.value[normalizedIndex.value + 1] || null
    );

    // 获取下一组页面（用于翻页动画）
    const nextLeftPage = computed(
      () => bookPages.value[normalizedIndex.value + 2] || null
    );
    const nextRightPage = computed(
      () => bookPages.value[normalizedIndex.value + 3] || null
    );

    // 获取上一组页面（用于翻页动画）
    const prevLeftPage = computed(
      () => bookPages.value[normalizedIndex.value - 2] || null
    );
    const prevRightPage = computed(
      () => bookPages.value[normalizedIndex.value - 1] || null
    );

    // 向前翻页
    const goToNextPage = async () => {
      if (
        normalizedIndex.value + 2 < bookPages.value.length &&
        !isAnimating.value
      ) {
        // 1. 设置动画状态和方向
        isAnimating.value = true;
        direction.value = 1;
        shadowOpacity.value = 0;

        // 2. 强制设置初始状态
        forwardPageRotation.value = 0;

        // 3. 等待DOM更新并强制浏览器绘制
        await nextTick();
        // 这个强制重排/重绘很重要
        const dummy = document.body.offsetHeight;

        // 4. 添加一点延迟确保初始状态已经被渲染
        await new Promise((r) => setTimeout(r, 50));

        // 5. 设置阴影效果
        shadowOpacity.value = 1;

        // 6. 执行翻页动画
        forwardPageRotation.value = -180;

        // 7. 等待动画完成
        await new Promise((r) => setTimeout(r, 700));

        // 8. 更新页面和重置状态
        currentPageIndex.value = normalizedIndex.value + 2;
        isAnimating.value = false;
        shadowOpacity.value = 0;
      }
    };

    // 向后翻页
    const goToPreviousPage = async () => {
      if (normalizedIndex.value - 2 >= 0 && !isAnimating.value) {
        // 1. 设置动画状态和方向
        isAnimating.value = true;
        direction.value = -1;
        shadowOpacity.value = 0;

        // 2. 强制设置初始状态
        backwardPageRotation.value = 0;

        // 3. 等待DOM更新并强制浏览器绘制
        await nextTick();
        // 这个强制重排/重绘很重要
        const dummy = document.body.offsetHeight;

        // 4. 添加一点延迟确保初始状态已经被渲染
        await new Promise((r) => setTimeout(r, 50));

        // 5. 设置阴影效果
        shadowOpacity.value = 1;

        // 6. 执行翻页动画
        backwardPageRotation.value = 180;

        // 7. 等待动画完成
        await new Promise((r) => setTimeout(r, 700));

        // 8. 更新页面和重置状态
        currentPageIndex.value = normalizedIndex.value - 2;
        isAnimating.value = false;
        shadowOpacity.value = 0;
      }
    };

    // 自动翻页定时器
    let autoTurnTimer = null;

    // 自动翻页功能
    const setupAutoTurn = () => {
      clearTimeout(autoTurnTimer);

      // 只在自动模式下启用
      if (props.mode === "manual") return;

      // 如果是auto-left模式，从最后一页开始
      if (props.mode === "auto-left") {
        // 设置为最后一页（确保是偶数索引）
        currentPageIndex.value =
          Math.floor((bookPages.value.length - 1) / 2) * 2;
      } else {
        // 其他模式从第一页开始
        currentPageIndex.value = 0;
      }

      // 初始设置延迟与autoTurnInterval保持一致
      setTimeout(() => {
        startAutoTurn();
      }, props.autoTurnInterval); // 使用props中的时间间隔
    };

    // 开始自动翻页循环
    const startAutoTurn = () => {
      // 清除可能存在的定时器
      clearTimeout(autoTurnTimer);

      // 只在自动模式下执行
      if (props.mode === "manual") return;

      // 如果正在动画中，等待动画完成
      if (isAnimating.value) {
        autoTurnTimer = setTimeout(startAutoTurn, 100);
        return;
      }

      // 根据不同模式执行翻页
      const performTurn = async () => {
        try {
          if (props.mode === "auto-right") {
            if (normalizedIndex.value + 2 < bookPages.value.length) {
              await goToNextPage();
            } else {
              // 如果已经到最后一页，重置到第一页
              currentPageIndex.value = 0;
            }
          } else if (props.mode === "auto-left") {
            if (normalizedIndex.value - 2 >= 0) {
              await goToPreviousPage();
            } else {
              // 如果已经到第一页，重置到最后一页
              currentPageIndex.value =
                Math.floor((bookPages.value.length - 1) / 2) * 2;
            }
          }

          // 设置下一次翻页
          autoTurnTimer = setTimeout(startAutoTurn, props.autoTurnInterval);
        } catch (error) {
          console.error("Auto turn error:", error);
          // 出错时也继续尝试
          autoTurnTimer = setTimeout(startAutoTurn, props.autoTurnInterval);
        }
      };

      // 执行翻页
      performTurn();
    };

    // 监听模式或间隔变化，重新设置自动翻页
    watch(() => [props.mode, props.autoTurnInterval], setupAutoTurn);

    // 挂载和卸载时的事件处理
    onMounted(() => {
      setupAutoTurn();
    });

    onUnmounted(() => {
      clearTimeout(autoTurnTimer);
    });

    return {
      bookRef,
      bookPages,
      currentPageIndex,
      normalizedIndex,
      isAnimating,
      direction,
      leftPage,
      rightPage,
      nextLeftPage,
      nextRightPage,
      prevLeftPage,
      prevRightPage,
      goToNextPage,
      goToPreviousPage,
      forwardPageRotation,
      backwardPageRotation,
      shadowOpacity,
    };
  },
};
</script>

<style scoped>
.book-container {
  position: relative;
  transform-style: preserve-3d;
}

.page-flip-container {
  transition: transform 0.7s cubic-bezier(0.3, 0.1, 0.3, 1);
  transform-style: preserve-3d;
}

.page-flip-front,
.page-flip-back {
  transition: transform 0.7s cubic-bezier(0.3, 0.1, 0.3, 1);
  backface-visibility: hidden;
}

.page-shadow {
  transition: opacity 0.2s ease;
}
</style>
