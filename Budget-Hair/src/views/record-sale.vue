<template>
  <div class="p-6">
    <h1 class="text-sky-500 text-3xl font-semibold text-center mb-6">Sales Records</h1>

    <!-- Filters for Daily, Weekly, Monthly -->
    <div class="flex justify-center mb-6">
      <button 
        class="border border-blue-500 text-blue-500 py-2 px-4 rounded-lg text-sm font-semibold mr-2"
        @click="setFilter('daily')" 
        :class="{'bg-blue-500 text-white': filter === 'daily'}">
        Daily
      </button>

      <button 
        class="border border-blue-500 text-blue-500 py-2 px-4 rounded-lg text-sm font-semibold mr-2"
        @click="setFilter('weekly')" 
        :class="{'bg-blue-500 text-white': filter === 'weekly'}">
        Weekly
      </button>

      <button 
        class="border border-blue-500 text-blue-500 py-2 px-4 rounded-lg text-sm font-semibold"
        @click="setFilter('monthly')" 
        :class="{'bg-blue-500 text-white': filter === 'monthly'}">
        Monthly
      </button>
    </div>

    <!-- No Records Found Message -->
    <div v-if="filteredRecords.length === 0" class="text-gray-500 text-center mb-6">
      No sales records found for the selected filter.
    </div>

    <!-- Records Table -->
    <div class="overflow-x-auto">
      <table class="min-w-full bg-white border border-gray-300">
        <thead class="bg-gray-100">
          <tr>
            <th class="px-4 py-2 text-left">Product Type</th>
            <th class="px-4 py-2 text-left">Subtype</th>
            <th class="px-4 py-2 text-left">Quantity</th>
            <th class="px-4 py-2 text-left">Date</th>
            <th class="px-4 py-2 text-left">Time</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(record, index) in filteredRecords" :key="index">
            <td class="px-4 py-2">{{ record.productType }}</td>
            <td class="px-4 py-2">{{ record.productSubtype }}</td>
            <td class="px-4 py-2">{{ record.quantitySold }}</td>
            <td class="px-4 py-2">{{ record.date }}</td>
            <td class="px-4 py-2">{{ record.time }}</td>
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
}

button {
  transition: background-color 0.3s;
}

button:hover {
  background-color: #3b82f6;
  color: white;
}
</style>
