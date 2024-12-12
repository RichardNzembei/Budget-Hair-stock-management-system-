<template>
  <div class="notification-container">
    <div v-if="isSubscribed">
      <h3>You are subscribed to notifications!</h3>
      <p>Stay updated with real-time notifications.</p>
      <button @click="unsubscribe">Unsubscribe</button>
    </div>
    <div v-else>
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
    };
  },
  computed: {
    notificationStore() {
      return useNotificationStore();
    },
  },
  methods: {
    async subscribe() {
      await this.notificationStore.subscribeUser();
      this.isSubscribed = !!this.notificationStore.subscription;
    },
    async unsubscribe() {
      await this.notificationStore.unsubscribeUser();
      this.isSubscribed = false;
    },
  },
  mounted() {
    this.isSubscribed = !!this.notificationStore.subscription;
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
