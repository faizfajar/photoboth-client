<template>
  <div class="h-screen w-full bg-white text-zinc-900 flex flex-col p-12 select-none overflow-hidden font-sans">
    
    <header class="mb-12">
      <h2 class="text-6xl font-black italic uppercase tracking-tighter leading-tight">
        Pick Your <span class="text-yellow-500">Frame</span>
      </h2>
      <p class="text-zinc-400 font-bold uppercase tracking-[0.4em] text-[10px] mt-2">
        Sentuhan akhir untuk karakter fotomu
      </p>
    </header>

    <div class="flex-1 overflow-y-auto no-scrollbar pb-10">
      <div class="grid grid-cols-4 gap-8 max-w-7xl mx-auto w-full">
        <div 
          v-for="frame in frames" 
          :key="frame.id"
          @click="selectAndContinue(frame.src)"
          class="group relative flex flex-col bg-zinc-50 rounded-[3rem] p-6 border-4 border-transparent hover:border-yellow-400 transition-all duration-500 cursor-pointer shadow-sm hover:shadow-2xl overflow-hidden"
        >
          <div class="aspect-[2/3] w-full bg-zinc-200 rounded-2xl overflow-hidden mb-6 relative shadow-inner">
             <img :src="frame.thumbnail || frame.src" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
             <div class="absolute inset-0 bg-yellow-500/0 group-hover:bg-yellow-500/10 transition-colors"></div>
          </div>

          <div class="text-center">
            <h3 class="text-xl font-black uppercase tracking-tighter">{{ frame.name }}</h3>
          </div>
          
          <div v-if="store.selectedFrame === frame.src" class="absolute top-6 right-6 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg">
            <span class="text-black font-bold text-xs">✓</span>
          </div>
        </div>
      </div>
    </div>

    <footer class="mt-auto pt-6 border-t border-zinc-100 flex justify-between items-center opacity-40">
      <span class="text-[10px] font-bold uppercase tracking-widest">Selected: {{ store.selectedFrame ? 'Ready' : 'None' }}</span>
      <button @click="store.nextStep('START')" class="text-[10px] font-black uppercase text-white transition-colors">
        ← Kembali ke Awal
      </button>
    </footer>
  </div>
</template>

<script setup>
import { useBoothStore } from '../store'
// Memuat data frame dari JSON agar logika komponen tetap bersih
import framesData from '../data/frames.json'

const store = useBoothStore()
const frames = framesData

// Fungsi untuk menyimpan pilihan dan lanjut ke tahap berikutnya
const selectAndContinue = (frameSrc) => {
  store.selectedFrame = frameSrc
  store.nextStep('LAYOUT')
}
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

/* Memastikan gambar tetap tajam saat scaling */
img {
  image-rendering: -webkit-optimize-contrast;
  backface-visibility: hidden;
}
</style>