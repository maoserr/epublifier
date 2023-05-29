import { createApp } from 'vue'
import App from "../popup/PopupApp.vue";
import PrimeVue from 'primevue/config';

const app = createApp(App);
app.use(PrimeVue);

app.mount('#app')

