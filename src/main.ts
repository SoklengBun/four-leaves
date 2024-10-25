import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { i18n } from './locales';
import App from './App.vue';
import router from './router';
import { Popup, Switch } from 'vant';

import 'vant/lib/index.css';
import './assets/main.css';
import './styles/tailwind.css';

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.use(i18n);
app.use(Popup);
app.use(Switch);

router.isReady().then(() => app.mount('#app'));
