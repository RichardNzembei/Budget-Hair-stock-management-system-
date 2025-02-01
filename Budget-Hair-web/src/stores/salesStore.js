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

        this.socket.on('sale-updated', () => {
          console.log('Sale data updated!');
          this.fetchSales();
        });

        this.socket.on('stock-updated', () => {
          console.log('Stock data updated!');
          // Additional logic can go here if needed
        });

        this.socket.on('connect_error', (err) => {
          console.error('Socket connection error:', err);
        });

        this.socket.on('disconnect', () => {
          console.log('Socket disconnected');
        });
      }
    },

    // Disconnect the socket
    disconnectSocket() {
      if (this.socket) {
        this.socket.disconnect();
        this.socket = null;
        console.log('Socket disconnected');
      }
    },


    // Fetch all sales
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
          
          // Emit socket event to notify all clients
          this.socket.emit("sale-change");
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
          console.log("User canceled sale restore.");
          return;
        }
    
        const quantityToRestore = result.value;
    
        const response = await axios.patch(
          `${apiBaseUrl}/api/sales/${saleId}`,
          null,
          { params: { quantityToRestore } }
        );
    
        if (response.status === 200) {
          console.log("Sale updated successfully:", response.data);
    
          Swal.fire({
            title: "Restored to stock",
            text: `${quantityToRestore} units of ${productType}, ${productSubtype} restored successfully.`,
            icon: "success",
            confirmButtonText: "OK",
          });
    
          this.socket.emit("sale-updated"); // Notify other clients
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
    },
  persist: true,
});
