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
        }
        await this.fetchSales();
      } catch (error) {
        console.error('Error adding sale:', error.response?.data || error);
      }
    },

    // Delete a sale
    async deleteSale(saleId, productType, productSubtype, quantitySold) {
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
  },

  persist: true,
});