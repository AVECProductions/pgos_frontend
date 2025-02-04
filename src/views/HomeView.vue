<template>
  <div class="container home-container">
    <div class="columns is-centered">
      <div class="column is-half">
        <div class="box">
          <h1 class="title has-text-centered">Welcome to PGOS</h1>
          <h2 class="subtitle has-text-centered">Personal Growth Operating System</h2>
          
          <div class="buttons is-centered">
            <router-link to="/login" class="button is-primary is-fullwidth mb-3">
              Login
            </router-link>
            <router-link to="/register" class="button is-fullwidth">
              Register
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useAuthStore } from '@/stores/auth'
import { computed } from 'vue'
import DashboardView from './DashboardView.vue'

export default {
  name: 'HomeView',
  components: {
    DashboardView
  },
  setup() {
    const authStore = useAuthStore()
    return {
      isAuthenticated: computed(() => authStore.isAuthenticated)
    }
  }
}
</script>

<style scoped>
.home-container {
  margin-top: 20vh;
}
</style>
