<template>
  <PageLayout>
    <!-- Authorization request status -->
    <div class="flex flex-col items-center justify-center h-full">
      <!-- No access status -->
      <div v-if="!hasAccess && !pending" class="text-center">
        <div
          class="mb-6 w-20 h-20 mx-auto bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center"
        >
          <svg
            class="w-10 h-10 text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            ></path>
          </svg>
        </div>
        <h2 class="text-2xl font-bold text-gray-800 mb-4">
          Authorization Required
        </h2>
        <p class="text-gray-600 mb-8 max-w-md mx-auto">
          To use the EEG device and access brain signals, you need to authorize
          this application.
        </p>
        <button
          @click="requestAuth"
          class="px-8 py-3 bg-blue-600 text-white font-semibold rounded-full hover:bg-blue-700 transition-colors shadow-lg"
        >
          Request Authorization
        </button>
      </div>

      <!-- Authorization pending status -->
      <div v-else-if="pending" class="text-center">
        <div
          class="mb-6 w-20 h-20 mx-auto bg-gradient-to-br from-orange-100 to-orange-200 rounded-full flex items-center justify-center"
        >
          <div class="animate-spin">
            <svg
              class="w-10 h-10 text-orange-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              ></path>
            </svg>
          </div>
        </div>
        <h2 class="text-2xl font-bold text-gray-800 mb-4">
          Waiting for Authorization
        </h2>
        <p class="text-gray-600 mb-8">
          Please check and approve the authorization request...
        </p>
        <div class="flex items-center justify-center text-blue-600">
          <div
            class="animate-pulse w-2 h-2 bg-blue-600 rounded-full mr-1"
          ></div>
          <div
            class="animate-pulse w-2 h-2 bg-blue-600 rounded-full mr-1"
            style="animation-delay: 0.2s"
          ></div>
          <div
            class="animate-pulse w-2 h-2 bg-blue-600 rounded-full"
            style="animation-delay: 0.4s"
          ></div>
        </div>
      </div>

      <!-- Authorization successful status -->
      <div v-else class="text-center">
        <div
          class="mb-6 w-20 h-20 mx-auto bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center"
        >
          <svg
            class="w-10 h-10 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M5 13l4 4L19 7"
            ></path>
          </svg>
        </div>
        <h2 class="text-2xl font-bold text-gray-800 mb-4">
          Authorization Successful
        </h2>
        <p class="text-gray-600 mb-8">
          Great! You now have access to the EEG device.
        </p>
        <button
          @click="goToDevice"
          class="px-8 py-3 bg-green-600 text-white font-semibold rounded-full hover:bg-green-700 transition-colors shadow-lg"
        >
          Connect Device
        </button>
      </div>
    </div>
  </PageLayout>
</template>
