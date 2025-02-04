<template>
  <div>
    <div class="level">
      <div class="level-left">
        <div class="level-item">
          <h1 class="title">Goals</h1>
        </div>
      </div>
      <div class="level-right">
        <div class="level-item">
          <button class="button is-primary" @click="showNewGoalModal = true">
            Add New Goal
          </button>
        </div>
      </div>
    </div>

    <!-- Active Goals -->
    <div class="columns is-multiline">
      <!-- Yearly Goals -->
      <div class="column is-12">
        <h2 class="title is-4">Yearly Goals ({{ currentYear }})</h2>
        <div class="box" v-for="goal in yearlyGoals" :key="goal.id">
          <div class="level">
            <div class="level-left">
              <div class="level-item">
                <div>
                  <h3 class="title is-5">{{ goal.life_sector }}</h3>
                  <p class="subtitle is-6">{{ goal.description }}</p>
                </div>
              </div>
            </div>
            <div class="level-right">
              <div class="level-item">
                <div class="buttons">
                  <button class="button is-small" @click="editGoal(goal)">
                    Edit
                  </button>
                  <button class="button is-small" @click="viewHistory(goal)">
                    History
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Quarterly Goals -->
      <div class="column is-12">
        <h2 class="title is-4">Q{{ currentQuarter }} Goals</h2>
        <div class="box" v-for="goal in quarterlyGoals" :key="goal.id">
          <div class="level">
            <div class="level-left">
              <div class="level-item">
                <div>
                  <h3 class="title is-5">{{ goal.life_sector }}</h3>
                  <p class="subtitle is-6">{{ goal.description }}</p>
                  <p v-if="goal.yearly_goal" class="is-size-7">
                    Supporting yearly goal: {{ goal.yearly_goal.life_sector }} - {{ goal.yearly_goal.description }}
                  </p>
                </div>
              </div>
            </div>
            <div class="level-right">
              <div class="level-item">
                <div class="buttons">
                  <button class="button is-small" @click="editGoal(goal)">
                    Edit
                  </button>
                  <button class="button is-small" @click="viewHistory(goal)">
                    History
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- New Goal Modal -->
    <div class="modal" :class="{ 'is-active': showNewGoalModal }">
      <div class="modal-background" @click="showNewGoalModal = false"></div>
      <div class="modal-card">
        <header class="modal-card-head">
          <p class="modal-card-title">Create New Goal</p>
          <button class="delete" @click="showNewGoalModal = false"></button>
        </header>
        <section class="modal-card-body">
          <div class="field">
            <label class="label">Goal Type</label>
            <div class="control">
              <div class="select is-fullwidth">
                <select v-model="newGoal.type">
                  <option value="yearly">Yearly Goal</option>
                  <option value="quarterly">Quarterly Goal</option>
                </select>
              </div>
            </div>
          </div>

          <template v-if="newGoal.type === 'yearly'">
            <div class="field">
              <label class="label">Life Sector</label>
              <div class="control">
                <div class="select is-fullwidth">
                  <select v-model="newGoal.life_sector">
                    <option value="other">Other</option>
                    <option value="health">Health & Fitness</option>
                    <option value="career">Career & Work</option>
                    <option value="relationships">Relationships</option>
                    <option value="personal">Personal Growth</option>
                    <option value="finance">Finance</option>
                  </select>
                </div>
              </div>
            </div>
          </template>

          <template v-if="newGoal.type === 'quarterly'">
            <div class="field">
              <label class="label">Life Sector</label>
              <div class="control">
                <div class="select is-fullwidth">
                  <select v-model="newGoal.life_sector">
                    <option value="other">Other</option>
                    <option value="health">Health & Fitness</option>
                    <option value="career">Career & Work</option>
                    <option value="relationships">Relationships</option>
                    <option value="personal">Personal Growth</option>
                    <option value="finance">Finance</option>
                  </select>
                </div>
              </div>
            </div>
            <div class="field">
              <label class="label">Supporting Yearly Goal</label>
              <div class="control">
                <div class="select is-fullwidth">
                  <select v-model="newGoal.yearly_goal">
                    <option v-for="goal in yearlyGoals" :key="goal.id" :value="goal.id">
                      {{ goal.life_sector }}
                    </option>
                  </select>
                </div>
              </div>
            </div>
          </template>

          <div class="field">
            <label class="label">Description</label>
            <div class="control">
              <textarea class="textarea" v-model="newGoal.description"></textarea>
            </div>
          </div>
        </section>
        <footer class="modal-card-foot">
          <button class="button is-primary" @click="createGoal" :class="{ 'is-loading': loading }">
            Create Goal
          </button>
          <button class="button" @click="showNewGoalModal = false">Cancel</button>
        </footer>
      </div>
    </div>

    <!-- History Modal -->
    <div class="modal" :class="{ 'is-active': showHistoryModal }">
      <div class="modal-background" @click="showHistoryModal = false"></div>
      <div class="modal-card">
        <header class="modal-card-head">
          <p class="modal-card-title">Goal History</p>
          <button class="delete" @click="showHistoryModal = false"></button>
        </header>
        <section class="modal-card-body">
          <div class="timeline">
            <div v-for="(revision, index) in selectedGoalHistory" :key="index" class="timeline-item">
              <div class="timeline-marker"></div>
              <div class="timeline-content">
                <p class="heading">{{ formatDate(revision.created_at) }}</p>
                <div class="content">
                  <p><strong>Changed by:</strong> {{ revision.user }}</p>
                  <p><strong>Changes:</strong></p>
                  <ul>
                    <li v-for="(change, field) in revision.changes" :key="field">
                      {{ field }}: {{ change.from }} → {{ change.to }}
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>

    <!-- Add Edit Goal Modal -->
    <div class="modal" :class="{ 'is-active': showEditGoalModal }">
      <div class="modal-background" @click="showEditGoalModal = false"></div>
      <div class="modal-card">
        <header class="modal-card-head">
          <p class="modal-card-title">Edit Goal</p>
          <button class="delete" @click="showEditGoalModal = false"></button>
        </header>
        <section class="modal-card-body">
          <template v-if="selectedGoal.type === 'yearly'">
            <div class="field">
              <label class="label">Life Sector</label>
              <div class="control">
                <div class="select is-fullwidth">
                  <select v-model="selectedGoal.life_sector">
                    <option value="other">Other</option>
                    <option value="health">Health & Fitness</option>
                    <option value="career">Career & Work</option>
                    <option value="relationships">Relationships</option>
                    <option value="personal">Personal Growth</option>
                    <option value="finance">Finance</option>
                  </select>
                </div>
              </div>
            </div>
          </template>

          <template v-if="selectedGoal.type === 'quarterly'">
            <div class="field">
              <label class="label">Life Sector</label>
              <div class="control">
                <div class="select is-fullwidth">
                  <select v-model="selectedGoal.life_sector">
                    <option value="other">Other</option>
                    <option value="health">Health & Fitness</option>
                    <option value="career">Career & Work</option>
                    <option value="relationships">Relationships</option>
                    <option value="personal">Personal Growth</option>
                    <option value="finance">Finance</option>
                  </select>
                </div>
              </div>
            </div>
            <div class="field">
              <label class="label">Supporting Yearly Goal</label>
              <div class="control">
                <div class="select is-fullwidth">
                  <select v-model="selectedGoal.yearly_goal">
                    <option v-for="goal in yearlyGoals" :key="goal.id" :value="goal.id">
                      {{ goal.life_sector }}
                    </option>
                  </select>
                </div>
              </div>
            </div>
          </template>

          <div class="field">
            <label class="label">Description</label>
            <div class="control">
              <textarea class="textarea" v-model="selectedGoal.description"></textarea>
            </div>
          </div>
        </section>
        <footer class="modal-card-foot">
          <button class="button is-primary" @click="updateGoal" :class="{ 'is-loading': loading }">
            Update Goal
          </button>
          <button class="button" @click="showEditGoalModal = false">Cancel</button>
        </footer>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'

export default {
  name: 'GoalsView',
  setup() {
    const yearlyGoals = ref([])
    const quarterlyGoals = ref([])
    const showNewGoalModal = ref(false)
    const showHistoryModal = ref(false)
    const selectedGoalHistory = ref([])
    const loading = ref(false)
    const showEditGoalModal = ref(false)
    const selectedGoal = ref({
      type: 'yearly',
      description: '',
      life_sector: 'other',
      yearly_goal: null
    })

    const newGoal = ref({
      type: 'yearly',
      description: '',
      life_sector: 'other',
      yearly_goal: null
    })

    const currentYear = new Date().getFullYear()
    const currentQuarter = Math.floor((new Date().getMonth() + 3) / 3)

    const fetchGoals = async () => {
      try {
        const [yearlyResponse, quarterlyResponse] = await Promise.all([
          axios.get('/api/yearly-goals/'),
          axios.get('/api/quarterly-goals/')
        ])
        yearlyGoals.value = yearlyResponse.data
        quarterlyGoals.value = quarterlyResponse.data
      } catch (error) {
        console.error('Error fetching goals:', error)
      }
    }

    const createGoal = async () => {
      loading.value = true
      try {
        if (newGoal.value.type === 'yearly') {
          await axios.post('/api/yearly-goals/', {
            description: newGoal.value.description,
            life_sector: newGoal.value.life_sector,
            start_date: new Date().toISOString().split('T')[0],
            end_date: `${currentYear}-12-31`
          })
        } else {
          const quarterEndDate = new Date(currentYear, currentQuarter * 3, 0)
          await axios.post('/api/quarterly-goals/', {
            life_sector: newGoal.value.life_sector,
            description: newGoal.value.description,
            yearly_goal: newGoal.value.yearly_goal,
            quarter: currentQuarter,
            start_date: new Date().toISOString().split('T')[0],
            end_date: quarterEndDate.toISOString().split('T')[0]
          })
        }
        await fetchGoals()
        showNewGoalModal.value = false
        newGoal.value = {
          type: 'yearly',
          description: '',
          life_sector: 'other',
          yearly_goal: null
        }
      } catch (error) {
        console.error('Error creating goal:', error)
      } finally {
        loading.value = false
      }
    }

    const viewHistory = async (goal) => {
      try {
        const goalType = goal.life_sector ? 'quarterly' : 'yearly'
        const response = await axios.get(`/api/${goalType}-goals/${goal.id}/history/`)
        selectedGoalHistory.value = response.data
        showHistoryModal.value = true
      } catch (error) {
        console.error('Error fetching goal history:', error)
      }
    }

    const formatDate = (date) => {
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    const editGoal = (goal) => {
      selectedGoal.value = {
        ...goal,
        type: goal.life_sector ? 'quarterly' : 'yearly'
      }
      showEditGoalModal.value = true
    }

    const updateGoal = async () => {
      loading.value = true
      try {
        const goalType = selectedGoal.value.type === 'yearly' ? 'yearly-goals' : 'quarterly-goals'
        await axios.put(`/api/${goalType}/${selectedGoal.value.id}/`, {
          description: selectedGoal.value.description,
          life_sector: selectedGoal.value.life_sector,
          yearly_goal: selectedGoal.value.yearly_goal,
          start_date: selectedGoal.value.start_date,
          end_date: selectedGoal.value.end_date,
          quarter: selectedGoal.value.quarter
        })
        await fetchGoals()
        showEditGoalModal.value = false
      } catch (error) {
        console.error('Error updating goal:', error)
      } finally {
        loading.value = false
      }
    }

    onMounted(() => {
      fetchGoals()
    })

    return {
      yearlyGoals,
      quarterlyGoals,
      showNewGoalModal,
      showHistoryModal,
      selectedGoalHistory,
      newGoal,
      loading,
      currentYear,
      currentQuarter,
      createGoal,
      viewHistory,
      formatDate,
      showEditGoalModal,
      selectedGoal,
      editGoal,
      updateGoal
    }
  }
}
</script>

<style scoped>
.timeline {
  margin-top: 1rem;
}

.timeline-item {
  padding-bottom: 2rem;
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