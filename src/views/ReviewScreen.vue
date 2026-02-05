<template>
  <div class="h-screen w-full flex flex-col bg-zinc-950 p-8 text-white overflow-hidden relative select-none touch-none">
    
    <header class="text-center mb-6 flex-shrink-0 animate-in fade-in slide-in-from-top duration-700">
      <h2 class="text-6xl font-black italic uppercase tracking-tighter">
        Final <span class="text-yellow-400">Review</span>
      </h2>
      <p class="text-sm opacity-40 uppercase tracking-[0.4em] mt-3">Geser & Atur Tata Letak Sesukamu</p>
    </header>

    <div class="flex-1 flex gap-10 min-h-0">
      
      <main 
        class="relative flex-1 bg-white shadow-[0_50px_100px_rgba(0,0,0,0.5)] rounded-lg overflow-hidden border-[12px] border-white"
        @mousemove="onMove" @touchmove.prevent="onMove"
        @mouseup="onEnd" @touchend="onEnd"
      >
        <div 
          v-for="(photo, idx) in store.photos" :key="idx"
          class="absolute cursor-move transition-shadow"
          :class="{ 'ring-4 ring-yellow-400 shadow-2xl z-20': activeIdx === idx, 'z-10': activeIdx !== idx }"
          :style="{ 
            left: photo.x + 'px', 
            top: photo.y + 'px', 
            transform: `rotate(${photo.rotation}deg) scale(${photo.scale})`,
          }"
          @mousedown="onStart($event, idx)" @touchstart.prevent="onStart($event, idx)"
        >
          <img :src="photo.src" class="w-64 h-64 object-cover border-4 border-white shadow-lg" />
          
          <div v-if="activeIdx === idx" class="absolute -top-12 left-1/2 -translate-x-1/2 flex gap-2 animate-in fade-in zoom-in duration-300">
            <button @click="reCapture(idx)" class="bg-red-600 p-2 rounded-full shadow-lg">↺</button>
            <button @click="editPhoto(idx)" class="bg-yellow-400 text-black p-2 rounded-full shadow-lg">✎</button>
          </div>
        </div>

        <img v-if="store.selectedFrame" :src="store.selectedFrame" class="absolute inset-0 w-full h-full object-fill pointer-events-none z-30" />
      </main>

      <aside class="w-80 flex flex-col gap-6">
        <div v-if="activeIdx !== null" class="p-6 bg-white/5 rounded-[2.5rem] border border-white/10">
          <p class="text-[10px] font-black uppercase opacity-40 mb-6 tracking-widest text-center">Adjust Selected Photo</p>
          
          <div class="space-y-8">
            <div>
              <div class="flex justify-between text-[10px] font-bold mb-3 uppercase"><span>Size</span> <span>{{ Math.round(store.photos[activeIdx].scale * 100) }}%</span></div>
              <input type="range" min="0.4" max="2" step="0.1" v-model.number="store.photos[activeIdx].scale" class="w-full accent-yellow-400" />
            </div>

            <div>
              <div class="flex justify-between text-[10px] font-bold mb-3 uppercase"><span>Rotation</span> <span>{{ store.photos[activeIdx].rotation }}°</span></div>
              <input type="range" min="-180" max="180" v-model.number="store.photos[activeIdx].rotation" class="w-full accent-yellow-400" />
            </div>
          </div>

          <button @click="activeIdx = null" class="w-full mt-8 py-3 bg-white/10 rounded-xl text-[10px] font-black uppercase">Deselect</button>
        </div>

        <div class="mt-auto p-6 bg-yellow-400/5 rounded-[2rem] border border-yellow-400/20 text-center">
          <p class="text-[10px] text-yellow-400 font-black mb-2 uppercase tracking-widest">Interactive Tips</p>
          <p class="text-[10px] opacity-40 leading-relaxed italic uppercase">Tap foto untuk mengaktifkan kontrol. Drag untuk memindah posisi.</p>
        </div>
      </aside>
    </div>

    <footer class="flex-shrink-0 pt-8 flex flex-col gap-6 border-t border-white/10 bg-zinc-950/80 backdrop-blur-md">
      <div class="flex gap-6">
        <button @click="store.reset()" class="flex-1 py-7 bg-zinc-900 rounded-[2.5rem] font-black uppercase text-sm tracking-widest border border-white/5 active:bg-zinc-800 transition">
          Reset Sesi
        </button>
        <button @click="handlePrint" :disabled="isPrinting || store.photos.length < 1"
          class="flex-[2.5] py-7 bg-yellow-400 text-black font-black rounded-[2.5rem] uppercase text-3xl shadow-[0_12px_0_rgb(161,98,7)] active:translate-y-2 active:shadow-none transition-all disabled:opacity-30 disabled:grayscale">
          {{ isPrinting ? 'Memproses...' : 'Cetak Sekarang!' }}
        </button>
      </div>
    </footer>

    <transition name="fade">
      <div v-if="isPrinting" class="absolute inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center text-center p-12">
        <div class="relative w-32 h-32 mb-10">
          <div class="absolute inset-0 border-8 border-white/10 rounded-full animate-pulse"></div>
          <div class="absolute inset-0 border-8 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <h2 class="text-5xl font-black italic uppercase mb-6 tracking-tighter">Mencetak <span class="text-yellow-400">Karyamu...</span></h2>
      </div>
    </transition>

    <transition name="pop">
      <div v-if="showThankYou" class="absolute inset-0 z-[110] bg-yellow-400 flex flex-col items-center justify-center text-black text-center p-12">
        <div class="text-[120px] mb-8 animate-bounce">📸</div>
        <h2 class="text-7xl font-black italic uppercase leading-none mb-6">Terima Kasih!</h2>
      </div>
    </transition>

    <canvas ref="printCanvas" class="hidden" width="1200" height="1800"></canvas>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useBoothStore } from '../store'
import axios from 'axios'

const store = useBoothStore()
const printCanvas = ref(null)
const isPrinting = ref(false)
const showThankYou = ref(false)

// Logic Interaksi
const activeIdx = ref(null)
let isDragging = false
let offset = { x: 0, y: 0 }

const onStart = (e, idx) => {
  activeIdx.value = idx
  isDragging = true
  const event = e.touches ? e.touches[0] : e
  offset.x = event.clientX - store.photos[idx].x
  offset.y = event.clientY - store.photos[idx].y
}

const onMove = (e) => {
  if (!isDragging || activeIdx.value === null) return
  const event = e.touches ? e.touches[0] : e
  store.photos[activeIdx.value].x = event.clientX - offset.x
  store.photos[activeIdx.value].y = event.clientY - offset.y
}

const onEnd = () => { isDragging = false }

// Navigasi (Tetap)
const reCapture = (index) => {
  store.activeIndex = index 
  store.nextStep('CAPTURE')
}

const editPhoto = (index) => {
  store.editingIndex = index
  store.nextStep('EDIT')
}

// LOGIKA CETAK BARU: Mengikuti posisi X, Y, Scale, Rotation
const generatePrintLayout = async () => {
  const canvas = printCanvas.value
  const ctx = canvas.getContext('2d')

  // Dasar Kanvas
  ctx.fillStyle = "white"
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // Hitung skala dari Layar ke Resolusi Cetak (1200x1800)
  // Karena area kerja di layar mungkin tidak sebesar 1200px, kita butuh scale ratio
  const screenToPrintScale = 1200 / canvas.getBoundingClientRect().width

  // 1. Gambar Foto Berdasarkan Posisi Interaktif
  for (const photo of store.photos) {
    if (photo.src) {
      const img = new Image()
      img.src = photo.src
      await new Promise(r => img.onload = r)

      ctx.save()
      
      // Translasi ke posisi X, Y (dikali skala cetak)
      const renderX = photo.x * screenToPrintScale
      const renderY = photo.y * screenToPrintScale
      const renderSize = 256 * screenToPrintScale * photo.scale // 256 adalah lebar w-64 di UI

      // Geser titik rotasi ke tengah foto
      ctx.translate(renderX + (renderSize / 2), renderY + (renderSize / 2))
      ctx.rotate((photo.rotation * Math.PI) / 180)
      
      // Draw foto dari titik tengah
      ctx.drawImage(img, -renderSize / 2, -renderSize / 2, renderSize, renderSize)
      
      ctx.restore()
    }
  }

  // 2. Gambar Frame PNG di Paling Atas (Layer Terakhir)
  if (store.selectedFrame) {
    const frameImg = new Image()
    frameImg.src = store.selectedFrame
    await new Promise(r => frameImg.onload = r)
    ctx.drawImage(frameImg, 0, 0, canvas.width, canvas.height)
  }

  return canvas.toDataURL('image/jpeg', 0.98)
}

const handlePrint = async () => {
  if (isPrinting.value) return
  isPrinting.value = true

  try {
    const base64Image = await generatePrintLayout()
    const response = await axios.post('http://localhost:8080/api/v1/print', { image: base64Image })

    if (response.data.status === 'success') {
      isPrinting.value = false
      showThankYou.value = true
      setTimeout(() => { showThankYou.value = false }, 7000)
    }
  } catch (error) {
    console.error(error)
    isPrinting.value = false
    alert("Printer Error!")
  }
}
</script>

<style scoped>
/* Transisi (Tetap) */
.fade-enter-active, .fade-leave-active { transition: opacity 0.5s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.pop-enter-active { transition: all 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
.pop-enter-from { transform: scale(0.5); opacity: 0; }

.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
}
</style>