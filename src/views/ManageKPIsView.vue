<template>
  <div>
    <div class="header-container">
      <h1 class="title mb-0">Manage KPIs</h1>
      <button class="button" @click="openModal()">
        <span class="icon"><i class="fas fa-plus"></i></span>
        <span>New KPI</span>
      </button>
    </div>

    <!-- KPI List -->
    <div class="box">
      <div v-if="kpis.length === 0" class="empty-state">
        <p>No KPIs found. Create your first KPI to start tracking.</p>
      </div>
      
      <div v-else class="kpi-list">
        <div v-for="kpi in kpis" :key="kpi.id" class="kpi-card">
          <div class="kpi-content">
            <h3 class="kpi-name">{{ kpi.name }}</h3>
            <div class="kpi-meta">
              <span class="tag">{{ kpi.frequency }}</span>
              <span class="target">{{ kpi.target_value }} {{ kpi.unit }}</span>
            </div>
          </div>
          <button class="button is-small" @click="openModal(kpi)">Edit</button>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <div class="modal" :class="{ 'is-active': showModal }">
      <div class="modal-background" @click="closeModal"></div>
      <div class="modal-card">
        <header class="modal-card-head">
          <p class="modal-card-title">{{ currentKPI ? 'Edit' : 'New' }} KPI</p>
          <button class="delete" @click="closeModal"></button>
        </header>
        
        <section class="modal-card-body">
          <div class="field">
            <label class="label">Name</label>
            <input 
              class="input" 
              v-model="form.name" 
              placeholder="e.g., Read daily"
            >
          </div>

          <div class="field-group">
            <div class="field">
              <label class="label">Target Value</label>
              <input 
                class="input" 
                type="number" 
                v-model.number="form.target_value"
                min="0"
              >
            </div>

            <div class="field">
              <label class="label">Unit</label>
              <input 
                class="input" 
                v-model="form.unit" 
                placeholder="e.g., minutes"
              >
            </div>
          </div>

          <div class="field">
            <label class="label">Frequency</label>
            <div class="select is-fullwidth">
              <select v-model="form.frequency">
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
          </div>
        </section>

        <footer class="modal-card-foot">
          <button 
            class="button is-primary" 
            @click="saveKPI"
          >
            {{ currentKPI ? 'Update' : 'Create' }}
          </button>
          <button class="button" @click="closeModal">Cancel</button>
          <button 
            v-if="currentKPI" 
            class="button is-danger ml-auto" 
            @click="deleteKPI"
          >
            Delete
          </button>
        </footer>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import axios from 'axios'

export default {
  name: 'ManageKPIsView',
  setup() {
    const kpis = ref([])
    const showModal = ref(false)
    const currentKPI = ref(null)
    const form = ref({
      name: '',
      target_value: 0,
      unit: '',
      frequency: 'daily'
    })

    const fetchKPIs = async () => {
      try {
        const response = await axios.get('/api/kpis/')
        kpis.value = response.data
      } catch (error) {
        console.error('Error fetching KPIs:', error)
      }
    }

    const openModal = (kpi = null) => {
      currentKPI.value = kpi
      if (kpi) {
        form.value = { ...kpi }
      } else {
        form.value = {
          name: '',
          target_value: 0,
          unit: '',
          frequency: 'daily'
        }
      }
      showModal.value = true
    }

    const closeModal = () => {
      showModal.value = false
      currentKPI.value = null
    }

    const saveKPI = async () => {
      try {
        if (currentKPI.value) {
          await axios.put(`/api/kpis/${currentKPI.value.id}/`, form.value)
        } else {
          await axios.post('/api/kpis/', form.value)
        }
        await fetchKPIs()
        closeModal()
      } catch (error) {
        console.error('Error saving KPI:', error)
      }
    }

    const deleteKPI = async () => {
      if (!confirm('Are you sure you want to delete this KPI?')) return
      
      try {
        await axios.delete(`/api/kpis/${currentKPI.value.id}/`)
        await fetchKPIs()
        closeModal()
      } catch (error) {
        console.error('Error deleting KPI:', error)
      }
    }

    onMounted(fetchKPIs)

    return {
      kpis,
      showModal,
      currentKPI,
      form,
      openModal,
      closeModal,
      saveKPI,
      deleteKPI
    }
  }
}
</script>

<style scoped>
.header-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.kpi-list {
  display: grid;
  gap: 1rem;
}

.kpi-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: var(--card-background);
  border: 1px solid var(--border);
  border-radius: 4px;
}

.kpi-content {
  flex: 1;
}

.kpi-name {
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
}

.kpi-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: var(--text);
}

.tag {
  text-transform: capitalize;
  background: var(--button-background);
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
}

.field-group {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
}

.modal-card {
  background: var(--card-background);
  color: var(--text);
}

.modal-card-head,
.modal-card-foot {
  background: var(--card-background);
  border-color: var(--border);
}

.input, .select select {
  background: var(--button-background);
  border-color: var(--border);
  color: var(--text);
}

.empty-state {
  text-align: center;
  padding: 2rem;
  color: var(--text);
}
</style> 