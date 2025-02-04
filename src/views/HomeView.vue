<template>
  <div class="home">
    <div v-if="isAuthenticated">
      <DashboardView />
    </div>
    <div v-else class="welcome-section">
      <div class="hero is-fullheight-with-navbar">
        <div class="hero-body">
          <div class="container has-text-centered">
            <h1 class="title is-1">Welcome to PGOS</h1>
            <p class="subtitle">Personal Goal & Objective System</p>
            <div class="buttons is-centered mt-5">
              <router-link to="/login" class="button">Login</router-link>
              <router-link to="/register" class="button">Register</router-link>
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
  background-color: var(--card-background);
  color: var(--text);
}

.button {
  background-color: var(--button-background);
  color: var(--text);
  border-color: var(--border);
  min-width: 100px;
}

.button:hover {
  background-color: var(--link);
  color: var(--text-strong);
}
</style>
