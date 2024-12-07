<script setup>
import Navbar from './components/navbar.vue';

import { RouterView } from 'vue-router';
</script>

<template>
  <Navbar />
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
