import "./assets/css/tailwind.css";
import { createPinia } from "pinia";
import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);

if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("/service-worker.js")
    .then((registration) => {
      console.log("Service Worker registered with scope:", registration.scope);

      if ("sync" in registration) {
        console.log("Background sync is supported");
      } else {
        console.log("Background sync is not supported");
      }

      triggerBackgroundSync(registration);
    })
    .catch((error) => {
      console.error("Service Worker registration failed:", error);
    });
}

function triggerBackgroundSync(registration) {
  if ("sync" in registration) {
    registration.sync
      .register("fetch-data")
      .then(() => {
        console.log("Background sync triggered");
      })
      .catch((error) => {
        console.error("Background sync registration failed:", error);
      });
  }
}

app.mount("#app");
