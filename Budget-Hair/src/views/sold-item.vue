<template>
  <div class="container mx-auto py-8">
    <h1 class="text-md font-bold mb-6 text-center text-sky-500">Sell Product</h1>
    <div class="bg-white p-6 rounded-lg shadow-lg max-w-3xl mx-auto">

      <div v-if="Object.keys(stockStore.stock).length === 0">
        <p>Loading stock data...</p>
      </div>

      <div v-else>
        <form @submit.prevent="sellProduct" aria-label="Sell Product Form">
          <div class="mb-6">
            <label for="productType" class="block text-lg font-medium text-black">Product Type</label>
            <select v-model="selectedProductType" id="productType"
              class="w-full mt-2 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              aria-label="Product Type Dropdown">
              <option value="" disabled>Select Product Type</option>
              <option v-for="(subtypes, type) in stockStore.stock" :key="type" :value="type">
                {{ type }}
              </option>
            </select>
          </div>
          <div class="mb-6" v-if="selectedProductType">
            <label for="productSubtype" class="block text-lg font-medium text-black">Product Subtype</label>
            <select v-model="selectedProductSubtype" id="productSubtype"
              class="w-full mt-2 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              aria-label="Product Subtype Dropdown">
              <option value="" disabled>Select Product Subtype</option>
              <option v-for="(quantity, subtype) in stockStore.stock[selectedProductType]" :key="subtype"
                :value="subtype">
                {{ subtype }}
              </option>
            </select>
          </div>
          <div class="mb-6" v-if="selectedProductSubtype">
            <label for="quantity" class="block text-lg font-medium text-black">Quantity</label>
            <input v-model.number="quantityToSell" id="quantity" type="number"
              :max="stockStore.stock[selectedProductType]?.[selectedProductSubtype]" min="1" @input="validateQuantity"
              class="w-full mt-2 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              aria-label="Quantity Input" />
            <p class="text-sm text-gray-500 mt-1">
              Available Stock: {{ stockStore.stock[selectedProductType]?.[selectedProductSubtype] }}
            </p>
          </div>
          <p v-if="errorMessage" class="text-red-500 text-sm mt-2">{{ errorMessage }}</p>

          <button type="submit"
            class="w-full px-4 py-2 bg-red-500 text-white rounded-md shadow hover:bg-red-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
            :disabled="!selectedProductType || !selectedProductSubtype || quantityToSell <= 0 || loading">
            {{ loading ? "Processing..." : "Sell Product" }}
          </button>
        </form>

        <div v-if="showSuccess" class="mt-4 text-green-500 text-center">
          <p>Product sold successfully and sale logged!</p>
        </div>
      </div>
    </div>

    <PopupNotification ref="popupNotification" />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from "vue";
import { useSalesStore } from "@/stores/salesStore";
import { useStockStore } from "@/stores/stockStore";
import PopupNotification from "@/components/PopupNotification.vue";

const salesStore = useSalesStore();
const stockStore = useStockStore();

const selectedProductType = ref("");
const selectedProductSubtype = ref("");
const quantityToSell = ref(0);
const errorMessage = ref("");
const loading = ref(false);
const showSuccess = ref(false);

const popupNotification = ref(null);
onMounted(() => {
  stockStore.initSocket();
  salesStore.initSocket();
  stockStore.socket?.on("stock-updated", () => {
    console.log("Stock updated in real time");
  });
  salesStore.socket?.on("sale-updated", async () => {
    console.log("Sales updated in real time");
  });
});

onUnmounted(() => {
  stockStore.disconnectSocket();
  salesStore.disconnectSocket();
});
const validateQuantity = () => {
  const maxStock = stockStore.stock[selectedProductType.value]?.[selectedProductSubtype.value];
  if (quantityToSell.value < 1) quantityToSell.value = 1;
  if (quantityToSell.value > maxStock) quantityToSell.value = maxStock;
};

const sellProduct = async () => {
  errorMessage.value = "";
  showSuccess.value = false;
  loading.value = true;

  try {
    if (!selectedProductType.value || !selectedProductSubtype.value || quantityToSell.value <= 0) {
      throw new Error("Please select a valid product, subtype, and quantity.");
    }

    const availableStock = stockStore.stock[selectedProductType.value]?.[selectedProductSubtype.value];

    if (!availableStock || quantityToSell.value > availableStock) {
      throw new Error("Stock quantity is not sufficient.");
    }

    const productType = selectedProductType.value;
    const productSubtype = selectedProductSubtype.value;
    const quantity = quantityToSell.value;
    await salesStore.addSaleToBackend(productType, productSubtype, quantity);
    selectedProductType.value = "";
    selectedProductSubtype.value = "";
    quantityToSell.value = 0;
    nextTick(() => {
      if (popupNotification.value) {
        popupNotification.value.show(
          `Sold ${quantity} pieces of ${productType.toUpperCase()}`,
          `You have successfully sold ${quantity} units of ${productSubtype.toUpperCase()}.`
        );
      }
    });

    showSuccess.value = true;
  } catch (error) {
    errorMessage.value = error.message || "An unexpected error occurred.";
  } finally {
    loading.value = false;
  }
};
</script>
