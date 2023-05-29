import {createApp} from 'vue'
import App from "../sidebar/SideBar.vue"
import PrimeVue from "primevue/config";

const app = createApp(App)
app.use(PrimeVue)

app.mount("#app")
