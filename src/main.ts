import { createApp } from "vue";
import { createPinia } from "pinia";

import App from "./App.vue";
import router from "./router";
import { Popup } from "vant";

import "vant/lib/index.css";
import "./assets/main.css";
import "./styles/tailwind.css";

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.use(Popup);

app.mount("#app");
