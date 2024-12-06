// stores/stockStore.js
import { defineStore } from 'pinia';
import axios from 'axios';

export const useStockStore = defineStore('stock', {
  state: () => ({
    stock: {},
  }),

  actions: {
    async fetchStock() {
      try {
        const response = await axios.get('http://localhost:5000/api/stock');
        this.stock = response.data;
      } catch (error) {
        console.error('Error fetching stock:', error);
      }
    },

    async addStockToBackend(productType, productSubtype, quantity) {
      try {
        const response = await axios.post('http://localhost:5000/api/stock', {
          productType,
          productSubtype,
          quantity,
        });
        console.log(response.data);
        this.fetchStock(); // refresh stock data after adding
      } catch (error) {
        console.error('Error adding stock:', error);
      }
    },
  },
});
