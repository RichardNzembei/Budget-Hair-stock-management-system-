<template>
  <div class="container mx-auto py-8">
    <h1 class="text-md font-bold mb-6 text-center text-sky-500">MAIN DASHBOARD</h1>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- SALES OVERVIEW -->
      <div class="bg-white p-6 rounded shadow-md">
        <h2 class="font-semibold text-sm mb-4 text-gray-700 text-center">
          SALES OVERVIEW
          <span class="today text-green-400 bg-white rounded-lg shadow-lg p-1 font-bold font-sans text-sm tracking-wide">
            today's
          </span>
        </h2>

        <div v-if="salesItems.length === 0" class="text-center text-gray-500">
          No sales for today.
        </div>

        <ul v-else class="space-y-4">
          <li v-for="sale in salesItems" :key="sale.id" class="bg-gray-50 p-4 rounded-md shadow-md hover:bg-gray-100 transition duration-300 space-x-4">
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

        <div v-if="Object.keys(stock).length === 0" class="text-center text-gray-500">
          No stock data available.
        </div>

        <ul v-else class="space-y-3">
          <li v-for="(subtypes, productType) in stock" :key="productType" class="bg-gray-50 p-4 rounded-md shadow-md hover:bg-gray-100 transition duration-300">
            <!-- Delete Product Type Button -->
            <div class="flex justify-between items-center">
              <h3 class="font-semibold text-sm text-gray-600 mb-2 flex-1">{{ productType.toUpperCase() }}</h3>
              <button @click="deleteProductType(productType)" class="text-red-500 text-sm hover:text-red-700">
                <img src="../assets/img/delete.png" alt="delete" class="h-6 w-6">
              </button>
            </div>
            
            <ul class="space-y-2 text-sm">
              <li v-for="(quantity, productSubtype) in subtypes" :key="productSubtype" class="text-gray-800 space-x-4">
                <span class="font-medium text-gray-600">{{ productSubtype.toUpperCase() }}:</span>
                <span v-if="quantity === 0" class="text-red-500 font-semibold">Out of Stock</span>
                <span v-else-if="quantity < 5" class="text-green-500 font-light">
                  <span class="text-sky-700">{{ quantity }}</span> (Restock)*
                </span>
                <span v-else class="text-sky-500 font-semibold">{{ quantity }}</span>

                <!-- Dropdown Button for Actions -->
                <div class="relative inline-block text-left mt-2">
                  <button @click="toggleDropdown(productType, productSubtype)" class="text-sm text-blue-500 hover:underline">
                    <img src="../assets/img/actions.png" alt="" class="h-6 w-6 mr-6">
                  </button>
                  <div v-if="dropdownVisible[`${productType}-${productSubtype}`]" class="dropdown-menu absolute left-4  bg-white rounded-md shadow-lg border border-gray-200">
                    <div class="py-2">
                      <button @click="editStock(productType, productSubtype)" class="block px-4 py-2 text-sm text-blue-500 hover:bg-gray-100">
                        Edit
                      </button>
                      <button @click="deleteProductSubtype(productType, productSubtype)" class="block px-4 py-2 text-sm text-red-500 hover:bg-gray-100">
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
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
const dropdownVisible = ref({}); // Track visibility of dropdown for each stock item

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

const editStock = async (productType, productSubtype) => {
  const newQuantity = prompt(
    `Enter the new quantity for ${productType.toUpperCase()} - ${productSubtype.toUpperCase()}:`,
    stock.value[productType][productSubtype]
  );

  if (newQuantity !== null) {
    const parsedQuantity = parseInt(newQuantity, 10);
    if (!isNaN(parsedQuantity) && parsedQuantity >= 0) {
      await stockStore.editStock(productType, productSubtype, parsedQuantity);
      stock.value[productType][productSubtype] = parsedQuantity;
      alert("Stock updated successfully!");
    } else {
      alert("Invalid input. Please enter a valid number.");
    }
  }
};

const deleteProductSubtype = async (productType, productSubtype) => {
  const confirmDelete = confirm(
    `Are you sure you want to delete the ${productSubtype.toUpperCase()} subtype from ${productType.toUpperCase()}?`
  );

  if (confirmDelete) {
    await stockStore.deleteStock(productType, productSubtype); // Update stock data
    // Remove the productSubtype from stock
    delete stock.value[productType][productSubtype];

    // If the productType now has no subtypes, remove the whole productType
    if (Object.keys(stock.value[productType]).length === 0) {
      delete stock.value[productType];
    }

    alert(`${productSubtype.toUpperCase()} deleted successfully!`);
  }
};

const deleteProductType = async (productType) => {
  const confirmDelete = confirm(
    `Are you sure you want to delete the entire ${productType.toUpperCase()} product type?`
  );

  if (confirmDelete) {
    await stockStore.deleteProductType(productType); // Call the method from stockStore
    // Remove the entire productType from stock
    delete stock.value[productType];

    alert(`${productType.toUpperCase()} product type deleted successfully!`);
  }
};

// Function to toggle visibility of dropdown menu
const toggleDropdown = (productType, productSubtype) => {
  const key = `${productType}-${productSubtype}`;
  dropdownVisible.value[key] = !dropdownVisible.value[key];
};

// Close the dropdown when clicking outside
const closeDropdown = (event) => {
  if (!event.target.closest('.relative')) {
    dropdownVisible.value = {};
  }
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
  document.addEventListener("click", closeDropdown);
});

onUnmounted(() => {
  document.removeEventListener("click", closeDropdown);
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
  font-size: 14px;
}

ul li:hover {
  background-color: rgba(242, 242, 242, 0.6);
}
</style>