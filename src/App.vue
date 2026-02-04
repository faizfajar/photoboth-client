<template>
  <div class="w-screen h-screen max-w-[1080px] mx-auto bg-black relative overflow-hidden">
    
    <Transition name="fade" mode="out-in">
      <div v-if="store.currentStep === 'START'" 
           key="start"
           @click="store.nextStep('FRAME')" 
           class="h-full flex flex-col items-center justify-center cursor-pointer bg-gradient-to-b from-purple-900 to-black">
        <h1 class="text-7xl font-black italic animate-pulse">SNAP & GLOW</h1>
        <p class="mt-4 text-xl tracking-[0.5em] opacity-50 uppercase">Sentuh Untuk Memulai</p>
      </div>

      <FrameSelection v-else-if="store.currentStep === 'FRAME'" key="frame" />

      <div v-else-if="store.currentStep === 'CAPTURE'" key="capture" class="h-full">
        <CameraPreview />
      </div>

      <div v-else-if="store.currentStep === 'REVIEW'" key="review" class="h-full p-10 flex flex-col items-center">
        <h2 class="text-4xl font-black mb-10 italic">HASIL FOTOMU</h2>
        
        <div class="grid grid-cols-2 gap-4 w-full mb-10 overflow-y-auto">
          <div v-for="(img, idx) in store.photos" :key="idx" class="rounded-2xl overflow-hidden border-2 border-white/10 shadow-2xl">
            <img :src="img" class="w-full h-full object-cover" />
          </div>
        </div>

        <button @click="store.reset()" class="w-full py-6 bg-yellow-400 text-black font-black text-2xl rounded-2xl uppercase">
          Selesai / Ulangi
        </button>
      </div>
    </Transition>

  </div>
</template>

<script setup>
import { useBoothStore } from './store'
import CameraPreview from './components/CameraPreview.vue'
import FrameSelection from './views/FrameSelection.vue' // Pastikan ini di-import!

const store = useBoothStore()
</script>

<style>
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>