<template>
  <div>
    <!-- Header with Add Button -->
    <div class="level mb-4">
      <div class="level-left">
        <div class="level-item">
          <h1 class="title mb-0">KPI Tracker</h1>
        </div>
      </div>
      <div class="level-right">
        <div class="level-item">
          <button class="button" @click="showNewKPIModal = true">
            <span class="icon">
              <i class="fas fa-plus"></i>
            </span>
            <span>Add New KPI</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Date Navigation -->
    <div class="date-navigation mb-5">
      <button class="nav-arrow left-arrow" @click="previousWeek">
        <span class="icon">
          <i class="fas fa-chevron-left"></i>
        </span>
      </button>
      
      <div class="dates-container">
        <button 
          v-for="date in weekDates" 
          :key="date"
          class="date-button"
          :class="{ 'is-selected': isSelectedDate(date) }"
          @click="selectedDate = date"
        >
          <div class="date-content">
            <div class="weekday">{{ formatWeekday(date) }}</div>
            <div class="date">{{ formatDateNumber(date) }}</div>
          </div>
        </button>
      </div>

      <button class="nav-arrow right-arrow" @click="nextWeek">
        <span class="icon">
          <i class="fas fa-chevron-right"></i>
        </span>
      </button>
    </div>

    <!-- KPI List -->
    <div class="box">
      <div v-if="kpis.length === 0" class="has-text-centered">
        <p>No KPIs found. Create one using the button above.</p>
      </div>
      <table v-else class="table is-fullwidth">
        <thead>
          <tr>
            <th>KPI</th>
            <th>Target</th>
            <th>Achieved?</th>
            <th>Notes</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="kpi in kpis" :key="kpi.id">
            <td>
              <strong>{{ kpi.name }}</strong>
              <p class="is-size-7">{{ kpi.description }}</p>
            </td>
            <td>{{ kpi.target_value }} {{ kpi.unit }}</td>
            <td>
              <label class="checkbox">
                <input 
                  type="checkbox" 
                  :checked="isKPIAchieved(kpi)"
                  @change="toggleKPIAchievement(kpi)"
                >
              </label>
            </td>
            <td>
              <input 
                class="input is-small"
                type="text"
                v-model="kpiNotes[kpi.id]"
                @change="saveKPIRecord(kpi)"
                placeholder="Add notes..."
              >
            </td>
            <td>
              <button class="button is-small" @click="editKPI(kpi)">
                Edit
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- New KPI Modal -->
    <div class="modal" :class="{ 'is-active': showNewKPIModal }">
      <div class="modal-background" @click="showNewKPIModal = false"></div>
      <div class="modal-card">
        <header class="modal-card-head">
          <p class="modal-card-title">Add New KPI</p>
          <button class="delete" @click="showNewKPIModal = false"></button>
        </header>
        <section class="modal-card-body">
          <div class="field">
            <label class="label">Name</label>
            <div class="control">
              <input class="input" type="text" v-model="newKPI.name">
            </div>
          </div>
          <div class="field">
            <label class="label">Description</label>
            <div class="control">
              <textarea class="textarea" v-model="newKPI.description"></textarea>
            </div>
          </div>
          <div class="columns">
            <div class="column">
              <div class="field">
                <label class="label">Target Value</label>
                <div class="control">
                  <input class="input" type="number" v-model="newKPI.target_value">
                </div>
              </div>
            </div>
            <div class="column">
              <div class="field">
                <label class="label">Unit</label>
                <div class="control">
                  <input class="input" type="text" v-model="newKPI.unit">
                </div>
              </div>
            </div>
          </div>
          <div class="field">
            <label class="label">Frequency</label>
            <div class="control">
              <div class="select is-fullwidth">
                <select v-model="newKPI.frequency">
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
            </div>
          </div>
          <div class="field">
            <label class="label">Related Goal (Optional)</label>
            <div class="control">
              <div class="select is-fullwidth">
                <select v-model="newKPI.quarterly_goal">
                  <option :value="null">None</option>
                  <option v-for="goal in quarterlyGoals" :key="goal.id" :value="goal.id">
                    {{ goal.life_sector }} - {{ goal.description }}
                  </option>
                </select>
              </div>
            </div>
          </div>
        </section>
        <footer class="modal-card-foot">
          <button class="button is-primary" @click="createKPI">Create KPI</button>
          <button class="button" @click="showNewKPIModal = false">Cancel</button>
        </footer>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'

export default {
  name: 'KPITrackerView',
  setup() {
    const kpis = ref([])
    const quarterlyGoals = ref([])
    const showNewKPIModal = ref(false)
    const selectedDate = ref(new Date().toISOString().split('T')[0])
    const kpiNotes = ref({})
    const kpiRecords = ref({})

    const newKPI = ref({
      name: '',
      description: '',
      target_value: 0,
      unit: '',
      quarterly_goal: null,
      frequency: 'daily'
    })

    // Date navigation
    const weekDates = computed(() => {
      const dates = []
      const currentDate = new Date(selectedDate.value)
      const firstDay = new Date(currentDate)
      firstDay.setDate(currentDate.getDate() - currentDate.getDay())
      
      for (let i = 0; i < 7; i++) {
        const date = new Date(firstDay)
        date.setDate(firstDay.getDate() + i)
        dates.push(date.toISOString().split('T')[0])
      }
      return dates
    })

    const previousWeek = () => {
      const date = new Date(selectedDate.value)
      date.setDate(date.getDate() - 7)
      selectedDate.value = date.toISOString().split('T')[0]
      fetchKPIRecords()
    }

    const nextWeek = () => {
      const date = new Date(selectedDate.value)
      date.setDate(date.getDate() + 7)
      selectedDate.value = date.toISOString().split('T')[0]
      fetchKPIRecords()
    }

    const formatWeekday = (dateString) => {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', { weekday: 'short' })
    }

    const formatDateNumber = (dateString) => {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', { 
        month: 'short',
        day: 'numeric'
      })
    }

    const isSelectedDate = (date) => date === selectedDate.value

    // KPI Management
    const fetchKPIs = async () => {
      try {
        console.log('Fetching KPIs...')
        const response = await axios.get('/api/kpis/')
        console.log('KPIs received:', response.data)
        kpis.value = response.data
      } catch (error) {
        console.error('Error fetching KPIs:', error.response?.data || error)
      }
    }

    const fetchQuarterlyGoals = async () => {
      try {
        const response = await axios.get('/api/quarterly-goals/')
        quarterlyGoals.value = response.data
      } catch (error) {
        console.error('Error fetching quarterly goals:', error)
      }
    }

    const fetchKPIRecords = async () => {
      try {
        const response = await axios.get(`/api/kpi-records/?entry_date=${selectedDate.value}`)
        kpiRecords.value = response.data.reduce((acc, record) => {
          acc[record.kpi] = record
          kpiNotes.value[record.kpi] = record.notes
          return acc
        }, {})
      } catch (error) {
        console.error('Error fetching KPI records:', error)
      }
    }

    const createKPI = async () => {
      try {
        const kpiData = { ...newKPI.value }
        if (!kpiData.quarterly_goal) {
          delete kpiData.quarterly_goal
        }
        console.log('Sending KPI data:', kpiData)
        await axios.post('/api/kpis/', kpiData)
        await fetchKPIs()
        showNewKPIModal.value = false
        newKPI.value = {
          name: '',
          description: '',
          target_value: 0,
          unit: '',
          quarterly_goal: null,
          frequency: 'daily'
        }
      } catch (error) {
        console.error('Error creating KPI:', error.response?.data || error)
      }
    }

    const isKPIAchieved = (kpi) => {
      return kpiRecords.value[kpi.id]?.value >= kpi.target_value
    }

    const toggleKPIAchievement = async (kpi) => {
      const achieved = !isKPIAchieved(kpi)
      await saveKPIRecord({
        ...kpi,
        achieved
      })
    }

    const saveKPIRecord = async (kpi) => {
      try {
        const existingRecord = kpiRecords.value[kpi.id]
        const value = kpi.achieved ? kpi.target_value : 0
        
        if (existingRecord) {
          await axios.put(`/api/kpi-records/${existingRecord.id}/`, {
            kpi: kpi.id,
            entry_date: selectedDate.value,
            value,
            notes: kpiNotes.value[kpi.id] || ''
          })
        } else {
          await axios.post('/api/kpi-records/', {
            kpi: kpi.id,
            entry_date: selectedDate.value,
            value,
            notes: kpiNotes.value[kpi.id] || ''
          })
        }
        await fetchKPIRecords()
      } catch (error) {
        console.error('Error saving KPI record:', error)
      }
    }

    onMounted(() => {
      fetchKPIs()
      fetchQuarterlyGoals()
      fetchKPIRecords()
    })

    return {
      kpis,
      quarterlyGoals,
      showNewKPIModal,
      selectedDate,
      weekDates,
      kpiNotes,
      newKPI,
      previousWeek,
      nextWeek,
      formatWeekday,
      formatDateNumber,
      isSelectedDate,
      createKPI,
      isKPIAchieved,
      toggleKPIAchievement,
      saveKPIRecord
    }
  }
}
</script>

<style scoped>
.level {
  margin-bottom: 1.5rem !important;
}

.date-navigation {
  position: relative;
  display: flex;
  align-items: stretch;
  background-color: var(--card-background);
  border-radius: 8px;
  padding: 0.5rem;
  gap: 0.5rem;
}

.nav-arrow {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--button-background);
  border: 1px solid var(--border);
  border-radius: 4px;
  color: var(--text);
  width: 40px;
  cursor: pointer;
  z-index: 2;
}

.nav-arrow:hover {
  background-color: var(--link);
  color: var(--text-strong);
}

.dates-container {
  display: flex;
  flex: 1;
  gap: 4px;
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
  scroll-behavior: smooth;
  padding: 0 4px;
}

.dates-container::-webkit-scrollbar {
  display: none;
}

.date-button {
  flex: 1;
  min-width: 80px; /* Ensure minimum width for readability */
  border: 1px solid var(--border);
  border-radius: 4px;
  background-color: var(--card-background);
  color: var(--text);
  cursor: pointer;
  padding: 0.5rem;
  transition: all 0.2s ease;
}

.date-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.weekday {
  font-size: 0.9rem;
  font-weight: bold;
}

.date {
  font-size: 0.8rem;
}

.date-button.is-selected {
  background-color: var(--link);
  border-color: var(--link);
  color: var(--text-strong);
}

/* Mobile Specific Styles */
@media screen and (max-width: 768px) {
  .date-button {
    min-width: 70px;
    padding: 0.5rem 0.25rem;
  }

  .nav-arrow {
    width: 36px;
  }

  /* Make the arrows more visible on mobile */
  .nav-arrow {
    position: sticky;
    background-color: var(--button-background);
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
  }

  .left-arrow {
    left: 0;
  }

  .right-arrow {
    right: 0;
  }

  .table {
    font-size: 0.9rem;
  }

  /* Make table more mobile-friendly */
  .table td {
    padding: 0.5rem;
  }

  /* Optional: Stack table on mobile */
  @media screen and (max-width: 480px) {
    .table, .table tbody, .table tr, .table td {
      display: block;
    }

    .table thead {
      display: none;
    }

    .table tr {
      margin-bottom: 1rem;
      border-bottom: 2px solid var(--border);
    }

    .table td {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.5rem;
      border: none;
    }

    .table td::before {
      content: attr(data-label);
      font-weight: bold;
      margin-right: 1rem;
    }
  }
}
</style> 