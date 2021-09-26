import Vue from "vue";
import App from "./PopupApp.vue";

Vue.config.productionTip = false;

/* eslint-disable no-new */
new Vue({
    el: "#app",
    render: (createElement) => {
        return createElement(App)
    }
});



