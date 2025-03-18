import { defineStore } from "pinia";
import axios from "axios";
import { io } from "socket.io-client";

const apiBaseUrl =
  process.env.NODE_ENV === "production"
    ? "https://budget-hair-stock-management-system.onrender.com"
    : "http://localhost:5000";

export const useStockStore = defineStore("stock", {
  state: () => ({
    stock: {},
    stockHistory: [],
    socket: null,
  }),

  actions: {
    initSocket() {
      if (!this.socket) {
        this.socket = io(apiBaseUrl);

        this.socket.on("stock-updated", (payload) => {
          console.log("Stock updated event received:", payload);
          this.fetchStock();
        });

        this.socket.on("connect", () => {
          console.log("Connected to WebSocket server");
        });

        this.socket.on("disconnect", () => {
          console.log("Disconnected from WebSocket server");
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
        console.log("Fetched stock:", this.stock);
        await this.cacheStockData(response.data);
      } catch (error) {
        console.error("Error fetching stock:", error.response?.data || error);
      }
    },
    async fetchStockHistory() {
      try {
        const response = await axios.get(`${apiBaseUrl}/api/stock/history`);
        console.log("API Response:", response.data); // Debug log
        this.stockHistory = response.data;
        console.log("Fetched stock history:", this.stockHistory);
      } catch (error) {
        console.error("Error fetching stock history:", error.response?.data || error);
      }
    },
    

    async addStock(productType, productSubtype, quantity) {
      try {
        const stock = { productType, productSubtype, quantity };
        const response = await axios.post(`${apiBaseUrl}/api/stock`, stock);

        if (response.status === 201) {
          console.log("Stock added successfully:", response.data);
          await this.fetchStock();
          await this.fetchStockHistory();
        } else {
          console.error("Failed to add stock:", response.data);
        }
      } catch (error) {
        console.error("Error adding stock:", error.response?.data || error);
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
          console.log("Stock edited successfully:", response.data);
          await this.fetchStock();
          await this.fetchStockHistory();
        }
      } catch (error) {
        console.error("Error editing stock:", error.response?.data || error);
      }
    },

    async deleteStock(productType, productSubtype) {
      try {
        console.log("Deleting stock:", { productType, productSubtype });
        const response = await axios.delete(`${apiBaseUrl}/api/stock`, {
          data: { productType, productSubtype },
        });

        if (response.status === 200) {
          console.log("Stock deleted successfully:", response.data);
          await this.fetchStock();
          await this.fetchStockHistory();
        }
      } catch (error) {
        console.error("Error deleting stock:", error.response?.data || error);
      }
    },

    async deleteProductType(productType) {
      try {
        const response = await axios.delete(
          `${apiBaseUrl}/api/stock/${productType}`
        );
        console.log(`${productType} deleted successfully`);
        await this.fetchStock();
      } catch (error) {
        console.error(
          "Error deleting product type:",
          error.response?.data || error
        );
      }
    },
    async deleteProductSubtype(productType, productSubtype) {
      try {
        await axios.delete(
          `${apiBaseUrl}/api/stock/${productType}/${productSubtype}`
        );
        console.log(`${productSubtype} deleted successfully`);
        await this.fetchStock();
        await this.fetchStockHistory();
      } catch (error) {
        console.error("Error deleting product subtype:", error);
      }
    },

    async cacheStockData(stockData) {
      const cache = await caches.open("stock-cache");
      const cachedResponse = new Response(JSON.stringify(stockData));
      await cache.put("/api/stock", cachedResponse);
      console.log("Stock data cached successfully");
    },
    async syncStockData() {
      const cache = await caches.open("stock-cache");
      const cachedResponse = await cache.match("/api/stock");
      if (cachedResponse) {
        const cachedStock = await cachedResponse.json();
        console.log("Using cached stock data:", cachedStock);
        this.stock = cachedStock;
      } else {
        console.log("No cached stock data available");
      }

      const tag = "sync-stock";
      if (navigator.serviceWorker) {
        await navigator.serviceWorker.ready.then((registration) => {
          return registration.sync.register(tag);
        });
        console.log("Stock data sync registered in background");
      }
    },

    async handleBackgroundSync(event) {
      if (event.tag === "sync-stock") {
        console.log("Background sync triggered for stock data");
        await this.fetchStock();
      }
    },
  },
});
