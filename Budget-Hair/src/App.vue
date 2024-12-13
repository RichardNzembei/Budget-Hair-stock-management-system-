<script setup>
import { onMounted, onUnmounted, ref } from 'vue';
import Navbar from './components/navbar.vue';
import Notification from './components/Notification.vue';
import { RouterView } from 'vue-router';
import { useStockStore } from '@/stores/stockStore';
import { useSalesStore } from '@/stores/salesStore';
import { useNotificationStore } from '@/stores/notification';

// Create store instances
const stockStore = useStockStore();
const salesStore = useSalesStore();
const notificationStore = useNotificationStore();

const isSubscribed = ref(false);

onMounted(() => {
  // Initialize stores
  stockStore.fetchStock();
  salesStore.fetchSales();
  stockStore.initSocket();
  salesStore.initSocket();

  // Check if the user is already subscribed for notifications
  if (notificationStore.subscription) {
    isSubscribed.value = true;
  } else {
    isSubscribed.value = false;
  }

  // Initialize socket for notification updates
  notificationStore.initSocket();
});

onUnmounted(() => {
  // Disconnect sockets when the component is unmounted
  stockStore.disconnectSocket();
  salesStore.disconnectSocket();
  notificationStore.disconnectSocket();
});
</script>

<template>
  <Navbar />
  <Notification />
  <div class="mt-20">
    <RouterView />
  </div>
</template>

<style scoped>
.mt-20 {
  margin-top: 60px;
}

@media (min-width: 1024px) {
  .mt-20 {
    margin-top: 80px;
  }
}
</style>
