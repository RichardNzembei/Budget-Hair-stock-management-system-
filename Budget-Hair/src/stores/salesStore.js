import { defineStore } from 'pinia';
import axios from 'axios';
import { io } from 'socket.io-client';

const apiBaseUrl =
  process.env.NODE_ENV === 'production'
    ? 'https://budget-hair-stock-management-system.onrender.com'
    : 'http://localhost:5000';

export const useSalesStore = defineStore('sales', {
  state: () => ({
    sales: [],
    socket: null,
  }),

  actions: {
    // Initialize socket connection
    initSocket() {
      if (!this.socket) {
        this.socket = io(apiBaseUrl);

        this.socket.on('sale-updated', () => {
          console.log('Sale data updated!');
          this.fetchSales();
        });

        this.socket.on('stock-updated', () => {
          console.log('Stock data updated!');
          // Additional logic can go here if needed
        });

        this.socket.on('connect_error', (err) => {
          console.error('Socket connection error:', err);
        });

        this.socket.on('disconnect', () => {
          console.log('Socket disconnected');
        });
      }
    },

    // Disconnect the socket
    disconnectSocket() {
      if (this.socket) {
        this.socket.disconnect();
        this.socket = null;
        console.log('Socket disconnected');
      }
    },

    // Fetch all sales
    async fetchSales() {
      try {
        const response = await axios.get(`${apiBaseUrl}/api/sales`);
        this.sales = response.data;
        console.log('Fetched sales:', response.data);
        // Cache sales data
        await this.cacheSalesData(response.data);
      } catch (error) {
        console.error('Error fetching sales:', error.response?.data || error);
      }
    },

    // Add a sale to the backend
    async addSaleToBackend(productType, productSubtype, quantitySold) {
      try {
        const sale = {
          productType,
          productSubtype,
          quantitySold,
          saleTime: new Date().toISOString(),
        };

        const response = await axios.post(`${apiBaseUrl}/api/sales`, sale);
        if (response.status === 201) {
          console.log('Sale added successfully:', response.data);
          await this.fetchSales();
        }
      } catch (error) {
        console.error('Error adding sale:', error.response?.data || error);
      }
    },

    // Delete a sale
    async deleteSale(saleId) {
      try {
        console.log(`Deleting sale with ID: ${saleId}`);

        // Step 1: Delete sale from the database
        const response = await axios.delete(`${apiBaseUrl}/api/sales/${saleId}`);
        if (response.status === 200) {
          console.log('Sale deleted successfully:', response.data);
        } else {
          console.log('Failed to delete sale:', response);
          return;
        }

        // Step 2: Fetch updated sales list
        await this.fetchSales();

        console.log('Sale deleted and stock restored.');
      } catch (error) {
        console.error('Error deleting sale:', error.response?.data || error);
      }
    },

    // Cache sales data for offline use
    async cacheSalesData(salesData) {
      const cache = await caches.open('sales-cache');
      const cachedResponse = new Response(JSON.stringify(salesData));
      await cache.put('/api/sales', cachedResponse);
      console.log('Sales data cached successfully');
    },

    // Sync sales data when app comes online (background sync)
    async syncSalesData() {
      const cache = await caches.open('sales-cache');
      const cachedResponse = await cache.match('/api/sales');
      if (cachedResponse) {
        const cachedSales = await cachedResponse.json();
        console.log('Using cached sales data:', cachedSales);
        this.sales = cachedSales;
      } else {
        console.log('No cached sales data available');
      }

      // Trigger background sync for updates
      const tag = 'sync-sales';
      if (navigator.serviceWorker) {
        await navigator.serviceWorker.ready.then((registration) => {
          return registration.sync.register(tag);
        });
        console.log('Sales data sync registered in background');
      }
    },

    // Event listener for background sync
    async handleBackgroundSync(event) {
      if (event.tag === 'sync-sales') {
        console.log('Background sync triggered for sales data');
        await this.fetchSales();
      }
    },
  },

  persist: true,
});
