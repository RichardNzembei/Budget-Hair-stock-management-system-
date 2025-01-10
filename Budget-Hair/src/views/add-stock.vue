<template>
  <div class="container mx-auto py-8">
    <h1 class="text-3xl font-bold mb-6 text-center text-sky-500">Add Stock</h1>
    <div class="bg-white p-6 rounded-lg shadow-lg max-w-3xl mx-auto">
      <form @submit.prevent="addStock">
        <div class="mb-6">
          <label for="productType" class="block text-lg font-medium text-black">Product Type</label>
          <input v-model="productType" id="productType" placeholder="Enter Product Type"
            class="w-full mt-2 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 uppercase" />
        </div>

        <div class="mb-6">
          <label for="productSubtype" class="block text-lg font-medium text-black">Product Subtype</label>
          <input v-model="productSubtype" id="productSubtype" placeholder="Enter Product Subtype"
            class="w-full mt-2 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 uppercase" />
        </div>

        <div class="mb-6">
          <label for="quantity" class="block text-lg font-medium text-black">Quantity</label>
          <input v-model="quantity" id="quantity" type="number" min="1" required placeholder="Enter Quantity"
            class="w-full mt-2 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500" />
        </div>

        <button type="submit" :disabled="loading"
          class="w-full px-4 py-2 bg-sky-500 text-white rounded-md shadow hover:bg-white hover:text-sky-600">
          <span v-if="loading">Adding...</span>
          <span v-else>Add Stock</span>
        </button>
      </form>
      <div v-if="loading" class="absolute inset-0 flex items-center justify-center bg-opacity-50 bg-gray-200">
        <div class="w-12 h-12 border-4 border-t-4 border-sky-500 border-solid rounded-full animate-spin"></div>
      </div>
    </div>
    <PopupNotification ref="popupNotification" />
  </div>
</template>
<script setup>
import { ref } from 'vue';
import { useStockStore } from '../stores/stockStore';
import PopupNotification from '@/components/PopupNotification.vue';

const stockStore = useStockStore();
const productType = ref('');
const productSubtype = ref('');
const quantity = ref(1);
const loading = ref(false);
const popupNotification = ref(null);
const sanitizeInput = (str) => {
  return str
    .trim()
    .replace(/\s+/g, ' ')
    .toUpperCase();
};

const validateStockInput = (productType, productSubtype, quantity) => {
  if (!productType || !productSubtype || quantity <= 0) {
    return 'Please provide valid inputs.';
  }
  return null;
};

const addStock = async () => {
  productType.value = sanitizeInput(productType.value);
  productSubtype.value = sanitizeInput(productSubtype.value);

  const error = validateStockInput(productType.value, productSubtype.value, quantity.value);
  if (error) {
    popupNotification.value.show('Validation Error', error);
    return;
  }

  loading.value = true;

  try {
    await stockStore.addStockToBackend(productType.value, productSubtype.value, quantity.value);

    productType.value = '';
    productSubtype.value = '';
    quantity.value = 1;

    popupNotification.value.show('Success!', 'Stock added successfully.');
  } catch (e) {
    popupNotification.value.show('Error!', 'Failed to add stock. Please try again.');
  } finally {
    loading.value = false;
  }
};
</script>
