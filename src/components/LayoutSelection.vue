<template>
  <div class="h-screen w-full bg-white text-zinc-900 flex flex-col p-12 select-none overflow-hidden font-sans">
    
    <header class="mb-12">
      <h2 class="text-6xl font-black italic uppercase tracking-tighter">
        Select <span class="text-yellow-500">Layout</span>
      </h2>
      <p class="text-zinc-400 font-bold uppercase tracking-[0.4em] text-[10px] mt-2">
        Konfigurasi otomatis untuk cetak 4R
      </p>
    </header>

    <div class="flex-1 overflow-y-auto no-scrollbar pb-10">
      <div class="grid grid-cols-3 gap-8 max-w-7xl mx-auto w-full">
        <div 
          v-for="layout in layouts" 
          :key="layout.id"
          @click="store.setLayout(layout)"
          class="group flex flex-col bg-zinc-50 rounded-[3.5rem] p-10 border-4 border-transparent hover:border-yellow-400 transition-all duration-500 cursor-pointer shadow-sm hover:shadow-2xl"
        >
          <div class="aspect-[2/3] w-full bg-zinc-200 rounded-[2rem] p-5 grid gap-3 mb-8 group-hover:bg-zinc-300"
               :style="{ gridTemplateColumns: layout.cols, gridTemplateRows: layout.rows }">
            <div 
              v-for="n in layout.slots.length" 
              :key="n" 
              class="bg-white rounded-xl shadow-sm border border-black/5"
            ></div>
          </div>

          <div class="text-center">
            <h3 class="text-2xl font-black uppercase tracking-tighter mb-1">{{ layout.name }}</h3>
            <div class="inline-block px-4 py-1 bg-zinc-900 text-white rounded-full text-[9px] font-black uppercase tracking-widest">
              {{ layout.slots.length }} Poses
            </div>
          </div>
        </div>
      </div>
    </div>

    <footer class="mt-auto pt-6 border-t border-zinc-100 flex justify-between items-center opacity-40">
      <span class="text-[10px] font-bold uppercase tracking-widest italic">Digital & Print Ready</span>
      <button @click="store.nextStep('FRAME')" class="text-[10px] font-black uppercase text-white transition-colors">
        ← Kembali ke Frame
      </button>
    </footer>
  </div>
</template>

<script setup>
import { useBoothStore } from '../store'
// Import data layout dari file JSON terpisah
import layoutsData from '../data/layouts.json'

const store = useBoothStore()
// Inisialisasi list layout dari data yang di-import
const layouts = layoutsData
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>