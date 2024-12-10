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
        @click="setFilter('monthly')" :class="{ 'bg-blue-500 text-white': filter === 'monthly' }">
        Monthly
      </button>
      <button
        class="border border-blue-500 text-blue-500 py-2 px-4 rounded-lg text-sm font-semibold transition-all duration-300 ease-in-out transform hover:bg-blue-500 hover:text-white"
        @click="setFilter('allTime')" :class="{ 'bg-blue-500 text-white': filter === 'allTime' }">
        All Time
      </button>
    </div>

    <div v-if="filteredRecords.length === 0" class="text-gray-500 text-center mb-6 font-semibold">
      No sales records found for the selected filter.
    </div>

    <div class="overflow-x-auto bg-white shadow-lg rounded-lg p-4" v-if="filteredRecords.length > 0">
      <table class="min-w-full bg-white border border-gray-300 rounded-lg">
        <thead class="bg-gray-100">
          <tr>
            <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Product Type</th>
            <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Subtype</th>
            <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Quantity</th>
            <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Date</th>
            <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Time</th>
            <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(record, index) in filteredRecords" :key="index" class="hover:bg-gray-50">
            <td class="px-6 py-4 text-sm text-gray-600">{{ record.productType }}</td>
            <td class="px-6 py-4 text-sm text-gray-600">{{ record.productSubtype }}</td>
            <td class="px-6 py-4 text-sm text-gray-600">{{ record.quantitySold }}</td>
            <td class="px-6 py-4 text-sm text-gray-600">{{ record.date }}</td>
            <td class="px-6 py-4 text-sm text-gray-600">{{ record.time }}</td>
            <td class="px-6 py-4 text-sm ">
              <button 
                @click="deleteSale(record.id, record.productType, record.productSubtype, record.quantitySold)"
                class="text-red-500 hover:text-red-700 hover:underline"
              >
                Restore
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useSalesStore } from "@/stores/salesStore";
import Swal from "sweetalert2";


// Access the store
const salesStore = useSalesStore();
const filter = ref('daily');

// Set filter function
const setFilter = (value) => {
  filter.value = value;
};

// Computed property to filter sales
const filteredRecords = computed(() => {
  if (!salesStore.sales || salesStore.sales.length === 0) {
    return [];
  }

  const now = new Date();
  const sales = salesStore.sales.map((sale) => {
    return {
      ...sale,
      saleTime: new Date(sale.saleTime),
    };
  });

  return sales
    .filter((sale) => {
      const saleDate = sale.saleTime;
      if (filter.value === 'daily') {
        return saleDate.toDateString() === now.toDateString();
      } else if (filter.value === 'monthly') {
        return (
          saleDate.getMonth() === now.getMonth() &&
          saleDate.getFullYear() === now.getFullYear()
        );
      } else if (filter.value === 'allTime') {
        return true;
      }
      return true;
    })
    .map((sale) => ({
      ...sale,
      date: sale.saleTime.toLocaleDateString(),
      time: sale.saleTime.toLocaleTimeString(),
      isSameDay: sale.saleTime.toDateString() === now.toDateString(),
    }))
    .sort((a, b) => b.saleTime - a.saleTime);
});

// Fetch sales data on mounted
onMounted(() => {
  salesStore.fetchSales();
  salesStore.initSocket();
});

const deleteSale = (saleId, productType, productSubtype, quantitySold) => {
  Swal.fire({
    title: "Are you sure?",
    text: `You are about to restore the sale of ${quantitySold} ${productSubtype}(s) under ${productType}. This action cannot be undone.`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Yes, restore it!",
  }).then((result) => {
    if (result.isConfirmed) {
      salesStore.deleteSale(saleId, productType, productSubtype, quantitySold);
      Swal.fire("Restored!", "The sale has been restored.", "success");
    }
  });
};
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

tr.same-day {
  background-color: #f0f9ff;
}

button {
  transition: background-color 0.3s;
}



tr:hover {
  background-color: #f1f5f9;
}
</style>
