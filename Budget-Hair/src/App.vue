<script setup>
import { onMounted, onUnmounted, ref } from 'vue';
import Navbar from './components/navbar.vue';
import Notification from './components/Notification.vue';
import { RouterView } from 'vue-router';
import { useStockStore } from '@/stores/stockStore';
import { useSalesStore } from '@/stores/salesStore';
import { useNotificationStore } from '@/stores/notification';

const stockStore = useStockStore();
const salesStore = useSalesStore();
const notificationStore = useNotificationStore();

const isSubscribed = ref(false);
onMounted(() => {
  stockStore.syncStockData();
  stockStore.fetchStock(true); // 👈 force fetch from server
  salesStore.fetchSales();
  stockStore.initSocket();
  salesStore.initSocket();

  if (notificationStore.subscription) {
    isSubscribed.value = true;
  } else {
    isSubscribed.value = false;
  }

  notificationStore.initSocket();
});


onUnmounted(() => {
  stockStore.disconnectSocket();
  salesStore.disconnectSocket();
  notificationStore.disconnectSocket();
});
</script>

<template>
  <Navbar/>
  <Notification />
  <div class="mt-20 bg-gray-50 min-h-screen">
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