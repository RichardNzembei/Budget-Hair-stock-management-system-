import { defineStore } from "pinia";
import axios from "axios";
import { io } from "socket.io-client";
import Swal from "sweetalert2";

const apiBaseUrl =
  process.env.NODE_ENV === "production"
    ? "https://budget-hair-stock-management-system.onrender.com"
    : "http://localhost:5000";

export const useSalesStore = defineStore("sales", {
  state: () => ({
    sales: [],
    socket: null,
  }),

  actions: {
    initSocket() {
      if (!this.socket) {
        this.socket = io(apiBaseUrl);

        this.socket.on("sale-updated", () => {
          console.log("Sale data updated!");
          this.fetchSales();
        });

        this.socket.on("stock-updated", () => {
          console.log("Stock data updated!");
          // Additional logic can go here if needed
        });

        this.socket.on("connect_error", (err) => {
          console.error("Socket connection error:", err);
        });

        this.socket.on("disconnect", () => {
          console.log("Socket disconnected");
        });
      }
    },

    // Disconnect the socket
    disconnectSocket() {
      if (this.socket) {
        this.socket.disconnect();
        this.socket = null;
        console.log("Socket disconnected");
      }
    },

    async fetchSales() {
      try {
        const response = await axios.get(`${apiBaseUrl}/api/sales`);
        this.sales = response.data;
        console.log("Fetched sales:", response.data);
        await this.cacheSalesData(response.data);
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
        }
      } catch (error) {
        console.error("Error adding sale:", error.response?.data || error);
      }
    },

    async deleteSale(saleId, productType, productSubtype, quantitySold) {
      try {
        console.log(`Updating sale with ID: ${saleId}`);

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
          return;
        }

        const quantityToRestore = result.value;

        const response = await axios.patch(
          `${apiBaseUrl}/api/sales/${saleId}`,
          null,
          {
            params: { quantityToRestore },
          }
        );

        if (response.status === 200) {
          console.log("Sale updated successfully:", response.data);

          await this.fetchSales();

          Swal.fire({
            title: "Restored to stock",
            text: `${quantityToRestore} units of ${productType}, ${productSubtype} restored to stock successfully.`,
            icon: "success",
            confirmButtonText: "OK",
          });
        } else {
          console.log("Failed to update sale:", response);
        }
      } catch (error) {
        console.error("Error updating sale:", error.response?.data || error);
        Swal.fire({
          title: "Error",
          text: "There was an error processing the request.",
          icon: "error",
          confirmButtonText: "OK",
        });
      }
    },

    async cacheSalesData(salesData) {
      const cache = await caches.open("sales-cache");
      const cachedResponse = new Response(JSON.stringify(salesData));
      await cache.put("/api/sales", cachedResponse);
      console.log("Sales data cached successfully");
    },

    async syncSalesData() {
      const cache = await caches.open("sales-cache");
      const cachedResponse = await cache.match("/api/sales");
      if (cachedResponse) {
        const cachedSales = await cachedResponse.json();
        console.log("Using cached sales data:", cachedSales);
        this.sales = cachedSales;
      } else {
        console.log("No cached sales data available");
      }

      const tag = "sync-sales";
      if (navigator.serviceWorker) {
        await navigator.serviceWorker.ready.then((registration) => {
          return registration.sync.register(tag);
        });
        console.log("Sales data sync registered in background");
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
