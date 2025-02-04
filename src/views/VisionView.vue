<template>
  <div>
    <h1 class="title">Vision Statements</h1>

    <!-- Header with Add Button -->
    <div class="level mb-5">
      <div class="level-left">
        <div class="level-item">
          <p class="subtitle">Define your long-term vision and core values</p>
        </div>
      </div>
      <div class="level-right">
        <div class="level-item">
          <button class="button is-primary" @click="showNewVisionModal = true">
            Add New Vision
          </button>
        </div>
      </div>
    </div>

    <!-- Vision List -->
    <div class="box">
      <div v-if="visions.length === 0" class="has-text-centered">
        <p>No vision statements found. Create one using the button above.</p>
      </div>
      <div v-else>
        <div v-for="vision in visions" :key="vision.id" class="card mb-4">
          <div class="card-content">
            <div class="level">
              <div class="level-left">
                <div class="level-item">
                  <div>
                    <p class="title is-4">{{ vision.title }}</p>
                    <p class="subtitle is-6">Last updated: {{ formatDate(vision.updated_at) }}</p>
                  </div>
                </div>
              </div>
              <div class="level-right">
                <div class="level-item">
                  <div class="buttons">
                    <button class="button is-small" @click="editVision(vision)">
                      Edit
                    </button>
                    <button class="button is-small is-danger" @click="confirmDelete(vision)">
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div class="content">
              {{ vision.description }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- New Vision Modal -->
    <div class="modal" :class="{ 'is-active': showNewVisionModal }">
      <div class="modal-background" @click="showNewVisionModal = false"></div>
      <div class="modal-card">
        <header class="modal-card-head">
          <p class="modal-card-title">{{ editingVision ? 'Edit Vision' : 'Add New Vision' }}</p>
          <button class="delete" @click="showNewVisionModal = false"></button>
        </header>
        <section class="modal-card-body">
          <div class="field">
            <label class="label">Title</label>
            <div class="control">
              <input class="input" type="text" v-model="newVision.title" 
                     placeholder="e.g., 5-Year Career Vision">
            </div>
          </div>
          <div class="field">
            <label class="label">Description</label>
            <div class="control">
              <textarea class="textarea" v-model="newVision.description" 
                        placeholder="Describe your vision in detail..."></textarea>
            </div>
          </div>
        </section>
        <footer class="modal-card-foot">
          <button class="button is-primary" @click="saveVision">
            {{ editingVision ? 'Update Vision' : 'Create Vision' }}
          </button>
          <button class="button" @click="showNewVisionModal = false">Cancel</button>
        </footer>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div class="modal" :class="{ 'is-active': showDeleteModal }">
      <div class="modal-background" @click="showDeleteModal = false"></div>
      <div class="modal-card">
        <header class="modal-card-head">
          <p class="modal-card-title">Confirm Delete</p>
          <button class="delete" @click="showDeleteModal = false"></button>
        </header>
        <section class="modal-card-body">
          Are you sure you want to delete this vision statement?
        </section>
        <footer class="modal-card-foot">
          <button class="button is-danger" @click="deleteVision">Delete</button>
          <button class="button" @click="showDeleteModal = false">Cancel</button>
        </footer>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import axios from 'axios'

export default {
  name: 'VisionView',
  setup() {
    const visions = ref([])
    const showNewVisionModal = ref(false)
    const showDeleteModal = ref(false)
    const editingVision = ref(null)
    const visionToDelete = ref(null)

    const newVision = ref({
      title: '',
      description: ''
    })

    const fetchVisions = async () => {
      try {
        console.log('Fetching visions...')
        const response = await axios.get('/api/visions/')
        console.log('Visions received:', response.data)
        visions.value = response.data
      } catch (error) {
        console.error('Error fetching visions:', error.response?.data || error)
      }
    }

    const saveVision = async () => {
      try {
        if (editingVision.value) {
          await axios.put(`/api/visions/${editingVision.value.id}/`, newVision.value)
        } else {
          await axios.post('/api/visions/', newVision.value)
        }
        await fetchVisions()
        showNewVisionModal.value = false
        editingVision.value = null
        newVision.value = {
          title: '',
          description: ''
        }
      } catch (error) {
        console.error('Error saving vision:', error.response?.data || error)
      }
    }

    const editVision = (vision) => {
      editingVision.value = vision
      newVision.value = {
        title: vision.title,
        description: vision.description
      }
      showNewVisionModal.value = true
    }

    const confirmDelete = (vision) => {
      visionToDelete.value = vision
      showDeleteModal.value = true
    }

    const deleteVision = async () => {
      try {
        await axios.delete(`/api/visions/${visionToDelete.value.id}/`)
        await fetchVisions()
        showDeleteModal.value = false
        visionToDelete.value = null
      } catch (error) {
        console.error('Error deleting vision:', error.response?.data || error)
      }
    }

    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    }

    onMounted(() => {
      fetchVisions()
    })

    return {
      visions,
      showNewVisionModal,
      showDeleteModal,
      newVision,
      editingVision,
      saveVision,
      editVision,
      confirmDelete,
      deleteVision,
      formatDate
    }
  }
}
</script>

<style scoped>
.card {
  transition: all 0.3s ease;
}

.card:hover {
  box-shadow: 0 2px 15px rgba(0, 0, 0, 0.1);
}

.content {
  white-space: pre-line;
}
</style> 