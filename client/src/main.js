import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import SprintOneIDE from './components/SprintOneIDE.vue'

const app = createApp(App)

app.use(router).mount('#app')
app.component("SprintOneIDE", SprintOneIDE)