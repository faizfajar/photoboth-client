<template>
  <component :is="currentView" />
</template>

<script setup>
import { computed } from 'vue'
import { useBoothStore } from './store'
import StartScreen from './views/StartScreen.vue'
import FrameSelection from './views/FrameSelection.vue'
import LayoutSelection from './components/LayoutSelection.vue'
import CameraPreview from './components/CameraPreview.vue'
import ReviewScreen from './views/ReviewScreen.vue'

const store = useBoothStore()

const currentView = computed(() => {
  switch (store.currentStep) {
    case 'START': return StartScreen
    case 'LAYOUT': return LayoutSelection
    case 'CAPTURE': return CameraPreview
    case 'REVIEW': return ReviewScreen
    default: return StartScreen
  }
})
</script>

<style>
/* Pastikan ini ada di file CSS global kamu */
html, body, #app {
  margin: 0;
  padding: 0;
  height: 100%;
  width: 100%;
  background-color: black; /* Hindari warna putih yang bikin silau */
  overflow: hidden;
}
</style>