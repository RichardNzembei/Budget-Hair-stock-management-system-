import { defineStore } from 'pinia';
import axios from 'axios';

const apiBaseUrl =
  process.env.NODE_ENV === 'production'
    ? 'https://budget-hair-stock-management-system.onrender.com'
    : 'http://localhost:5000';

export const useStockStore = defineStore('stock', {
  state: () => ({
    stock: {},
  }),

  actions: {
    async fetchStock() {
      try {
        const response = await axios.get(`${apiBaseUrl}/api/stock`);
        this.stock = response.data;
        console.log('Fetched stock:', response.data);
      } catch (error) {
        console.error('Error fetching stock:', error.response?.data || error);
      }
    },

    async addStockToBackend(productType, productSubtype, quantity) {
      try {
        const stock = {
          productType,
          productSubtype,
          quantity,
        };

        const response = await axios.post(`${apiBaseUrl}/api/stock`, stock);

        if (response.status === 201) {
          console.log('Stock added successfully:', response.data);
          await this.fetchStock();
        } else {
          console.error('Failed to add stock:', response.data);
        }
      } catch (error) {
        console.error('Error adding stock:', error.response?.data || error);
      }
    },
  },
});
