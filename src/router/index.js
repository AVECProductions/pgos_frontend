import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

// Views
import HomeView from '@/views/HomeView.vue'
import LoginView from '@/views/LoginView.vue'
import DashboardView from '@/views/DashboardView.vue'
import VisionView from '@/views/VisionView.vue'
import GoalsView from '@/views/GoalsView.vue'
import JournalView from '@/views/JournalView.vue'
import JournalEntryForm from '@/views/JournalEntryForm.vue'
import KPITrackerView from '@/views/KPITrackerView.vue'
import RegisterView from '@/views/RegisterView.vue'
import ManageKPIsView from '@/views/ManageKPIsView.vue'
import RecipeImport from '@/components/recipes/RecipeImport.vue'
import MyRecipes from '@/components/recipes/MyRecipes.vue'
import RecipeDetail from '@/components/recipes/RecipeDetail.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: DashboardView,
    meta: { requiresAuth: true }
  },
  {
    path: '/vision',
    name: 'vision',
    component: VisionView,
    meta: { requiresAuth: true }
  },
  {
    path: '/goals',
    name: 'goals',
    component: GoalsView,
    meta: { requiresAuth: true }
  },
  {
    path: '/journal',
    name: 'journal',
    component: JournalView,
    meta: { requiresAuth: true }
  },
  {
    path: '/journal/new',
    name: 'journal-new',
    component: JournalEntryForm,
    meta: { requiresAuth: true }
  },
  {
    path: '/journal/:id/edit',
    name: 'journal-edit',
    component: JournalEntryForm,
    meta: { requiresAuth: true }
  },
  {
    path: '/kpis',
    redirect: '/kpis/track'
  },
  {
    path: '/kpis/manage',
    name: 'manage-kpis',
    component: ManageKPIsView,
    meta: { requiresAuth: true }
  },
  {
    path: '/kpis/track',
    name: 'track-kpis',
    component: KPITrackerView,
    meta: { requiresAuth: true }
  },
  {
    path: '/register',
    name: 'register',
    component: RegisterView
  },
  {
    path: '/recipes',
    name: 'recipes',
    component: MyRecipes,
    meta: { requiresAuth: true }
  },
  {
    path: '/recipes/import',
    name: 'recipe-import',
    component: RecipeImport,
    meta: { requiresAuth: true }
  },
  {
    path: '/recipes/:id',
    name: 'recipe-detail',
    component: RecipeDetail,
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

// Navigation guard
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  } else {
    next()
  }
})

export default router
