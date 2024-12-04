<template>
    <div class="p-6">
      <h1 class="text-sky-500 text-3xl font-semibold text-center mb-6">Sales Records</h1>
  
      <!-- Filters for Daily, Weekly, Monthly -->
      <div class="flex justify-center mb-6">
        <UButton 
      variant="outline" 
      size="sm" 
      @click="setFilter('daily')" 
      :class="{'bg-blue-500 text-white': filter === 'daily'}">
      <span class="material-icons mr-2">calendar_today</span>
      Daily
    </UButton>

    <UButton 
      variant="outline" 
      size="sm" 
      @click="setFilter('weekly')" 
      :class="{'bg-blue-500 text-white': filter === 'weekly'}">
      <span class="material-icons mr-2">calendar_view_week</span>
      Weekly
    </UButton>

    <UButton 
      variant="outline" 
      size="sm" 
      @click="setFilter('monthly')" 
      :class="{'bg-blue-500 text-white': filter === 'monthly'}">
      <span class="material-icons mr-2">calendar_view_month</span>
      Monthly
    </UButton>
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
              <td class="px-4 py-2">{{ product.totalSales | currency }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed } from 'vue';
 
  
  // Dummy records data
  const records = ref([
    { id: 1, name: 'Braids', quantity: 10, totalSales: 100, date: '2024-12-03' },
    { id: 2, name: 'Weaves', quantity: 5, totalSales: 50, date: '2024-12-04' },
    { id: 3, name: 'Curls', quantity: 20, totalSales: 200, date: '2024-12-01' },
    { id: 4, name: 'Straight Hair', quantity: 7, totalSales: 70, date: '2024-12-05' },
    // Add more sample records as needed
  ]);
  
  // Ref for filter type (daily, weekly, monthly)
  const filter = ref('daily');
  
  // Filter records based on the selected time filter (Daily, Weekly, Monthly)
  const filteredRecords = computed(() => {
    const now = new Date();
    
    return records.value.filter(record => {
      const recordDate = new Date(record.date);
  
      if (filter.value === 'daily') {
        return recordDate.toDateString() === now.toDateString();
      } else if (filter.value === 'weekly') {
        const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay())); // Get the start of the week
        return recordDate >= startOfWeek && recordDate <= now;
      } else if (filter.value === 'monthly') {
        return recordDate.getMonth() === now.getMonth() && recordDate.getFullYear() === now.getFullYear();
      }
  
      return true;
    });
  });
  
  // Set the filter to daily, weekly, or monthly
  const setFilter = (value) => {
    filter.value = value;
  };
  
  // Currency filter function (just for display purposes)
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
  