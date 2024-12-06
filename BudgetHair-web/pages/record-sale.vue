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
  
    <!-- No Records Found Message -->
    <div v-if="filteredRecords.length === 0" class="text-gray-500 text-center mb-6 font-semibold">
      No sales records found for the selected filter.
    </div>

    <!-- Records Table -->
    <div class="overflow-x-auto bg-white shadow-lg rounded-lg p-4">
      <table class="min-w-full bg-white border border-gray-300 rounded-lg">
        <thead class="bg-gray-100">
          <tr>
            <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Product Type</th>
            <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Subtype</th>
            <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Quantity</th>
            <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Date</th>
            <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Time</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(record, index) in filteredRecords" :key="index" class="hover:bg-gray-50">
            <td class="px-6 py-4 text-sm text-gray-600">{{ record.productType }}</td>
            <td class="px-6 py-4 text-sm text-gray-600">{{ record.productSubtype }}</td>
            <td class="px-6 py-4 text-sm text-gray-600">{{ record.quantitySold }}</td>
            <td class="px-6 py-4 text-sm text-gray-600">{{ record.date }}</td>
            <td class="px-6 py-4 text-sm text-gray-600">{{ record.time }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    </div>
  </template>
<script setup>
import { ref, computed, onMounted } from 'vue';

// State for filter and sales records
const filter = ref('daily');
const salesRecords = ref([]); // All sales data

// Load sales data from local storage
onMounted(() => {
  const storedSales = JSON.parse(localStorage.getItem('sales')) || [];
  console.log(storedSales); // Log to inspect the data
  salesRecords.value = storedSales.map(sale => {
    const currentDate = new Date(); // Get current date to combine with saleTime
    const saleTime = sale.saleTime; // e.g., '07:22:52 PM'

    // Construct a full Date object using today's date and the sale time
    const saleDate = new Date(`${currentDate.toLocaleDateString()} ${saleTime}`);

    // Add formatted date and time fields
    return {
      ...sale,
      saleDate, // Store the full Date object for sorting later
      date: saleDate.toLocaleDateString(),  // Format the date
      time: saleDate.toLocaleTimeString(),  // Format the time
    };
  });
});

// Computed property to filter and sort records based on the selected filter type (daily, weekly, monthly)
const filteredRecords = computed(() => {
  const now = new Date();

  let filtered = salesRecords.value.filter((sale) => {
    const saleDate = new Date(sale.date);

    if (filter.value === 'daily') {
      return saleDate.toDateString() === now.toDateString();
    } else if (filter.value === 'weekly') {
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay()); // Start of the week (Sunday)
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6); // End of the week (Saturday)
      return saleDate >= startOfWeek && saleDate <= endOfWeek;
    } else if (filter.value === 'monthly') {
      return (
        saleDate.getMonth() === now.getMonth() &&
        saleDate.getFullYear() === now.getFullYear()
      );
    }

    return true; // Default case: no filter applied
  });

  // Sort records by saleDate in descending order (most recent first)
  return filtered.sort((a, b) => b.saleDate - a.saleDate);
});

// Method to set the filter
const setFilter = (value) => {
  filter.value = value;
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
  text-transform: capitalize;
}

button {
  transition: background-color 0.3s;
}

button:hover {
  background-color: #3b82f6;
  color: white;
}

tr:hover {
  background-color: #f1f5f9;
}
</style>
  