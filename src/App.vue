<template>
  <div id="wrapper">
    <nav class="navbar is-dark">
      <div class="navbar-brand">
        <router-link to="/" class="navbar-item">
          <strong>PGOS</strong>
        </router-link>
        <a 
          role="button" 
          class="navbar-burger" 
          :class="{ 'is-active': showMobileMenu }"
          aria-label="menu" 
          aria-expanded="false"
          @click="toggleMobileMenu"
        >
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
        </a>
      </div>
      <div class="navbar-menu" :class="{ 'is-active': showMobileMenu }">
        <div class="navbar-end">
          <template v-if="isAuthenticated">
            <router-link to="/vision" class="navbar-item" @click="closeMobileMenu">Vision</router-link>
            <router-link to="/rich" class="navbar-item" @click="closeMobileMenu">RICH</router-link>
            <router-link to="/goals" class="navbar-item" @click="closeMobileMenu">Goals</router-link>
            <router-link to="/kpis/track" class="navbar-item" @click="closeMobileMenu">KPIs</router-link>
            <router-link to="/journal" class="navbar-item" @click="closeMobileMenu">Journal</router-link>
            <div class="navbar-item has-dropdown is-hoverable">
              <a class="navbar-link">
                {{ username }}
              </a>
              <div class="navbar-dropdown">
                <router-link to="/profile" class="navbar-item" @click="closeMobileMenu">Profile</router-link>
                <a class="navbar-item" @click="handleLogout">Logout</a>
              </div>
            </div>
          </template>
          <template v-else>
            <div class="navbar-item">
              <div class="buttons">
                <router-link to="/login" class="button is-light">Login</router-link>
                <router-link to="/register" class="button is-primary">Register</router-link>
              </div>
            </div>
          </template>
          <div class="navbar-item">
            <button class="button" @click="toggleTheme">
              <span class="icon">
                <i :class="isDarkMode ? 'fas fa-sun' : 'fas fa-moon'"></i>
              </span>
            </button>
          </div>
        </div>
      </div>
    </nav>

    <section class="section">
      <div class="container">
        <router-view />
      </div>
    </section>

    <footer class="footer">
      <div class="content has-text-centered">
        <p>Personal Goal & Objective System (PGOS) - © 2024</p>
      </div>
    </footer>
  </div>
</template>

<script>
import { useAuthStore } from '@/stores/auth'
import { computed, ref, onMounted } from 'vue'
import '@/assets/themes.css'

export default {
  name: 'App',
  setup() {
    const authStore = useAuthStore()
    const isDarkMode = ref(false)
    const showMobileMenu = ref(false)

    const toggleMobileMenu = () => {
      showMobileMenu.value = !showMobileMenu.value
    }

    const closeMobileMenu = () => {
      showMobileMenu.value = false
    }

    const handleLogout = () => {
      closeMobileMenu()
      authStore.logout()
    }

    const toggleTheme = () => {
      isDarkMode.value = !isDarkMode.value
      document.documentElement.setAttribute(
        'data-theme',
        isDarkMode.value ? 'dark' : 'light'
      )
      localStorage.setItem('theme', isDarkMode.value ? 'dark' : 'light')
    }

    onMounted(() => {
      // Always set dark theme
      isDarkMode.value = true
      document.documentElement.setAttribute('data-theme', 'dark')
      localStorage.setItem('theme', 'dark')
    })

    return {
      isAuthenticated: computed(() => authStore.isAuthenticated),
      username: computed(() => authStore.user?.username),
      logout: authStore.logout,
      showMobileMenu,
      toggleMobileMenu,
      closeMobileMenu,
      handleLogout,
      isDarkMode,
      toggleTheme
    }
  }
}
</script>

<style>
@import 'bulma/css/bulma.min.css';

#wrapper {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.section {
  flex: 1;
}

.footer {
  margin-top: auto;
  padding: 2rem 1.5rem;
}

/* Smooth transitions for theme switching */
* {
  transition: background-color 0.3s ease, color 0.3s ease;
}

/* Add these styles for mobile menu */
@media screen and (max-width: 1023px) {
  .navbar-menu.is-active {
    background-color: var(--navbar-background) !important;
  }

  .navbar-dropdown {
    background-color: var(--navbar-background) !important;
    border: none !important;
  }

  .navbar-item.has-dropdown {
    padding: 0;
  }

  .navbar-dropdown .navbar-item {
    padding-left: 1.5rem;
  }
}
</style>
