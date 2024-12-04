<template>
    <div class="container mx-auto py-8">
      <h1 class="text-3xl font-bold mb-6 text-center text-sky-500">Add New Product</h1>
  
      <!-- Form to add a new product -->
      <div class="bg-white p-6 rounded-lg shadow-lg max-w-3xl mx-auto">
        <form @submit.prevent="addProduct">
          <!-- Step 1: Select Braid Type -->
          <div v-if="step === 1" class="mb-6">
            <label for="productType" class="text-lg font-medium text-black">Braid Type</label>
            <USelect
              v-model="productType"
              id="productType"
              :options="braidTypes"
              class="w-full mt-2"
              placeholder="Select Braid Type"
            />
          </div>
  
          <!-- Step 2: Select Braid Subtype -->
          <div v-if="step === 2" class="mb-6">
            <label for="productSubtype" class="text-lg font-medium text-gray-700">Braid Subtype</label>
            <USelect
              v-model="productSubtype"
              id="productSubtype"
              :options="braidSubtypes"
              class="w-full mt-2"
              placeholder="Select Subtype"
            />
          </div>
  
          <!-- Step 3: Quantity and Price -->
          <div v-if="step === 3" class="mb-6">
            <div class="mb-4">
              <label for="quantity" class="text-lg font-medium text-gray-700">Quantity</label>
              <UInput
                v-model="quantity"
                id="quantity"
                type="number"
                class="w-full mt-2"
                min="1"
                required
                placeholder="Enter Quantity"
              />
            </div>
  
            <div class="mb-4">
              <label for="price" class="text-lg font-medium text-gray-700">Price</label>
              <UInput
                v-model="price"
                id="price"
                type="number"
                class="w-full mt-2"
                min="0"
                required
                placeholder="Enter Price"
              />
            </div>
          </div>
  
          <!-- Navigation buttons -->
          <div class="flex justify-between mt-6">
            <UButton
              v-if="step > 1"
              @click.prevent="prevStep"
              
              class="w-full sm:w-auto bg-orange-400 text-white"
            >
              Back
            </UButton>
            <UButton
              v-if="step < 3"
              @click.prevent="nextStep"
              class="w-full sm:w-auto bg-red-500 text-white"
            >
              Next
            </UButton>
            <UButton
              v-if="step === 3"
              type="submit"
              class="w-full sm:w-auto bg-green-500 text-white"
            >
              Add Product
            </UButton>
          </div>
        </form>
      </div>
    </div>
  </template>
  
  <script>
 
  
  export default {
    
    data() {
      return {
        step: 1, // Track the step in the multi-step form
        productType: "",
        productSubtype: "",
        quantity: 1,
        price: 0,
        braidTypes: [
          { value: 'OMBRE BRAIDS LONG', label: 'OMBRE BRAIDS LONG' },
          { value: 'OMBRE SHORT', label: 'OMBRE SHORT' },
          { value: 'SPARKLES LONG', label: 'SPARKLES LONG' },
          { value: 'SPARKLES SHORT', label: 'SPARKLES SHORT' },
          { value: 'EXPRESSION BRAIDS', label: 'EXPRESSION BRAIDS' },
          { value: 'DEEPTWIST', label: 'DEEPTWIST' },
          { value: 'AFROSPRINGTWIST', label: 'AFROSPRINGTWIST' },
          { value: 'NUBIAN TWIST', label: 'NUBIAN TWIST' },
          { value: 'NUBIAN LONG', label: 'NUBIAN LONG' },
          { value: 'ITALY CURLS', label: 'ITALY CURLS' },
          { value: 'MARLEY BRAIDS', label: 'MARLEY BRAIDS' },
          { value: 'MARLEY SHORT', label: 'MARLEY SHORT' },
          { value: 'AFROBULK', label: 'AFROBULK' },
          { value: 'PASSION TWIST', label: 'PASSION TWIST' },
          { value: 'PASSION TWIST SHORT', label: 'PASSION TWIST SHORT' },
          { value: 'GYPSYLOCS', label: 'GYPSYLOCS' },
          { value: 'GYPSYLOCS SHORT', label: 'GYPSYLOCS SHORT' },
          { value: 'DEEPWAVE LOCS', label: 'DEEPWAVE LOCS' },
          { value: 'RIVERLOCS', label: 'RIVERLOCS' },
          { value: 'AFROTWIST', label: 'AFROTWIST' },
          { value: 'FRENCH CURLS 18 inches', label: 'FRENCH CURLS 18 inches' },
          { value: 'FRENCH CURLS 24', label: 'FRENCH CURLS 24' },
          { value: 'FRENCH CURLS 14 inches', label: 'FRENCH CURLS 14 inches' },
          { value: 'EXOTIC CURLS', label: 'EXOTIC CURLS' },
          { value: 'PASSION LOCS', label: 'PASSION LOCS' },
          { value: 'FRENCH LOCS', label: 'FRENCH LOCS' },
          { value: 'NU LOCS', label: 'NU LOCS' },
          { value: 'JUMPY CURLS', label: 'JUMPY CURLS' },
          { value: 'BONESTRAIGHT', label: 'BONESTRAIGHT' },
          { value: 'QUEEN LOCS', label: 'QUEEN LOCS' },
          { value: 'RIVERBOX BRAIDS', label: 'RIVERBOX BRAIDS' },
          { value: 'PRETWISTED NUBIAN', label: 'PRETWISTED NUBIAN' },
        ],
        braidSubtypes: [], // List of subtypes that will update based on product type selected
      };
    },
    methods: {
      // Move to the next step
      nextStep() {
        if (this.step === 1 && this.productType) {
          this.setSubtypes(); // Set subtypes based on selected product type
          this.step++;
        } else if (this.step === 2 && this.productSubtype) {
          this.step++;
        }
      },
  
      // Move to the previous step
      prevStep() {
        this.step--;
      },
  
      // Set subtypes based on selected braid type
      setSubtypes() {
        switch (this.productType) {
          case "Knotless":
            this.braidSubtypes = [
              { value: 'Short', label: 'Short' },
              { value: 'Medium', label: 'Medium' },
              { value: 'Long', label: 'Long' },
            ];
            break;
          case "NU LOCS":
            this.braidSubtypes = [
              { value: 'Small', label: 'Small' },
              { value: 'Medium', label: 'Medium' },
              { value: 'Large', label: 'Large' },
            ];
            break;
          case "Senegalese":
            this.braidSubtypes = [
              { value: 'Classic', label: 'Classic' },
              { value: 'Curly', label: 'Curly' },
            ];
            break;
          case "Passion Twist":
            this.braidSubtypes = [
              { value: 'Water Wave', label: 'Water Wave' },
              { value: 'Straight', label: 'Straight' },
            ];
            break;
          default:
            this.braidSubtypes = [];
            break;
        }
      },
  
      // Handle form submission
      addProduct() {
        const newProduct = {
          id: Date.now(),
          productType: this.productType,
          productSubtype: this.productSubtype,
          quantity: this.quantity,
          price: this.price,
        };
  
        console.log("New Product Added:", newProduct);
  
        // After adding the product, reset the form
        this.productType = "";
        this.productSubtype = "";
        this.quantity = 1;
        this.price = 0;
        this.step = 1;
  
        // Optionally, redirect or show a success message
        alert("Product successfully added!");
      }
    }
  };
  </script>
  
  <style scoped>
  .container {
    max-width: 900px;
  }
  
  form input,
  form select {
    transition: border-color 0.3s ease;
  }
  
  form input:focus,
  form select:focus {
    border-color: #4CAF50;
    outline: none;
  }
  </style>
  