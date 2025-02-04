<template>
  <div class="container login-container">
    <div class="columns is-centered">
      <div class="column is-half">
        <div class="box">
          <h1 class="title has-text-centered">Login</h1>
          
          <form @submit.prevent="handleSubmit">
            <div class="field">
              <label class="label">Username</label>
              <div class="control">
                <input 
                  class="input" 
                  type="text" 
                  v-model="form.username" 
                  required
                  autocomplete="username"
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
                  autocomplete="current-password"
                >
              </div>
            </div>

            <div class="field">
              <div class="control">
                <button 
                  class="button is-primary is-fullwidth" 
                  type="submit"
                  :class="{ 'is-loading': loading }"
                >
                  Login
                </button>
              </div>
            </div>
          </form>
        </div>
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
  margin-top: 15vh;
}
</style>