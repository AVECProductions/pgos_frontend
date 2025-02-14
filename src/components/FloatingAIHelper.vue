<template>
  <div>
    <elevenlabs-convai 
      agent-id="q1C87pc7gAQiqU0bCIEZ"
      voice="true"
      input-mode="voice"
      enable-voice-input="true"
      enable-voice-output="true"
      audio-quality="high"
      buffer-size="2048"
      sample-rate="44100"
      latency-hint="interactive"
      stream-optimized="true"
      mobile-optimized="true"
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
    script.crossOrigin = 'anonymous'
    document.head.appendChild(script)

    // Configure audio context for better performance
    const initAudioContext = () => {
      try {
        window.AudioContext = window.AudioContext || window.webkitAudioContext;
        const audioContext = new AudioContext({
          latencyHint: 'interactive',
          sampleRate: 44100,
        });
        
        // Optimize audio processing
        if (audioContext.audioWorklet) {
          audioContext.audioWorklet.addModule('path/to/worklet.js').catch(console.error);
        }
      } catch (e) {
        console.error('Audio Context initialization failed:', e);
      }
    };

    // Wait for the widget to be loaded
    script.onload = () => {
      initAudioContext();
      this.setupWidgetObserver()
    }
  },
  methods: {
    async requestMicrophonePermission() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
            channelCount: 1,
            sampleRate: 44100,
            sampleSize: 16,
          } 
        });
        console.log('Microphone permission granted');
        // Keep the stream active
        window.audioStream = stream;
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
/* Optimize mobile performance */
@media (max-width: 768px) {
  .convai-widget {
    will-change: transform;
    transform: translateZ(0);
    backface-visibility: hidden;
    perspective: 1000px;
  }
}
</style> 