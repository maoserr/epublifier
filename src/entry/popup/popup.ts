import { createApp } from 'vue'
import App from "./PopupApp.vue";
import PrimeVue from 'primevue/config';
import {setup_browser} from '../../common/browser_utils'

setup_browser()

const app = createApp(App);
app.use(PrimeVue);

app.mount('#app')

