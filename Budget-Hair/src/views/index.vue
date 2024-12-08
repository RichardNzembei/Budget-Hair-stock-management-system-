<template>
  <div class="container mx-auto py-8">
    <h1 class="text-md font-bold mb-6 text-center text-sky-500">MAIN DASHBOARD</h1>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- SALES OVERVIEW -->
      <div class="bg-white p-6 rounded shadow-md">
        <h2 class="font-semibold text-sm mb-4 text-gray-700 text-center">
          SALES OVERVIEW
          <span
            class="today text-green-400 bg-white rounded-lg shadow-lg p-1 font-bold font-sans text-sm tracking-wide">
            today's
          </span>
        </h2>

        <!-- Message if no sales for today -->
        <div v-if="salesItems.length === 0" class="text-center text-gray-500">
          No sales for today.
        </div>

        <ul v-else class="space-y-4">
          <li v-for="sale in salesItems" :key="sale.id"
            class="bg-gray-50 p-4 rounded-md shadow-md hover:bg-gray-100 transition duration-300 space-x-4">
            <div class="text-sm">
              <strong class="text-gray-600">{{ sale.productType.toUpperCase() }}</strong>
              <br />
              <span class="text-gray-600">{{ sale.productSubtype.toUpperCase() }}:</span>
              <span class="text-green-500">{{ sale.quantitySold }}</span>
            </div>
            <div class="text-gray-400 text-sm flex justify-end">
              {{ formatSaleTime(sale.saleTime) }}
            </div>
          </li>
        </ul>
      </div>

      <!-- STOCK OVERVIEW -->
      <div class="bg-white p-6 rounded-lg shadow-lg">
        <h2 class="font-semibold text-sm mb-4 text-gray-700 text-center">STOCK OVERVIEW</h2>

        <!-- Message if no stock data -->
        <div v-if="Object.keys(stock).length === 0" class="text-center text-gray-500">
          No stock data available.
        </div>

        <ul v-else class="space-y-3">
          <li v-for="(subtypes, productType) in stock" :key="productType"
            class="bg-gray-50 p-4 rounded-md shadow-md hover:bg-gray-100 transition duration-300">
            <h3 class="font-semibold text-sm text-gray-600 mb-2">{{ productType.toUpperCase() }}</h3>
            <ul class="space-y-2 text-sm">
              <li v-for="(quantity, productSubtype) in subtypes" :key="productSubtype" class="text-gray-800 space-x-4">
                <span class="font-medium text-gray-600">{{ productSubtype.toUpperCase() }}:</span>
                <span class="text-sky-500 font-semibold">{{ quantity }}</span>
              </li>
            </ul>
          </li>
        </ul>
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
    await stockStore.fetchStock();
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
h3 {
  letter-spacing: 0.5px;
}

ul {
  padding-left: 20px;
}

ul li {
  font-size: 1rem;
}

ul li:hover {
  background-color: #f3f4f6;
  cursor: pointer;
}

h2,
h3,
strong,
span {
  text-transform: uppercase;
}

.today {
  text-transform: lowercase;
}

.text-gray-400 {
  font-size: 0.875rem;
}
</style>
