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
            <router-link to="/vision" class="navbar-item" @click="closeAllMenus">Vision</router-link>
            <router-link to="/goals" class="navbar-item" @click="closeAllMenus">Goals</router-link>
            <router-link to="/kpis/track" class="navbar-item" @click="closeAllMenus">KPIs</router-link>
            <router-link to="/journal" class="navbar-item" @click="closeAllMenus">Journal</router-link>
            <div class="navbar-item has-dropdown" :class="{ 'is-active': showUserMenu }">
              <a class="navbar-link" @click="toggleUserMenu">
                {{ username }}
              </a>
              <div class="navbar-dropdown">
                <router-link to="/profile" class="navbar-item" @click="closeAllMenus">Profile</router-link>
                <a class="navbar-item" @click="handleLogout">Logout</a>
              </div>
            </div>
          </template>
          <template v-else>
            <div class="navbar-item">
              <div class="buttons">
                <router-link to="/login" class="button" @click="closeAllMenus">Login</router-link>
                <router-link to="/register" class="button" @click="closeAllMenus">Register</router-link>
              </div>
            </div>
          </template>
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
        <p>Personal Growth Operating System (PGOS) - © 2024</p>
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
    const showMobileMenu = ref(false)
    const showUserMenu = ref(false)

    const toggleMobileMenu = () => {
      showMobileMenu.value = !showMobileMenu.value
      if (showMobileMenu.value === false) {
        showUserMenu.value = false
      }
    }

    const toggleUserMenu = () => {
      showUserMenu.value = !showUserMenu.value
    }

    const closeAllMenus = () => {
      showMobileMenu.value = false
      showUserMenu.value = false
    }

    const handleLogout = () => {
      closeAllMenus()
      authStore.logout()
    }

    onMounted(() => {
      // Set dark theme once and forget about it
      document.documentElement.setAttribute('data-theme', 'dark')
    })

    return {
      isAuthenticated: computed(() => authStore.isAuthenticated),
      username: computed(() => authStore.user?.username),
      logout: authStore.logout,
      showMobileMenu,
      showUserMenu,
      toggleMobileMenu,
      toggleUserMenu,
      closeAllMenus,
      handleLogout
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

  .navbar-item.has-dropdown {
    padding: 0;
  }

  .navbar-dropdown {
    display: none;
  }

  .navbar-item.has-dropdown.is-active .navbar-dropdown {
    display: block;
  }

  .navbar-link::after {
    display: none !important;  /* Remove the arrow on mobile */
  }

  .navbar-item.has-dropdown {
    padding-right: 1rem !important;  /* Reset padding on mobile */
  }
}

/* Style the mobile menu burger icon */
.navbar-burger {
  color: var(--text) !important;
}

.navbar-burger span {
  height: 2px !important;
  width: 16px !important;
  left: calc(50% - 8px) !important;
  background-color: var(--text) !important;
}

.navbar-burger:hover {
  background-color: var(--button-background) !important;
}

/* Adjust the spacing of the lines */
.navbar-burger span:nth-child(1) {
  top: calc(50% - 6px) !important;
}

.navbar-burger span:nth-child(2) {
  top: calc(50%) !important;
}

.navbar-burger span:nth-child(3) {
  top: calc(50% + 6px) !important;
}

/* Adjust dropdown arrow positioning */
.navbar-link:not(.is-arrowless)::after {
  right: 0.75em !important;  /* Move arrow more to the left */
}

.navbar-item.has-dropdown {
  padding-right: 2.5em !important;  /* Add more space for the arrow */
}
</style>
