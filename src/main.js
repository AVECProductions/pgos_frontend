import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import axios from 'axios'

console.log('Initializing Vue app...')

// Configure axios defaults
axios.defaults.baseURL = 'http://localhost:8000'  // your Django backend URL

// Add request interceptor
axios.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

console.log('Mounting Vue app...')
app.mount('#app')
console.log('Vue app mounted')
