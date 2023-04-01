import { createApp } from 'vue'
import MyApp from "./OptionsApp.vue";
import PrimeVue from 'primevue/config';
import {setup_browser} from '../../common/browser_utils'

setup_browser()
const app = createApp(MyApp);
app.use(PrimeVue);

app.mount('#app')
