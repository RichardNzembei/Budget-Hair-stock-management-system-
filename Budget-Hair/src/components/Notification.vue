<template>
  <transition name="slide-down">
    <div 
      v-if="!isSubscribed && !hasSubscribedBefore" 
      class="fixed bottom-6 right-6 z-50 max-w-md w-full"
    >
      <div class="bg-white p-6 rounded-xl shadow-xl border border-gray-200/80 backdrop-blur-sm">
        <div class="flex items-start space-x-4">
          <div class="flex-shrink-0 p-2 bg-amber-100 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          
          <div class="flex-1">
            <h3 class="text-lg font-semibold text-gray-900 mb-1">
              Notifications Disabled
            </h3>
            <p class="text-gray-600 mb-4">
              Enable system notifications to receive important updates about your inventory.
            </p>
            
            <div class="flex space-x-3">
              <button 
                @click="subscribe"
                class="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
              >
                Enable Notifications
              </button>
              
              <button 
                @click="hasSubscribedBefore = true"
                class="px-4 py-2 text-gray-600 font-medium rounded-lg hover:bg-gray-100 transition-colors duration-200"
              >
                Remind Me Later
              </button>
            </div>
          </div>
          
          <button 
            @click="hasSubscribedBefore = true"
            class="text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import { useNotificationStore } from '@/stores/notification';

export default {
  data() {
    return {
      isSubscribed: false,
      hasSubscribedBefore: false,
    };
  },
  computed: {
    notificationStore() {
      return useNotificationStore();
    },
  },
  methods: {
    async subscribe() {
      console.log('Attempting to subscribe for notifications...');
      await this.notificationStore.subscribeUser();
      this.isSubscribed = !!this.notificationStore.subscription;

      if (this.isSubscribed) {
        console.log('Subscription successful.');
        localStorage.setItem('isSubscribed', 'true');
      } else {
        console.log('Subscription failed.');
      }
    },
  },
  mounted() {
    // Check if the user has subscribed previously from localStorage
    const subscriptionStatus = localStorage.getItem('isSubscribed');
    this.hasSubscribedBefore = subscriptionStatus === 'true';
    this.isSubscribed = this.hasSubscribedBefore;

    console.log(`Subscription status on mount: ${this.isSubscribed ? 'Subscribed' : 'Not Subscribed'}`);
  },
};
</script>

<style scoped>
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s cubic-bezier(0.68, -0.55, 0.27, 1.55);
}

.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

/* Animation for the enable button */
button:active {
  transform: translateY(1px) !important;
}
</style>