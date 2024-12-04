<template>
  <div class="p-6">
    <h1 class="text-sky-500 text-3xl font-semibold text-center mb-6">Sales Records</h1>

    <!-- Filters for Daily, Weekly, Monthly -->
    <div class="flex justify-center mb-6">
      <button 
        class="border border-blue-500 text-blue-500 py-2 px-4 rounded-lg text-sm font-semibold mr-2"
        @click="setFilter('daily')" 
        :class="{'bg-blue-500 text-white': filter === 'daily'}">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 inline-block mr-2" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fill-rule="evenodd" d="M4.75 3.5A.75.75 0 015.5 3h9a.75.75 0 01.75.75V4h2.5a.75.75 0 01.75.75v11a.75.75 0 01-.75.75H3a.75.75 0 01-.75-.75V4.75A.75.75 0 013 4h2.5V3.5a.75.75 0 01.75-.75h9a.75.75 0 01.75.75V4h2.5a.75.75 0 01.75.75v11a.75.75 0 01-.75.75H3a.75.75 0 01-.75-.75V4.75A.75.75 0 013 4h2.5V3.5z" clip-rule="evenodd" />
        </svg>
        Daily
      </button>

      <button 
        class="border border-blue-500 text-blue-500 py-2 px-4 rounded-lg text-sm font-semibold mr-2"
        @click="setFilter('weekly')" 
        :class="{'bg-blue-500 text-white': filter === 'weekly'}">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 inline-block mr-2" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fill-rule="evenodd" d="M15 2H5a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V4a2 2 0 00-2-2zM5 0a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V2a2 2 0 00-2-2H5z" clip-rule="evenodd" />
        </svg>
        Weekly
      </button>

      <button 
        class="border border-blue-500 text-blue-500 py-2 px-4 rounded-lg text-sm font-semibold"
        @click="setFilter('monthly')" 
        :class="{'bg-blue-500 text-white': filter === 'monthly'}">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 inline-block mr-2" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fill-rule="evenodd" d="M5 4V3a1 1 0 112 0v1h6V3a1 1 0 112 0v1h1a2 2 0 012 2v12a2 2 0 01-2 2H3a2 2 0 01-2-2V6a2 2 0 012-2h1z" clip-rule="evenodd" />
        </svg>
        Monthly
      </button>
    </div>

    <!-- Sales Records Table -->
    <div class="overflow-x-auto">
      <table class="min-w-full bg-white border border-gray-300">
        <thead class="bg-gray-100">
          <tr>
            <th class="px-4 py-2 text-left">Product</th>
            <th class="px-4 py-2 text-left">Quantity</th>
            <th class="px-4 py-2 text-left">Total Sales</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="product in filteredRecords" :key="product.id">
            <td class="px-4 py-2">{{ product.name }}</td>
            <td class="px-4 py-2">{{ product.quantity }}</td>
            <td class="px-4 py-2">{{ currency(product.totalSales) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>


<script setup>
import { ref, computed, onMounted } from 'vue';

// State for filter and product records
const filter = ref('daily');
const records = ref([]);

// Load product records from localStorage
onMounted(() => {
  const storedProducts = JSON.parse(localStorage.getItem('products')) || [];
  records.value = storedProducts;
});

// Computed property to filter records based on the selected filter type (daily, weekly, monthly)
const filteredRecords = computed(() => {
  const now = new Date();

  return records.value.filter((record) => {
    const recordDate = new Date(record.date);

    if (filter.value === 'daily') {
      return recordDate.toDateString() === now.toDateString();
    } else if (filter.value === 'weekly') {
      const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay())); // Get the start of the week
      return recordDate >= startOfWeek && recordDate <= now;
    } else if (filter.value === 'monthly') {
      return (
        recordDate.getMonth() === now.getMonth() && recordDate.getFullYear() === now.getFullYear()
      );
    }

    return true;
  });
});

// Method to set the filter
const setFilter = (value) => {
  filter.value = value;
};

// Currency formatting function
const currency = (value) => {
  return `$${value.toFixed(2)}`;
};
</script>
<style scoped>
/* Custom styling for the records table */
table {
  border-collapse: collapse;
  width: 100%;
}

th, td {
  padding: 12px;
  text-align: left;
}

th {
  background-color: #f8fafc;
}

td {
  border-top: 1px solid #e2e8f0;
}

button {
  transition: background-color 0.3s;
}

button:hover {
  background-color: #3b82f6;
  color: white;
}
</style>
