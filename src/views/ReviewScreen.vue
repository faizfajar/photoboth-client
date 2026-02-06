<template>
  <div class="h-screen w-full bg-zinc-950 text-white flex overflow-hidden font-sans select-none">
    
    <div class="flex-1 flex flex-col items-center justify-center p-12 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-900 to-black">
      
      <header class="mb-10 text-center">
        <h2 class="text-5xl font-black italic uppercase tracking-tighter">Review <span class="text-yellow-500">Result</span></h2>
        <p class="text-[10px] font-bold uppercase tracking-[0.4em] opacity-40 mt-2">Ready for high quality print</p>
      </header>

      <div class="relative w-[500px] aspect-[2/3] bg-white shadow-[0_50px_100px_rgba(0,0,0,0.5)] transform hover:scale-[1.02] transition-transform duration-700 overflow-hidden rounded-sm">
        
        <div v-for="(photo, index) in store.photos" :key="index"
             class="absolute overflow-hidden bg-zinc-100"
             :style="{ 
               left: (photo.x / 1200 * 100) + '%', 
               top: (photo.y / 1800 * 100) + '%', 
               width: (photo.w / 1200 * 100) + '%', 
               height: (photo.h / 1800 * 100) + '%' 
             }">
          <img v-if="photo.src" :src="photo.src" class="w-full h-full object-cover" />
        </div>

        <img v-if="store.selectedFrame" :src="store.selectedFrame" 
             class="absolute inset-0 w-full h-full z-10 pointer-events-none" />
      </div>
    </div>

    <div class="w-[450px] bg-zinc-900 border-l border-white/5 flex flex-col p-16 justify-center">
      
      <div class="space-y-10">
        <div>
          <h3 class="text-sm font-black uppercase tracking-widest text-yellow-500 mb-4">Summary</h3>
          <div class="space-y-4 opacity-60 text-xs font-bold uppercase tracking-wider">
            <div class="flex justify-between border-b border-white/5 pb-2">
              <span>Layout</span>
              <span>{{ store.selectedLayout?.name }}</span>
            </div>
            <div class="flex justify-between border-b border-white/5 pb-2">
              <span>Poses</span>
              <span>{{ store.photos.length }} Shots</span>
            </div>
            <div class="flex justify-between border-b border-white/5 pb-2">
              <span>Quality</span>
              <span>300 DPI</span>
            </div>
          </div>
        </div>

        <div class="flex flex-col gap-4 pt-10">
          <button @click="handlePrint" 
                  :disabled="isPrinting"
                  class="w-full py-8 bg-yellow-500 text-black rounded-3xl font-black uppercase tracking-widest text-sm shadow-[0_10px_40px_rgba(234,179,8,0.2)] active:scale-95 transition-all disabled:opacity-50">
            {{ isPrinting ? 'Printing...' : 'PRINT PHOTO' }}
          </button>
          
          <button @click="store.nextStep('CAPTURE')" 
                  class="w-full py-6 bg-white/5 hover:bg-white/10 text-white rounded-3xl font-black uppercase tracking-widest text-[10px] transition-all border border-white/5">
            Retake All
          </button>
        </div>
      </div>

      <footer class="mt-24 opacity-20 text-[9px] font-black uppercase tracking-[0.3em] leading-loose">
        Please do not close this screen while printing is in progress.
      </footer>
    </div>

    <transition name="fade">
      <div v-if="isPrinting" class="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center">
        <div class="w-24 h-24 border-4 border-yellow-500/20 border-t-yellow-500 rounded-full animate-spin mb-8"></div>
        <h2 class="text-3xl font-black uppercase italic tracking-tighter">Processing <span class="text-yellow-500">Print</span></h2>
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
    alert('Photo sent to printer!')
    store.reset() // Kembali ke Start Screen setelah selesai
  }, 5000)
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.5s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

/* Animasi Spin Custom */
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
.animate-spin {
  animation: spin 1s linear infinite;
}
</style>