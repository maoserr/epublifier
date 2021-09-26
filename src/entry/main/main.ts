import Vue from "vue";
import App from "./MainApp.vue";

Vue.config.productionTip = false;

/* eslint-disable no-new */
new Vue({
    el: "#app",
    render: (createElement) => {
        return createElement(App)
    },
});

