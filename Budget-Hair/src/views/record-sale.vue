<template>
  <div class="p-6 max-w-7xl mx-auto">
    <!-- Header Section -->
    <div class="text-center mb-8">
      <h1 class="text-md font-bold text-sky-600 mb-2">Records</h1>
      <p class="text-gray-500">View and manage your sales and stock history</p>
    </div>

    <!-- View Toggle Buttons -->
    <div class="flex justify-center mb-8">
      <div class="inline-flex rounded-lg shadow-sm border border-gray-200 bg-white p-1">
        <button
          @click="setView('sales')"
          class="px-6 py-2 text-sm font-medium rounded-md transition-all duration-200"
          :class="{
            'bg-sky-600 text-white shadow-sm': currentView === 'sales',
            'text-gray-600 hover:bg-gray-100': currentView !== 'sales'
          }"
        >
          Sales Records
        </button>
        <button
          @click="setView('stock')"
          class="px-6 py-2 text-sm font-medium rounded-md transition-all duration-200"
          :class="{
            'bg-sky-600 text-white shadow-sm': currentView === 'stock',
            'text-gray-600 hover:bg-gray-100': currentView !== 'stock'
          }"
        >
          Stock History
        </button>
      </div>
    </div>

    <!-- Filter Controls -->
    <div class="flex flex-col md:flex-row justify-between items-center mb-6">
      <div v-if="currentView === 'sales'" class="flex flex-wrap space-x-2 mb-4 md:mb-0">
        <button
          @click="setFilter('daily')"
          class="px-4 py-1.5 text-xs font-medium rounded-full border transition-colors"
          :class="{
            'border-sky-600 bg-sky-50 text-sky-600': filter === 'daily',
            'border-gray-300 text-gray-600 hover:bg-gray-50': filter !== 'daily'
          }"
        >
          Today
        </button>
        <button
          @click="setFilter('last4Days')"
          class="px-4 py-1.5 text-xs font-medium rounded-full border transition-colors"
          :class="{
            'border-sky-600 bg-sky-50 text-sky-600': filter === 'last4Days',
            'border-gray-300 text-gray-600 hover:bg-gray-50': filter !== 'last4Days'
          }"
        >
          Last 4 Days
        </button>
        <button
          @click="setFilter('allTime')"
          class="px-4 py-1.5 text-xs font-medium rounded-full border border-purple-600 bg-purple-50 text-purple-600 hover:bg-purple-100 transition-colors"
        >
          All Time
        </button>
        <button
          @click="toggleDateRangePicker"
          class="px-4 py-1.5 text-xs font-medium rounded-full border border-gray-300 text-gray-600 hover:bg-gray-50 flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Custom Range
        </button>
      </div>
      <div class="text-sm text-gray-500">
        Showing {{ currentView === 'sales' ? filteredSalesRecords.length : filteredStockHistory.length }} records
      </div>
    </div>

    <!-- Date Range Picker -->
    <div v-if="showDateRangePicker && currentView === 'sales'" class="mb-6 bg-white p-4 rounded-xl shadow-sm border border-gray-200">
      <div class="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
          <input
            v-model="dateRange.start"
            type="date"
            class="block w-full rounded-md border-gray-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">End Date</label>
          <input
            v-model="dateRange.end"
            type="date"
            class="block w-full rounded-md border-gray-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm"
          />
        </div>
        <div class="flex space-x-2">
          <button
            @click="applyDateRange"
            class="px-4 py-2 text-sm font-medium text-white bg-sky-600 rounded-md hover:bg-sky-700"
          >
            Apply
          </button>
          <button
            @click="clearDateRange"
            class="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            Clear
          </button>
        </div>
      </div>
    </div>

    <!-- Sales Records Section -->
    <div v-if="currentView === 'sales'">
      <div class="mb-4 text-sm text-gray-500" v-if="filter === 'last4Days'">
        <p>Showing sales records for the last 4 days. Use filters or custom date range for other periods.</p>
      </div>
      <div v-if="filteredSalesRecords.length === 0" class="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 class="text-lg font-medium text-gray-700 mb-1">No sales records found</h3>
        <p class="text-gray-500">Try adjusting your filters or check back later</p>
      </div>

      <div v-else class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 class="text-lg font-semibold text-gray-800">Sales Records</h2>
          <span class="text-sm text-gray-500">{{ filteredSalesRecords.length }} records</span>
        </div>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subtype</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="(record, index) in filteredSalesRecords" :key="record.id" class="hover:bg-gray-50 transition-colors duration-150">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ record.productType }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ record.productSubtype }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ record.quantitySold }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ record.date }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ record.time }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <button 
                    @click="deleteSale(record.id, record.productType, record.productSubtype, record.quantitySold)"
                    class="text-sky-600 hover:text-sky-800 font-medium hover:underline flex items-center"
                    :disabled="salesStore.loading"
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
      </div>
    </div>

    <!-- Stock History Section -->
    <div v-if="currentView === 'stock'">
      <div class="mb-4 text-sm text-gray-500">
        <p>Showing stock history for today.</p>
      </div>
      <div v-if="filteredStockHistory.length === 0" class="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
        <h3 class="text-lg font-medium text-gray-700 mb-1">No stock history found</h3>
        <p class="text-gray-500">No stock changes recorded for today.</p>
      </div>

      <div v-else class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 class="text-lg font-semibold text-gray-800">Stock History</h2>
          <span class="text-sm text-gray-500">{{ filteredStockHistory.length }} records</span>
        </div>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subtype</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="(record, index) in filteredStockHistory" :key="index" class="hover:bg-gray-50 transition-colors duration-150">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ record.productType }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ record.productSubtype }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ record.quantity || record.newQuantity }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ record.date }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ record.time }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span class="px-2 py-1 text-xs rounded-full" 
                    :class="{
                      'bg-green-100 text-green-800': record.action === 'added',
                      'bg-red-100 text-red-800': record.action === 'removed',
                      'bg-blue-100 text-blue-800': record.action === 'updated' || record.action === 'edited'
                    }"
                  >
                    {{ record.action }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useSalesStore } from '@/stores/salesStore';
import { useStockStore } from '@/stores/stockStore';
import Swal from 'sweetalert2';

// Access the stores
const salesStore = useSalesStore();
const stockStore = useStockStore();
const currentView = ref('sales');
const filter = ref('last4Days');
const showDateRangePicker = ref(false);
const dateRange = ref({ start: null, end: null });

onMounted(() => {
  salesStore.initSocket();
  stockStore.initSocket();
  fetchInitialData();

  salesStore.socket?.on('sale-updated', (payload) => {
    console.log('Sale updated in records:', payload);
    // No need to fetch sales manually, store already updates it via socket
  });

  salesStore.socket?.on('sale-deleted', (payload) => {
    console.log('Sale deleted in records:', payload);
    // No need to fetch sales manually, store already updates it via socket
  });

  stockStore.socket?.on('stock-updated', (payload) => {
    console.log('Stock updated in records:', payload);
    // Again, rely on store updates
  });

  stockStore.socket?.on('disconnect', () => {
    console.warn('WebSocket disconnected in records');
  });

  stockStore.socket?.on('connect', () => {
    console.log('WebSocket reconnected in records');
    fetchInitialData();
  });
});

onUnmounted(() => {
  salesStore.disconnectSocket();
  stockStore.disconnectSocket();
});

const fetchInitialData = async () => {
  if (currentView.value === 'sales') {
    if (filter.value === 'last4Days') {
      await salesStore.fetchSales();
    } else if (filter.value === 'allTime') {
      await salesStore.fetchAllTimeSales();
    }
  } else {
    await stockStore.fetchStockHistory();
  }
};

// Set view (sales or stock)
const setView = async (view) => {
  currentView.value = view;
  if (view === 'stock') {
    filter.value = 'daily';
    await stockStore.fetchStockHistory();
  } else {
    filter.value = 'last4Days';
    await salesStore.fetchSales();
  }
};

// Set filter and fetch data
const setFilter = async (value) => {
  filter.value = value;
  showDateRangePicker.value = false;
  dateRange.value = { start: null, end: null };
  if (value === 'allTime') {
    await salesStore.fetchAllTimeSales();
  } else if (value === 'daily' || value === 'last4Days') {
    await salesStore.fetchSales();
  } else if (value === 'custom') {
    showDateRangePicker.value = true;
  }
};

// Toggle date range picker
const toggleDateRangePicker = () => {
  showDateRangePicker.value = !showDateRangePicker.value;
  if (showDateRangePicker.value) {
    filter.value = 'custom';
  } else {
    filter.value = 'last4Days';
    salesStore.fetchSales();
  }
};

// Apply custom date range
const applyDateRange = async () => {
  if (!dateRange.value.start || !dateRange.value.end) {
    Swal.fire({
      icon: 'warning',
      title: 'Invalid Date Range',
      text: 'Please select both start and end dates.',
    });
    return;
  }
  filter.value = 'custom';
  await salesStore.fetchSalesByDateRange(dateRange.value.start, dateRange.value.end);
};

// Clear date range
const clearDateRange = () => {
  dateRange.value = { start: null, end: null };
  filter.value = 'last4Days';
  showDateRangePicker.value = false;
  salesStore.fetchSales();
};

// Filtered sales records
const filteredSalesRecords = computed(() => {
  if (!salesStore.sales || salesStore.sales.length === 0) {
    return [];
  }

  const now = new Date();
  const fiveDaysAgo = new Date(now);
  fiveDaysAgo.setDate(now.getDate() - 5);

  return salesStore.sales
    .filter((sale) => {
      const saleDate = new Date(sale.saleTime);
      if (filter.value === 'daily') {
        return saleDate.toDateString() === now.toDateString();
      } else if (filter.value === 'last4Days') {
        return saleDate >= fiveDaysAgo && saleDate <= now;
      } else if (filter.value === 'allTime') {
        return true;
      } else if (filter.value === 'custom' && dateRange.value.start && dateRange.value.end) {
        const startDate = new Date(dateRange.value.start);
        const endDate = new Date(dateRange.value.end);
        endDate.setHours(23, 59, 59, 999);
        return saleDate >= startDate && saleDate <= endDate;
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

// Filtered stock history
const filteredStockHistory = computed(() => {
  if (!stockStore.stockHistory || stockStore.stockHistory.length === 0) {
    return [];
  }

  return stockStore.stockHistory
    .map((historyRecord) => {
      const historyDate = new Date(historyRecord.timestamp);
      return {
        ...historyRecord,
        date: historyDate.toLocaleDateString(),
        time: historyDate.toLocaleTimeString(),
      };
    })
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
});

const deleteSale = async (saleId, productType, productSubtype, quantitySold) => {
  try {
    await salesStore.deleteSale(saleId, productType, productSubtype, quantitySold);
    // Fallback fetches to ensure updates if WebSocket fails
    if (!salesStore.isConnected || !stockStore.isConnected) {
      await salesStore.fetchSales();
      await stockStore.fetchStock();
      await stockStore.fetchStockHistory();
    }
  } catch (error) {
    console.error('Error restoring sale:', error);
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Failed to restore sale. Please try again.',
    });
  }
};
</script>

<style scoped>
tr {
  transition: background-color 0.15s ease;
}
button:hover {
  transition: all 0.2s ease;
}
.overflow-x-auto::-webkit-scrollbar {
  height: 6px;
}
.overflow-x-auto::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}
.overflow-x-auto::-webkit-scrollbar-thumb {
  background: #cbd5e0;
  border-radius: 3px;
}
.overflow-x-auto::-webkit-scrollbar-thumb:hover {
  background: #a0aec0;
}
input[type="date"] {
  transition: all 0.2s ease;
}
</style>