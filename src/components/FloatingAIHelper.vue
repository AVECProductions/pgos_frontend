<template>
  <div>
    <elevenlabs-convai 
      agent-id="q1C87pc7gAQiqU0bCIEZ"
      voice="true"
      input-mode="voice"
      enable-voice-input="true"
      enable-voice-output="true"
      audio-quality="medium"
      stream-optimized="true"
      mobile-optimized="true"
      playback-rate="1.0"
      buffer-size="8192"
      sample-rate="22050"
      latency="0.5"
      voice-chunk-size="1024"
      output-format="mp3"
      compression="true"
      mono="true"
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
    
    // Load ElevenLabs script with priority
    const script = document.createElement('script')
    script.src = 'https://elevenlabs.io/convai-widget/index.js'
    script.async = true
    script.defer = false
    script.setAttribute('importance', 'high')
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
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext
        this.audioContext = new AudioContext({
          // Lower sample rate for better performance
          sampleRate: 22050,
          latencyHint: 'playback',
          // Increased buffer size to prevent choppy audio
          bufferSize: 8192
        })

        // Simplified audio processing chain
        const masterGain = this.audioContext.createGain()
        masterGain.gain.value = 0.9 // Slightly reduced volume
        masterGain.connect(this.audioContext.destination)

        // Add a compressor to smooth out audio
        const compressor = this.audioContext.createDynamicsCompressor()
        compressor.threshold.value = -24
        compressor.knee.value = 30
        compressor.ratio.value = 12
        compressor.attack.value = 0.003
        compressor.release.value = 0.25
        compressor.connect(masterGain)

        this.masterGain = masterGain
        this.compressor = compressor
      } catch (e) {
        console.error('Audio Context Setup Error:', e)
      }
    },

    setupIOSAudioUnlock() {
      const unlockAudio = () => {
        if (this.audioContext && this.audioContext.state !== 'running') {
          this.audioContext.resume()
        }
        document.body.removeEventListener('touchstart', unlockAudio)
        document.body.removeEventListener('touchend', unlockAudio)
      }

      document.body.addEventListener('touchstart', unlockAudio)
      document.body.addEventListener('touchend', unlockAudio)
    },

    async requestMicrophonePermission() {
      try {
        const constraints = {
          audio: {
            echoCancellation: { ideal: true },
            noiseSuppression: { ideal: true },
            autoGainControl: { ideal: true },
            // Reduced quality for better performance
            sampleRate: { ideal: 22050 },
            sampleSize: { ideal: 16 },
            channelCount: { ideal: 1 },
            latency: { ideal: 0.5 },
            // Mobile specific
            ...(this.isIOS ? {
              googEchoCancellation: { ideal: true },
              googAutoGainControl: { ideal: true },
              googNoiseSuppression: { ideal: true },
              googHighpassFilter: { ideal: true }
            } : {})
          }
        }

        const stream = await navigator.mediaDevices.getUserMedia(constraints)
        this.audioStream = stream

        if (this.isIOS && this.audioContext) {
          const source = this.audioContext.createMediaStreamSource(stream)
          source.connect(this.compressor)
        }

        console.log('Audio setup complete')
      } catch (err) {
        console.error('Microphone Error:', err)
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
  /* Optimize rendering */
  -webkit-transform: translate3d(0,0,0);
  transform: translate3d(0,0,0);
}

/* Mobile optimizations */
@media (max-width: 768px) {
  .convai-widget {
    will-change: transform;
    -webkit-transform: translate3d(0,0,0);
    transform: translate3d(0,0,0);
  }
}
</style> 