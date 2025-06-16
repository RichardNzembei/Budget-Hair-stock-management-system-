<template>
  <div class="container mx-auto px-4 py-8 max-w-6xl">
    <!-- Header with subtle gradient and better spacing -->
    <div class="mb-8 text-center">
      <h1 class="text-md font-bold mb-2 bg-gradient-to-r from-sky-500 to-blue-600 bg-clip-text text-transparent">
        MAIN DASHBOARD
      </h1>
      <p class="text-sm text-gray-500">Real-time overview</p>
    </div>

    <!-- Grid layout with responsive adjustments -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- SALES OVERVIEW CARD -->
      <div class="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 transition-all hover:shadow-xl">
        <!-- Card Header with accent border -->
        <div class="border-b border-sky-100 bg-gradient-to-r from-sky-50 to-white p-5">
          <div class="flex items-center justify-center space-x-2">
            <h2 class="font-semibold text-gray-700 text-md">
              SALES OVERVIEW
            </h2>
            <span class="today bg-sky-100 text-sky-600 rounded-full px-3 py-1 text-xs font-semibold shadow-inner">
              Today
            </span>
          </div>
        </div>

        <!-- Card Body -->
        <div class="p-5">
          <!-- Empty state -->
          <div v-if="salesItems.length === 0" class="text-center py-8">
            <div class="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h3 class="text-gray-500 font-medium">No sales today</h3>
            <p class="text-gray-400 text-sm mt-1">Your recent sales will appear here</p>
          </div>

          <!-- Sales List -->
          <ul v-else class="divide-y divide-gray-100">
            <li v-for="sale in salesItems" :key="sale.id" class="py-4 first:pt-0 last:pb-0">
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-3">
                  <div class="bg-sky-100 p-2 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                    </svg>
                  </div>
                  <div>
                    <h3 class="font-medium text-gray-800 text-sm">{{ sale.productType.toUpperCase() }}</h3>
                    <p class="text-xs text-gray-500">
                      {{ sale.productSubtype.toUpperCase() }}
                      <span class="text-green-500 font-semibold ml-1">{{ sale.quantitySold }} sold</span>
                    </p>
                  </div>
                </div>
                <span class="text-xs font-medium text-gray-400 bg-gray-50 px-2 py-1 rounded-full">
                  {{ formatSaleTime(sale.saleTime) }}
                </span>
              </div>
            </li>
          </ul>
        </div>
      </div>

      <!-- STOCK OVERVIEW CARD -->
      <div class="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 transition-all hover:shadow-xl">
        <!-- Card Header with accent border -->
        <div class="border-b border-emerald-100 bg-gradient-to-r from-emerald-50 to-white p-5 flex items-center justify-between">
          <h2 class="font-semibold text-gray-700 text-md text-center">
            STOCK OVERVIEW
          </h2>
            <button @click="refreshStock"
    class="flex items-center text-sm text-sky-600 hover:text-sky-800 font-medium transition">
    <svg v-if="!refreshing" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24"
      stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
        d="M4 4v6h6M20 20v-6h-6M4 20l5-5M20 4l-5 5" />
    </svg>
    <svg v-else class="animate-spin h-5 w-5 mr-1 text-sky-600" xmlns="http://www.w3.org/2000/svg" fill="none"
      viewBox="0 0 24 24">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
      <path class="opacity-75" fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
    <span>{{ refreshing ? 'Refreshing...' : 'Refresh' }}</span>
  </button>
        </div>

        <!-- Card Body -->
        <div class="p-5">
          <!-- Empty state -->
          <div v-if="Object.keys(stock).length === 0" class="text-center py-8">
            <div class="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h3 class="text-gray-500 font-medium">No stock data</h3>
            <p class="text-gray-400 text-sm mt-1">Your inventory will appear here</p>
          </div>

          <!-- Stock List -->
          <ul v-else class="space-y-4">
            <li v-for="(subtypes, productType) in stock" :key="productType" class="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
              <div class="flex items-center space-x-2 mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <h3 class="font-semibold text-gray-700 text-sm">{{ productType.toUpperCase() }}</h3>
              </div>
              
              <ul class="grid grid-cols-2 gap-3">
                <li v-for="(quantity, productSubtype) in subtypes" :key="productSubtype" class="flex items-center justify-between bg-white p-2 rounded-md border border-gray-100">
                  <span class="text-xs font-medium text-gray-600">{{ productSubtype.toUpperCase() }}</span>
                  <span class="text-xs font-bold bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">
                    {{ quantity }} in stock
                  </span>
                </li>
              </ul>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from "vue";
import { useStockStore } from "@/stores/stockStore";
import { useSalesStore } from "@/stores/salesStore";

const stockStore = useStockStore();
const salesStore = useSalesStore();
const refreshing = ref(false);

const refreshStock = async () => {
  refreshing.value = true;
  try {
    await stockStore.fetchStock({ force: true }); // optional 'force' param if you support it
  } catch (error) {
    console.error('Failed to refresh stock:', error);
  } finally {
    refreshing.value = false;
  }
};


const stock = ref({});
const salesItems = computed(() => {
  const today = new Date().setHours(0, 0, 0, 0);
  return salesStore.sales
    .filter((sale) => {
      const saleDate = new Date(sale.saleTime).setHours(0, 0, 0, 0);
      return saleDate === today;
    })
    .sort((a, b) => new Date(b.saleTime) - new Date(a.saleTime));
});

const formatSaleTime = (saleTime) => {
  const options = { hour: "2-digit", minute: "2-digit", hour12: true };
  return new Date(saleTime).toLocaleTimeString(undefined, options);
};

const loadDashboardData = async () => {
  if (Object.keys(stockStore.stock).length === 0) {
    await stockStore.fetchStock();
  }

  if (salesStore.sales.length === 0) {
    await salesStore.fetchSales();
  }

  stock.value = { ...stockStore.stock };
};

const initializeSocket = () => {
  stockStore.initSocket();
  salesStore.initSocket();

  const socket = stockStore.socket;

  socket.on("sale-updated", async () => {
    console.log("Real-time sales update received");
    await salesStore.fetchSales();
  });

  socket.on("stock-updated", async () => {
    console.log("Real-time stock update received");
    await stockStore.innitSocket();
    stock.value = { ...stockStore.stock };
  });
};

const disconnectSocket = () => {
  stockStore.disconnectSocket();
  salesStore.disconnectSocket();
};

onMounted(() => {
  loadDashboardData();
  initializeSocket();
});

onUnmounted(() => {
  disconnectSocket();
});
</script>

<style scoped>
/* Smooth transitions for interactive elements */
li {
  transition: all 0.2s ease;
}

/* Better visual hierarchy for empty states */
.text-center svg {
  transition: transform 0.3s ease;
}

.text-center:hover svg {
  transform: scale(1.1);
}

/* Subtle hover effects for cards */
.bg-white:hover {
  transform: translateY(-2px);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .grid-cols-2 {
    grid-template-columns: 1fr;
  }
}
</style>