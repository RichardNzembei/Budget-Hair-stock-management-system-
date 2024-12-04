<template>
    <div class="container mx-auto py-8">
      <h1 class="text-sky-500 text-center text-2xl font-semibold mb-4">Stock Dashboard</h1>
  
      <!-- Stock Overview -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div class="bg-white p-6 rounded shadow-md">
          <h2 class="font-semibold text-lg mb-4">Stock Overview</h2>
          <ul>
            <li v-for="item in stockItems" :key="item.id" class="mb-2">
              <strong>{{ item.productType }}</strong>: {{ item.quantity }} units in stock
            </li>
          </ul>
        </div>
  
        <!-- Sales Overview -->
        <div class="bg-white p-6 rounded shadow-md">
          <h2 class="font-semibold text-lg mb-4">Sales Overview</h2>
          <ul>
            <li v-for="sale in salesItems" :key="sale.id" class="mb-2">
              Sold {{ sale.quantitySold }} of {{ sale.productName }} for ${{ sale.salePrice }}
            </li>
          </ul>
        </div>
      </div>
  
    
    </div>
  </template>
  
  <script>
  import { ref } from 'vue';
  
  export default {
    props: {
      stockItems: Array,
      salesItems: Array
    }
  };
  </script>
  