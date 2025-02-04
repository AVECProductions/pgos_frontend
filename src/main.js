import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import axios from 'axios'
import AOS from 'aos'
import 'aos/dist/aos.css'
import 'animate.css'

console.log('Initializing Vue app...')

// Initialize AOS
AOS.init({
  duration: 800,
  easing: 'ease-out',
  once: true
})

// Configure axios defaults
axios.defaults.baseURL = process.env.NODE_ENV === 'production' 
  ? 'https://pgos-production.up.railway.app'  // Replace with your Railway URL
  : 'http://localhost:8000'

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
