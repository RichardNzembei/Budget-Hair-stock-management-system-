<template>
    <div class="container mx-auto py-8">
      <h1 class="text-3xl font-bold mb-6 text-center text-sky-500">Add New Product</h1>
    
      <div class="bg-white p-6 rounded-lg shadow-lg max-w-3xl mx-auto">
        <form @submit.prevent="confirmSale">
          <!-- Step 1: Select or Add Braid Type -->
          <div v-if="step === 1" class="mb-6">
            <label for="productType" class="block text-lg font-medium text-black">Braid Type</label>
            <select
              v-model="productType"
              id="productType"
              class="w-full mt-2 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="" disabled>Select Product Type</option>
              <option v-for="type in braidTypes" :key="type.value" :value="type.value">
                {{ type.label }}
              </option>
            </select>
    
            <div class="mt-4">
              <label for="newBraidType" class="block text-sm font-medium text-gray-700">
                Can't find the product? Add a new one:
              </label>
              <input
                v-model="newBraidType"
                id="newBraidType"
                placeholder="Enter new Product type"
                class="w-full mt-2 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                @click.prevent="addBraidType"
                class="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md shadow hover:bg-blue-600"
              >
                Add Product Type
              </button>
            </div>
          </div>
    
          <!-- Step 2: Enter Braid Subtype -->
          <div v-if="step === 2" class="mb-6">
            <label for="productSubtype" class="block text-lg font-medium text-gray-700">Braid Subtype</label>
            <input
              v-model="productSubtype"
              id="productSubtype"
              type="text"
              placeholder="Enter Subtype"
              class="w-full mt-2 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
    
          <!-- Step 3: Quantity -->
          <div v-if="step === 3" class="mb-6">
            <label for="quantity" class="block text-lg font-medium text-gray-700">Quantity</label>
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
    
          <!-- Step 4: Confirm Sale -->
          <div v-if="step === 4" class="mb-6">
            <h2 class="text-lg font-medium text-gray-700">Confirm Sale</h2>
            <p>Product Type: {{ productType }}</p>
            <p>Subtype: {{ productSubtype }}</p>
            <p>Quantity: {{ quantity }}</p>
          </div>
    
          <!-- Navigation buttons -->
          <div class="flex justify-between mt-6">
            <button
              v-if="step > 1"
              @click.prevent="prevStep"
              class="w-full sm:w-auto px-4 py-2 bg-orange-400 text-white rounded-md shadow hover:bg-orange-500"
            >
              Back
            </button>
            <button
              v-if="step < 4"
              @click.prevent="nextStep"
              class="w-full sm:w-auto px-4 py-2 bg-red-500 text-white rounded-md shadow hover:bg-red-600"
            >
              Next
            </button>
            <button
              v-if="step === 4"
              type="submit"
              class="w-full sm:w-auto px-4 py-2 bg-green-500 text-white rounded-md shadow hover:bg-green-600"
            >
              Confirm Sale
            </button>
          </div>
        </form>
      </div>
    </div>
  </template>
    
  <script setup>
  import { ref } from 'vue';
  
  // Reactive state variables
  const step = ref(1);
  const productType = ref('');
  const productSubtype = ref('');
  const newBraidType = ref('');
  const quantity = ref(1);
  const braidTypes = ref([
    { value: 'OMBRE BRAIDS LONG', label: 'OMBRE BRAIDS LONG' },
    { value: 'OMBRE SHORT', label: 'OMBRE SHORT' },
    { value: 'SPARKLES LONG', label: 'SPARKLES LONG' },
    { value: 'SPARKLES SHORT', label: 'SPARKLES SHORT' },
    // other product types
  ]);
  
  // Step navigation methods
  const nextStep = () => {
    if (step.value === 1 && productType.value) {
      step.value++;
    } else if (step.value === 2 && productSubtype.value) {
      step.value++;
    } else if (step.value === 3 && quantity.value > 0) {
      step.value++;
    }
  };
  
  const prevStep = () => {
    step.value--;
  };
  
  // Add new braid type to the list
  const addBraidType = () => {
    if (newBraidType.value.trim() !== "") {
      const newType = {
        value: newBraidType.value.trim().toUpperCase(),
        label: newBraidType.value.trim().toUpperCase(),
      };
      if (!braidTypes.value.some((type) => type.value === newType.value)) {
        braidTypes.value.push(newType);
        productType.value = newType.value;
        newBraidType.value = "";
      } else {
        alert("Braid type already exists!");
      }
    }
  };
  
  // Confirm Sale and save to localStorage
  const confirmSale = () => {
    const sale = {
      id: Date.now(), // Generate a unique ID using the timestamp
      productType: productType.value,
      productSubtype: productSubtype.value,
      quantitySold: quantity.value,
      saleDate: new Date().toISOString(), // Add timestamp when the sale is confirmed
    };
  
    // Save the sale to localStorage
    const storedSales = JSON.parse(localStorage.getItem('sales')) || [];
    storedSales.push(sale);
    localStorage.setItem('sales', JSON.stringify(storedSales));
  
    console.log("Sale Confirmed:", sale);
    resetForm();
  };
  
  // Reset form after adding a product
  const resetForm = () => {
    productType.value = '';
    productSubtype.value = '';
    quantity.value = 1;
    step.value = 1;
  };
  </script>
  