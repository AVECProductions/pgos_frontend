import { defineStore } from 'pinia'
import axios from 'axios'

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
        const response = await axios.post('/api/token/', {
          username,
          password
        })
        
        this.token = response.data.access
        localStorage.setItem('token', this.token)
        
        // Set axios default header for future requests
        axios.defaults.headers.common['Authorization'] = `Bearer ${this.token}`
        
        // Fetch user data
        await this.fetchUserProfile()
        
        return true
      } catch (error) {
        console.error('Login error:', error)
        throw error
      }
    },

    async fetchUserProfile() {
      try {
        // Ensure token is in headers
        axios.defaults.headers.common['Authorization'] = `Bearer ${this.token}`
        const response = await axios.get('/api/users/profile/')
        this.user = response.data
      } catch (error) {
        console.error('Error fetching user profile:', error)
        throw error
      }
    },

    async logout() {
      this.user = null
      this.token = null
      localStorage.removeItem('token')
      delete axios.defaults.headers.common['Authorization']
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