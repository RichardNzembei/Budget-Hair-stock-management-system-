<template>
  <div class="container mx-auto py-8">
    <h1 class="text-3xl font-bold mb-6 text-center text-sky-500">Manage Products</h1>
    <div class="bg-white p-6 rounded-lg shadow-lg max-w-3xl mx-auto">
      <form @submit.prevent="addStock">
        <!-- Product Type -->
        <div class="mb-6">
          <label for="productType" class="block text-lg font-medium text-black">Product Type</label>
          <input
            v-model="productType"
            id="productType"
            placeholder="Enter Product Type"
            class="w-full mt-2 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 uppercase"
          />
        </div>

        <!-- Product Subtype -->
        <div class="mb-6">
          <label for="productSubtype" class="block text-lg font-medium text-black">Product Subtype</label>
          <input
            v-model="productSubtype"
            id="productSubtype"
            placeholder="Enter Product Subtype"
            class="w-full mt-2 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 uppercase"
          />
        </div>

        <!-- Quantity -->
        <div class="mb-6">
          <label for="quantity" class="block text-lg font-medium text-black">Quantity</label>
          <input
            v-model="quantity"
            id="quantity"
            type="number"
            min="1"
            required
            placeholder="Enter Quantity"
            class="w-full mt-2 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>

        <!-- Submit Button -->
        <button
          type="submit"
          class="w-full px-4 py-2 bg-green-500 text-white rounded-md shadow hover:bg-green-600"
        >
          Add Stock
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue';

// Reactive variables
const productType = ref('');
const productSubtype = ref('');
const quantity = ref(1);

// Stock structure
const stock = reactive({});

// Load stock from local storage
const loadStockFromLocalStorage = () => {
  const storedStock = localStorage.getItem('stock');
  if (storedStock) {
    Object.assign(stock, JSON.parse(storedStock));
  }
};

// Save stock to local storage
const saveStockToLocalStorage = () => {
  localStorage.setItem('stock', JSON.stringify(stock));
  console.log(stock)
};

// Function to add stock
const addStock = () => {
  if (!productType.value || !productSubtype.value || quantity.value <= 0) {
    alert("Please provide valid inputs.");
    return;
  }

  if (!stock[productType.value]) {
    stock[productType.value] = {};
  }

  if (!stock[productType.value][productSubtype.value]) {
    stock[productType.value][productSubtype.value] = 0;
  }

  // Add quantity to stock
  stock[productType.value][productSubtype.value] += Number(quantity.value);

  // Save updated stock to local storage
  saveStockToLocalStorage();

  // Clear input fields
  productType.value = '';
  productSubtype.value = '';
  quantity.value = 1;

  alert("Stock added successfully!");
};

// Load stock from local storage on component mount
onMounted(loadStockFromLocalStorage);
</script>

<style scoped>
/* Transform text to uppercase */
input.uppercase {
  text-transform: uppercase;
}
</style>
