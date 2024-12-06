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

        <button type="submit"
          class="w-full px-4 py-2 bg-sky-500 text-white rounded-md shadow hover:bg-white hover:text-sky-600">
          Add Stock
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useStockStore } from '../stores/stockStore'

const stockStore = useStockStore();
const productType = ref('');
const productSubtype = ref('');
const quantity = ref(1);

const addStock = async () => {
  if (!productType.value || !productSubtype.value || quantity.value <= 0) {
    alert("Please provide valid inputs.");
    return;
  }

  await stockStore.addStockToBackend(productType.value, productSubtype.value, quantity.value);

  productType.value = '';
  productSubtype.value = '';
  quantity.value = 1;

  alert("Stock added successfully!");
};
</script>

<style scoped>
input.uppercase {
  text-transform: uppercase;
}
</style>
