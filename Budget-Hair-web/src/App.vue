<script setup>
import { onMounted, onUnmounted } from 'vue';
import Navbar from './components/navbar.vue';
import { RouterView } from 'vue-router';
import { useStockStore } from '@/stores/stockStore';
import { useSalesStore } from '@/stores/salesStore';

const stockStore = useStockStore();
const salesStore = useSalesStore();

onMounted(() => {
  stockStore.fetchStock();
  salesStore.fetchSales();
  stockStore.initSocket();
  salesStore.initSocket();
});

onUnmounted(() => {
  stockStore.disconnectSocket();
  salesStore.disconnectSocket();
});
</script>

<template>
 <div class="bg-gray-50 min-h-screen">
  <Navbar />
  <div class="mt-20">
    <RouterView />
  </div>
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
