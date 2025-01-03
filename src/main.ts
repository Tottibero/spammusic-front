import { createApp } from "vue";
import { createPinia } from "pinia";
import ToastPlugin from "vue3-toaster";
import App from "./App.vue";
import router from "./router";
import "./style.css";
import "./index.css";

const app = createApp(App);
app.use(createPinia());
app.use(router);
app.use(ToastPlugin, {
  closable: false,
  //.. other options
});

app.mount("#app");
