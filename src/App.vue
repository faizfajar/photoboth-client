<template>
  <div class="w-screen h-screen max-w-[1080px] mx-auto bg-black relative overflow-hidden">
    
    <Transition name="fade" mode="out-in">
      <div v-if="store.currentStep === 'START'" key="start" @click="store.nextStep('FRAME')" 
           class="h-full flex flex-col items-center justify-center cursor-pointer bg-zinc-950">
        <h1 class="text-7xl font-black italic animate-bounce">SNAP & GLOW</h1>
      </div>

      <FrameSelection v-else-if="store.currentStep === 'FRAME'" key="frame" />

      <CameraPreview v-else-if="store.currentStep === 'CAPTURE'" key="capture" />

      <ReviewScreen v-else-if="store.currentStep === 'REVIEW'" key="review" />

      <PhotoEditor v-else-if="store.currentStep === 'EDIT'" key="edit" />
    </Transition>

  </div>
</template>

<script setup>
import { useBoothStore } from './store'
import CameraPreview from './components/CameraPreview.vue'
import FrameSelection from './views/FrameSelection.vue'
import ReviewScreen from './views/ReviewScreen.vue' // <-- PASTIKAN INI DI-IMPORT
import PhotoEditor from './views/PhotoEditor.vue'

const store = useBoothStore()
</script>

<style>
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>