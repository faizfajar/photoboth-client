<template>
  <div class="h-screen w-full bg-white text-black flex flex-col p-8 overflow-hidden select-none">
    <h1 class="text-4xl font-black italic uppercase mb-10 tracking-tighter">Select Frame</h1>

    <div class="flex flex-1 gap-10 min-h-0">
      <div class="w-48 flex flex-col gap-4">
        <button v-for="cat in ['All', 'Collaboration', 'Season']" :key="cat"
          @click="activeCategory = cat"
          :class="['py-4 px-6 rounded-xl font-bold transition-all border-2', 
                   activeCategory === cat ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-zinc-100 border-transparent text-zinc-400']">
          {{ cat }}
        </button>
      </div>

      <div class="flex-1 flex flex-col items-center justify-center bg-zinc-50 rounded-[3rem] p-10 relative">
        <div class="relative h-full aspect-[2/3] shadow-2xl rounded-lg overflow-hidden border-8 border-white bg-white">
          <img :src="currentFrame.src" class="w-full h-full object-contain" />
        </div>
        
        <button @click="store.nextStep('CAPTURE')" 
                class="absolute bottom-10 right-10 bg-zinc-900 text-white px-10 py-5 rounded-full font-black uppercase flex items-center gap-3 hover:scale-105 transition active:scale-95 shadow-xl">
          Take Photo <span class="text-2xl">→</span>
        </button>
      </div>
    </div>

    <div class="h-48 mt-8 flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
      <div v-for="(frame, idx) in filteredFrames" :key="idx"
           @click="selectFrame(idx)"
           :class="['flex-shrink-0 w-32 aspect-[2/3] rounded-lg border-4 overflow-hidden transition-all cursor-pointer',
                    store.selectedFrameIndex === idx ? 'border-yellow-400 scale-105 shadow-lg' : 'border-zinc-200 opacity-60']">
        <img :src="frame.src" class="w-full h-full object-cover" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useBoothStore } from '../store'

const store = useBoothStore()
const activeCategory = ref('All')

// Mockup Data Bingkai
const frames = [
  { id: 1, name: 'Floral Classic', category: 'Season', src: '/public/frames/butterfly.png' },
  { id: 2, name: 'Cyber Neon', category: 'Collaboration', src: '/public/frames/cyber.png' },
  { id: 3, name: 'Basic White', category: 'All', src: '/public/frames/retro.png' },
]

const filteredFrames = computed(() => {
  if (activeCategory.value === 'All') return frames
  return frames.filter(f => f.category === activeCategory.value)
})

const currentFrame = computed(() => frames[store.selectedFrameIndex] || frames[0])

const selectFrame = (index) => {
  store.selectedFrameIndex = index
  // Simpan juga ke store.selectedFrame untuk digunakan di CameraPreview
  store.selectedFrame = frames[index].src
}
</script>