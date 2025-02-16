<template>
  <div class="recipe-import">
    <div class="box">
      <h2 class="title is-4">Import Recipe</h2>
      
      <div class="field">
        <label class="label">Recipe URL</label>
        <div class="control">
          <input 
            class="input" 
            type="url" 
            v-model="url" 
            placeholder="Enter recipe URL"
            :class="{ 'is-danger': error }"
            @input="clearExistingRecipe"
          >
        </div>
        <p class="help is-danger" v-if="error">{{ error }}</p>
      </div>

      <!-- Existing Recipe Alert -->
      <div v-if="existingRecipe" class="notification is-warning">
        <p class="mb-3">
          This recipe is already in your collection: <strong>{{ existingRecipe.title }}</strong>
        </p>
        <div class="buttons">
          <router-link 
            :to="`/recipes/${existingRecipe.id}`" 
            class="button is-primary"
          >
            View Recipe
          </router-link>
          <button @click="clearForm" class="button">
            Import Different Recipe
          </button>
        </div>
      </div>

      <div class="field" v-else>
        <div class="control">
          <button 
            class="button is-primary" 
            @click="extractRecipe"
            :class="{ 'is-loading': loading }"
            :disabled="loading || !url"
          >
            Extract Recipe
          </button>
        </div>
      </div>

      <!-- Status Messages -->
      <div v-if="statusMessage" class="notification" :class="statusClass">
        <p>{{ statusMessage }}</p>
      </div>

      <!-- Display extracted recipe data -->
      <div v-if="recipeData" class="recipe-preview mt-4">
        <h3 class="title is-5">{{ recipeData.title }}</h3>
        
        <div class="content">
          <p v-if="recipeData.description">{{ recipeData.description }}</p>
          
          <div class="columns">
            <div class="column" v-if="recipeData.prep_time">
              <p><strong>Prep Time:</strong> {{ recipeData.prep_time }} minutes</p>
            </div>
            <div class="column" v-if="recipeData.cook_time">
              <p><strong>Cook Time:</strong> {{ recipeData.cook_time }} minutes</p>
            </div>
            <div class="column" v-if="recipeData.total_time">
              <p><strong>Total Time:</strong> {{ recipeData.total_time }} minutes</p>
            </div>
            <div class="column" v-if="recipeData.servings">
              <p><strong>Servings:</strong> {{ recipeData.servings }}</p>
            </div>
          </div>

          <div class="ingredients mt-4">
            <h4 class="title is-6">Ingredients:</h4>
            <ul>
              <li v-for="(ingredient, index) in recipeData.ingredients" :key="index">
                {{ ingredient }}
              </li>
            </ul>
          </div>

          <div class="instructions mt-4">
            <h4 class="title is-6">Instructions:</h4>
            <div v-html="formattedInstructions"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import axios from 'axios'
import { useAuthStore } from '@/stores/auth'

export default {
  name: 'RecipeImport',
  
  setup() {
    const url = ref('')
    const error = ref('')
    const loading = ref(false)
    const recipeData = ref(null)
    const statusMessage = ref('')
    const statusClass = ref('is-info')
    const existingRecipe = ref(null)
    const authStore = useAuthStore()

    const formattedInstructions = computed(() => {
      if (!recipeData.value?.instructions) return ''
      // Split instructions into paragraphs and wrap in <p> tags
      return recipeData.value.instructions
        .split('\n')
        .filter(line => line.trim())
        .map(line => `<p>${line}</p>`)
        .join('')
    })

    const updateStatus = (message, type = 'info') => {
      statusMessage.value = message
      statusClass.value = `is-${type}`
    }

    const checkExistingRecipe = async () => {
      try {
        const response = await axios.post(
          '/api/recipes/recipes/check_url_exists/',
          { url: url.value },
          {
            headers: {
              'Authorization': `Bearer ${authStore.token}`
            }
          }
        )
        
        if (response.data.exists) {
          existingRecipe.value = response.data.recipe
          return true
        }
        
        existingRecipe.value = null
        return false
        
      } catch (err) {
        console.error('Error checking URL:', err)
        return false
      }
    }

    const clearExistingRecipe = () => {
      existingRecipe.value = null
      error.value = ''
      statusMessage.value = ''
      recipeData.value = null
    }

    const clearForm = () => {
      url.value = ''
      clearExistingRecipe()
    }

    const extractRecipe = async () => {
      try {
        loading.value = true
        error.value = ''
        recipeData.value = null
        statusMessage.value = ''
        
        // Check if recipe already exists
        const exists = await checkExistingRecipe()
        if (exists) {
          return
        }

        updateStatus('Attempting to extract recipe using recipe-scraper...', 'info')

        const response = await axios.post(
          '/api/recipes/recipes/extract_from_url/',
          { url: url.value },
          {
            headers: {
              'Authorization': `Bearer ${authStore.token}`
            },
            responseType: 'text',
            onDownloadProgress: (progressEvent) => {
              if (progressEvent.event.target) {
                const text = progressEvent.event.target.responseText
                if (text) {
                  const lines = text.split('\n').filter(line => line.trim())
                  
                  lines.forEach(line => {
                    try {
                      const data = JSON.parse(line)
                      if (data.intermediate) {
                        updateStatus(data.status, 'warning')
                      } else {
                        recipeData.value = data
                        if (data.save_error) {
                          updateStatus(`Recipe extracted but failed to save: ${data.save_error}`, 'warning')
                        } else {
                          updateStatus(
                            `Successfully ${data.source === 'openai' ? 'extracted and saved' : 'imported'} recipe using ${data.source}!`,
                            'success'
                          )
                          // Could redirect to the recipe detail page here
                          // router.push(`/recipes/${data.id}`)
                        }
                      }
                    } catch (e) {
                      console.debug('JSON parse error:', e)
                    }
                  })
                }
              }
            }
          }
        )

      } catch (err) {
        console.error('Error details:', err)
        error.value = err.response?.data?.error || 'Failed to extract recipe'
        updateStatus('Failed to extract recipe', 'danger')
      } finally {
        loading.value = false
      }
    }

    return {
      url,
      error,
      loading,
      recipeData,
      statusMessage,
      statusClass,
      formattedInstructions,
      existingRecipe,
      extractRecipe,
      clearForm,
      clearExistingRecipe
    }
  }
}
</script>

<style scoped>
.recipe-import {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.recipe-preview {
  border-top: 1px solid #ddd;
  padding-top: 1.5rem;
}

.notification {
  transition: all 0.3s ease;
}
</style> 