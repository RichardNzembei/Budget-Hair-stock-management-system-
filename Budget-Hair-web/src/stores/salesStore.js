import { defineStore } from "pinia";
import axios from "axios";
import { io } from "socket.io-client";
import Swal from "sweetalert2";
import debounce from "lodash/debounce";

const apiBaseUrl =
  process.env.NODE_ENV === "production"
    ? "https://budget-hair-stock-management-system.onrender.com"
    : "http://localhost:5000";

export const useSalesStore = defineStore("sales", {
  state: () => ({
    sales: [],
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

        this.socket.on("sale-updated", (payload) => {
          console.log("Sale updated event received:", payload);
          this.updateSaleFromSocket(payload);
        });

        this.socket.on("sale-deleted", ({ id }) => {
          console.log("Sale deleted event received:", id);
          this.sales = this.sales.filter((sale) => sale.id !== id);
          this.cacheSalesData(this.sales);
        });

        this.socket.on("stock-updated", (payload) => {
          console.log("Stock updated event received:", payload);
        });

        this.socket.on("connect", () => {
          console.log("Connected to WebSocket server");
          this.isConnected = true;
        });

        this.socket.on("disconnect", () => {
          console.log("Disconnected from WebSocket server");
          this.isConnected = false;
        });

        this.socket.on("connect_error", (err) => {
          console.error("Socket connection error:", err.message);
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

    updateSaleFromSocket(payload) {
      if (!payload || !payload.id || !payload.productType || !payload.productSubtype || !payload.quantitySold) {
        console.error("Invalid sale-updated payload:", payload);
        setTimeout(() => this.fetchSales(), 1000);
        return;
      }

      const { id, productType, productSubtype, quantitySold, saleTime } = payload;
      const existingSaleIndex = this.sales.findIndex((sale) => sale.id === id);

      if (existingSaleIndex >= 0) {
        this.sales[existingSaleIndex] = { id, productType, productSubtype, quantitySold, saleTime };
      } else {
        this.sales.push({ id, productType, productSubtype, quantitySold, saleTime });
      }

      this.sales.sort((a, b) => new Date(b.saleTime) - new Date(a.saleTime));
      this.cacheSalesData(this.sales);
    },

    fetchSales: debounce(async function () {
      const cacheValidDuration = 30 * 1000;
      if (this.lastFetched && Date.now() - this.lastFetched < cacheValidDuration) {
        console.log("Using recent sales data, skipping fetch");
        return;
      }

      try {
        this.loading = true;
        const response = await axios.get(`${apiBaseUrl}/api/sales`);
        this.sales = response.data;
        this.lastFetched = Date.now();
        console.log("Fetched 5-day sales:", this.sales);
        await this.cacheSalesData(this.sales);
      } catch (error) {
        console.error("Error fetching 5-day sales:", error.response?.data || error.message);
      } finally {
        this.loading = false;
      }
    }, 500),

    async fetchAllTimeSales() {
      try {
        this.loading = true;
        const response = await axios.get(`${apiBaseUrl}/api/sales/all-time`);
        this.sales = response.data;
        console.log("Fetched all-time sales:", this.sales);
        await this.cacheSalesData(this.sales);
      } catch (error) {
        console.error("Error fetching all-time sales:", error.response?.data || error.message);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to fetch all-time sales.",
        });
      } finally {
        this.loading = false;
      }
    },

    async fetchSalesByDateRange(startDate, endDate) {
      try {
        this.loading = true;
        const response = await axios.get(`${apiBaseUrl}/api/sales/date-range`, {
          params: { startDate, endDate },
        });
        this.sales = response.data;
        console.log("Fetched sales by date range:", this.sales);
        await this.cacheSalesData(this.sales);
      } catch (error) {
        console.error("Error fetching sales by date range:", error.response?.data || error.message);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to fetch sales for the selected date range.",
        });
      } finally {
        this.loading = false;
      }
    },

    async addSaleToBackend(productType, productSubtype, quantitySold) {
      try {
        this.loading = true;
        const sale = {
          productType,
          productSubtype,
          quantitySold,
          saleTime: new Date().toISOString(),
        };
        const response = await axios.post(`${apiBaseUrl}/api/sales`, sale);
        if (response.status === 201) {
          console.log("Sale added successfully:", response.data);
          // No need to emit sale-updated; backend handles it
        }
      } catch (error) {
        console.error("Error adding sale:", error.response?.data || error.message);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async deleteSale(saleId, productType, productSubtype, quantitySold) {
      try {
        this.loading = true;
        const result = await Swal.fire({
          title: "Enter quantity to restore",
          input: "number",
          inputLabel: "Quantity to restore",
          inputValue: quantitySold || 0,
          inputAttributes: {
            min: 1,
            max: quantitySold,
            step: 1,
          },
          showCancelButton: true,
          confirmButtonText: "Restore",
          cancelButtonText: "Cancel",
          preConfirm: (quantityToRestore) => {
            if (quantityToRestore <= 0) {
              Swal.showValidationMessage("Quantity must be greater than 0");
              return false;
            }
            return quantityToRestore;
          },
        });

        if (!result.isConfirmed) {
          console.log("User canceled sale restore.");
          return;
        }

        const quantityToRestore = parseInt(result.value);
        const response = await axios.patch(`${apiBaseUrl}/api/sales/${saleId}`, null, {
          params: { quantityToRestore },
        });

        if (response.status === 200) {
          console.log("Sale updated successfully:", response.data);
          Swal.fire({
            title: "Restored to stock",
            text: `${quantityToRestore} units of ${productSubtype} (${productType}) restored successfully.`,
            icon: "success",
            confirmButtonText: "OK",
          });
        }
      } catch (error) {
        console.error("Error updating sale:", error.response?.data || error.message);
        Swal.fire({
          title: "Error",
          text: "There was an error processing the request.",
          icon: "error",
          confirmButtonText: "OK",
        });
      } finally {
        this.loading = false;
      }
    },

    async cacheSalesData(salesData) {
      try {
        const cache = await caches.open("sales-cache");
        const cachedResponse = new Response(JSON.stringify(salesData));
        await cache.put("/api/sales", cachedResponse);
        console.log("Sales data cached successfully");
      } catch (error) {
        console.error("Error caching sales data:", error);
      }
    },

    async syncSalesData() {
      try {
        const cache = await caches.open("sales-cache");
        const cachedResponse = await cache.match("/api/sales");
        if (cachedResponse) {
          const cachedSales = await cachedResponse.json();
          console.log("Using cached sales data:", cachedSales);
          this.sales = cachedSales;
          this.lastFetched = Date.now();
        } else {
          console.log("No cached sales data available");
          await this.fetchSales();
        }

        const tag = "sync-sales";
        if (navigator.serviceWorker) {
          await navigator.serviceWorker.ready.then((registration) => {
            return registration.sync.register(tag);
          });
          console.log("Sales data sync registered in background");
        }
      } catch (error) {
        console.error("Error syncing sales data:", error);
      }
    },

    async handleBackgroundSync(event) {
      if (event.tag === "sync-sales") {
        console.log("Background sync triggered for sales data");
        await this.fetchSales();
      }
    },
  },

  persist: true,
});