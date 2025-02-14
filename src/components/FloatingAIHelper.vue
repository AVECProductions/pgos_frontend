<template>
  <div>
    <elevenlabs-convai 
      agent-id="q1C87pc7gAQiqU0bCIEZ"
      voice="true"
      input-mode="voice"
      enable-voice-input="true"
      enable-voice-output="true"
    ></elevenlabs-convai>
  </div>
</template>

<script>
export default {
  name: 'FloatingAIHelper',
  mounted() {
    // Load ElevenLabs script
    const script = document.createElement('script')
    script.src = 'https://elevenlabs.io/convai-widget/index.js'
    script.async = true
    document.head.appendChild(script)

    // Wait for the widget to be loaded
    script.onload = () => {
      this.setupWidgetObserver()
    }
  },
  methods: {
    async requestMicrophonePermission() {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true })
        console.log('Microphone permission granted')
      } catch (err) {
        console.error('Error accessing microphone:', err)
      }
    },
    setupWidgetObserver() {
      // Wait for the widget to be added to the DOM
      const observer = new MutationObserver((mutations, obs) => {
        const widget = document.querySelector('.convai-widget')
        if (widget) {
          obs.disconnect() // Stop observing once we find the widget
          
          // Now observe the widget for class changes
          new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
              if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                const isOpen = widget.classList.contains('convai-widget-expanded')
                if (isOpen) {
                  // Only request microphone permission when widget is opened
                  this.requestMicrophonePermission()
                }
              }
            })
          }).observe(widget, {
            attributes: true,
            attributeFilter: ['class']
          })
        }
      })

      // Start observing the document body for the widget to be added
      observer.observe(document.body, {
        childList: true,
        subtree: true
      })
    }
  }
}
</script>

<style scoped>
/* Add any custom styling for the widget container here */
</style> 