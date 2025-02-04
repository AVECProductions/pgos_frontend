<template>
  <div>
    <div class="header-container">
      <h1 class="title mb-0">Journal</h1>
      <button class="button" @click="createEntry">
        <span class="icon">
          <i class="fas fa-plus"></i>
        </span>
        <span>New Entry</span>
      </button>
    </div>

    <div class="journal-list">
      <div class="box" v-for="entry in entries" :key="entry.id">
        <div class="journal-container">
          <div class="journal-info">
            <h3 class="title is-5 mb-2">{{ formatDate(entry.created_at) }}</h3>
            <p class="content" v-html="entry.content_html"></p>
          </div>
          <div class="journal-actions">
            <button class="button is-small mr-2" @click="editEntry(entry)">
              Edit
            </button>
            <button class="button is-small" @click="deleteEntry(entry)">
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="!entries.length" class="has-text-centered mt-6">
      <p class="is-size-4 has-text-grey">No journal entries yet.</p>
      <router-link to="/journal/new" class="button is-primary mt-4">
        Write Your First Entry
      </router-link>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

export default {
  name: 'JournalView',
  setup() {
    const router = useRouter()
    const entries = ref([])

    const createEntry = () => {
      router.push('/journal/new')
    }

    const editEntry = (entry) => {
      router.push(`/journal/${entry.id}/edit`)
    }

    const deleteEntry = async (entry) => {
      if (confirm('Are you sure you want to delete this entry?')) {
        try {
          await axios.delete(`/api/journal/${entry.id}/`)
          await fetchEntries()
        } catch (error) {
          console.error('Error deleting entry:', error)
        }
      }
    }

    const fetchEntries = async () => {
      try {
        const response = await axios.get('/api/journal/')
        entries.value = response.data
      } catch (error) {
        console.error('Error fetching journal entries:', error)
      }
    }

    const formatDate = (date) => {
      return new Date(date).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }

    onMounted(() => {
      fetchEntries()
    })

    return {
      entries,
      formatDate,
      createEntry,
      editEntry,
      deleteEntry
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

.journal-container {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}

.journal-info {
  flex: 1;
  min-width: 0;
}

.journal-actions {
  flex-shrink: 0;
  display: flex;
  gap: 0.5rem;
}

@media screen and (max-width: 768px) {
  .journal-container {
    flex-direction: column;
  }

  .journal-actions {
    width: 100%;
    justify-content: flex-end;
    margin-top: 1rem;
  }
}
</style> 