<template>
  <div class="fixed inset-0 w-screen h-screen bg-zinc-950 text-white overflow-hidden select-none font-sans flex">
    
    <div class="absolute inset-0 opacity-[0.03] pointer-events-none" 
         style="background-image: radial-gradient(#fff 1px, transparent 1px); background-size: 40px 40px;"></div>

    <aside class="w-64 h-full bg-black/20 backdrop-blur-xl border-r border-white/5 z-50 flex flex-col p-6 gap-6 overflow-y-auto no-scrollbar">
      <div class="mb-2 text-center">
        <h3 class="text-[10px] font-black uppercase tracking-[0.4em] opacity-20 italic">Film Strip</h3>
      </div>
      
      <div v-for="(photo, index) in store.photos" :key="index"
           @click="handleSlotClick(index)"
           class="relative rounded-2xl overflow-hidden border-2 transition-all duration-500 cursor-pointer group shrink-0"
           :class="[
             store.activeIndex === index ? 'border-yellow-400 scale-[1.05] shadow-lg z-10' : 'border-white/5 opacity-40 hover:opacity-100',
             justCapturedIndex === index ? 'animate-slot-flash' : 'bg-white/5'
           ]"
           :style="{ width: '100%', aspectRatio: `${photo.w} / ${photo.h}` }">
        
        <transition name="slot-pop">
          <img v-if="photo.src" :src="photo.src" class="w-full h-full object-cover" />
        </transition>
        
        <div v-if="photo.src" class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
           <span class="text-sm">🔍</span>
        </div>

        <div v-if="!photo.src && store.activeIndex === index" class="absolute inset-0 flex items-center justify-center bg-yellow-400/5">
          <div class="w-2 h-2 bg-yellow-400 rounded-full animate-ping"></div>
        </div>

        <div class="absolute top-2 left-2 w-5 h-5 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center text-[8px] font-bold opacity-30">
          0{{ index + 1 }}
        </div>
      </div>
      
      <button v-if="store.allPhotosCaptured" @click="store.nextStep('REVIEW')" 
              class="mt-auto py-5 bg-yellow-400 text-black rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl hover:scale-105 transition-all">
        Finish Session →
      </button>
    </aside>

    <main class="flex-1 relative h-full flex items-center justify-center p-12 overflow-hidden transition-all duration-500"
          :class="(selectedPoseDetail || showPoseModal || reviewingPhotoIndex !== null) ? 'scale-95 blur-sm opacity-50' : 'scale-100'">
      
      <div class="absolute top-12 left-12 right-12 flex justify-between items-start opacity-20 pointer-events-none font-mono text-[10px]">
        <div>REC: 4K RES<br>ISO: 100 | WB: AUTO</div>
        <div class="text-right uppercase">Slot: 0{{ store.activeIndex + 1 }}<br>{{ store.selectedLayout?.name }}</div>
      </div>

      <div v-if="currentSlot"
           class="relative shadow-2xl bg-black overflow-hidden transition-all duration-700 max-h-[75vh] morph-transition"
           :style="{ height: '100%', aspectRatio: `${currentSlot.w} / ${currentSlot.h}` }">
        
        <div class="absolute inset-0 pointer-events-none z-30 border-[1px] border-white/5 m-6">
          <div class="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-yellow-400/50"></div>
          <div class="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-yellow-400/50"></div>
          <div class="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-yellow-400/50"></div>
          <div class="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-yellow-400/50"></div>
        </div>

        <video ref="videoRef" autoplay muted playsinline class="absolute inset-0 w-full h-full object-cover scale-x-[-1] z-0"></video>
        
        <img v-if="activeGhost" :src="activeGhost" class="absolute inset-0 w-full h-full object-contain opacity-30 pointer-events-none z-10 mix-blend-screen" />

        <transition name="flash-number">
          <div v-if="countdown > 0" :key="countdown" class="absolute inset-0 z-[80] flex flex-col items-center justify-center pointer-events-none">
            <span class="text-[250px] font-black italic text-white drop-shadow-[0_0_40px_rgba(255,255,255,0.4)] animate-blink">
              {{ countdown }}
            </span>
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
        <button @click="showPoseModal = true" class="w-16 h-16 rounded-xl border border-white/10 flex items-center justify-center hover:bg-white/5 transition-all opacity-40 hover:opacity-100">
          📂
        </button>
      </div>

      <div class="pb-10 flex flex-col items-center gap-4">
        <span class="text-[8px] font-black uppercase tracking-[0.3em] opacity-30">{{ store.photos[store.activeIndex]?.src ? 'Retake' : 'Capture' }}</span>
        <button @click="startCountdown" :disabled="countdown > 0"
                class="w-24 h-24 rounded-full border-4 flex items-center justify-center transition-all active:scale-90 group"
                :class="store.photos[store.activeIndex]?.src ? 'border-red-600' : 'border-yellow-400'">
          <div class="w-20 h-20 rounded-full transition-all group-hover:scale-90"
               :class="store.photos[store.activeIndex]?.src ? 'bg-red-600' : 'bg-yellow-400'">
          </div>
        </button>
      </div>
    </aside>

    <transition name="pop">
      <div v-if="reviewingPhotoIndex !== null" class="fixed inset-0 z-[150] bg-black/95 backdrop-blur-xl flex items-center justify-center p-10">
        <div class="flex flex-col items-center w-full max-w-5xl">
          
          <header class="mb-8 flex flex-col items-center gap-4">
            <h3 class="text-3xl font-black italic uppercase tracking-tighter">Review <span class="text-yellow-400">Capture</span></h3>
            
            <button v-if="store.photos[reviewingPhotoIndex].usedGhost"
                    @click="compareMode = !compareMode"
                    class="px-6 py-2 rounded-full border border-white/20 text-[10px] font-black uppercase tracking-widest transition-all"
                    :class="compareMode ? 'bg-yellow-400 text-black border-yellow-400' : 'bg-white/5 text-white'">
              {{ compareMode ? 'Close Compare View' : 'Compare with Pose Guide' }}
            </button>
          </header>

          <div class="flex gap-6 w-full justify-center items-center">
            <div class="relative overflow-hidden border-4 border-white/10 shadow-2xl bg-zinc-900 rounded-[2rem] transition-all duration-500"
                :style="{ 
                    width: compareMode ? '45%' : '100%', 
                    maxWidth: compareMode ? '400px' : '500px', 
                    aspectRatio: `${store.photos[reviewingPhotoIndex].w} / ${store.photos[reviewingPhotoIndex].h}` 
                }">
              <img :src="store.photos[reviewingPhotoIndex].src" class="w-full h-full object-cover" />
              <div class="absolute top-4 left-6 px-3 py-1 bg-black/50 backdrop-blur-md rounded-full text-[8px] font-black uppercase text-yellow-400">Result</div>
            </div>

            <div v-if="compareMode" 
                class="relative overflow-hidden border-4 border-yellow-400/20 shadow-2xl bg-zinc-900 rounded-[2rem] transition-all duration-500 animate-in slide-in-from-left-5"
                :style="{ 
                    width: '45%', maxWidth: '400px', 
                    aspectRatio: `${store.photos[reviewingPhotoIndex].w} / ${store.photos[reviewingPhotoIndex].h}` 
                }">
              <img :src="store.photos[reviewingPhotoIndex].usedGhost" class="w-full h-full object-contain opacity-60 mix-blend-screen" />
              <div class="absolute top-4 left-6 px-3 py-1 bg-yellow-400 text-black rounded-full text-[8px] font-black uppercase">Guide</div>
            </div>
          </div>

          <div class="flex gap-4 w-full max-w-[500px] mt-12 px-6 text-xs font-black uppercase">
            <button @click="closeReview" class="flex-1 py-6 bg-white/10 rounded-2xl">Keep Photo</button>
            <button @click="handleRetakeAction" class="flex-1 py-6 bg-red-600 rounded-2xl shadow-lg">Retake Shot</button>
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
          <button @click="selectedPoseDetail = null" class="mt-8 opacity-40 uppercase tracking-widest text-[8px] font-bold">Close Preview</button>
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
import { playTick, playShutter } from '../utils/audio'

const store = useBoothStore()
const videoRef = ref(null)
const canvasRef = ref(null)

const countdown = ref(0)
const showFlash = ref(false)
const showPoseModal = ref(false)
const selectedPoseDetail = ref(null)
const reviewingPhotoIndex = ref(null)
const activeGhost = ref(null)
const poseLibrary = ref(poseData)
const justCapturedIndex = ref(null)
const compareMode = ref(false);
let stream = null

const currentSlot = computed(() => store.photos[store.activeIndex] || null)

// --- HANDLERS ---
const handleSlotClick = (index) => {
  if (countdown.value > 0) return
  if (store.photos[index]?.src) {
    reviewingPhotoIndex.value = index 
  } else {
    store.activeIndex = index 
  }
}

const handleRetakeAction = () => {
  store.activeIndex = reviewingPhotoIndex.value
  reviewingPhotoIndex.value = null
}

const openPoseDetail = (pose) => { selectedPoseDetail.value = pose }
const closeDetailAndShowAll = () => { selectedPoseDetail.value = null; showPoseModal.value = true }
const useThisPose = () => { 
  activeGhost.value = selectedPoseDetail.value.ghostSrc
  selectedPoseDetail.value = null
  showPoseModal.value = false 
}

const startCountdown = () => {
  if (countdown.value > 0) return
  countdown.value = 3; 

  
  playTick();

  const timer = setInterval(() => {
    if (countdown.value > 1) playTick();
    if (countdown.value > 0) countdown.value--
    if (countdown.value === 0) { clearInterval(timer); doCapture(); }
  }, 1000)
}

const doCapture = () => {
  playShutter();
  showFlash.value = true
  const video = videoRef.value
  const canvas = canvasRef.value
  if (!video || !currentSlot.value) return

  canvas.width = currentSlot.value.w * 2;
  canvas.height = currentSlot.value.h * 2;
  const ctx = canvas.getContext('2d');

  ctx.save();
  ctx.translate(canvas.width, 0);
  ctx.scale(-1, 1);
  ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight, 0, 0, canvas.width, canvas.height);
  ctx.restore();

  const capturedIndex = store.activeIndex;
  justCapturedIndex.value = capturedIndex;

  store.updatePhoto(capturedIndex, canvas.toDataURL('image/jpeg', 0.95), activeGhost.value);

  setTimeout(() => {
    showFlash.value = false;
    justCapturedIndex.value = null;
    const nextEmpty = store.photos.findIndex(p => p.src === null);
    if (nextEmpty !== -1) store.activeIndex = nextEmpty;
  }, 500);
};

const closeReview = () => {
  reviewingPhotoIndex.value = null;
  compareMode.value = false;
};

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

/* Morphing transition untuk viewport yang elastis */
.morph-transition {
  transition: all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.pop-enter-active { transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
.pop-enter-from { transform: scale(0.9) translateY(20px); opacity: 0; }
/* --- CINEMA COUNTDOWN KEYFRAMES --- */

@keyframes blink-animation {
  0%, 100% { 
    opacity: 1; 
    transform: scale(1);
    filter: brightness(1);
  }
  50% { 
    opacity: 0.7; 
    transform: scale(0.95);
    filter: brightness(1.5); /* Memberikan efek kilatan saat redup */
  }
}

.animate-blink {
  /* Berkedip 2 kali dalam satu detik (0.5s per loop) */
  animation: blink-animation 0.5s ease-in-out infinite;
}

/* Transisi saat angka berganti (3 ke 2, dst) */
.flash-number-enter-active {
  transition: all 0.2s ease-out;
}

.flash-number-enter-from {
  opacity: 0;
  transform: scale(1.5); /* Efek angka datang dari arah layar */
  filter: blur(10px);
}

.flash-number-leave-active {
  transition: all 0.2s ease-in;
}

.flash-number-leave-to {
  opacity: 0;
  transform: scale(0.5); /* Angka mengecil saat hilang */
  filter: blur(5px);
}

/* Memastikan tidak ada shadow kotak yang tertinggal */
span {
  user-select: none;
  pointer-events: none;
}

/* --- ANIMASI SLOT FLASH --- */
@keyframes slot-flash-anim {
  0% { background-color: rgba(250, 204, 21, 0.8); border-color: #facc15; } /* Kuning terang */
  100% { background-color: rgba(255, 255, 255, 0.05); border-color: rgba(255, 255, 255, 0.05); } /* Kembali normal */
}

.animate-slot-flash {
  animation: slot-flash-anim 0.8s ease-out forwards;
}

/* --- TRANSISI GAMBAR POP-IN (ELASTIC) --- */
/* Saat gambar masuk */
.slot-pop-enter-active {
  /* Menggunakan cubic-bezier untuk efek membal (overshoot) */
  transition: all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* Keadaan awal sebelum masuk */
.slot-pop-enter-from {
  opacity: 0;
  transform: scale(0.5) translateY(20px); /* Mulai dari kecil dan sedikit di bawah */
  filter: blur(10px); /* Mulai dengan blur */
}

/* Keadaan akhir (normal) */
.slot-pop-enter-to {
  opacity: 1;
  transform: scale(1) translateY(0);
  filter: blur(0);
}
</style>