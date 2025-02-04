<template>
  <div>
    <h1 class="title">Dashboard</h1>
    
    <!-- Quick Stats -->
    <div class="columns is-multiline">
      <div class="column is-3">
        <div class="box has-background-primary has-text-white">
          <h2 class="subtitle has-text-white mb-2">Active Goals</h2>
          <p class="title has-text-white">{{ stats.activeGoals || 0 }}</p>
        </div>
      </div>
      <div class="column is-3">
        <div class="box has-background-info has-text-white">
          <h2 class="subtitle has-text-white mb-2">KPIs Tracked</h2>
          <p class="title has-text-white">{{ stats.kpisTracked || 0 }}</p>
        </div>
      </div>
      <div class="column is-3">
        <div class="box has-background-success has-text-white">
          <h2 class="subtitle has-text-white mb-2">Journal Entries</h2>
          <p class="title has-text-white">{{ stats.journalEntries || 0 }}</p>
        </div>
      </div>
      <div class="column is-3">
        <div class="box has-background-warning has-text-white">
          <h2 class="subtitle has-text-white mb-2">RICH Items</h2>
          <p class="title has-text-white">{{ stats.richItems || 0 }}</p>
        </div>
      </div>
    </div>

    <!-- Recent Activity -->
    <div class="columns">
      <div class="column is-8">
        <div class="box">
          <h2 class="title is-4">Recent Activity</h2>
          <div v-if="recentActivity.length" class="timeline">
            <div v-for="activity in recentActivity" :key="activity.id" class="timeline-item">
              <div class="timeline-marker"></div>
              <div class="timeline-content">
                <p class="heading">{{ formatDate(activity.date) }}</p>
                <p>{{ activity.description }}</p>
              </div>
            </div>
          </div>
          <p v-else>No recent activity</p>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="column is-4">
        <div class="box">
          <h2 class="title is-4">Quick Actions</h2>
          <div class="buttons">
            <router-link to="/goals" class="button is-fullwidth">
              Add New Goal
            </router-link>
            <router-link to="/journal/new" class="button is-fullwidth">
              Write Journal Entry
            </router-link>
            <router-link to="/kpis/track" class="button is-fullwidth">
              Track KPIs
            </router-link>
          </div>
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
.timeline {
  margin-top: 1rem;
}

.timeline-item {
  padding-bottom: 1rem;
  position: relative;
}

.timeline-marker {
  position: absolute;
  background: #dbdbdb;
  border: 2px solid #dbdbdb;
  border-radius: 100%;
  height: 12px;
  width: 12px;
  left: -20px;
  top: 6px;
}

.timeline-content {
  padding-left: 1rem;
  border-left: 2px solid #dbdbdb;
}
</style> 