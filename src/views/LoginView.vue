<template>
  <div class="columns is-centered">
    <div class="column is-one-third">
      <div class="box">
        <h1 class="title has-text-centered">Login</h1>
        
        <form @submit.prevent="handleSubmit">
          <div class="field">
            <label class="label">Username</label>
            <div class="control">
              <input 
                class="input" 
                type="text" 
                v-model="username" 
                required
                :class="{ 'is-danger': errors.username }"
              >
            </div>
            <p class="help is-danger" v-if="errors.username">{{ errors.username }}</p>
          </div>

          <div class="field">
            <label class="label">Password</label>
            <div class="control">
              <input 
                class="input" 
                type="password" 
                v-model="password" 
                required
                :class="{ 'is-danger': errors.password }"
              >
            </div>
            <p class="help is-danger" v-if="errors.password">{{ errors.password }}</p>
          </div>

          <div class="field">
            <div class="control">
              <button 
                class="button is-primary is-fullwidth" 
                :class="{ 'is-loading': loading }"
                type="submit"
              >
                Login
              </button>
            </div>
          </div>

          <p class="has-text-centered mt-4">
            Don't have an account? 
            <router-link to="/register">Register</router-link>
          </p>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

export default {
  name: 'LoginView',
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()
    
    const username = ref('')
    const password = ref('')
    const loading = ref(false)
    const errors = ref({})

    const handleSubmit = async () => {
      loading.value = true
      errors.value = {}

      try {
        await authStore.login(username.value, password.value)
        router.push('/')
      } catch (error) {
        if (error.response?.data) {
          errors.value = error.response.data
        } else {
          errors.value = { general: 'An error occurred during login' }
        }
      } finally {
        loading.value = false
      }
    }

    return {
      username,
      password,
      loading,
      errors,
      handleSubmit
    }
  }
}
</script> 