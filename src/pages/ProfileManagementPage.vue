<template>
  <PageLayout>
    <!-- Title -->
    <div class="flex flex-col items-center justify-center w-full">
      <h2 class="text-xl font-semibold text-gray-800 mb-2">
        User Profile Management
      </h2>
      <hr class="border w-[90%] mb-4 border-solid border-[#808080]" />

      <div
        class="flex flex-col items-center justify-center main-card bg-white/95 backdrop-blur-md rounded-3xl shadow-[0_0_20px_rgba(0,0,0,0.3)] w-full max-w-[1000px] mx-auto p-6"
      >
        <!-- Create Profile Button -->
        <div class="w-full mb-6 flex gap-3">
          <button
            @click="openCreateDialog"
            class="flex-1 py-3 bg-blue-600 text-white font-semibold rounded-full hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            Create Profile
          </button>
          <button
            @click="refreshProfiles"
            class="px-6 py-3 bg-gray-600 text-white font-semibold rounded-full hover:bg-gray-700 transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-2"
          >
            <svg
              class="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              ></path>
            </svg>
            Refresh
          </button>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="flex items-center justify-center py-8">
          <div class="flex items-center gap-3 text-blue-600">
            <svg class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              ></circle>
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <span class="text-lg">Loading profiles...</span>
          </div>
        </div>

        <!-- Empty State -->
        <div
          v-else-if="profiles.length === 0"
          class="h-96 flex flex-col items-center justify-center text-gray-500"
        >
          <svg
            class="w-16 h-16 mb-4 text-gray-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            ></path>
          </svg>
          <h3 class="text-lg font-medium text-gray-700 mb-2">
            No profiles found
          </h3>
          <p class="text-gray-500">Create your first profile to get started</p>
        </div>

        <!-- Profiles List -->
        <div v-else class="w-full">
          <div class="h-96 overflow-y-auto pr-2 space-y-4">
            <div
              v-for="(profile, index) in profiles"
              :key="profile.name"
              class="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200"
            >
              <div class="flex items-center justify-between">
                <!-- Profile Info -->
                <div class="flex items-center gap-3 flex-1 min-w-0">
                  <div
                    class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-sm flex-shrink-0"
                  >
                    {{ index + 1 }}
                  </div>
                  <div class="min-w-0 flex-1">
                    <h3 class="text-base font-medium text-gray-800 truncate">
                      {{ profile.name }}
                    </h3>
                    <p class="text-xs text-gray-500">
                      {{ formatCreatedAt(profile.created_at) }}
                    </p>
                  </div>
                </div>

                <!-- Action Buttons -->
                <div class="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    @click="enterProfile(profile)"
                    class="px-3 py-1.5 bg-green-500 text-white rounded-full hover:bg-green-600 transition-all duration-200 text-xs font-medium shadow-sm hover:shadow-md"
                  >
                    Enter
                  </button>
                  <button
                    @click="openRenameDialog(profile)"
                    class="px-3 py-1.5 bg-yellow-500 text-white rounded-full hover:bg-yellow-600 transition-all duration-200 text-xs font-medium shadow-sm hover:shadow-md"
                  >
                    Rename
                  </button>
                  <button
                    @click="confirmDelete(profile)"
                    class="px-3 py-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all duration-200 text-xs font-medium shadow-sm hover:shadow-md"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Create/Rename Dialog -->
    <teleport to="body" v-if="showDialog">
      <div
        class="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50"
      >
        <div
          class="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden"
        >
          <div class="px-6 py-4 border-b border-gray-200">
            <h3 class="text-lg font-semibold text-gray-800">
              {{
                dialogMode === "create" ? "Create Profile" : "Rename Profile"
              }}
            </h3>
          </div>
          <div class="px-6 py-4">
            <input
              v-model="dialogName"
              type="text"
              maxlength="20"
              placeholder="Enter profile name"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              @keyup.enter="submitDialog"
            />
            <div v-if="dialogError" class="mt-2 text-red-500 text-sm">
              {{ dialogError }}
            </div>
          </div>
          <div
            class="px-6 py-4 border-t border-gray-200 flex justify-end gap-3"
          >
            <button
              @click="closeDialog"
              class="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              @click="submitDialog"
              class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium shadow-sm hover:shadow-md"
            >
              {{ dialogMode === "create" ? "Create" : "Save" }}
            </button>
          </div>
        </div>
      </div>
    </teleport>

    <!-- Delete Confirm Dialog -->
    <teleport to="body" v-if="showDeleteDialog">
      <div
        class="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50"
      >
        <div
          class="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden"
        >
          <div class="px-6 py-4 border-b border-gray-200">
            <h3 class="text-lg font-semibold text-gray-800">Delete Profile</h3>
          </div>
          <div class="px-6 py-4">
            <div class="flex items-center gap-3 mb-4">
              <div
                class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center"
              >
                <svg
                  class="w-6 h-6 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.996-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  ></path>
                </svg>
              </div>
              <div>
                <p class="text-gray-800 font-medium">
                  Are you sure you want to delete this profile?
                </p>
                <p class="text-gray-600 text-sm mt-1">
                  Profile: "{{ deleteProfileObj?.name }}"
                </p>
              </div>
            </div>
            <p class="text-gray-600 text-sm">This action cannot be undone.</p>
          </div>
          <div
            class="px-6 py-4 border-t border-gray-200 flex justify-end gap-3"
          >
            <button
              @click="closeDeleteDialog"
              class="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              @click="deleteProfileConfirmed"
              class="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200 font-medium shadow-sm hover:shadow-md"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </teleport>
  </PageLayout>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import {
  queryProfile,
  createProfile,
  renameProfile,
  deleteProfile,
  loadProfile,
} from "../api/profile";
import PageLayout from "@/components/PageLayout.vue";

const router = useRouter();
const profiles = ref([]);
const loading = ref(true);
const showDialog = ref(false);
const dialogMode = ref("create"); // 'create' or 'rename'
const dialogName = ref("");
const dialogError = ref("");
const editingProfile = ref(null);
const showDeleteDialog = ref(false);
const deleteProfileObj = ref(null);

const fetchProfiles = async () => {
  loading.value = true;
  try {
    const response = await queryProfile();
    if (response.status === 1) {
      // 先过滤掉不兼容的profiles，然后按创建时间排序，最新的在前面
      const compatibleProfiles = (response.result || []).filter(
        (profile) => profile.is_compatible === true
      );
      const sortedProfiles = compatibleProfiles.sort((a, b) => {
        const dateA = new Date(a.created_at);
        const dateB = new Date(b.created_at);
        return dateB - dateA; // 降序排列，最新的在前面
      });
      profiles.value = sortedProfiles;
    } else {
      console.error("Failed to fetch profiles:", response.message);
      profiles.value = [];
      ElMessage.error(`Failed to load profiles: ${response.message}`);
    }
  } catch (error) {
    console.error("Error fetching profiles:", error);
    profiles.value = [];
    ElMessage.error("Network error occurred while loading profiles");
  }
  loading.value = false;
};

const openCreateDialog = () => {
  dialogMode.value = "create";
  dialogName.value = "";
  dialogError.value = "";
  editingProfile.value = null;
  showDialog.value = true;
};

const openRenameDialog = (profile) => {
  dialogMode.value = "rename";
  dialogName.value = profile.name;
  dialogError.value = "";
  editingProfile.value = profile;
  showDialog.value = true;
};

const closeDialog = () => {
  showDialog.value = false;
};

const submitDialog = async () => {
  const name = dialogName.value.trim();
  if (!/^[a-zA-Z0-9 ]{1,20}$/.test(name)) {
    dialogError.value =
      "Name must be alphanumeric and less than 20 characters.";
    return;
  }

  try {
    let response;
    if (dialogMode.value === "create") {
      response = await createProfile(name);
      if (response && response.status === 1) {
        ElMessage.success(`Profile "${name}" created successfully!`);
        showDialog.value = false;
        fetchProfiles();
      } else {
        dialogError.value = response?.message || "Failed to create profile";
        ElMessage.error(
          `Failed to create profile: ${response?.message || "Unknown error"}`
        );
      }
    } else if (dialogMode.value === "rename" && editingProfile.value) {
      response = await renameProfile(editingProfile.value.name, name);
      if (response && response.status === 1) {
        ElMessage.success(`Profile renamed to "${name}" successfully!`);
        showDialog.value = false;
        fetchProfiles();
      } else {
        dialogError.value = response?.message || "Failed to rename profile";
        ElMessage.error(
          `Failed to rename profile: ${response?.message || "Unknown error"}`
        );
      }
    }
  } catch (error) {
    console.error("Error in dialog operation:", error);
    dialogError.value = "Network error occurred";
    ElMessage.error("Network error occurred");
  }
};

const confirmDelete = (profile) => {
  deleteProfileObj.value = profile;
  showDeleteDialog.value = true;
};

const closeDeleteDialog = () => {
  showDeleteDialog.value = false;
};

const deleteProfileConfirmed = async () => {
  if (deleteProfileObj.value) {
    try {
      const response = await deleteProfile(deleteProfileObj.value.name);
      if (response.status === 1) {
        ElMessage.success(
          `Profile "${deleteProfileObj.value.name}" deleted successfully!`
        );
        showDeleteDialog.value = false;
        fetchProfiles();
      } else {
        console.error("Failed to delete profile:", response.message);
        ElMessage.error(`Failed to delete profile: ${response.message}`);
      }
    } catch (error) {
      console.error("Error deleting profile:", error);
      ElMessage.error("Network error occurred while deleting profile");
    }
  }
};

const enterProfile = async (profile) => {
  try {
    const response = await loadProfile(profile.name);
    if (response.status === 1) {
      ElMessage.success(`Entering profile "${profile.name}"`);
      router.push(`/profile/${profile.name}`);
    } else {
      console.error("Failed to load profile:", response.message);
      ElMessage.error(`Failed to load profile: ${response.message}`);
    }
  } catch (error) {
    console.error("Error loading profile:", error);
    ElMessage.error("Network error occurred while loading profile");
  }
};

const formatCreatedAt = (createdAt) => {
  if (!createdAt) return "Unknown";

  const date = new Date(createdAt);
  const now = new Date();
  const diffTime = now - date;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  // 如果是今天
  if (diffDays === 0) {
    return `Today ${date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  }
  // 如果是昨天
  else if (diffDays === 1) {
    return `Yesterday ${date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  }
  // 如果是一周内
  else if (diffDays < 7) {
    return `${diffDays} days ago`;
  }
  // 其他情况显示完整日期
  else {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }
};

const refreshProfiles = () => {
  ElMessage({
    showClose: true,
    message: "Refreshing profiles...",
    duration: 1000,
  });
  // ElMessage.info("Refreshing profiles...");
  fetchProfiles();
};

onMounted(() => {
  fetchProfiles();
});
</script>

<style scoped>
/* 确保按钮动画效果 */
button:active {
  transform: scale(0.97);
}

/* 用户列表滚动区域的滚动条样式 */
.h-96::-webkit-scrollbar {
  width: 8px;
}

.h-96::-webkit-scrollbar-track {
  background: rgba(243, 244, 246, 0.5);
  border-radius: 4px;
}

.h-96::-webkit-scrollbar-thumb {
  background-color: rgba(156, 163, 175, 0.6);
  border-radius: 4px;
  transition: background-color 0.2s ease;
}

.h-96::-webkit-scrollbar-thumb:hover {
  background-color: rgba(156, 163, 175, 0.8);
}

/* 通用滚动条样式 */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background-color: rgba(156, 163, 175, 0.5);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background-color: rgba(156, 163, 175, 0.7);
}
</style>
