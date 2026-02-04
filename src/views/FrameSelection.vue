<template>
  <div class="h-screen w-full flex flex-col bg-black text-white p-8 overflow-hidden">
    
    <header class="flex-shrink-0 pt-8 pb-10 text-center">
      <h2 class="text-6xl font-black italic tracking-tighter uppercase leading-none">
        Pilih <span class="text-yellow-400">Bingkai</span>
      </h2>
      <p class="text-xl opacity-40 mt-2 tracking-widest uppercase">Sesuaikan gayamu!</p>
    </header>

    <main class="flex-1 overflow-y-auto pr-2 custom-scrollbar">
      <div class="grid grid-cols-2 gap-6 pb-10">
        <div 
          v-for="frame in frames" 
          :key="frame.id"
          @click="selectFrame(frame)"
          :class="[
            'relative aspect-[9/16] rounded-[2.5rem] overflow-hidden border-4 transition-all duration-300',
            selectedId === frame.id 
              ? 'border-yellow-400 scale-[0.98] shadow-[0_0_50px_rgba(250,204,21,0.3)]' 
              : 'border-white/10 opacity-70'
          ]"
        >
          <div class="absolute inset-0 bg-zinc-900 -z-10"></div>

          <img 
            :src="frame.path" 
            class="w-full h-full object-cover" 
            draggable="false"
          />

          <div 
            v-if="selectedId === frame.id" 
            class="absolute inset-0 bg-yellow-400/10 flex items-center justify-center"
          >
            <div class="bg-yellow-400 text-black p-4 rounded-full shadow-xl">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="4" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </main>

    <footer class="flex-shrink-0 py-8">
      <button 
        @click="confirmSelection"
        :disabled="!selectedId"
        :class="[
          'w-full py-8 rounded-[2rem] font-black text-4xl uppercase tracking-tighter transition-all duration-300 active:scale-95',
          selectedId 
            ? 'bg-yellow-400 text-black shadow-[0_15px_0_rgb(161,98,7)]' 
            : 'bg-zinc-800 text-zinc-600 cursor-not-allowed opacity-50'
        ]"
      >
        Mulai Foto
      </button>
    </footer>

  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useBoothStore } from '../store'

const store = useBoothStore()
const selectedId = ref(null)

// Sesuaikan dengan file yang ada di folder public/frames/ kamu
const frames = [
  { id: 1, path: '/frames/batik.png' },
  { id: 2, path: '/frames/cyber.png' },
  { id: 3, path: '/frames/butterfly.png' },
  { id: 4, path: '/frames/retro.png' },
  { id: 5, path: '/frames/frame.png' }, // Contoh tambahan buat ngetes scroll
  // { id: 6, path: '/frames/frame2.png' },
]

const selectFrame = (frame) => {
  selectedId.value = frame.id
  store.selectedFrame = frame.path
}

const confirmSelection = () => {
  if (selectedId.value) {
    store.nextStep('CAPTURE')
  }
}
</script>

<style scoped>
/* Sembunyikan scrollbar tapi tetep bisa di-scroll */
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
}
</style>