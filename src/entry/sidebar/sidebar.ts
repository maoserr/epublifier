import {createApp} from 'vue'
import App from "./SideBar.vue"
import PrimeVue from "primevue/config";

const app = createApp(App)
app.use(PrimeVue)

app.mount("#app")
