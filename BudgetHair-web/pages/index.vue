<template>
  <div class="container mx-auto py-8">
    <h1 class="text-md font-bold mb-6 text-center text-sky-500">MAIN DASHBOARD</h1>

    <!-- Dashboard Overview -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    
      <!-- Sales Overview -->
      <div class="bg-white p-6 rounded shadow-md">
        <h2 class="font-semibold text-sm mb-4 text-gray-700 text-center">SALES OVERVIEW
          <span class="today text-green-400 bg-white rounded-lg shadow-lg p-1 font-bold font-sans text-sm  tracking-wide">today's</span>

        </h2>
        <ul class="space-y-4">
          <li
            v-for="sale in salesItems"
            :key="sale.id"
            class="bg-gray-50 p-4 rounded-md shadow-md hover:bg-gray-100 transition duration-300 space-x-4"
          >
            <div class=text-sm>
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
      
      <!-- Stock Overview -->
      <div class="bg-white p-6 rounded-lg shadow-lg">
        <h2 class="font-semibold text-sm mb-4 text-gray-700 text-center">STOCK OVERVIEW</h2>
        <ul class="space-y-3">
          <li
            v-for="(subtypes, productType) in stock"
            :key="productType"
            class="bg-gray-50 p-4 rounded-md shadow-md hover:bg-gray-100 transition duration-300"
          >
            <h3 class="font-semibold text-sm text-gray-600 mb-2">{{ productType.toUpperCase() }}</h3>
            <ul class="space-y-2 text-sm">
              <li
                v-for="(quantity, productSubtype) in subtypes"
                :key="productSubtype"
                class="text-gray-800 space-x-4"
              >
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
import { ref, onMounted } from 'vue';

// Reactive references
const stock = ref({});
const salesItems = ref([]);

// Helper function to convert sale time into a full Date object
const convertToDate = (saleTime) => {
  const currentDate = new Date().toISOString().split('T')[0]; // Get current date in YYYY-MM-DD format
  const fullDate = `${currentDate} ${saleTime}`; // Combine current date with sale time
  const formattedDate = fullDate.replace(/(AM|PM)/, ' $1'); // Ensure that AM/PM format is correctly handled
  return new Date(formattedDate); // Convert into a Date object
};

// Helper function to format the sale time as a readable string
const formatSaleTime = (saleTime) => {
  const options = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }; 
  return saleTime.toLocaleTimeString([], options); // Format the time part only
};

// Filter sales for today's date
const filterSalesForToday = (sales) => {
  const today = new Date().toISOString().split('T')[0]; // Get current date in YYYY-MM-DD format
  return sales.filter(sale => {
    const saleDate = sale.saleTime.toISOString().split('T')[0]; // Get sale date in YYYY-MM-DD format
    return saleDate === today;
  });
};

// Load stock and sales data from localStorage
const loadStockFromLocalStorage = () => {
  const storedStock = localStorage.getItem('stock');
  if (storedStock) {
    stock.value = JSON.parse(storedStock);
  }

  const storedSales = JSON.parse(localStorage.getItem('sales')) || [];

  // Convert sale times to full Date objects
  const salesWithDate = storedSales.map(sale => ({
    ...sale,
    saleTime: convertToDate(sale.saleTime), // Convert the saleTime string to a full Date object
  }));

  // Filter sales for today and sort by latest first
  salesItems.value = filterSalesForToday(salesWithDate)
    .sort((a, b) => b.saleTime - a.saleTime); // Sort by timestamp (latest first)
};

// Initialize data on component mount
onMounted(loadStockFromLocalStorage);
</script>

<style scoped>
/* Custom styles to improve the presentation */
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
