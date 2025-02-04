<template>
  <div>
    <div class="header-container">
      <div class="header-text">
        <h1 class="title mb-0">Vision Statements</h1>
        <p class="subtitle is-6 mt-1">Define your long-term aspirations and core values to guide your journey.</p>
      </div>
      <button class="button" @click="showNewVisionModal = true">
        <span class="icon">
          <i class="fas fa-plus"></i>
        </span>
        <span>Add Vision</span>
      </button>
    </div>

    <div class="vision-list">
      <div class="box" v-for="vision in visions" :key="vision.id">
        <div class="vision-container">
          <div class="vision-info">
            <h3 class="title is-5 mb-2">{{ vision.title }}</h3>
            <p class="content">{{ vision.description }}</p>
          </div>
          <div class="vision-actions">
            <button class="button is-small mr-2" @click="editVision(vision)">
              Edit
            </button>
            <button class="button is-small" @click="deleteVision(vision)">
              Delete
            </button>
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
.header-container {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
}

.header-text {
  flex: 1;
}

.subtitle {
  color: var(--text) !important;
  opacity: 0.8;
}

.vision-container {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}

.vision-info {
  flex: 1;
  min-width: 0;
}

.vision-actions {
  flex-shrink: 0;
  display: flex;
  gap: 0.5rem;
}

@media screen and (max-width: 768px) {
  .vision-container {
    flex-direction: column;
  }

  .vision-actions {
    width: 100%;
    justify-content: flex-end;
    margin-top: 1rem;
  }
}
</style> 