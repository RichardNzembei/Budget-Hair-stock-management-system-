import { defineStore } from "pinia";
import axios from "axios";

export const useSalesStore = defineStore("sales", {
  state: () => ({
    sales: [],
  }),
  actions: {
    async fetchSales() {
      try {
        const response = await axios.get("http://localhost:5000/api/sales");
        this.sales = response.data;
      } catch (error) {
        console.error("Error fetching sales:", error);
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
        await axios.post("http://localhost:5000/api/sales", sale);
        await this.fetchSales(); // Refresh sales after adding
      } catch (error) {
        console.error("Error adding sale:", error);
      }
    },
  },
});
