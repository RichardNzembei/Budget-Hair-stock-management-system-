<template>
  <div class="container mx-auto py-8">
    <h1 class="text-sky-500 text-center text-2xl font-semibold mb-4">Sales Dashboard</h1>

    <!-- Sales Overview -->
    <div class="bg-white p-6 rounded shadow-md">
      <h2 class="font-semibold text-lg mb-4">Today's Sales Overview</h2>
      <ul>
        <template v-for="(sales, productType) in groupedSales" :key="productType">
          <li class="mb-4">
            <h3 class="text-indigo-500 font-semibold">{{ productType.toUpperCase() }}</h3>
            <ul>
              <li 
                v-for="sale in sales" 
                :key="sale.id" 
                class="flex justify-between border-b border-gray-200 py-2"
              >
                <span>{{ sale.code }}</span>
                <span>{{ sale.quantity }}</span>
                <span>{{ sale.time }}</span>
              </li>
            </ul>
          </li>
        </template>
      </ul>
      <p v-if="Object.keys(groupedSales).length === 0" class="text-gray-500 text-sm">No sales recorded for today.</p>
    </div>
  </div>
</template>

<script>
import { computed } from "vue";

export default {
  props: {
    salesItems: Array, // Assumes sales data is passed as a prop
  },
  setup(props) {
    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split("T")[0];

    // Filter and sort sales for today
    const sortedTodaySales = computed(() => {
      return props.salesItems
        .filter((sale) => {
          const saleDate = sale.date.split("T")[0]; // Ensure date is in YYYY-MM-DD format
          return saleDate === today;
        })
        .sort((a, b) => new Date(b.date) - new Date(a.date)); // Newest sale first
    });

    // Group sorted sales by product type
    const groupedSales = computed(() => {
      const grouped = {};
      sortedTodaySales.value.forEach((sale) => {
        if (!grouped[sale.productName]) {
          grouped[sale.productName] = [];
        }
        grouped[sale.productName].push(sale);
      });
      return grouped;
    });

    return {
      groupedSales,
    };
  },
};
</script>

<style scoped>
/* Custom styles for sales display */
h3 {
  text-transform: uppercase;
}

ul {
  padding: 0;
  list-style: none;
}

li {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

li span {
  flex: 1;
  text-align: center;
}
</style>
