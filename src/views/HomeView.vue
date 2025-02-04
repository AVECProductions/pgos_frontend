<template>
  <div class="home">
    <div v-if="isAuthenticated">
      <DashboardView />
    </div>
    <div v-else class="welcome-section">
      <div class="hero is-primary">
        <div class="hero-body">
          <div class="container">
            <h1 class="title">Welcome to PGOS</h1>
            <h2 class="subtitle">Personal Goal & Objective System</h2>
            <div class="buttons">
              <router-link to="/login" class="button is-light is-medium">
                Login
              </router-link>
              <router-link to="/register" class="button is-light is-outlined is-medium">
                Register
              </router-link>
            </div>
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
.welcome-section {
  margin-top: -1.5rem;
}

.hero {
  text-align: center;
}

.buttons {
  justify-content: center;
  margin-top: 2rem;
}
</style>
