<template>
  <div class="login-container">
    <div class="login-box">
      <h1 class="title has-text-centered mb-5">Login</h1>
      
      <form @submit.prevent="handleSubmit">
        <div class="field">
          <label class="label">Username</label>
          <div class="control">
            <input 
              class="input" 
              type="text" 
              v-model="form.username" 
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
              v-model="form.password" 
              required
              :class="{ 'is-danger': errors.password }"
            >
          </div>
          <p class="help is-danger" v-if="errors.password">{{ errors.password }}</p>
        </div>

        <div class="field">
          <div class="control">
            <button 
              class="button is-fullwidth" 
              :class="{ 'is-loading': loading }" 
              type="submit"
            >
              Login
            </button>
          </div>
        </div>

        <div v-if="error" class="notification is-danger">
          {{ error }}
        </div>

        <p class="has-text-centered mt-4">
          Don't have an account? 
          <router-link to="/register">Register</router-link>
        </p>
      </form>
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
    
    const form = ref({
      username: '',
      password: ''
    })
    const loading = ref(false)
    const errors = ref({})
    const error = ref(null)

    const handleSubmit = async () => {
      loading.value = true
      errors.value = {}

      try {
        await authStore.login(form.value.username, form.value.password)
        router.push('/')
      } catch (e) {
        if (e.response?.data) {
          errors.value = e.response.data
        } else {
          error.value = 'An error occurred during login'
        }
      } finally {
        loading.value = false
      }
    }

    return {
      form,
      loading,
      errors,
      error,
      handleSubmit
    }
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 150px);
}

.login-box {
  background-color: var(--card-background);
  padding: 2.5rem;
  border-radius: 12px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 2px 15px rgba(0, 0, 0, 0.1);
}

@media screen and (max-width: 768px) {
  .login-box {
    margin: 1rem;
    padding: 2rem;
  }
}
</style> 