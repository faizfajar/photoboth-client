<template>
  <div class="fixed inset-0 w-screen h-screen bg-zinc-950 text-white overflow-hidden select-none font-sans flex">
    
    <div class="absolute inset-0 opacity-[0.03] pointer-events-none" 
         style="background-image: radial-gradient(#fff 1px, transparent 1px); background-size: 40px 40px;"></div>

    <aside class="w-64 h-full bg-black/20 backdrop-blur-xl border-r border-white/5 z-50 flex flex-col p-6 gap-4">
      <div class="mb-2 text-center">
        <h3 class="text-[10px] font-black uppercase tracking-[0.4em] opacity-20">Film Strip</h3>
      </div>
      
      <div v-for="(photo, index) in store.photos" :key="index"
           @click="handleSlotClick(index)"
           class="flex-1 relative rounded-2xl overflow-hidden border-2 transition-all duration-500 bg-white/5 cursor-pointer group"
           :class="activeIndex === index ? 'border-yellow-400 scale-[1.02] shadow-lg' : 'border-white/5 opacity-40 hover:opacity-100'">
        <img v-if="photo.src" :src="photo.src" class="w-full h-full object-cover" />
        <div v-if="photo.src" class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
           <span class="text-sm">🔍</span>
        </div>
        <div v-if="!photo.src && activeIndex === index" class="absolute inset-0 flex items-center justify-center">
          <div class="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-ping"></div>
        </div>
      </div>

      <button v-if="store.allPhotosCaptured" @click="store.nextStep('REVIEW')" 
              class="mt-4 py-4 bg-yellow-400 text-black rounded-2xl font-black uppercase tracking-widest text-[10px] hover:scale-105 transition-all">
        Finish →
      </button>
    </aside>

    <main class="flex-1 relative h-full flex items-center justify-center p-12 overflow-hidden">
      
      <div class="absolute top-12 left-12 right-12 flex justify-between items-start opacity-20 pointer-events-none font-mono text-[10px]">
        <div>REC: 4K RES<br>ISO: 100</div>
        <div class="text-right uppercase">Slot: 0{{ activeIndex + 1 }}<br>{{ store.selectedLayout?.name }}</div>
      </div>

      <div v-if="currentSlot"
           class="relative shadow-2xl bg-black overflow-hidden transition-all duration-700 max-h-[75vh]"
           :style="{ height: '100%', aspectRatio: `${currentSlot.w} / ${currentSlot.h}` }">
        
        <div class="absolute inset-0 pointer-events-none z-30 border-[1px] border-white/5 m-6">
          <div class="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-yellow-400/50"></div>
          <div class="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-yellow-400/50"></div>
          <div class="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-yellow-400/50"></div>
          <div class="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-yellow-400/50"></div>
        </div>

        <video ref="videoRef" autoplay muted playsinline class="absolute inset-0 w-full h-full object-cover scale-x-[-1] z-0"></video>
        
        <img v-if="activeGhost" :src="activeGhost" class="absolute inset-0 w-full h-full object-contain opacity-30 pointer-events-none z-10 mix-blend-screen" />

        <transition name="fade">
          <div v-if="countdown > 0" class="absolute inset-0 z-[80] flex items-center justify-center bg-black/30 backdrop-blur-[2px]">
            <span class="text-[180px] font-black italic text-yellow-400 drop-shadow-2xl">{{ countdown }}</span>
          </div>
        </transition>

        <div v-if="showFlash" class="absolute inset-0 bg-white z-[100]"></div>
      </div>
    </main>

    <aside class="w-40 h-full bg-black/20 border-l border-white/5 flex flex-col items-center py-10 gap-8 z-50">
      
      <div class="flex-1 flex flex-col gap-4 overflow-y-auto no-scrollbar px-6">
        <div v-for="pose in poseLibrary.slice(0, 5)" :key="pose.id" 
             @click="openPoseDetail(pose)"
             class="w-16 h-20 rounded-xl overflow-hidden border transition-all cursor-pointer bg-white/5 shrink-0"
             :class="activeGhost === pose.ghostSrc ? 'border-yellow-400 scale-110 shadow-lg' : 'border-white/10 opacity-40 hover:opacity-100'">
          <img :src="pose.thumb" class="w-full h-full object-cover grayscale" />
        </div>
        
        <button @click="showPoseModal = true" class="w-16 h-16 rounded-xl border border-white/10 flex items-center justify-center hover:bg-white/5 transition-all text-xl opacity-40 hover:opacity-100">
          📂
        </button>
      </div>

      <div class="pb-10 flex flex-col items-center gap-4">
        <span class="text-[8px] font-black uppercase tracking-[0.3em] opacity-30">{{ store.photos[activeIndex]?.src ? 'Retake' : 'Capture' }}</span>
        <button @click="startCountdown" :disabled="countdown > 0"
                class="w-24 h-24 rounded-full border-4 flex items-center justify-center transition-all active:scale-90 group"
                :class="store.photos[activeIndex]?.src ? 'border-red-600' : 'border-yellow-400'">
          <div class="w-20 h-20 rounded-full transition-all group-hover:scale-90"
               :class="store.photos[activeIndex]?.src ? 'bg-red-600 shadow-[0_0_30px_rgba(220,38,38,0.3)]' : 'bg-yellow-400 shadow-[0_0_30px_rgba(250,204,21,0.3)]'">
          </div>
        </button>
      </div>
    </aside>

    <transition name="pop">
      <div v-if="reviewingPhotoIndex !== null" class="fixed inset-0 z-[150] bg-black/95 backdrop-blur-xl flex items-center justify-center p-10">
        <div class="flex flex-col items-center max-w-xl w-full">
          <div class="relative aspect-[3/4] w-full rounded-[3rem] overflow-hidden border-4 border-white/10 mb-10 shadow-2xl">
            <img :src="store.photos[reviewingPhotoIndex]?.src" class="w-full h-full object-cover" />
          </div>
          <div class="flex gap-4 w-full px-6 text-xs font-black uppercase text-white">
            <button @click="reviewingPhotoIndex = null" class="flex-1 py-6 bg-white/10 rounded-2xl">Keep Pose</button>
            <button @click="triggerRetakeFromReview" class="flex-1 py-6 bg-red-600 rounded-2xl">Retake</button>
          </div>
        </div>
      </div>
    </transition>

    <transition name="pop">
      <div v-if="selectedPoseDetail" class="fixed inset-0 z-[170] bg-black/98 backdrop-blur-2xl flex items-center justify-center p-10">
        <div class="flex flex-col items-center max-w-md w-full animate-in fade-in zoom-in duration-300">
          <div class="relative aspect-[3/4] w-full rounded-[3.5rem] overflow-hidden border-4 border-yellow-400 shadow-2xl mb-12 bg-zinc-900">
            <img :src="selectedPoseDetail.thumb" class="w-full h-full object-cover" />
          </div>
          <div class="flex gap-4 w-full text-[10px] font-black uppercase text-white">
            <button @click="closeDetailAndShowAll" class="flex-1 py-6 bg-white/10 rounded-[2rem] border border-white/5">See All Guide</button>
            <button @click="useThisPose" class="flex-1 py-6 bg-yellow-400 text-black rounded-[2rem]">Use Pose</button>
          </div>
          <button @click="selectedPoseDetail = null" class="mt-8 opacity-40 hover:opacity-100 uppercase tracking-widest text-[8px] font-bold">Close Preview</button>
        </div>
      </div>
    </transition>

    <transition name="fade">
      <div v-if="showPoseModal" class="fixed inset-0 z-[160] bg-zinc-950/98 flex items-center justify-center p-20">
        <div class="w-full max-w-6xl">
          <div class="flex justify-between items-center mb-12">
            <h2 class="text-5xl font-black italic uppercase tracking-tighter">Choose <span class="text-yellow-400">Pose</span></h2>
            <button @click="showPoseModal = false" class="text-5xl font-light opacity-30 hover:opacity-100">&times;</button>
          </div>
          <div class="grid grid-cols-4 gap-8 overflow-y-auto max-h-[60vh] pr-6 custom-scrollbar">
            <div v-for="pose in poseLibrary" :key="'modal-'+pose.id" 
                 @click="openPoseDetail(pose)"
                 class="group aspect-[3/4] rounded-[2.5rem] overflow-hidden border-2 border-white/5 bg-zinc-900 transition-all hover:border-white/20 cursor-pointer">
              <img :src="pose.thumb" class="w-full h-full object-cover grayscale opacity-50 group-hover:opacity-100 group-hover:grayscale-0 transition-all" />
            </div>
          </div>
        </div>
      </div>
    </transition>

    <canvas ref="canvasRef" class="hidden"></canvas>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useBoothStore } from '../store'
import poseData from '../data/poses.json'

const store = useBoothStore()
const videoRef = ref(null)
const canvasRef = ref(null)

// State management
const activeIndex = ref(0)
const countdown = ref(0)
const showFlash = ref(false)
const showPoseModal = ref(false)
const selectedPoseDetail = ref(null)
const reviewingPhotoIndex = ref(null)
const activeGhost = ref(null)
const poseLibrary = ref(poseData)
let stream = null

const currentSlot = computed(() => store.photos[activeIndex.value] || null)

// --- HANDLERS ---

const handleSlotClick = (index) => {
  if (countdown.value > 0) return
  if (store.photos[index]?.src) {
    reviewingPhotoIndex.value = index // Buka modal review foto
  } else {
    activeIndex.value = index // Pindah slot aktif
  }
}

// MEMULIHKAN: Fungsi membuka detail pose
const openPoseDetail = (pose) => { 
  selectedPoseDetail.value = pose 
}

// MEMULIHKAN: Fungsi transisi dari detail ke grid library
const closeDetailAndShowAll = () => { 
  selectedPoseDetail.value = null 
  showPoseModal.value = true 
}

// MEMULIHKAN: Fungsi mengaktifkan ghost pose
const useThisPose = () => { 
  activeGhost.value = selectedPoseDetail.value.ghostSrc
  selectedPoseDetail.value = null
  showPoseModal.value = false 
}

const triggerRetakeFromReview = () => { 
  activeIndex.value = reviewingPhotoIndex.value
  reviewingPhotoIndex.value = null 
}

const startCountdown = () => {
  if (countdown.value > 0) return
  countdown.value = 3
  const timer = setInterval(() => {
    if (countdown.value > 0) countdown.value--
    if (countdown.value === 0) { clearInterval(timer); doCapture() }
  }, 1000)
}

const doCapture = () => {
  showFlash.value = true
  const video = videoRef.value
  const canvas = canvasRef.value
  const ctx = canvas.getContext('2d')
  if (!video || !currentSlot.value) return

  canvas.width = currentSlot.value.w * 2
  canvas.height = currentSlot.value.h * 2

  const videoW = video.videoWidth
  const videoH = video.videoHeight
  const targetRatio = currentSlot.value.w / currentSlot.value.h
  const sourceRatio = videoW / videoH

  let drawW, drawH, sx, sy
  if (sourceRatio > targetRatio) {
    drawH = videoH; drawW = videoH * targetRatio; sx = (videoW - drawW) / 2; sy = 0;
  } else {
    drawW = videoW; drawH = videoH / targetRatio; sx = 0; sy = (videoH - drawH) / 2;
  }

  ctx.save()
  ctx.translate(canvas.width, 0)
  ctx.scale(-1, 1)
  ctx.drawImage(video, sx, sy, drawW, drawH, 0, 0, canvas.width, canvas.height)
  ctx.restore()

  store.updatePhoto(activeIndex.value, canvas.toDataURL('image/jpeg', 0.95))
  
  setTimeout(() => {
    showFlash.value = false
    const nextEmpty = store.photos.findIndex(p => p.src === null)
    if (nextEmpty !== -1) activeIndex.value = nextEmpty
  }, 400)
}

onMounted(async () => {
  await nextTick()
  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: { width: 1920, height: 1080 } })
    if (videoRef.value) videoRef.value.srcObject = stream
  } catch (e) { console.error(e) }
})

onUnmounted(() => { if (stream) stream.getTracks().forEach(t => t.stop()) })
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar { display: none; }
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #facc15; border-radius: 10px; }

.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.pop-enter-active { transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
.pop-enter-from { transform: scale(0.9) translateY(20px); opacity: 0; }
</style>