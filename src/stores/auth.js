import { defineStore } from 'pinia'
import axios from 'axios'
import router from '@/router'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: localStorage.getItem('token') || null
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
  },

  actions: {
    async login(username, password) {
      try {
        const response = await axios.post('/auth/jwt/create/', {
          username,
          password
        })
        
        const token = response.data.access
        this.token = token
        localStorage.setItem('token', token)
        
        // Get user data
        const userResponse = await axios.get('/auth/users/me/', {
          headers: { Authorization: `Bearer ${token}` }
        })
        this.user = userResponse.data

        router.push('/dashboard')
        return true
      } catch (error) {
        console.error('Login error:', error.response?.data)
        throw error
      }
    },

    logout() {
      this.token = null
      this.user = null
      localStorage.removeItem('token')
      router.push('/login')
    },

    async register(userData) {
      try {
        await axios.post('/api/users/register/', userData)
        // After registration, log the user in
        return await this.login(userData.username, userData.password)
      } catch (error) {
        console.error('Registration error:', error)
        throw error
      }
    }
  }
}) 