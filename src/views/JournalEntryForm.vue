<template>
  <div>
    <div class="header-container">
      <h1 class="title mb-0">{{ currentDateTime }}</h1>
    </div>

    <div class="box">
      <form @submit.prevent="handleSubmit">
        <div class="field">
          <QuillEditor
            v-model:content="form.content_html"
            contentType="html"
            theme="snow"
            toolbar="full"
            :options="editorOptions"
            @ready="onEditorReady"
          />
        </div>

        <div class="field is-grouped mt-5">
          <div class="control">
            <button 
              class="button is-primary" 
              type="submit"
              :class="{ 'is-loading': loading }"
            >
              {{ isEditing ? 'Update' : 'Create' }}
            </button>
          </div>
          <div class="control">
            <button 
              class="button" 
              type="button" 
              @click="router.push('/journal')"
            >
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import axios from 'axios'
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'

export default {
  name: 'JournalEntryForm',
  components: {
    QuillEditor
  },
  setup() {
    const router = useRouter()
    const route = useRoute()
    const loading = ref(false)
    const form = ref({
      content_html: ''
    })

    const currentDateTime = computed(() => {
      return new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    })

    const editorOptions = {
      modules: {
        toolbar: [
          ['bold', 'italic', 'underline', 'strike'],
          ['blockquote', 'code-block'],
          [{ 'header': 1 }, { 'header': 2 }],
          [{ 'list': 'ordered'}, { 'list': 'bullet' }],
          [{ 'script': 'sub'}, { 'script': 'super' }],
          [{ 'indent': '-1'}, { 'indent': '+1' }],
          [{ 'size': ['small', false, 'large', 'huge'] }],
          [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
          [{ 'color': [] }, { 'background': [] }],
          [{ 'align': [] }],
          ['clean'],
          ['link']
        ]
      },
      placeholder: 'Write your thoughts...',
      theme: 'snow'
    }

    const isEditing = computed(() => route.params.id !== undefined)

    const fetchEntry = async (id) => {
      try {
        const response = await axios.get(`/api/journal/${id}/`)
        form.value = response.data
      } catch (error) {
        console.error('Error fetching entry:', error)
      }
    }

    const handleSubmit = async () => {
      loading.value = true
      try {
        if (isEditing.value) {
          await axios.put(`/api/journal/${route.params.id}/`, form.value)
        } else {
          await axios.post('/api/journal/', form.value)
        }
        router.push('/journal')
      } catch (error) {
        console.error('Error saving entry:', error)
      } finally {
        loading.value = false
      }
    }

    const onEditorReady = (quill) => {
      // The editor is ready
      console.log('Editor ready!', quill)
    }

    onMounted(() => {
      if (isEditing.value) {
        fetchEntry(route.params.id)
      }
    })

    return {
      form,
      loading,
      handleSubmit,
      isEditing,
      router,
      editorOptions,
      onEditorReady,
      currentDateTime
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

:deep(.ql-editor.ql-blank::before) {
  color: var(--text) !important;
  opacity: 0.6;
}

:deep(.ql-editor) {
  min-height: 200px;
  background-color: var(--card-background);
  color: var(--text);
  font-size: 1.1rem;
  line-height: 1.6;
}

:deep(.ql-toolbar) {
  background-color: var(--card-background);
  border-color: var(--border) !important;
}

:deep(.ql-container) {
  border-color: var(--border) !important;
}

:deep(.ql-stroke) {
  stroke: var(--text) !important;
}

:deep(.ql-fill) {
  fill: var(--text) !important;
}

:deep(.ql-picker) {
  color: var(--text) !important;
}

:deep(.ql-picker-options) {
  background-color: var(--card-background) !important;
  color: var(--text) !important;
}
</style> 