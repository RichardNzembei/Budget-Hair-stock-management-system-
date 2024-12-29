const PUBLIC_VAPID_KEY = 'BLXNZaVwiz5mh3WI_Zqf-e77TvVs80zxJX0KL8MZEB2KRcAvPANCekrwj8vbGrNT6nMGmwu1zxbBOdMd8S6kaGM';
import { defineStore } from 'pinia';
import axios from 'axios';
import { io } from 'socket.io-client';

const apiBaseUrl =
  process.env.NODE_ENV === 'production'
    ? 'https://budget-hair-stock-management-system.onrender.com'
    : 'http://localhost:5000';

export const useNotificationStore = defineStore('notification', {
  state: () => ({
    subscription: null,
    socket: null,
  }),

  actions: {
    // Initialize WebSocket connection
    initSocket() {
      if (!this.socket) {
        console.log('Initializing WebSocket connection...');
        this.socket = io(apiBaseUrl);

        this.socket.on('connect', () => {
          console.log('Connected to WebSocket server.');
        });

        this.socket.on('notification-received', (payload) => {
          console.log('Notification received:', payload);
          if ('Notification' in window) {
            new Notification(payload.title, { body: payload.body });
          }
        });

        this.socket.on('disconnect', () => {
          console.log('Disconnected from WebSocket server.');
        });
      }
    },

    // Disconnect the WebSocket connection
    disconnectSocket() {
      if (this.socket) {
        console.log('Disconnecting WebSocket...');
        this.socket.disconnect();
        this.socket = null;
        console.log('Socket disconnected.');
      }
    },
    async subscribeUser() {
      try {
        console.log('Starting subscription process...');
        
        // Check notification support
        if (!('Notification' in window)) {
          throw new Error('Notifications are not supported in this browser.');
        }
    
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          throw new Error('Notification permissions denied by the user.');
        }
    
        const registration = await navigator.serviceWorker.register('/service-worker.js');
        console.log('Service Worker registered successfully:', registration);
    
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: this.urlBase64ToUint8Array(PUBLIC_VAPID_KEY),
        });
    
        console.log('Subscription created:', subscription);
    
        await axios.post(`${apiBaseUrl}/api/subscribe`, subscription);
        console.log('Subscription sent to backend.');
    
      } catch (error) {
        console.error('Error during subscription:', error);
      }
    },
    

    // Unsubscribe the user from notifications
    async unsubscribeUser() {
      try {
        if (!this.subscription) {
          console.log('No subscription found to unsubscribe.');
          return;
        }

        console.log('Unsubscribing user...');
        await this.subscription.unsubscribe();
        console.log('User unsubscribed from notifications.');

        await axios.post(`${apiBaseUrl}/api/unsubscribe`, this.subscription);
        console.log('Unsubscription data sent to backend.');

        this.subscription = null;
        console.log('User unsubscribed successfully.');
      } catch (error) {
        console.error('Error unsubscribing from notifications:', error);
      }
    },

    // Convert Base64 VAPID key to Uint8Array
    urlBase64ToUint8Array(base64String) {
      console.log('Converting VAPID key to Uint8Array...');
      const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
      const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
      const rawData = window.atob(base64);
      const outputArray = new Uint8Array(rawData.length);
      for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
      }
      console.log('VAPID key converted:', outputArray);
      return outputArray;
    },
  },
});
