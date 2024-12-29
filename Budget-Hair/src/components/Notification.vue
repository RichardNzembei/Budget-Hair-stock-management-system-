<template>
  <div v-if="!isSubscribed && !hasSubscribedBefore" class="notification-container">
    <div>
      <h3>Notifications Disabled</h3>
      <p>Click the button below to enable notifications.</p>
      <button @click="subscribe">Enable Notifications</button>
    </div>
  </div>
  <div v-if="isSubscribed" class="notification-container">
    <div>
      <h3>Notifications Enabled</h3>
      <p>You will now receive notifications.</p>
      <button @click="unsubscribe">Disable Notifications</button>
    </div>
  </div>
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
    async unsubscribe() {
      console.log('Attempting to unsubscribe from notifications...');
      await this.notificationStore.unsubscribeUser();
      this.isSubscribed = false;
      localStorage.removeItem('isSubscribed');
      console.log('User unsubscribed from notifications.');
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
