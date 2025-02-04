<template>
  <div class="container">
    <div class="columns is-centered">
      <div class="column is-half">
        <div class="box">
          <h1 class="title has-text-centered">Register</h1>
          
          <form @submit.prevent="handleSubmit">
            <div class="field">
              <label class="label">Username</label>
              <div class="control">
                <input 
                  class="input" 
                  type="text" 
                  v-model="form.username"
                  required
                >
              </div>
            </div>

            <div class="field">
              <label class="label">Email</label>
              <div class="control">
                <input 
                  class="input" 
                  type="email" 
                  v-model="form.email"
                  required
                >
              </div>
            </div>

            <div class="field">
              <label class="label">Password</label>
              <div class="control">
                <input 
                  class="input" 
                  type="password" 
                  v-model="form.password"
                  required
                >
              </div>
            </div>

            <div class="field">
              <label class="label">Confirm Password</label>
              <div class="control">
                <input 
                  class="input" 
                  type="password" 
                  v-model="form.password2"
                  required
                >
              </div>
            </div>

            <div class="field">
              <div class="control">
                <button 
                  class="button is-fullwidth" 
                  :class="{ 'is-loading': loading }"
                  type="submit"
                >
                  Register
                </button>
              </div>
            </div>

            <div v-if="error" class="notification is-danger">
              {{ error }}
            </div>
          </form>

          <p class="has-text-centered mt-4">
            Already have an account? 
            <router-link to="/login">Login</router-link>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import axios from 'axios'

export default {
  name: 'RegisterView',
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()
    const loading = ref(false)
    const error = ref('')
    const form = ref({
      username: '',
      email: '',
      password: '',
      password2: ''
    })

    const handleSubmit = async () => {
      if (form.value.password !== form.value.password2) {
        error.value = 'Passwords do not match'
        return
      }

      loading.value = true
      error.value = ''

      try {
        await axios.post('/auth/users/', {
          username: form.value.username,
          email: form.value.email,
          password: form.value.password
        })
        
        await authStore.login(form.value.username, form.value.password)
      } catch (err) {
        console.log('Registration error:', err.response?.data)
        error.value = err.response?.data?.detail || 
                     Object.values(err.response?.data || {})[0]?.[0] ||
                     'Registration failed'
      } finally {
        loading.value = false
      }
    }

    return {
      form,
      loading,
      error,
      handleSubmit
    }
  }
}
</script> 