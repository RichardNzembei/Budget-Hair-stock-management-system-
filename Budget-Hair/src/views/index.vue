<template>
  <div class="container mx-auto py-8">
    <h1 class="text-3xl font-bold mb-6 text-center text-sky-500">STOCK DASHBOARD</h1>

    <!-- Dashboard Overview -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
      <!-- Stock Overview -->
      <div class="bg-white p-6 rounded-lg shadow-lg">
        <h2 class="font-semibold text-lg mb-4 text-gray-700">STOCK OVERVIEW</h2>
        <ul class="space-y-6">
          <li v-for="(subtypes, productType) in stock" :key="productType" class="bg-gray-50 p-4 rounded-md shadow-md hover:bg-gray-100 transition duration-300">
            <h3 class="font-semibold text-xl text-indigo-600 mb-2">{{ productType.toUpperCase() }}</h3>
            <ul class="space-y-2">
              <li v-for="(quantity, productSubtype) in subtypes" :key="productSubtype" class="text-gray-800 space-x-4">
                <span class="font-medium text-gray-600">{{ productSubtype.toUpperCase() }}:</span> 
                <span class="text-green-500 font-semibold">{{ quantity }}</span>
              </li>
            </ul>
          </li>
        </ul>
      </div>

      <!-- Sales Overview -->
      <div class="bg-white p-6 rounded shadow-md">
        <h2 class="font-semibold text-lg mb-4 text-gray-700">SALES OVERVIEW</h2>
        <ul class="space-y-4">
          <li v-for="sale in salesItems" :key="sale.id" class="bg-gray-50 p-4 rounded-md shadow-md hover:bg-gray-100 transition duration-300">
            <strong class="text-indigo-600">{{ sale.productType.toUpperCase() }}</strong><br>
            <span class="text-gray-600">{{ sale.productSubtype.toUpperCase() }}:</span> 
            <span class="text-red-500">{{ sale.quantitySold }} SOLD</span>
            <span class="text-gray-400"> ON {{ sale.saleDate.toUpperCase() }}</span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

// Reactive references
const stock = ref({});
const salesItems = ref([]);

// Load stock and sales data from localStorage
const loadStockFromLocalStorage = () => {
  const storedStock = localStorage.getItem('stock');
  if (storedStock) {
    stock.value = JSON.parse(storedStock);
  }

  const storedSales = JSON.parse(localStorage.getItem('sales')) || [];
  salesItems.value = storedSales;
};

// Initialize data on component mount
onMounted(loadStockFromLocalStorage);
</script>

<style scoped>
/* Custom styles to improve the presentation */
h3 {
  letter-spacing: 0.5px;
}

ul {
  padding-left: 20px;
}

ul li {
  font-size: 1rem;
}

ul li:hover {
  background-color: #f3f4f6;
  cursor: pointer;
}

h2, h3, strong, span {
  text-transform: uppercase;
}
</style>
