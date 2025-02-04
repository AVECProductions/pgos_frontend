<template>
  <div>
    <h1 class="title">{{ isEditing ? 'Edit Entry' : 'New Journal Entry' }}</h1>

    <form @submit.prevent="handleSubmit">
      <div class="field">
        <label class="label">Title</label>
        <div class="control">
          <input 
            class="input" 
            type="text" 
            v-model="form.title"
            required
            :class="{ 'is-danger': errors.title }"
          >
        </div>
        <p class="help is-danger" v-if="errors.title">{{ errors.title }}</p>
      </div>

      <div class="field">
        <label class="label">Content</label>
        <div class="control">
          <editor-content 
            class="content-editor"
            :editor="editor"
          />
        </div>
        <p class="help is-danger" v-if="errors.content_html">{{ errors.content_html }}</p>
      </div>

      <div class="field is-grouped">
        <div class="control">
          <button 
            class="button is-primary"
            :class="{ 'is-loading': loading }"
            type="submit"
          >
            {{ isEditing ? 'Update' : 'Create' }} Entry
          </button>
        </div>
        <div class="control">
          <router-link to="/journal" class="button is-light">
            Cancel
          </router-link>
        </div>
      </div>
    </form>
  </div>
</template>

<script>
import { ref, onBeforeUnmount } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import axios from 'axios'
import { Editor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import Bold from '@tiptap/extension-bold'
import Italic from '@tiptap/extension-italic'
import BulletList from '@tiptap/extension-bullet-list'
import OrderedList from '@tiptap/extension-ordered-list'
import ListItem from '@tiptap/extension-list-item'

export default {
  name: 'JournalEntryForm',
  components: {
    EditorContent,
  },
  setup() {
    const router = useRouter()
    const route = useRoute()
    const loading = ref(false)
    const errors = ref({})
    const form = ref({
      title: '',
      content_html: ''
    })

    const editor = new Editor({
      extensions: [
        StarterKit,
        Document,
        Paragraph,
        Text,
        Bold,
        Italic,
        BulletList,
        OrderedList,
        ListItem,
      ],
      content: '',
      onUpdate: ({ editor }) => {
        form.value.content_html = editor.getHTML()
      }
    })

    const isEditing = route.params.id !== undefined

    const fetchEntry = async () => {
      if (isEditing) {
        try {
          const response = await axios.get(`/api/journal/${route.params.id}/`)
          form.value = response.data
          editor.commands.setContent(response.data.content_html)
        } catch (error) {
          console.error('Error fetching journal entry:', error)
        }
      }
    }

    const handleSubmit = async () => {
      loading.value = true
      errors.value = {}

      try {
        const method = isEditing ? 'put' : 'post'
        const url = isEditing ? `/api/journal/${route.params.id}/` : '/api/journal/'
        await axios[method](url, form.value)
        router.push('/journal')
      } catch (error) {
        if (error.response?.data) {
          errors.value = error.response.data
        }
      } finally {
        loading.value = false
      }
    }

    fetchEntry()

    onBeforeUnmount(() => {
      editor.destroy()
    })

    return {
      form,
      loading,
      errors,
      editor,
      isEditing,
      handleSubmit
    }
  }
}
</script>

<style>
.content-editor {
  border: 1px solid #dbdbdb;
  border-radius: 4px;
  padding: 1rem;
  min-height: 300px;
}

.content-editor:focus-within {
  border-color: #3273dc;
}

.ProseMirror {
  outline: none;
}

.ProseMirror > * + * {
  margin-top: 0.75em;
}

.ProseMirror ul,
.ProseMirror ol {
  padding: 0 1rem;
}
</style> 