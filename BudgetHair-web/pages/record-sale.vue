<template>
  <div class="p-6 bg-gray-50 min-h-screen">
    <h1 class="text-sky-500 text-3xl font-semibold text-center mb-6">Sales Records</h1>

    <div class="flex justify-center mb-6">
      <button
        class="border border-blue-500 text-blue-500 py-2 px-4 rounded-lg text-sm font-semibold mr-2 transition-all duration-300 ease-in-out transform hover:bg-blue-500 hover:text-white"
        @click="setFilter('daily')" :class="{ 'bg-blue-500 text-white': filter === 'daily' }">
        Daily
      </button>

      <button
        class="border border-blue-500 text-blue-500 py-2 px-4 rounded-lg text-sm font-semibold mr-2 transition-all duration-300 ease-in-out transform hover:bg-blue-500 hover:text-white"
        @click="setFilter('weekly')" :class="{ 'bg-blue-500 text-white': filter === 'weekly' }">
        Weekly
      </button>

      <button
        class="border border-blue-500 text-blue-500 py-2 px-4 rounded-lg text-sm font-semibold transition-all duration-300 ease-in-out transform hover:bg-blue-500 hover:text-white"
        @click="setFilter('monthly')" :class="{ 'bg-blue-500 text-white': filter === 'monthly' }">
        Monthly
      </button>
    </div>
    <div v-if="loading" class="text-center text-gray-500">Loading sales records...</div>

    <div v-if="filteredRecords.length === 0 && !loading" class="text-gray-500 text-center mb-6 font-semibold">
      No sales records found for the selected filter.
    </div>

    <div v-if="!loading" class="overflow-x-auto bg-white shadow-lg rounded-lg p-4">
      <table class="min-w-full bg-white border border-gray-300 rounded-lg">
        <thead class="bg-gray-100">
          <tr>
            <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Product Type
            </th>
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
import { useSalesStore } from "@/stores/salesStore";
const filter = ref('daily');
const loading = ref(true);
const salesStore = useSalesStore();

const loadSalesData = async () => {
  try {
    await salesStore.fetchSales();
  } catch (error) {
    console.error("Error loading sales data", error);
  } finally {
    loading.value = false;
  }
};

const convertToDate = (saleTime) => {
  return new Date(saleTime);
};

const filteredRecords = computed(() => {
  const now = new Date();
  const sales = salesStore.sales.map((sale) => {
    console.log('Raw saleTime:', sale.saleTime);
    return {
      ...sale,
      saleTime: convertToDate(sale.saleTime),
    };
  });

  console.log(sales);

  return sales
    .filter((sale) => {
      const saleDate = sale.saleTime;
      console.log('Comparing saleDate:', saleDate, 'to now:', now);
      if (filter.value === 'daily') {
        return saleDate.toDateString() === now.toDateString();
      } else if (filter.value === 'weekly') {
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        return saleDate >= startOfWeek && saleDate <= endOfWeek;
      } else if (filter.value === 'monthly') {
        return (
          saleDate.getMonth() === now.getMonth() &&
          saleDate.getFullYear() === now.getFullYear()
        );
      }
      return true;
    })
    .map((sale) => ({
      ...sale,
      date: sale.saleTime.toLocaleDateString(),
      time: sale.saleTime.toLocaleTimeString(),
    }))
    .sort((a, b) => b.saleTime - a.saleTime);
});
const setFilter = (value) => {
  filter.value = value;
};

onMounted(loadSalesData);
</script>

<style scoped>
table {
  border-collapse: collapse;
  width: 100%;
}

th,
td {
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

tr:hover {
  background-color: #f1f5f9;
}
</style>
