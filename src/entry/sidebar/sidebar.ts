import { createApp } from 'vue'
import App from "./SideBar.vue"
import PrimeVue from "primevue/config";

const app = createApp(App)
app.use(PrimeVue)

app.mount('#app')

let baseMouseX:any, baseMouseY:any
window.addEventListener('mousedown', handleDragStart)
function handleDragStart (evt:any) {
    baseMouseX = evt.clientX
    baseMouseY = evt.clientY
    window.parent.postMessage({
        msg: 'SALADICT_DRAG_START',
        mouseX: baseMouseX,
        mouseY: baseMouseY
    }, '*')

    document.addEventListener('mouseup', handleDragEnd)
    document.addEventListener('mousemove', handleMousemove)
}

function handleMousemove (evt:any) {
    window.parent.postMessage({
        msg: 'SALADICT_DRAG_MOUSEMOVE',
        offsetX: evt.clientX - baseMouseX,
        offsetY: evt.clientY - baseMouseY
    }, '*')
}

function handleDragEnd () {
    window.parent.postMessage({
        msg: 'SALADICT_DRAG_END'
    }, '*')

    document.removeEventListener('mouseup', handleDragEnd)
    document.removeEventListener('mousemove', handleMousemove)
}
