<template>
  <div>
    <div class="level">
      <div class="level-left">
        <div class="level-item">
          <h1 class="title">Journal Entries</h1>
        </div>
      </div>
      <div class="level-right">
        <div class="level-item">
          <router-link to="/journal/new" class="button is-primary">
            New Entry
          </router-link>
        </div>
      </div>
    </div>

    <!-- Journal Entries List -->
    <div class="columns is-multiline">
      <div v-for="entry in entries" :key="entry.id" class="column is-12">
        <div class="box">
          <div class="level">
            <div class="level-left">
              <div class="level-item">
                <h2 class="title is-4">{{ entry.title }}</h2>
              </div>
            </div>
            <div class="level-right">
              <div class="level-item">
                <p class="has-text-grey">{{ formatDate(entry.created_at) }}</p>
              </div>
            </div>
          </div>
          <div class="content" v-html="entry.content_html"></div>
          <div class="buttons">
            <router-link :to="`/journal/${entry.id}/edit`" class="button is-small">
              Edit
            </router-link>
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
import axios from 'axios'

export default {
  name: 'JournalView',
  setup() {
    const entries = ref([])

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
      formatDate
    }
  }
}
</script> 