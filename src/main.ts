import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
//VueSweetalert2
import VueSweetalert2 from 'vue-sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
//VueDatePicker
import VueDatePicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';

import SidebarMenu from "./layouts/default/components/SidebarMenu.vue";
console.log(SidebarMenu);


import './style.css';
import './index.css';

const app = createApp(App);
app.use(createPinia());
app.use(router);
app.use(VueSweetalert2);
app.component('VueDatePicker', VueDatePicker);

app.mount('#app');
