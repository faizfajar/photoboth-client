<template>
  <div class="h-screen w-full bg-zinc-950 text-white flex items-center justify-center overflow-hidden font-sans select-none relative p-12">
    
    <div class="absolute inset-0 opacity-[0.03] pointer-events-none" 
         style="background-image: radial-gradient(#fff 1px, transparent 1px); background-size: 40px 40px;"></div>
    <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100vw] h-[100vw] bg-yellow-500/5 rounded-full blur-[150px] -z-10"></div>

    <div class="flex w-full max-w-7xl h-full items-center gap-20 z-10 animate-in fade-in slide-in-from-bottom-10 duration-1000">
      
      <div class="flex-1 flex justify-center items-center h-full">
        <div class="relative w-full max-w-[450px] aspect-[2/3] bg-white shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)] rounded-sm overflow-hidden transform rotate-2 hover:rotate-0 transition-transform duration-700 p-[1px]">
          
          <div v-for="(photo, index) in store.photos" :key="index"
               class="absolute bg-zinc-100 overflow-hidden"
               :style="{ 
                 left: (photo.x / 1200 * 100) + '%', 
                 top: (photo.y / 1800 * 100) + '%', 
                 width: (photo.w / 1200 * 100) + '%', 
                 height: (photo.h / 1800 * 100) + '%' 
               }">
            <img v-if="photo.src" :src="photo.src" class="w-full h-full object-cover" />
          </div>

          <img v-if="store.selectedFrame" :src="store.selectedFrame" 
               class="absolute inset-0 w-full h-full z-10 pointer-events-none object-fill" />
        </div>
      </div>

      <div class="w-[400px] flex flex-col justify-center gap-12">
        
        <header>
          <h2 class="text-6xl font-black italic uppercase tracking-tighter leading-none mb-4">
            Final <br><span class="text-yellow-500">Result</span>
          </h2>
          <div class="h-1.5 w-24 bg-yellow-500 rounded-full mb-6"></div>
          <p class="text-white/30 text-[10px] uppercase font-bold tracking-[0.3em] leading-relaxed">
            Your high-definition memories are ready. Review your shots before we send them to the lab.
          </p>
        </header>

        <div class="space-y-4 border-y border-white/5 py-8 text-[10px] font-bold uppercase tracking-widest text-white/60">
          <div class="flex justify-between items-center">
            <span class="opacity-40 font-medium">Template</span>
            <span class="text-white">{{ store.selectedLayout?.name }}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="opacity-40 font-medium">Resolution</span>
            <span class="text-white italic">300 DPI / HQ</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="opacity-40 font-medium">Print Size</span>
            <span class="text-white italic">4R / Standard</span>
          </div>
        </div>

        <div class="flex flex-col gap-4">
          <button @click="handlePrint" :disabled="isPrinting"
                  class="w-full py-8 bg-yellow-400 text-black font-black uppercase tracking-[0.2em] text-sm rounded-3xl shadow-[0_20px_50px_rgba(234,179,8,0.2)] hover:scale-105 active:scale-95 transition-all">
            {{ isPrinting ? 'Processing...' : 'Print Photo' }}
          </button>
          
          <button @click="store.nextStep('CAPTURE')" 
                  class="w-full py-6 bg-white/5 hover:bg-white/10 text-white font-black uppercase tracking-[0.2em] text-[10px] rounded-3xl border border-white/5 transition-all">
            ← Retake Session
          </button>
        </div>

        <footer class="opacity-20 text-[8px] font-black uppercase tracking-widest leading-loose">
          All images are processed with 10-bit color depth.<br>
          Cloud Sync ID: {{ Math.random().toString(36).substr(2, 9).toUpperCase() }}
        </footer>
      </div>

    </div>

    <transition name="fade">
      <div v-if="isPrinting" class="fixed inset-0 z-[100] bg-black/95 backdrop-blur-2xl flex flex-col items-center justify-center text-center">
        <div class="relative w-32 h-32 mb-12">
          <div class="absolute inset-0 border-4 border-yellow-500/10 rounded-full"></div>
          <div class="absolute inset-0 border-4 border-yellow-500 rounded-full border-t-transparent animate-spin"></div>
        </div>
        <h3 class="text-4xl font-black uppercase italic tracking-tighter mb-4">Lab <span class="text-yellow-500">Processing</span></h3>
        <p class="text-white/40 text-xs font-bold uppercase tracking-[0.5em] animate-pulse">Sending data to printer...</p>
      </div>
    </transition>

  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useBoothStore } from '../store'

const store = useBoothStore()
const isPrinting = ref(false)

const handlePrint = () => {
  isPrinting.value = true
  
  // Simulasi proses pengiriman data ke printer
  setTimeout(() => {
    isPrinting.value = false
    // Opsional: Tampilkan alert sukses atau langsung reset
    store.reset() 
  }, 5000)
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