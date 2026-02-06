<template>
  <div 
    @click="store.nextStep('FRAME')" 
    class="relative h-screen w-full bg-zinc-950 flex flex-col items-center justify-center overflow-hidden cursor-pointer select-none"
  >
    
    <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150vw] h-[150vw] bg-yellow-500/5 rounded-full blur-[150px] -z-10 animate-pulse-slow"></div>

    <div class="z-10 flex flex-col items-center text-center w-full px-6">
      
      <div class="flex flex-col items-center mb-8 animate-in fade-in zoom-in duration-1000">
        <h1 class="text-[12vw] md:text-[8vw] font-black italic uppercase tracking-tighter text-white leading-[0.8]">
          Selfie <br>
          <span class="text-yellow-500 text-stroke-white">Booth</span>
        </h1>
        
        <div class="h-2 w-24 md:w-40 bg-yellow-500 rounded-full mt-6"></div>
      </div>
      
      <p class="text-white/20 font-bold uppercase tracking-[0.5em] text-[10px] md:text-xs">
        Save your memories into photos!
      </p>
    </div>

    <div class="absolute bottom-20 left-1/2 -translate-x-1/2 flex flex-col items-center space-y-6 w-full">
      <p class="text-yellow-500/60 font-black uppercase tracking-[0.6em] text-[10px] md:text-xs animate-bounce-slow text-center">
        Tap anywhere to start
      </p>
      <div class="w-px h-16 bg-gradient-to-t from-yellow-500 to-transparent opacity-30"></div>
    </div>

    <footer class="absolute bottom-8 w-full max-w-[90%] flex justify-between items-center opacity-20 text-[8px] md:text-[10px] font-black uppercase tracking-widest text-white px-4">
      <span>High Definition Capture</span>
      <span class="italic text-right">v2.0 Beta • 2026</span>
    </footer>

  </div>
</template>

<script setup>
import { useBoothStore } from '../store'

const store = useBoothStore()
</script>

<style scoped>
/* Animasi atmosferik tetap terjaga */
@keyframes pulse-slow {
  0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.05; }
  50% { transform: translate(-50%, -50%) scale(1.1); opacity: 0.08; }
}

@keyframes bounce-slow {
  0%, 100% { transform: translateY(0); opacity: 0.5; }
  50% { transform: translateY(-10px); opacity: 1; }
}

.animate-pulse-slow {
  animation: pulse-slow 10s infinite ease-in-out;
}

.animate-bounce-slow {
  animation: bounce-slow 3s infinite ease-in-out;
}

/* Efek outline teks tanpa warna isi */
.text-stroke-white {
  -webkit-text-stroke: 1.5px rgba(255, 255, 255, 0.4);
  color: transparent;
}
</style>