<template>
    <div class="container mx-auto py-8">
      <h1 class="text-3xl font-bold mb-6 text-center text-sky-500">Sell Products</h1>
      <div class="bg-white p-6 rounded-lg shadow-lg max-w-3xl mx-auto">
        <form @submit.prevent="sellProduct">
          <!-- Product Type -->
          <div class="mb-6">
            <label for="productType" class="block text-lg font-medium text-black">Product Type</label>
            <select
              v-model="selectedProductType"
              id="productType"
              class="w-full mt-2 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="" disabled>Select Product Type</option>
              <option v-for="(subtypes, type) in stock" :key="type" :value="type">
                {{ type }}
              </option>
            </select>
          </div>
  
          <!-- Product Subtype -->
          <div class="mb-6" v-if="selectedProductType">
            <label for="productSubtype" class="block text-lg font-medium text-black">Product Subtype</label>
            <select
              v-model="selectedProductSubtype"
              id="productSubtype"
              class="w-full mt-2 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="" disabled>Select Product Subtype</option>
              <option v-for="(quantity, subtype) in stock[selectedProductType]" :key="subtype" :value="subtype">
                {{ subtype }}
              </option>
            </select>
          </div>
  
          <!-- Quantity -->
          <div class="mb-6" v-if="selectedProductSubtype">
            <label for="quantity" class="block text-lg font-medium text-black">Quantity</label>
            <input
              v-model="quantityToSell"
              id="quantity"
              type="number"
              :max="stock[selectedProductType][selectedProductSubtype]"
              min="1"
              placeholder="Enter Quantity to Sell"
              class="w-full mt-2 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
            <p class="text-sm text-gray-500 mt-1">
              Available Stock: {{ stock[selectedProductType][selectedProductSubtype] }}
            </p>
          </div>
  
          <!-- Submit Button -->
          <button
            type="submit"
            class="w-full px-4 py-2 bg-red-500 text-white rounded-md shadow hover:bg-red-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
            :disabled="!selectedProductType || !selectedProductSubtype || quantityToSell <= 0"
          >
            Sell Product
          </button>
        </form>
      </div>
    </div>
  </template>
  
  <script setup>
  import { reactive, ref, onMounted } from 'vue';
  
  // Reactive variables
  const stock = reactive({});
  const sales = reactive([]);
  const selectedProductType = ref('');
  const selectedProductSubtype = ref('');
  const quantityToSell = ref(0);
  
  // Load stock and sales from local storage
  const loadFromLocalStorage = () => {
    const storedStock = localStorage.getItem('stock');
    const storedSales = localStorage.getItem('sales');
    if (storedStock) {
      Object.assign(stock, JSON.parse(storedStock));
    }
    if (storedSales) {
      Object.assign(sales, JSON.parse(storedSales));
    }
  };
  
  // Save stock and sales to local storage
  const saveToLocalStorage = () => {
    localStorage.setItem('stock', JSON.stringify(stock));
    localStorage.setItem('sales', JSON.stringify(sales));
  };
  
  // Function to sell product
  const sellProduct = () => {
    if (
      !selectedProductType.value ||
      !selectedProductSubtype.value ||
      quantityToSell.value <= 0 ||
      quantityToSell.value > stock[selectedProductType.value][selectedProductSubtype.value]
    ) {
      alert('Invalid input. Please check the selected product and quantity.');
      return;
    }
  
    // Deduct the sold quantity from stock
    stock[selectedProductType.value][selectedProductSubtype.value] -= Number(quantityToSell.value);
  
    // Remove subtype if quantity becomes 0
    if (stock[selectedProductType.value][selectedProductSubtype.value] === 0) {
      delete stock[selectedProductType.value][selectedProductSubtype.value];
    }
  
    // Remove product type if no subtypes are left
    if (Object.keys(stock[selectedProductType.value]).length === 0) {
      delete stock[selectedProductType.value];
    }
  
    // Log the sale
    sales.push({
  productType: selectedProductType.value,
  productSubtype: selectedProductSubtype.value,
  quantitySold: Number(quantityToSell.value),
  saleTime: new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }),
});

  
    // Save updated stock and sales to local storage
    saveToLocalStorage();
  
    // Reset form fields
    selectedProductType.value = '';
    selectedProductSubtype.value = '';
    quantityToSell.value = 0;
  
    alert('Product sold successfully and sale logged!');
  };
  
  // Load stock and sales from local storage on component mount
  onMounted(loadFromLocalStorage);
  </script>
  
  <style scoped>
  /* Add custom styles if needed */
  </style>
  