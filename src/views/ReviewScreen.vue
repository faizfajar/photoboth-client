<template>
  <div class="h-screen w-full bg-zinc-950 text-white flex items-center justify-center p-12 relative overflow-hidden font-sans select-none">
    
    <div class="absolute inset-0 opacity-[0.03] pointer-events-none" 
         style="background-image: radial-gradient(#fff 1px, transparent 1px); background-size: 40px 40px;"></div>

    <div class="flex w-full max-w-7xl h-full items-center gap-20 z-10 animate-in fade-in slide-in-from-bottom-10 duration-700">
      
      <div class="flex-1 flex justify-center items-center h-full">
        <div class="relative w-full max-w-[450px] aspect-[2/3] bg-white shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)] rounded-sm overflow-hidden transform rotate-1">
          
          <div v-for="(photo, index) in store.photos" :key="index"
               class="absolute bg-zinc-100 overflow-hidden cursor-pointer group"
               @click="store.retakePhoto(index)"
               :style="{ 
                 left: (photo.x / 1200 * 100) + '%', 
                 top: (photo.y / 1800 * 100) + '%', 
                 width: (photo.w / 1200 * 100) + '%', 
                 height: (photo.h / 1800 * 100) + '%' 
               }">
            <img v-if="photo.src" :src="photo.src" class="w-full h-full object-cover transition-opacity group-hover:opacity-70" />
            <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
               <span class="text-[10px] font-black uppercase bg-white text-black px-4 py-1 rounded-full">Retake</span>
            </div>
          </div>

          <img :src="store.selectedLayout?.frameSrc" 
               class="absolute inset-0 w-full h-full z-10 pointer-events-none object-fill" />
        </div>
      </div>

      <div class="w-[400px] flex flex-col justify-center gap-12">
        <header>
          <h2 class="text-6xl font-black italic uppercase tracking-tighter leading-none mb-4">
            High <br><span class="text-yellow-400">Quality</span>
          </h2>
          <div class="h-1.5 w-24 bg-yellow-400 rounded-full mb-6"></div>
          <p class="text-white/30 text-[10px] uppercase font-bold tracking-[0.3em]">
            Click on any photo to retake, or proceed to finalize your digital print.
          </p>
        </header>

        <div class="flex flex-col gap-4">
          <button @click="generateFinalImage" :disabled="isProcessing"
                  class="w-full py-8 bg-yellow-400 text-black font-black uppercase tracking-[0.2em] text-sm rounded-3xl shadow-xl hover:scale-105 active:scale-95 transition-all">
            {{ isProcessing ? 'Processing Lab...' : 'Finalize & Print' }}
          </button>
          
          <button @click="store.nextStep('CAPTURE')" 
                  class="w-full py-4 text-white/30 hover:text-white font-black uppercase tracking-[0.2em] text-[10px] transition-all">
            ← Back to Camera
          </button>
        </div>

        <div class="review-screen flex items-center justify-center">
          <div v-if="store.lastSavedPath" class="qr-container">
            <qrcode-vue 
              :value="completeUrl" 
              :size="180" 
              level="H" 
              render-as="svg"
            />
            <p class="mt-2 font-bold text-center">SCAN TO DOWNLOAD</p>
          </div>
        </div>
      </div>

     
    </div>

    <transition name="fade">
      <div v-if="isProcessing" class="fixed inset-0 z-[300] bg-black/90 backdrop-blur-2xl flex flex-col items-center justify-center">
        <div class="relative w-24 h-24 mb-8">
          <div class="absolute inset-0 border-4 border-white/10 rounded-full"></div>
          <div class="absolute inset-0 border-4 border-yellow-400 rounded-full border-t-transparent animate-spin"></div>
        </div>
        <h2 class="text-2xl font-black italic uppercase tracking-tighter animate-pulse">
          Processing <span class="text-yellow-400">High Quality</span> Image
        </h2>
        <p class="text-[10px] uppercase tracking-[0.4em] opacity-40 mt-4">Optimizing for print, please wait...</p>
      </div>
    </transition>

    <canvas ref="outputCanvas" class="hidden" width="1200" height="1800"></canvas>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { ref } from 'vue'
import { useBoothStore } from '../store'
import QrcodeVue from 'qrcode.vue';

const store = useBoothStore()
const outputCanvas = ref(null)
const isProcessing = ref(false)

const tunnelBase = 'https://7zxvbfr0-8080.asse.devtunnels.ms';

/** * Menggabungkan Base URL Tunnel dengan Path dari Database.
 * Inilah yang akan di-scan oleh HP user.
 */
const completeUrl = computed(() => {
  return store.lastSavedPath ? `${tunnelBase}${store.lastSavedPath}` : '';
});

/**
 * Logika Canvas Flattening
 * Menggabungkan foto-foto user dengan Frame PNG menjadi satu file JPG utuh.
 */
const generateFinalImage = async () => {
  isProcessing.value = true
  const canvas = outputCanvas.value
  const ctx = canvas.getContext('2d')

  // Bersihkan Canvas
  ctx.fillStyle = "#ffffff"
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // Gambar Foto User satu per satu berdasarkan koordinat
  for (const photo of store.photos) {
    if (photo.src) {
      const img = await loadImage(photo.src)
      ctx.drawImage(img, photo.x, photo.y, photo.w, photo.h)
    }
  }

  // Gambar Frame PNG di atasnya
  if (store.selectedLayout?.frameSrc) {
    const frame = await loadImage(store.selectedLayout.frameSrc)
    ctx.drawImage(frame, 0, 0, 1200, 1800)
  }

  // Export Hasil Akhir
  const finalResult = canvas.toDataURL('image/jpeg', 0.95)
  
  // Simulasi selesai proses
  setTimeout(() => {
    isProcessing.value = false
    console.log("Final Image Generated:", finalResult)
    // Di sini kamu bisa kirim 'finalResult' ke printer atau WhatsApp API
    store.reset()
  }, 3000)
}

// Helper untuk load image secara async
const loadImage = (url) => {
  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => resolve(img)
    img.src = url
  })
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.5s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

/* Menghilangkan scrollbar jika ada overflow kecil */
.no-scrollbar::-webkit-scrollbar { display: none; }

/* Animasi Spin Custom */
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
.animate-spin {
  animation: spin 1s linear infinite;
}
</style>