<template>
  <div>
    <!-- Header with Add Button -->
    <div class="header-container">
      <h1 class="title mb-0">KPI Tracker</h1>
      <router-link to="/kpis/manage" class="button">
        <span class="icon">
          <i class="fas fa-cog"></i>
        </span>
        <span>Manage KPIs</span>
      </router-link>
    </div>

    <!-- Date Navigation -->
    <div class="date-navigation">
      <div class="dates">
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
    </div>

    <!-- KPI List -->
    <div class="box">
      <div v-if="kpis.length === 0" class="has-text-centered">
        <p>No KPIs found. Set them up in Manage KPIs.</p>
      </div>
      <div v-else class="kpi-list">
        <div v-for="kpi in kpis" :key="kpi.id" class="kpi-item">
          <div class="kpi-info">
            <strong>{{ kpi.name }}</strong>
            <span class="target-value">Target: {{ kpi.target_value }} {{ kpi.unit }}</span>
          </div>

          <div v-if="hasRecord(kpi)" class="kpi-status">
            <div class="completion-indicator" :class="getStatusClass(kpi)">
              <i class="fas" :class="getStatusIcon(kpi)"></i>
              <span>{{ getRecordValue(kpi) }} {{ kpi.unit }}</span>
            </div>
          </div>
          
          <div v-else class="kpi-actions">
            <div class="action-buttons">
              <button 
                class="button is-small action-button"
                @click="recordCompletion(kpi, kpi.target_value)"
                title="Complete"
              >
                <span class="icon">
                  <i class="fas fa-check"></i>
                </span>
              </button>
              
              <button 
                class="button is-small action-button"
                @click="showPartialModal(kpi)"
                title="Partial"
              >
                <span class="icon">
                  <i class="fas fa-clock"></i>
                </span>
              </button>
              
              <button 
                class="button is-small action-button"
                @click="recordCompletion(kpi, 0)"
                title="Skip"
              >
                <span class="icon">
                  <i class="fas fa-times"></i>
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Simple Partial Completion Modal -->
    <div class="modal" :class="{ 'is-active': showPartialCompletionModal }">
      <div class="modal-background" @click="closePartialModal"></div>
      <div class="modal-card">
        <header class="modal-card-head">
          <p class="modal-card-title">Record Progress</p>
          <button class="delete" @click="closePartialModal"></button>
        </header>
        <section class="modal-card-body">
          <div class="field">
            <label class="label">Amount ({{ selectedKPI?.unit }})</label>
            <input 
              class="input" 
              type="number" 
              v-model="partialValue"
              :max="selectedKPI?.target_value"
            >
          </div>
        </section>
        <footer class="modal-card-foot">
          <button class="button is-primary" @click="recordPartial">Save</button>
          <button class="button" @click="closePartialModal">Cancel</button>
        </footer>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed, watch } from 'vue'
import axios from 'axios'

export default {
  name: 'KPITrackerView',
  setup() {
    const kpis = ref([])
    const selectedDate = ref(new Date().toISOString().split('T')[0])
    const kpiRecords = ref({})
    const showPartialCompletionModal = ref(false)
    const selectedKPI = ref(null)
    const partialValue = ref('')

    // Date navigation
    const weekDates = computed(() => {
      const dates = []
      const today = new Date()
      today.setHours(0, 0, 0, 0)  // Reset time part
      
      // Get dates from 6 days ago to today, in correct order (past to present)
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today)
        date.setDate(today.getDate() - i)
        dates.push(date.toISOString().split('T')[0])
      }
      return dates  // Remove the .reverse() to keep past->present order
    })

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

    const fetchKPIRecords = async () => {
      try {
        console.log('Fetching records for date:', selectedDate.value)
        const response = await axios.get(`/api/kpi-records/?entry_date=${selectedDate.value}`)
        console.log('Received records:', response.data)
        // Reset records before setting new ones
        kpiRecords.value = {}
        // Add new records
        response.data.forEach(record => {
          kpiRecords.value[record.kpi] = record
        })
      } catch (error) {
        console.error('Error fetching KPI records:', error)
      }
    }

    const showPartialModal = (kpi) => {
      selectedKPI.value = kpi
      partialValue.value = ''
      showPartialCompletionModal.value = true
    }

    const closePartialModal = () => {
      showPartialCompletionModal.value = false
      selectedKPI.value = null
      partialValue.value = ''
    }

    const recordCompletion = async (kpi, value) => {
      try {
        const data = {
          kpi: kpi.id,
          entry_date: selectedDate.value,
          value: value,
          notes: value === 0 ? 'Not completed' : 'Completed'
        }
        console.log('Sending data:', data)
        await axios.post('/api/kpi-records/', data)
        await fetchKPIRecords()
      } catch (error) {
        console.error('Error recording completion:', error.response?.data || error)
      }
    }

    const hasRecord = (kpi) => {
      return kpiRecords.value[kpi.id] !== undefined
    }

    const getRecordValue = (kpi) => {
      const record = kpiRecords.value[kpi.id]
      if (!record) return null
      return `${record.value} ${kpi.unit}`
    }

    const getStatusClass = (kpi) => {
      const record = kpiRecords.value[kpi.id]
      if (!record) return ''
      if (record.value === 0) return 'is-danger'
      if (record.value === kpi.target_value) return 'is-success'
      return 'is-warning'
    }

    const getStatusIcon = (kpi) => {
      const record = kpiRecords.value[kpi.id]
      if (!record) return ''
      if (record.value === 0) return 'fa-times'
      if (record.value === kpi.target_value) return 'fa-check'
      return 'fa-clock'
    }

    // Add a watch effect for selectedDate
    watch(selectedDate, async (newDate) => {
      console.log('Date changed to:', newDate)
      await fetchKPIRecords()
    })

    onMounted(() => {
      fetchKPIs()
      fetchKPIRecords()
      
      // Scroll to the end of the date navigation after a short delay
      setTimeout(() => {
        const datesContainer = document.querySelector('.dates')
        if (datesContainer) {
          datesContainer.scrollLeft = datesContainer.scrollWidth
        }
      }, 100)
    })

    return {
      kpis,
      selectedDate,
      weekDates,
      kpiRecords,
      showPartialCompletionModal,
      selectedKPI,
      partialValue,
      formatWeekday,
      formatDateNumber,
      isSelectedDate,
      showPartialModal,
      closePartialModal,
      recordCompletion,
      hasRecord,
      getRecordValue,
      getStatusClass,
      getStatusIcon
    }
  }
}
</script>

<style scoped>
/* Header styling */
.header-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

/* KPI item styling */
.kpi-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid var(--border);
}

.kpi-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.kpi-target {
  font-size: 0.9rem;
  color: var(--text);
  opacity: 0.8;
}

.kpi-actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.buttons {
  display: flex;
  gap: 0.5rem;
}

.date-navigation {
  background-color: var(--card-background);
  border-radius: 8px;
  padding: 0.5rem;
}

.dates {
  display: flex;
  gap: 4px;
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
  scroll-behavior: smooth;
  padding: 0 4px;
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
  opacity: 1;
  position: relative;
}

.date-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;  /* Add space between weekday and date */
}

.weekday {
  font-size: 0.9rem;
  font-weight: bold;
  margin-bottom: 0.25rem;  /* Additional spacing */
}

.date {
  font-size: 0.8rem;
  opacity: 0.8;
}

.date-button.is-selected {
  background-color: var(--link);
  border-color: var(--link);
  color: var(--text-strong);
}

.date-button.future {
  opacity: 0.5;
  cursor: not-allowed;
}

.date-button.future::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 4px;
}

/* Mobile Specific Styles */
@media screen and (max-width: 768px) {
  .date-button {
    min-width: 70px;
    padding: 0.5rem 0.25rem;
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

.modal-card-foot {
  justify-content: flex-start;
}

.completion-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  font-size: 0.9rem;
}

.completion-indicator.is-success {
  background-color: rgba(72, 199, 116, 0.2);
  color: #48c774;
}

.completion-indicator.is-warning {
  background-color: rgba(255, 221, 87, 0.2);
  color: #ffdd57;
}

.completion-indicator.is-danger {
  background-color: rgba(255, 56, 96, 0.2);
  color: #ff3860;
}

.target-value {
  font-size: 0.9rem;
  opacity: 0.8;
  margin-top: 0.25rem;
  display: block;
}

.kpi-status {
  display: flex;
  align-items: center;
}

/* Make buttons more subtle until hover */
.button.is-small {
  background-color: var(--button-background);
  border-color: var(--border);
  color: var(--text);
  transition: all 0.2s ease;
}

.button.is-small:hover {
  transform: scale(1.05);
  background-color: var(--link);
  color: white;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.action-button {
  width: 36px;
  height: 36px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.05);  /* Slightly lighter background */
  border: 1px solid var(--border);
}

/* Brighter icon colors with better contrast */
.action-button:first-child .icon {
  color: #4ade80;  /* Brighter green */
}

.action-button:nth-child(2) .icon {
  color: #facc15;  /* Brighter yellow */
}

.action-button:last-child .icon {
  color: #fb7185;  /* Brighter red */
}

.action-button .icon {
  margin: 0;
  font-size: 1.2rem;  /* Slightly larger */
}

/* Hover states */
.action-button:hover {
  transform: scale(1.1);
}

.action-button:first-child:hover {
  background-color: #4ade80;
  border-color: #4ade80;
}

.action-button:nth-child(2):hover {
  background-color: #facc15;
  border-color: #facc15;
}

.action-button:last-child:hover {
  background-color: #fb7185;
  border-color: #fb7185;
}

.action-button:hover .icon {
  color: #1a1a1a !important;  /* Dark color on hover for better contrast */
}

/* Add smooth scrolling to the dates container */
.dates {
  scroll-behavior: smooth;
}
</style> 