<template>
  <div class="elevenlabs-widget box">
    <h2 class="subtitle">AI Assistant</h2>
    <div class="widget-container">
      <elevenlabs-convai 
        agent-id="q1C87pc7gAQiqU0bCIEZ"
      ></elevenlabs-convai>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ElevenLabsWidget',
  mounted() {
    // Load ElevenLabs script
    const script = document.createElement('script')
    script.src = 'https://elevenlabs.io/convai-widget/index.js'
    script.async = true
    document.head.appendChild(script)
  }
}
</script>

<style scoped>
.elevenlabs-widget {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.widget-container {
  flex: 1;
  min-height: 300px;
}
</style> 