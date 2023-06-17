import { createApp } from 'vue'
import App from "../popup/PopupApp.vue";
import PrimeVue from 'primevue/config';
import Tooltip from "primevue/tooltip";

const app = createApp(App);
app.use(PrimeVue);
app.directive('tooltip', Tooltip);

app.mount('#app')

