<template>
  <div class="h-screen w-full flex bg-black text-white overflow-hidden select-none font-sans">
    
    <div class="w-32 bg-zinc-900 border-r border-white/5 flex flex-col p-4 gap-4 overflow-y-auto custom-scrollbar">
      <p class="text-[8px] font-black opacity-40 uppercase text-center mb-2">Pose Ideas</p>
      
      <div v-for="pose in poseLibrary" :key="pose.id" 
           @click="activeGhost = pose.ghostSrc"
           class="group relative aspect-[3/4] rounded-xl overflow-hidden border-2 transition-all cursor-pointer"
           :class="activeGhost === pose.ghostSrc ? 'border-yellow-400 scale-105 shadow-lg' : 'border-white/10 opacity-50'">
        <img :src="pose.thumb" class="w-full h-full object-cover grayscale group-hover:grayscale-0" />
        <div v-if="activeGhost === pose.ghostSrc" class="absolute inset-0 bg-yellow-400/10 flex items-center justify-center">
          <span class="text-[10px] font-black text-yellow-400 bg-black/80 px-2 py-0.5 rounded">ACTIVE</span>
        </div>
      </div>

      <button @click="activeGhost = null" class="mt-4 text-[10px] font-bold text-white/30 uppercase hover:text-red-500">Clear Pose</button>
    </div>

    <div class="flex-1 h-full relative flex flex-col p-8 items-center justify-center bg-zinc-950">
      
      <div class="relative w-full aspect-square max-w-[700px] rounded-[4rem] overflow-hidden border-[12px] border-white/5 shadow-2xl bg-zinc-900">
        
        <video ref="videoRef" autoplay playsinline class="absolute inset-0 w-full h-full object-cover scale-x-[-1]"></video>
        
        <transition name="fade">
          <img v-if="activeGhost" :src="activeGhost" 
               class="absolute inset-0 w-full h-full object-contain opacity-30 pointer-events-none z-30 mix-blend-screen brightness-150" />
        </transition>

        <img v-if="store.selectedFrame" :src="store.selectedFrame" 
             class="absolute inset-0 w-full h-full object-fill pointer-events-none z-20 opacity-90" />

        <div v-if="countdown > 0" class="absolute inset-0 flex items-center justify-center z-40 bg-black/40 backdrop-blur-sm">
          <span class="text-[250px] font-black italic text-yellow-400 animate-ping">{{ countdown }}</span>
        </div>
        <div v-if="showFlash" class="absolute inset-0 bg-white z-50"></div>
      </div>

      <div class="mt-12 w-full max-w-[450px] flex flex-col gap-4">
        <button @click="startCountdown" :disabled="countdown > 0"
                class="w-full py-8 bg-yellow-400 text-black rounded-full font-black text-4xl uppercase shadow-[0_12px_0_rgb(161,98,7)] active:translate-y-2 active:shadow-none transition-all">
          {{ countdown > 0 ? 'READY' : 'CAPTURE' }}
        </button>
      </div>
    </div>

    <div class="w-80 h-full flex flex-col p-6 gap-4 bg-black border-l border-white/5 shadow-[-20px_0_50px_rgba(0,0,0,0.5)]">
      <h3 class="text-xs font-black uppercase tracking-[0.4em] opacity-30 mb-2">Moments</h3>
      
      <div v-for="(photo, index) in 4" :key="index"
           @click="activeIndex = index"
           class="flex-1 relative rounded-[2rem] overflow-hidden border-4 transition-all duration-500 bg-zinc-900/30"
           :class="activeIndex === index ? 'border-yellow-400 scale-[1.05] z-10' : 'border-white/5 opacity-50'">
        
        <transition name="slide-right">
          <img v-if="store.photos[index]" :src="store.photos[index].src" class="absolute inset-0 w-full h-full object-cover" />
        </transition>
        
        <div v-if="!store.photos[index] && activeIndex === index" class="absolute inset-0 flex items-center justify-center">
          <div class="w-2 h-2 bg-yellow-400 rounded-full animate-ping"></div>
        </div>
      </div>

      <button v-if="store.photos.some(p => p)" @click="store.nextStep('REVIEW')" 
              class="mt-4 py-4 bg-white/5 rounded-2xl font-bold text-yellow-400 uppercase tracking-widest text-[10px] border border-white/10">
        Finish & Arrange →
      </button>
    </div>

    <canvas ref="canvasRef" class="hidden" width="1080" height="1080"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useBoothStore } from '../store'

const store = useBoothStore()
const activeGhost = ref(null)
const countdown = ref(0)
const activeIndex = ref(0)
const showFlash = ref(false)
const videoRef = ref(null)
const canvasRef = ref(null)

// Mockup Library Pose
const poseLibrary = [
  { id: 1, thumb: '/poses/solo_1_thumb.jpg', ghostSrc: '/poses/solo_1_ghost.png' },
  { id: 2, thumb: '/poses/couple_1_thumb.jpg', ghostSrc: '/poses/couple_1_ghost.png' },
  { id: 3, thumb: '/poses/bestie_1_thumb.jpg', ghostSrc: '/poses/bestie_1_ghost.png' },
]

const startCountdown = () => {
  if (countdown.value > 0) return
  countdown.value = 3
  const timer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(timer)
      doCapture()
    }
  }, 1000)
}

const doCapture = () => {
  showFlash.value = true
  const canvas = canvasRef.value
  const ctx = canvas.getContext('2d')
  const video = videoRef.value

  const size = Math.min(video.videoWidth, video.videoHeight)
  const x = (video.videoWidth - size) / 2
  const y = (video.videoHeight - size) / 2

  ctx.save()
  ctx.translate(canvas.width, 0)
  ctx.scale(-1, 1)
  ctx.drawImage(video, x, y, size, size, 0, 0, canvas.width, canvas.height)
  ctx.restore()

  // Simpan foto sebagai object untuk Interactive Layout nantinya
  store.photos[activeIndex.value] = {
    src: canvas.toDataURL('image/jpeg', 0.9),
    x: 0, y: 0, scale: 1, rotation: 0 // Inisialisasi posisi default
  }
  
  setTimeout(() => {
    showFlash.value = false
    if (activeIndex.value < 3) activeIndex.value++
  }, 200)
}

onMounted(async () => {
  try {
    const s = await navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720 } })
    videoRef.value.srcObject = s
  } catch (e) { console.error(e) }
})
</script> 