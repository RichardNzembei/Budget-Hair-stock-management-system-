import { defineStore } from "pinia";
import axios from "axios";
import { io } from "socket.io-client";
import debounce from "lodash/debounce";

const apiBaseUrl =
  process.env.NODE_ENV === "production"
    ? "https://budget-hair-stock-management-system.onrender.com"
    : "http://localhost:5000";

export const useStockStore = defineStore("stock", {
  state: () => ({
    stock: {},
    stockHistory: [],
    socket: null,
    loading: false,
    lastFetched: null,
    isConnected: false,
  }),

  actions: {
    initSocket() {
      if (!this.socket) {
        this.socket = io(apiBaseUrl, {
          reconnection: true,
          reconnectionAttempts: 10,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
        });

        this.socket.on("stock-updated", (payload) => {
          console.log("Stock updated event received:", payload);
          this.updateStockFromSocket(payload);
        });

        this.socket.on("stock-deleted", ({ productType }) => {
          console.log("Stock deleted event received:", productType);
          if (this.stock[productType]) {
            delete this.stock[productType];
            this.cacheStockData(this.stock);
          }
        });

        this.socket.on("connect", () => {
          console.log("Connected to WebSocket server");
          this.isConnected = true;
          this.fetchStock(); // Ensure fresh data on reconnect
        });

        this.socket.on("disconnect", () => {
          console.log("Disconnected from WebSocket server");
          this.isConnected = false;
        });

        this.socket.on("connect_error", (err) => {
          console.error("WebSocket connection error:", err.message);
        });
      }
    },

    disconnectSocket() {
      if (this.socket) {
        this.socket.disconnect();
        this.socket = null;
        this.isConnected = false;
      }
    },

    updateStockFromSocket(payload) {
      if (!payload || !payload.productType || !payload.productSubtype) {
        console.error("Invalid stock-updated payload:", payload);
        setTimeout(() => this.fetchStock(), 1000); // Delayed fetch to allow reconnection
        return;
      }

      const { productType, productSubtype, newStock } = payload;

      if (!this.stock[productType]) {
        this.stock[productType] = {};
      }

      if (newStock === null) {
        delete this.stock[productType][productSubtype];
        if (Object.keys(this.stock[productType]).length === 0) {
          delete this.stock[productType];
        }
      } else {
        this.stock[productType][productSubtype] = newStock;
      }

      this.cacheStockData(this.stock);
    },

    fetchStock: debounce(async function (force = true) {
      const cacheValidDuration = 30 * 1000;
      if (!force && this.lastFetched && Date.now() - this.lastFetched < cacheValidDuration) {
        console.log("Using recent stock data, skipping fetch");
        return;
      }
    
      try {
        this.loading = true;
        const response = await axios.get(`${apiBaseUrl}/api/stock`);
        this.stock = response.data;
        this.lastFetched = Date.now();
        console.log("Fetched stock:", this.stock);
        await this.cacheStockData(response.data);
      } catch (error) {
        console.error("Error fetching stock:", error.response?.data || error.message);
      } finally {
        this.loading = false;
      }
    }, 500),
    

    async fetchStockHistory() {
      try {
        this.loading = true;
        const response = await axios.get(`${apiBaseUrl}/api/stock/history`);
        console.log("API Response:", response.data);
        this.stockHistory = response.data;
        console.log("Fetched stock history:", this.stockHistory);
      } catch (error) {
        console.error("Error fetching stock history:", error.response?.data || error.message);
      } finally {
        this.loading = false;
      }
    },

    async addStock(productType, productSubtype, quantity) {
      try {
        this.loading = true;
        const stock = { productType, productSubtype, quantity };
        const response = await axios.post(`${apiBaseUrl}/api/stock`, stock);
    
        if (response.status === 201) {
          console.log("Stock added successfully:", response.data);
    
          // Update local stock immediately using the response
          this.updateStockFromSocket({
            productType,
            productSubtype,
            newStock: (this.stock[productType]?.[productSubtype] || 0) + quantity,
          });
    
          await this.fetchStockHistory();
        } else {
          console.error("Failed to add stock:", response.data);
        }
      } catch (error) {
        console.error("Error adding stock:", error.response?.data || error.message);
        throw error;
      } finally {
        this.loading = false;
      }
    },
    async editStock(productType, productSubtype, quantity) {
      try {
        this.loading = true;
        const response = await axios.put(`${apiBaseUrl}/api/stock`, {
          productType,
          productSubtype,
          quantity,
        });
    
        if (response.status === 200) {
          console.log("Stock edited successfully:", response.data);
    
          this.updateStockFromSocket({
            productType,
            productSubtype,
            newStock: quantity, // here you set quantity as new stock amount
          });
    
          await this.fetchStockHistory();
        }
      } catch (error) {
        console.error("Error editing stock:", error.response?.data || error.message);
        throw error;
      } finally {
        this.loading = false;
      }
    },
    async deleteStock(productType, productSubtype) {
      try {
        this.loading = true;
        console.log("Deleting stock:", { productType, productSubtype });
        const response = await axios.delete(`${apiBaseUrl}/api/stock`, {
          data: { productType, productSubtype },
        });
    
        if (response.status === 200) {
          console.log("Stock deleted successfully:", response.data);
    
          this.updateStockFromSocket({
            productType,
            productSubtype,
            newStock: null, // Indicating deletion
          });
    
          await this.fetchStockHistory();
        }
      } catch (error) {
        console.error("Error deleting stock:", error.response?.data || error.message);
        throw error;
      } finally {
        this.loading = false;
      }
    },
    

    async deleteProductType(productType) {
      try {
        this.loading = true;
        await axios.delete(`${apiBaseUrl}/api/stock/${productType}`);
        console.log(`${productType} deleted successfully`);
    
        if (this.stock[productType]) {
          delete this.stock[productType];
          this.cacheStockData(this.stock);
        }
    
        await this.fetchStockHistory();
      } catch (error) {
        console.error("Error deleting product type:", error.response?.data || error.message);
        throw error;
      } finally {
        this.loading = false;
      }
    },
    

    async deleteProductSubtype(productType, productSubtype) {
      try {
        this.loading = true;
        await axios.delete(`${apiBaseUrl}/api/stock/${productType}/${productSubtype}`);
        console.log(`${productSubtype} deleted successfully`);
    
        this.updateStockFromSocket({
          productType,
          productSubtype,
          newStock: null,
        });
    
        await this.fetchStockHistory();
      } catch (error) {
        console.error("Error deleting product subtype:", error.response?.data || error.message);
        throw error;
      } finally {
        this.loading = false;
      }
    },    

    async cacheStockData(stockData) {
      try {
        const cache = await caches.open("stock-cache");
        const cachedResponse = new Response(JSON.stringify(stockData));
        await cache.put("/api/stock", cachedResponse);
        console.log("Stock data cached successfully");
      } catch (error) {
        console.error("Error caching stock data:", error);
      }
    },

    async syncStockData() {
      try {
        const cache = await caches.open("stock-cache");
        const cachedResponse = await cache.match("/api/stock");
        if (cachedResponse) {
          const cachedStock = await cachedResponse.json();
          console.log("Using cached stock data:", cachedStock);
          this.stock = cachedStock;
          this.lastFetched = Date.now();
        } else {
          console.log("No cached stock data available");
          await this.fetchStock();
        }

        const tag = "sync-stock";
        if (navigator.serviceWorker) {
          await navigator.serviceWorker.ready.then((registration) => {
            return registration.sync.register(tag);
          });
          console.log("Stock data sync registered in background");
        }
      } catch (error) {
        console.error("Error syncing stock data:", error);
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