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
      } else {
        console.log('WebSocket connection already initialized.');
      }
    },

    // Disconnect the WebSocket connection
    disconnectSocket() {
      if (this.socket) {
        console.log('Disconnecting WebSocket...');
        this.socket.disconnect();
        this.socket = null;
        console.log('Socket disconnected.');
      } else {
        console.log('No WebSocket connection to disconnect.');
      }
    },

    async subscribeUser() {
      try {
        console.log('Checking notification and service worker support...');
        if (!('Notification' in window) || !('serviceWorker' in navigator)) {
          alert('Notifications or Service Workers are not supported in your browser.');
          return;
        }

        console.log('Requesting notification permission...');
        const permission = await Notification.requestPermission();
        console.log('Notification permission:', permission);

        if (permission !== 'granted') {
          alert('Notification permission denied.');
          console.log('Notification permission denied.');
          return;
        }

        console.log('Registering service worker...');
        const registration = await navigator.serviceWorker.register('/service-worker.js');
        console.log('Service worker registered with scope:', registration.scope);

        console.log('Subscribing user to push notifications...');
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: this.urlBase64ToUint8Array(PUBLIC_VAPID_KEY),
        });
        console.log('Push subscription created:', subscription);

        this.subscription = subscription;

        // Send subscription to the backend
        console.log('Sending subscription to backend...');
        const response = await axios.post(`${apiBaseUrl}/api/subscribe`, subscription);
        console.log('Subscription successfully sent to backend:', response.data);
      } catch (error) {
        console.error('Error subscribing to notifications:', error);
        if (error.name === 'AbortError') {
          console.error('The push service registration was aborted.');
        }
        if (error.message) {
          console.error('Error message:', error.message);
        }
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

        const response = await axios.post(`${apiBaseUrl}/api/unsubscribe`, this.subscription);
        console.log('Unsubscription data sent to backend:', response.data);

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
      console.log('VAPID key converted to Uint8Array:', outputArray);
      return outputArray;
    },
  },
});
