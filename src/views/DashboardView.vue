<template>
  <div>
    <h1 class="title">Dashboard</h1>
    
    <!-- Quick Stats -->
    <div class="columns is-multiline">
      <div class="column is-3">
        <div class="box">
          <h2 class="subtitle mb-2">Active Goals</h2>
          <p class="title">{{ stats.activeGoals || 0 }}</p>
        </div>
      </div>
      <div class="column is-3">
        <div class="box">
          <h2 class="subtitle mb-2">KPIs Tracked</h2>
          <p class="title">{{ stats.kpisTracked || 0 }}</p>
        </div>
      </div>
      <div class="column is-3">
        <div class="box">
          <h2 class="subtitle mb-2">Journal Entries</h2>
          <p class="title">{{ stats.journalEntries || 0 }}</p>
        </div>
      </div>
      <div class="column is-3">
        <div class="box">
          <h2 class="subtitle mb-2">RICH Items</h2>
          <p class="title">{{ stats.richItems || 0 }}</p>
        </div>
      </div>
    </div>

    <!-- Recent Activity -->
    <div class="dashboard-grid">
      <div class="recent-activity box">
        <h2 class="subtitle">Recent Activity</h2>
        <div class="activity-list">
          <div v-for="activity in recentActivity" :key="activity.id" class="activity-item">
            <span class="activity-dot"></span>
            <div class="activity-content">
              <div class="activity-date">{{ formatDate(activity.date) }}</div>
              <div class="activity-description">{{ activity.description }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="quick-actions box">
        <h2 class="subtitle">Quick Actions</h2>
        <div class="actions-list">
          <router-link to="/goals/new" class="button is-fullwidth">
            Add New Goal
          </router-link>
          <router-link to="/journal/new" class="button is-fullwidth">
            Write Journal Entry
          </router-link>
          <router-link to="/kpis" class="button is-fullwidth">
            Track KPIs
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import axios from 'axios'

export default {
  name: 'DashboardView',
  setup() {
    const stats = ref({})
    const recentActivity = ref([])

    const fetchDashboardData = async () => {
      try {
        const response = await axios.get('/api/dashboard/')
        stats.value = response.data.stats
        recentActivity.value = response.data.recent_activity
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      }
    }

    const formatDate = (date) => {
      return new Date(date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    }

    onMounted(() => {
      fetchDashboardData()
    })

    return {
      stats,
      recentActivity,
      formatDate
    }
  }
}
</script>

<style scoped>
.dashboard-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 1.5rem;
  margin-top: 1.5rem;
}

.recent-activity,
.quick-actions {
  display: flex;
  flex-direction: column;
  height: 300px;  /* Fixed height for both sections */
}

.activity-list {
  flex: 1;
  overflow-y: auto;
  padding-right: 0.5rem;
}

.actions-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  flex: 1;
  justify-content: space-between;
}

.activity-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 0.75rem 0;
  border-bottom: 1px solid var(--border);
}

.activity-item:last-child {
  border-bottom: none;
}

.activity-dot {
  width: 8px;
  height: 8px;
  background-color: var(--link);
  border-radius: 50%;
  margin-top: 0.5rem;
}

.activity-content {
  flex: 1;
}

.activity-date {
  font-size: 0.9rem;
  color: var(--text);
  opacity: 0.8;
}

.activity-description {
  margin-top: 0.25rem;
}

/* Ensure buttons have consistent spacing */
.button.is-fullwidth {
  margin-bottom: 0;
}

/* Add scrollbar styling */
.activity-list::-webkit-scrollbar {
  width: 6px;
}

.activity-list::-webkit-scrollbar-track {
  background: var(--card-background);
}

.activity-list::-webkit-scrollbar-thumb {
  background: var(--border);
  border-radius: 3px;
}

/* Mobile responsiveness */
@media screen and (max-width: 768px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
}
</style> 