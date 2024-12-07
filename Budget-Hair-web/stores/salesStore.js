import { defineStore } from 'pinia';
import axios from 'axios';
import { io } from 'socket.io-client'; // Import the Socket.IO client

const apiBaseUrl =
  process.env.NODE_ENV === 'production'
    ? 'https://budget-hair-stock-management-system.onrender.com'
    : 'http://localhost:5000';

export const useSalesStore = defineStore('sales', {
  state: () => ({
    sales: [],
    socket: null, // Store the WebSocket connection
  }),

  actions: {
    // Initialize WebSocket connection
    initSocket() {
      if (!this.socket) {
        this.socket = io(apiBaseUrl); // Connect to the backend WebSocket server

        // Listen for the 'sale-updated' event
        this.socket.on('sale-updated', () => {
          console.log('Sale data updated!');
          this.fetchSales(); // Re-fetch sales data when a sale is updated
        });

        // Handle socket errors
        this.socket.on('connect_error', (err) => {
          console.error('Socket connection error:', err);
        });

        this.socket.on('disconnect', () => {
          console.log('Socket disconnected');
        });
      }
    },

    // Disconnect WebSocket connection (to avoid memory leaks)
    disconnectSocket() {
      if (this.socket) {
        this.socket.disconnect();
        this.socket = null;
        console.log('Socket disconnected');
      }
    },

    // Fetch all sales data
    async fetchSales() {
      try {
        const response = await axios.get(`${apiBaseUrl}/api/sales`);
        this.sales = response.data;
        console.log('Fetched sales:', response.data);
      } catch (error) {
        console.error('Error fetching sales:', error.response?.data || error);
      }
    },

    // Add a sale to the backend and re-fetch sales data
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
  },

  // To ensure WebSocket is connected as soon as the store is used
  persist: true, // Optional: to persist socket connection state if necessary
});
