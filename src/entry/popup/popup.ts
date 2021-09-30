import { createApp } from 'vue'
import App from "./PopupApp.vue";
import PrimeVue from 'primevue/config';


// @ts-ignore
const app = createApp(App);
app.use(PrimeVue);

app.mount('#app')

