import { defineStore } from "pinia";
import axios from "axios";


const apiBaseUrl =
  process.env.NODE_ENV === "production"
    ? "https://budget-hair-stock-management-system.onrender.com"
    : "http://localhost:5000";

export const useSalesStore = defineStore("sales", {
  state: () => ({
    sales: [],
  }),

  actions: {
    async fetchSales() {
      try {
        const response = await axios.get(`${apiBaseUrl}/api/sales`);
        this.sales = response.data;
        console.log("Fetched sales:", response.data);
      } catch (error) {
        console.error("Error fetching sales:", error.response?.data || error);
      }
    },

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
          console.log("Sale added successfully:", response.data);
          await this.fetchSales();
        } else {
          console.error("Failed to add sale:", response.data);
        }
      } catch (error) {
        console.error("Error adding sale:", error.response?.data || error);
      }
    },
  },
});
