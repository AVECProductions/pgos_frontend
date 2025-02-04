<template>
  <div>
    <!-- Show Dashboard for authenticated users -->
    <div v-if="isAuthenticated">
      <DashboardView />
    </div>

    <!-- Show Welcome page for unauthenticated users -->
    <div v-else class="home-container">
      <div class="welcome-box">
        <h1 class="title is-2 mb-4">Welcome to PGOS</h1>
        <p class="subtitle is-5 mb-5">Personal Growth Operating System</p>
        <div class="buttons is-centered">
          <router-link to="/login" class="button mr-2">Login</router-link>
          <router-link to="/register" class="button">Register</router-link>
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
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 150px);  /* Increased from 200px to 150px */
}

.welcome-box {
  background-color: var(--card-background);
  padding: 4rem;  /* Increased from 3rem to 4rem */
  border-radius: 12px;
  text-align: center;
  max-width: 600px;  /* Increased from 400px to 600px */
  width: 90%;
  box-shadow: 0 2px 15px rgba(0, 0, 0, 0.1);
}

.title {
  color: var(--text);
  font-size: 2.2rem !important;
  white-space: nowrap;  /* Prevent title from wrapping */
}

.subtitle {
  color: var(--text);
  opacity: 0.8;
}

.button {
  min-width: 120px;
}

@media screen and (max-width: 768px) {
  .welcome-box {
    padding: 3rem;  /* Increased from 2rem to 3rem */
    max-width: 400px;  /* Add max-width for mobile */
  }
  
  .title {
    font-size: 1.8rem !important;
    white-space: normal;  /* Allow wrapping on mobile */
  }
  
  .subtitle {
    font-size: 1.1rem !important;
  }
}
</style>
