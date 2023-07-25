import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { i18n } from './locales';
import { Popup, Switch } from 'vant';
import ElementPlus from 'element-plus';
import router from './router';
import App from './App.vue';

import './assets/main.css';
import './styles/tailwind.css';
import 'vant/lib/index.css';
import 'element-plus/dist/index.css';
import 'element-plus/theme-chalk/dark/css-vars.css';

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.use(i18n);
app.use(ElementPlus);
app.use(Popup);
app.use(Switch);

app.mount('#app');
