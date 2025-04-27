<template>
  <div class="p-6 ">
    <!-- Header Section -->
    <div class="max-w-7xl mx-auto">
      <div class="text-center mb-8">
        <h1 class="text-md font-bold bg-gradient-to-r from-sky-500 to-blue-600 bg-clip-text text-transparent mb-2">
          Sales Records
        </h1>
        <p class="text-gray-500 text-sm">Track sales history</p>
      </div>

      <!-- Filter Buttons -->
      <div class="flex flex-wrap justify-center gap-2 mb-8">
        <button
          v-for="(btn, index) in filters"
          :key="index"
          @click="setFilter(btn.value)"
          class="px-4 py-2 rounded-full text-sm font-medium transition-all duration-200"
          :class="{
            'bg-blue-500 text-white shadow-md': filter === btn.value,
            'bg-white text-gray-600 border border-gray-200 hover:border-blue-300 hover:text-blue-500': filter !== btn.value
          }"
        >
          {{ btn.label }}
        </button>
      </div>

      <!-- Empty State -->
      <div 
        v-if="filteredRecords.length === 0" 
        class="bg-white rounded-xl shadow-sm p-8 text-center max-w-2xl mx-auto"
      >
        <div class="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 class="text-lg font-medium text-gray-700 mb-1">No sales records found</h3>
        <p class="text-gray-500 text-sm">Your sales will appear here when you make transactions</p>
      </div>

      <!-- Sales Table -->
      <div v-else class="bg-white rounded-xl shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th 
                  v-for="(header, index) in headers" 
                  :key="index"
                  scope="col" 
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  <div class="flex items-center">
                    {{ header }}
                    <svg v-if="index < headers.length - 1" xmlns="http://www.w3.org/2000/svg" class="ml-1 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                    </svg>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr 
                v-for="(record, index) in filteredRecords" 
                :key="index" 
                class="hover:bg-gray-50 transition-colors duration-150"
                :class="{ 'bg-blue-50': record.isSameDay }"
              >
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="flex-shrink-0 h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                    </div>
                    <div class="ml-4">
                      <div class="text-sm font-medium text-gray-900 capitalize">{{ record.productType }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-600 capitalize">{{ record.productSubtype }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    {{ record.quantitySold }} sold
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {{ record.date }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  <div class="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-400 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {{ record.time }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button 
                    @click="deleteSale(record.id, record.productType, record.productSubtype, record.quantitySold)"
                    class="text-blue-600 hover:text-blue-900 mr-4 inline-flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Restore
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <!-- Pagination would go here -->
        <div class="bg-gray-50 px-6 py-3 flex items-center justify-between border-t border-gray-200">
          <div class="flex-1 flex justify-between sm:hidden">
            <a href="#" class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
              Previous
            </a>
            <a href="#" class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
              Next
            </a>
          </div>
          <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p class="text-sm text-gray-700">
                Showing <span class="font-medium">1</span> to <span class="font-medium">10</span> of <span class="font-medium">20</span> results
              </p>
            </div>
            <div>
              <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <a href="#" class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                  <span class="sr-only">Previous</span>
                  <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
                  </svg>
                </a>
                <a href="#" aria-current="page" class="z-10 bg-blue-50 border-blue-500 text-blue-600 relative inline-flex items-center px-4 py-2 border text-sm font-medium">
                  1
                </a>
                <a href="#" class="bg-white border-gray-300 text-gray-500 hover:bg-gray-50 relative inline-flex items-center px-4 py-2 border text-sm font-medium">
                  2
                </a>
                <a href="#" class="bg-white border-gray-300 text-gray-500 hover:bg-gray-50 relative inline-flex items-center px-4 py-2 border text-sm font-medium">
                  3
                </a>
                <a href="#" class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                  <span class="sr-only">Next</span>
                  <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                  </svg>
                </a>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useSalesStore } from "@/stores/salesStore";
import Swal from "sweetalert2";

const salesStore = useSalesStore();
const filter = ref('daily');

// Filter options
const filters = [
  { label: 'Daily', value: 'daily' },
  { label: 'Monthly', value: 'monthly' },
  { label: 'All Time', value: 'allTime' }
];

// Table headers
const headers = ['Product Type', 'Subtype', 'Quantity', 'Date', 'Time', 'Actions'];

const setFilter = (value) => {
  filter.value = value;
};

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
      date: sale.saleTime.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }),
      time: sale.saleTime.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }),
      isSameDay: sale.saleTime.toDateString() === now.toDateString(),
    }))
    .sort((a, b) => b.saleTime - a.saleTime);
});

// Fetch sales data on mounted
onMounted(() => {
  salesStore.initSocket();
});

const deleteSale = async (saleId, productType, productSubtype, quantitySold) => {
  salesStore.deleteSale(saleId, productType, productSubtype, quantitySold);
};
</script>

<style scoped>
/* Smooth transitions for table rows */
tr {
  transition: background-color 0.2s ease;
}

/* Highlight today's sales */
.bg-blue-50 {
  background-color: rgba(239, 246, 255, 0.5);
}

/* Better hover effect for buttons */
button {
  transition: all 0.2s ease;
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .hidden-mobile {
    display: none;
  }
}
</style>