<template>
  <div class="p-6 bg-gray-50 min-h-screen">
    <h1 class="text-sky-500 text-3xl font-semibold text-center mb-2">Records</h1>

    <div class="flex justify-center mb-6">
      <button
        class="border border-blue-500 text-blue-500 py-2 px-4 rounded-lg text-sm font-semibold mr-2 transition-all duration-300 ease-in-out transform hover:bg-blue-500 hover:text-white"
        @click="setView('sales')" :class="{ 'bg-blue-500 text-white': currentView === 'sales' }">
        Sales
      </button>
      <button
        class="border border-blue-500 text-blue-500 py-2 px-4 rounded-lg text-sm font-semibold mr-2 transition-all duration-300 ease-in-out transform hover:bg-blue-500 hover:text-white"
        @click="setView('stock')" :class="{ 'bg-blue-500 text-white': currentView === 'stock' }">
        Stock
      </button>
    </div>

    <!-- Sales Records Section -->
    <div v-if="currentView === 'sales'">
      <div v-if="filteredSalesRecords.length === 0" class="text-gray-500 text-center mb-6 font-semibold">
        No sales records found for the selected filter.
      </div>

      <div class="overflow-x-auto bg-white shadow-lg rounded-lg p-4" v-if="filteredSalesRecords.length > 0">
        <h2 class="text-xl text-gray-700 font-semibold mb-4">Sales Records</h2>
        <table class="min-w-full bg-white border border-gray-300 rounded-lg">
          <thead class="bg-gray-100">
            <tr>
              <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Product Type
              </th>
              <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Subtype</th>
              <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Quantity</th>
              <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Date</th>
              <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Time</th>
              <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(record, index) in filteredSalesRecords" :key="index" class="hover:bg-gray-50">
              <td class="px-6 py-4 text-sm text-gray-600">{{ record.productType }}</td>
              <td class="px-6 py-4 text-sm text-gray-600">{{ record.productSubtype }}</td>
              <td class="px-6 py-4 text-sm text-gray-600">{{ record.quantitySold }}</td>
              <td class="px-6 py-4 text-sm text-gray-600">{{ record.date }}</td>
              <td class="px-6 py-4 text-sm text-gray-600">{{ record.time }}</td>

              <td class="px-6 py-4 text-sm ">
                <button @click="deleteSale(record.id, record.productType, record.productSubtype, record.quantitySold)"
                  class="text-red-500 hover:text-red-700 hover:underline">
                  Restore
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Stock History Section -->
    <div v-if="currentView === 'stock'">
      <div v-if="filteredStockHistory.length === 0" class="text-gray-500 text-center mb-6 font-semibold">
        No stock history found for <span
          class="today text-green-400 bg-white rounded-lg shadow-lg p-1 font-bold font-sans text-sm tracking-wide">
          today
        </span> .
      </div>

      <div class="overflow-x-auto bg-white shadow-lg rounded-lg p-4" v-if="filteredStockHistory.length > 0">
        <h2 class="text-xl text-gray-700 font-semibold mb-4">Stock History</h2>
        <table class="min-w-full bg-white border border-gray-300 rounded-lg">
          <thead class="bg-gray-100">
            <tr>
              <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Product Type
              </th>
              <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Subtype</th>
              <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Quantity</th>
              <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Date</th>
              <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Time</th>
              <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(record, index) in filteredStockHistory" :key="index" class="hover:bg-gray-50">
              <td class="px-6 py-4 text-sm text-gray-600">{{ record.productType }}</td>
              <td class="px-6 py-4 text-sm text-gray-600">{{ record.productSubtype }}</td>
              <td class="px-6 py-4 text-sm text-gray-600">{{ record.quantity }}</td>
              <td class="px-6 py-4 text-sm text-gray-600">{{ record.date }}</td>
              <td class="px-6 py-4 text-sm text-gray-600">{{ record.time }}</td>
              <td class="px-6 py-4 text-sm text-gray-600">{{ record.action }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useSalesStore } from "@/stores/salesStore";
import { useStockStore } from "@/stores/stockStore";
import Swal from "sweetalert2";

// Access the stores
const salesStore = useSalesStore();
const stockStore = useStockStore();
const currentView = ref('sales');

const filter = ref('allTime');

const setView = (view) => {
  currentView.value = view;
};

const filteredSalesRecords = computed(() => {
  if (!salesStore.sales || salesStore.sales.length === 0) {
    return [];
  }

  const now = new Date();
  return salesStore.sales
    .filter((sale) => {
      const saleDate = new Date(sale.saleTime);
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
      date: new Date(sale.saleTime).toLocaleDateString(),
      time: new Date(sale.saleTime).toLocaleTimeString(),
    }))
    .sort((a, b) => new Date(b.saleTime) - new Date(a.saleTime));
});

const filteredStockHistory = computed(() => {
  const now = new Date();

  return stockStore.stockHistory
    .filter((historyRecord) => {
      const { timestamp } = historyRecord;
      if (!timestamp) {
        console.log('Invalid timestamp:', timestamp);
        return false;
      }

      const historyDate = new Date(timestamp);

      if (!historyDate.getTime()) {
        console.log('Invalid Date:', historyDate);
        return false;
      }

      if (filter.value === 'daily') {
        return historyDate.toDateString() === now.toDateString();
      } else if (filter.value === 'monthly') {
        return (
          historyDate.getMonth() === now.getMonth() &&
          historyDate.getFullYear() === now.getFullYear()
        );
      } else if (filter.value === 'allTime') {
        return true;
      }
      return true;
    })
    .map((historyRecord) => {
      const { timestamp } = historyRecord;
      const historyDate = new Date(timestamp);

      return {
        ...historyRecord,
        date: historyDate.toLocaleDateString(),
        time: historyDate.toLocaleTimeString(),
      };
    })
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
});


onMounted(() => {

  salesStore.initSocket();
  stockStore.initSocket();
});

const deleteSale = async (saleId, productType, productSubtype, quantitySold) => {

  salesStore.deleteSale(saleId, productType, productSubtype, quantitySold);



}


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