<template>
  <div v-if="!isSubscribed && !hasSubscribedBefore" class="notification-container">
    <div>
      <h3>Notifications Disabled</h3>
      <p>Click the button below to enable notifications.</p>
      <button @click="subscribe">Enable Notifications</button>
    </div>
  </div>
</template>

<script>
import { useNotificationStore } from '@/stores/notification';

export default {
  data() {
    return {
      isSubscribed: false,
      hasSubscribedBefore: false,  // Flag to track if the user has subscribed before
    };
  },
  computed: {
    notificationStore() {
      return useNotificationStore();
    },
  },
  methods: {
    async subscribe() {
      // Perform subscription logic
      await this.notificationStore.subscribeUser();
      this.isSubscribed = !!this.notificationStore.subscription;

      // Store subscription status in localStorage
      if (this.isSubscribed) {
        localStorage.setItem('isSubscribed', 'true');
      }
    },
    async unsubscribe() {
      // Perform unsubscribe logic
      await this.notificationStore.unsubscribeUser();
      this.isSubscribed = false;

      // Remove subscription status from localStorage
      localStorage.removeItem('isSubscribed');
    },
  },
  mounted() {
    // Check if the user has previously subscribed using localStorage
    const subscriptionStatus = localStorage.getItem('isSubscribed');
    this.hasSubscribedBefore = subscriptionStatus === 'true';  // Set to true if the user subscribed before
    this.isSubscribed = this.hasSubscribedBefore;  // Update subscription status
  },
};
</script>

<style scoped>
.notification-container {
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 10px;
  text-align: center;
  background-color: #f9f9f9;
}

.notification-container h3 {
  margin-bottom: 10px;
}

.notification-container button {
  padding: 10px;
  background-color: #007bff;
  color: #fff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.notification-container button:hover {
  background-color: #0056b3;
}
</style>
