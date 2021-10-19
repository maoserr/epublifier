import { createApp } from 'vue'

import App from "./Options.vue";
import PrimeVue from 'primevue/config';


// @ts-ignore
const app = createApp(App);
app.use(PrimeVue);

app.mount('#app')