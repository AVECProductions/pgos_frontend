<template>
  <div class="my-recipes">
    <div class="box">
      <div class="level">
        <div class="level-left">
          <h2 class="title is-4">My Recipes</h2>
        </div>
        <div class="level-right">
          <router-link to="/recipes/import" class="button is-primary">
            Import New Recipe
          </router-link>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="has-text-centered my-4">
        <span class="icon is-large">
          <i class="fas fa-spinner fa-pulse"></i>
        </span>
      </div>

      <!-- Error Message -->
      <div v-else-if="error" class="notification is-danger">
        {{ error }}
      </div>

      <!-- Recipe Grid -->
      <div v-else class="columns is-multiline">
        <div v-for="recipe in recipes" :key="recipe.id" class="column is-4">
          <div class="card">
            <div class="card-image">
              <figure class="image is-4by3">
                <img 
                  v-if="recipe.image_url" 
                  :src="recipe.image_url" 
                  :alt="recipe.title"
                  @error="handleImageError"
                >
                <div v-else class="no-image-placeholder">
                  <span class="icon is-large">
                    <i class="fas fa-utensils fa-2x"></i>
                  </span>
                </div>
              </figure>
            </div>
            <div class="card-content">
              <p class="title is-5">{{ recipe.title }}</p>
              <p class="subtitle is-6">
                {{ recipe.description ? recipe.description.substring(0, 100) + '...' : 'No description' }}
              </p>
              <div class="content">
                <p><strong>Prep Time:</strong> {{ recipe.prep_time }} minutes</p>
                <p><strong>Cook Time:</strong> {{ recipe.cook_time }} minutes</p>
                <p><strong>Servings:</strong> {{ recipe.servings }}</p>
              </div>
            </div>
            <footer class="card-footer">
              <router-link 
                :to="`/recipes/${recipe.id}`" 
                class="card-footer-item"
              >
                View Details
              </router-link>
              <a 
                :href="recipe.source_url" 
                target="_blank" 
                class="card-footer-item"
              >
                Original Source
              </a>
            </footer>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="!loading && !error && recipes.length === 0" class="has-text-centered my-6">
        <p class="is-size-5 mb-4">You haven't saved any recipes yet!</p>
        <router-link to="/recipes/import" class="button is-primary">
          Import Your First Recipe
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useAuthStore } from '@/stores/auth'

export default {
  name: 'MyRecipes',

  setup() {
    const recipes = ref([])
    const loading = ref(true)
    const error = ref('')
    const authStore = useAuthStore()

    const fetchRecipes = async () => {
      try {
        loading.value = true
        error.value = ''
        
        const response = await axios.get('/api/recipes/recipes/', {
          headers: {
            'Authorization': `Bearer ${authStore.token}`
          }
        })
        
        recipes.value = response.data
      } catch (err) {
        console.error('Error fetching recipes:', err)
        error.value = 'Failed to load recipes'
      } finally {
        loading.value = false
      }
    }

    const handleImageError = (e) => {
      e.target.parentElement.innerHTML = `
        <div class="no-image-placeholder">
          <span class="icon is-large">
            <i class="fas fa-utensils fa-2x"></i>
          </span>
        </div>
      `
    }

    onMounted(fetchRecipes)

    return {
      recipes,
      loading,
      error,
      handleImageError
    }
  }
}
</script>

<style scoped>
.my-recipes {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.card {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.card-content {
  flex-grow: 1;
}

.title {
  margin-bottom: 0.5rem;
}

.no-image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
  color: #7a7a7a;
  border-radius: 4px;
}

.image.is-4by3 {
  background-color: #f5f5f5;
}
</style> 