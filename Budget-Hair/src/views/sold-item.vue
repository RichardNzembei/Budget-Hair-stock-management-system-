<script setup>
import { ref, onMounted } from "vue";
import { useSalesStore } from "@/stores/salesStore"; // Import the sales store
import { useStockStore } from "@/stores/stockStore"; // Import the stock store

const salesStore = useSalesStore();
const stockStore = useStockStore();

const selectedProductType = ref("");
const selectedProductSubtype = ref("");
const quantityToSell = ref(0);
const errorMessage = ref("");
const loading = ref(false);
const showSuccess = ref(false);

// Add loading state for stock
const loadingStock = ref(true); // New state to track if stock is loading

// Sell product
const sellProduct = async () => {
  errorMessage.value = "";
  showSuccess.value = false;
  loading.value = true;

  if (
    !selectedProductType.value ||
    !selectedProductSubtype.value ||
    quantityToSell.value <= 0
  ) {
    errorMessage.value = "Please select a valid product, subtype, and quantity.";
    loading.value = false;
    return;
  }

  const availableStock = stockStore.stock[selectedProductType.value]?.[selectedProductSubtype.value];

  if (!availableStock || quantityToSell.value > availableStock) {
    errorMessage.value = "Stock quantity is not sufficient.";
    loading.value = false;
    return;
  }

  // Update stock in the backend and locally
  stockStore.stock[selectedProductType.value][selectedProductSubtype.value] -= quantityToSell.value;

  if (stockStore.stock[selectedProductType.value][selectedProductSubtype.value] === 0) {
    delete stockStore.stock[selectedProductType.value][selectedProductSubtype.value];
  }

  if (Object.keys(stockStore.stock[selectedProductType.value]).length === 0) {
    delete stockStore.stock[selectedProductType.value];
  }

  await stockStore.fetchStock(); // Refresh stock from backend

  // Add sale to backend
  await salesStore.addSaleToBackend(
    selectedProductType.value,
    selectedProductSubtype.value,
    quantityToSell.value
  );

  selectedProductType.value = "";
  selectedProductSubtype.value = "";
  quantityToSell.value = 0;

  loading.value = false;
  showSuccess.value = true;
};

onMounted(async () => {
  await stockStore.fetchStock(); // Fetch stock data
  loadingStock.value = false; // Set loading to false when data is fetched
  await salesStore.fetchSales(); // Fetch sales data
});
</script>

<template>
  <div class="container mx-auto py-8">
    <h1 class="text-3xl font-bold mb-6 text-center text-sky-500">Sell Product</h1>
    <div class="bg-white p-6 rounded-lg shadow-lg max-w-3xl mx-auto">
      <!-- Show loading message while fetching stock -->
      <div v-if="loadingStock" class="text-center text-lg">Loading stock data...</div>
      
      <!-- Only show the form if stock data is loaded -->
      <div v-else>
        <form @submit.prevent="sellProduct">
          <div class="mb-6">
            <label for="productType" class="block text-lg font-medium text-black">Product Type</label>
            <select v-model="selectedProductType" id="productType"
              class="w-full mt-2 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500">
              <option value="" disabled>Select Product Type</option>
              <option v-for="(subtypes, type) in stockStore.stock" :key="type" :value="type">
                {{ type }}
              </option>
            </select>
          </div>
          <div class="mb-6" v-if="selectedProductType">
            <label for="productSubtype" class="block text-lg font-medium text-black">Product Subtype</label>
            <select v-model="selectedProductSubtype" id="productSubtype"
              class="w-full mt-2 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500">
              <option value="" disabled>Select Product Subtype</option>
              <option v-for="(quantity, subtype) in stockStore.stock[selectedProductType]" :key="subtype" :value="subtype">
                {{ subtype }}
              </option>
            </select>
          </div>
          <div class="mb-6" v-if="selectedProductSubtype">
            <label for="quantity" class="block text-lg font-medium text-black">Quantity</label>
            <input v-model="quantityToSell" id="quantity" type="number"
              :max="stockStore.stock[selectedProductType][selectedProductSubtype]" min="1" placeholder="Enter Quantity to Sell"
              class="w-full mt-2 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500" />
            <p class="text-sm text-gray-500 mt-1">
              Available Stock: {{ stockStore.stock[selectedProductType][selectedProductSubtype] }}
            </p>
          </div>
          <p v-if="errorMessage" class="text-red-500 text-sm mt-2">{{ errorMessage }}</p>
          <button type="submit"
            class="w-full px-4 py-2 bg-red-500 text-white rounded-md shadow hover:bg-red-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
            :disabled="!selectedProductType || !selectedProductSubtype || quantityToSell <= 0 || loading">
            Sell Product
          </button>
        </form>
        <div v-if="showSuccess" class="mt-4 text-green-500 text-center">
          <p>Product sold successfully and sale logged!</p>
        </div>
      </div>
    </div>
  </div>
</template>
