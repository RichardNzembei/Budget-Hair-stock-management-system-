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
    socket: null,
  }),

  actions: {
    initSocket() {
      if (!this.socket) {
        this.socket = io(apiBaseUrl);

        this.socket.on('stock-updated', (payload) => {
          console.log('Stock updated event received:', payload);
          this.fetchStock();
        });

        this.socket.on('connect', () => {
          console.log('Connected to WebSocket server');
        });

        this.socket.on('disconnect', () => {
          console.log('Disconnected from WebSocket server');
        });
      }
    },

    disconnectSocket() {
      if (this.socket) {
        this.socket.disconnect();
        this.socket = null;
      }
    },

    async fetchStock() {
      try {
        const response = await axios.get(`${apiBaseUrl}/api/stock`);
        this.stock = response.data;
        console.log('Fetched stock:', this.stock);
      } catch (error) {
        console.error('Error fetching stock:', error.response?.data || error);
      }
    },

    async addStock(productType, productSubtype, quantity) {
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

    async editStock(productType, productSubtype, quantity) {
      try {
        const response = await axios.put(`${apiBaseUrl}/api/stock`, {
          productType,
          productSubtype,
          quantity,
        });

        if (response.status === 200) {
          console.log('Stock edited successfully:', response.data);
          await this.fetchStock(); // Refresh stock data
        }
      } catch (error) {
        console.error('Error editing stock:', error.response?.data || error);
      }
    },

    async deleteStock(productType, productSubtype) {
      try {
        console.log('Deleting stock:', { productType, productSubtype });
        const response = await axios.delete(`${apiBaseUrl}/api/stock`, {
          data: { productType, productSubtype },
        });

        if (response.status === 200) {
          console.log('Stock deleted successfully:', response.data);
          await this.fetchStock(); // Refresh stock data
        }
      } catch (error) {
        console.error('Error deleting stock:', error.response?.data || error);
      }
    },

    async deleteProductType(productType) {
      try {
        // Call the DELETE /stock/:productType route to delete the product type
        const response = await axios.delete(`${apiBaseUrl}/api/stock/${productType}`);
        console.log(`${productType} deleted successfully`);
        await this.fetchStock(); // Reload stock after deletion
      } catch (error) {
        console.error('Error deleting product type:', error.response?.data || error);
      }
    },
    

    async deleteProductSubtype(productType, productSubtype) {
      try {
        await axios.delete(`${apiBaseUrl}/api/stock/${productType}/${productSubtype}`);
        console.log(`${productSubtype} deleted successfully`);
        await this.fetchStock(); // Reload stock after deletion
      } catch (error) {
        console.error('Error deleting product subtype:', error);
      }
    },
  },
});