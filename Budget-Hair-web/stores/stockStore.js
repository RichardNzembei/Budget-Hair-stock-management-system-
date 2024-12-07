import { defineStore } from 'pinia';
import axios from 'axios';
import { io } from 'socket.io-client';

const apiBaseUrl =
  process.env.NODE_ENV === 'production'
    ? 'https://budget-hair-stock-management-system.onrender.com'
    : 'http://localhost:5000';

export const useStockStore = defineStore('stock', {
  state: () => ({
    stock: {},
    socket: null, // Store the WebSocket connection
  }),

  actions: {
    // Initialize WebSocket connection
    initSocket() {
      if (!this.socket) {
        this.socket = io(apiBaseUrl); // Connect to the backend WebSocket server

        // Listen for the 'stock-updated' event
        this.socket.on('stock-updated', async () => {
          console.log('Stock updated via WebSocket!');
          await this.fetchStock(); // Re-fetch stock data when the stock is updated
        });

        this.socket.on('connect', () => {
          console.log('Connected to WebSocket server');
        });

        this.socket.on('disconnect', () => {
          console.log('Disconnected from WebSocket server');
        });
      }
    },

    // Disconnect WebSocket connection
    disconnectSocket() {
      if (this.socket) {
        this.socket.disconnect();
        this.socket = null;
      }
    },

    // Fetch all stock data
    async fetchStock() {
      try {
        const response = await axios.get(`${apiBaseUrl}/api/stock`);
        this.stock = response.data;
        console.log('Fetched stock:', response.data);
      } catch (error) {
        console.error('Error fetching stock:', error.response?.data || error);
      }
    },

    // Add stock to the backend
    async addStockToBackend(productType, productSubtype, quantity) {
      try {
        const stock = { productType, productSubtype, quantity };
        const response = await axios.post(`${apiBaseUrl}/api/stock`, stock);

        if (response.status === 201) {
          console.log('Stock added successfully:', response.data);
        } else {
          console.error('Failed to add stock:', response.data);
        }
      } catch (error) {
        console.error('Error adding stock:', error.response?.data || error);
      }
    },
  },
});
