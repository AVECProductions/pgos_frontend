<template>
  <div class="recipe-detail">
    <div class="box">
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

      <!-- Recipe Content -->
      <template v-else-if="recipe">
        <nav class="level">
          <div class="level-left">
            <div class="level-item">
              <router-link to="/recipes" class="button">
                <span class="icon">
                  <i class="fas fa-arrow-left"></i>
                </span>
                <span>Back to Recipes</span>
              </router-link>
            </div>
          </div>
          <div class="level-right">
            <div class="level-item">
              <button @click="confirmDelete" class="button is-danger mr-2">
                <span class="icon">
                  <i class="fas fa-trash"></i>
                </span>
                <span>Delete Recipe</span>
              </button>
              <a :href="recipe.source_url" target="_blank" class="button is-primary">
                <span class="icon">
                  <i class="fas fa-external-link-alt"></i>
                </span>
                <span>View Original</span>
              </a>
            </div>
          </div>
        </nav>

        <!-- Delete Confirmation Modal -->
        <div class="modal" :class="{ 'is-active': showDeleteModal }">
          <div class="modal-background" @click="showDeleteModal = false"></div>
          <div class="modal-card">
            <header class="modal-card-head">
              <p class="modal-card-title">Delete Recipe</p>
              <button 
                class="delete" 
                aria-label="close" 
                @click="showDeleteModal = false"
              ></button>
            </header>
            <section class="modal-card-body">
              Are you sure you want to delete "{{ recipe.title }}"? This action cannot be undone.
            </section>
            <footer class="modal-card-foot">
              <button 
                class="button is-danger" 
                :class="{ 'is-loading': deleting }" 
                @click="deleteRecipe"
              >
                Delete Recipe
              </button>
              <button class="button" @click="showDeleteModal = false">Cancel</button>
            </footer>
          </div>
        </div>

        <h1 class="title is-2">{{ recipe.title }}</h1>
        
        <p v-if="recipe.description" class="subtitle is-5 mt-3">
          {{ recipe.description }}
        </p>

        <div class="columns mt-5">
          <div class="column is-4">
            <figure class="image is-4by3">
              <img 
                v-if="recipe.image_url" 
                :src="recipe.image_url" 
                :alt="recipe.title"
                class="recipe-image"
                @error="handleImageError"
              >
              <div v-else class="no-image-placeholder">
                <span class="icon is-large">
                  <i class="fas fa-utensils fa-3x"></i>
                </span>
              </div>
            </figure>
          </div>
          <div class="column is-3">
            <div class="box">
              <h3 class="title is-5">Details</h3>
              <div class="content">
                <p><strong>Prep Time:</strong> {{ recipe.prep_time }} minutes</p>
                <p><strong>Cook Time:</strong> {{ recipe.cook_time }} minutes</p>
                <p><strong>Total Time:</strong> {{ recipe.prep_time + recipe.cook_time }} minutes</p>
                <p><strong>Servings:</strong> {{ recipe.servings }}</p>
              </div>
            </div>

            <div class="box">
              <h3 class="title is-5">Ingredients</h3>
              <div class="content">
                <ul>
                  <li v-for="ingredient in recipe.ingredients" :key="ingredient.id">
                    {{ ingredient.quantity }} {{ ingredient.unit }} {{ ingredient.ingredient.name }}
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div class="column">
            <div class="box">
              <h3 class="title is-5">Instructions</h3>
              <div class="content" v-html="formattedInstructions"></div>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import { useAuthStore } from '@/stores/auth'

export default {
  name: 'RecipeDetail',

  setup() {
    const route = useRoute()
    const router = useRouter()
    const recipe = ref(null)
    const loading = ref(true)
    const error = ref('')
    const showDeleteModal = ref(false)
    const deleting = ref(false)
    const authStore = useAuthStore()

    const formattedInstructions = computed(() => {
      if (!recipe.value?.instructions) return ''
      return recipe.value.instructions
        .split('\n')
        .filter(line => line.trim())
        .map(line => `<p>${line}</p>`)
        .join('')
    })

    const fetchRecipe = async () => {
      try {
        loading.value = true
        error.value = ''
        
        const response = await axios.get(`/api/recipes/recipes/${route.params.id}/`, {
          headers: {
            'Authorization': `Bearer ${authStore.token}`
          }
        })
        
        recipe.value = response.data
      } catch (err) {
        console.error('Error fetching recipe:', err)
        error.value = 'Failed to load recipe'
      } finally {
        loading.value = false
      }
    }

    const confirmDelete = () => {
      showDeleteModal.value = true
    }

    const deleteRecipe = async () => {
      try {
        deleting.value = true
        
        await axios.delete(`/api/recipes/recipes/${route.params.id}/`, {
          headers: {
            'Authorization': `Bearer ${authStore.token}`
          }
        })

        // Close modal and redirect to recipes list
        showDeleteModal.value = false
        router.push('/recipes')
      } catch (err) {
        console.error('Error deleting recipe:', err)
        error.value = 'Failed to delete recipe'
      } finally {
        deleting.value = false
      }
    }

    const handleImageError = (e) => {
      e.target.parentElement.innerHTML = `
        <div class="no-image-placeholder">
          <span class="icon is-large">
            <i class="fas fa-utensils fa-3x"></i>
          </span>
        </div>
      `
    }

    onMounted(fetchRecipe)

    return {
      recipe,
      loading,
      error,
      formattedInstructions,
      showDeleteModal,
      deleting,
      confirmDelete,
      deleteRecipe,
      handleImageError
    }
  }
}
</script>

<style scoped>
.recipe-detail {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.content ul {
  list-style-type: none;
  margin-left: 0;
  padding-left: 0;
}

.recipe-image {
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.modal-card {
  max-width: 400px;
  width: auto;
  margin: 0 20px;
}

.no-image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
  color: #7a7a7a;
  border-radius: 8px;
}

.image.is-4by3 {
  background-color: #f5f5f5;
}
</style> 