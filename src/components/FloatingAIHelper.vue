<template>
  <div>
    <elevenlabs-convai 
      agent-id="q1C87pc7gAQiqU0bCIEZ"
      voice="true"
      input-mode="voice"
      enable-voice-input="true"
      enable-voice-output="true"
      audio-quality="high"
      stream-optimized="true"
      mobile-optimized="true"
      playback-rate="1.0"
      buffer-size="4096"
      sample-rate="48000"
    ></elevenlabs-convai>
  </div>
</template>

<script>
export default {
  name: 'FloatingAIHelper',
  data() {
    return {
      audioContext: null,
      audioStream: null,
      isIOS: false
    }
  },
  mounted() {
    // Detect iOS
    this.isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    
    // Load ElevenLabs script
    const script = document.createElement('script')
    script.src = 'https://elevenlabs.io/convai-widget/index.js'
    script.async = true
    document.head.appendChild(script)

    // Wait for the widget to be loaded
    script.onload = () => {
      this.setupWidgetObserver()
      if (this.isIOS) {
        this.setupIOSAudioContext()
      }
    }

    // Setup iOS audio unlock
    if (this.isIOS) {
      this.setupIOSAudioUnlock()
    }
  },
  methods: {
    setupIOSAudioContext() {
      // Initialize audio context with iOS-optimized settings
      const AudioContext = window.AudioContext || window.webkitAudioContext
      this.audioContext = new AudioContext({
        sampleRate: 48000,
        latencyHint: 'interactive',
        bufferSize: 4096
      })

      // Create and configure audio nodes for iOS
      const masterGain = this.audioContext.createGain()
      masterGain.gain.value = 1.0
      masterGain.connect(this.audioContext.destination)
    },

    setupIOSAudioUnlock() {
      // iOS requires user interaction to start audio context
      document.addEventListener('touchstart', () => {
        if (this.audioContext && this.audioContext.state !== 'running') {
          this.audioContext.resume()
        }
      }, { once: true })
    },

    async requestMicrophonePermission() {
      try {
        // iOS-optimized audio constraints
        const constraints = {
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
            sampleRate: 48000,
            sampleSize: 24,
            channelCount: 1,
            latency: 0,
            ...(this.isIOS ? {
              // iOS-specific constraints
              googEchoCancellation: true,
              googAutoGainControl: true,
              googNoiseSuppression: true,
              googHighpassFilter: true
            } : {})
          }
        }

        const stream = await navigator.mediaDevices.getUserMedia(constraints)
        this.audioStream = stream

        if (this.isIOS && this.audioContext) {
          // Connect the stream to the audio context
          const source = this.audioContext.createMediaStreamSource(stream)
          const processor = this.audioContext.createScriptProcessor(4096, 1, 1)
          
          source.connect(processor)
          processor.connect(this.audioContext.destination)
          
          // Keep references to prevent garbage collection
          this.source = source
          this.processor = processor
        }

        console.log('Microphone permission granted and audio setup complete')
      } catch (err) {
        console.error('Error accessing microphone:', err)
      }
    },

    setupWidgetObserver() {
      const observer = new MutationObserver((mutations, obs) => {
        const widget = document.querySelector('.convai-widget')
        if (widget) {
          obs.disconnect()
          
          new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
              if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                const isOpen = widget.classList.contains('convai-widget-expanded')
                if (isOpen) {
                  this.requestMicrophonePermission()
                  if (this.isIOS && this.audioContext) {
                    this.audioContext.resume()
                  }
                } else {
                  // Cleanup when widget is closed
                  if (this.audioStream) {
                    this.audioStream.getTracks().forEach(track => track.stop())
                  }
                }
              }
            })
          }).observe(widget, {
            attributes: true,
            attributeFilter: ['class']
          })
        }
      })

      observer.observe(document.body, {
        childList: true,
        subtree: true
      })
    }
  },
  beforeDestroy() {
    // Cleanup
    if (this.audioStream) {
      this.audioStream.getTracks().forEach(track => track.stop())
    }
    if (this.audioContext) {
      this.audioContext.close()
    }
  }
}
</script>

<style scoped>
.convai-widget {
  z-index: 1000;
  /* Optimize rendering on iOS */
  -webkit-transform: translateZ(0);
  -webkit-backface-visibility: hidden;
  -webkit-perspective: 1000;
}

/* iOS-specific optimizations */
@supports (-webkit-touch-callout: none) {
  .convai-widget {
    /* Prevent Safari rubber-banding */
    overscroll-behavior: none;
    -webkit-overflow-scrolling: touch;
  }
}

@media (max-width: 768px) {
  .convai-widget {
    will-change: transform;
    transform: translateZ(0);
  }
}
</style> 