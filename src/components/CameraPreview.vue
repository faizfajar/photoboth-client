<template>
  <div class="relative w-full h-screen bg-black overflow-hidden flex items-center justify-center">
    
    <video 
      ref="videoRef" 
      autoplay 
      playsinline 
      class="absolute inset-0 w-full h-full scale-x-[-1]"
    ></video>

    <div v-if="store.selectedFrame" class="absolute inset-0 pointer-events-none z-10">
      <img 
        :src="store.selectedFrame" 
        class="w-full h-full " 
      />
    </div>

    <canvas ref="canvasRef" class="hidden" width="1080" height="1920"></canvas>

    <div v-if="countdown > 0" class="absolute inset-0 flex items-center justify-center bg-black/20 z-20">
      <span class="text-[300px] font-black italic text-white drop-shadow-2xl animate-ping">
        {{ countdown }}
      </span>
    </div>

    <div v-if="showFlash" class="absolute inset-0 bg-white z-50 transition-opacity duration-100"></div>

    <div class="absolute top-10 flex gap-4 z-30">
      <div v-for="i in 4" :key="i" 
           :class="['w-5 h-5 rounded-full border-2', store.photos.length >= i ? 'bg-yellow-400 border-yellow-400' : 'border-white/50']">
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useBoothStore } from '../store'

const store = useBoothStore()
const videoRef = ref(null)
const canvasRef = ref(null)
const countdown = ref(0)
const showFlash = ref(false)

const capturePhoto = () => {
  const canvas = canvasRef.value
  const video = videoRef.value
  const ctx = canvas.getContext('2d')

  // Pastikan kualitas gambar bersih
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'

  // A. Gambar Video (Cover & Mirror)
  // Kita hitung perbandingan agar video ditarik menutupi canvas (sama kayak object-cover)
  const videoRatio = video.videoWidth / video.videoHeight
  const canvasRatio = canvas.width / canvas.height
  let drawWidth, drawHeight, startX, startY

  if (videoRatio > canvasRatio) {
    drawWidth = video.videoHeight * canvasRatio
    drawHeight = video.videoHeight
    startX = (video.videoWidth - drawWidth) / 2
    startY = 0
  } else {
    drawWidth = video.videoWidth
    drawHeight = video.videoWidth / canvasRatio
    startX = 0
    startY = (video.videoHeight - drawHeight) / 2
  }

  
  ctx.save()
  ctx.translate(canvas.width, 0)
  ctx.scale(-1, 1) // Mirror balik
  ctx.drawImage(video, startX, startY, drawWidth, drawHeight, 0, 0, canvas.width, canvas.height)
  ctx.restore()

  // B. Gambar Frame (Fill)
  if (store.selectedFrame) {
    const frameImg = new Image()
    frameImg.src = store.selectedFrame
    // Gambar frame dipaksa memenuhi ukuran canvas
    ctx.drawImage(frameImg, 0, 0, canvas.width, canvas.height)
  }

  const imageData = canvas.toDataURL('image/jpeg', 0.9)
  store.photos.push(imageData)
}

const startCaptureSession = async () => {
  for (let i = 0; i < 4; i++) {
    countdown.value = 3
    while (countdown.value > 0) {
      await new Promise(r => setTimeout(r, 1000))
      countdown.value--
    }

    showFlash.value = true
    capturePhoto()
    setTimeout(() => { showFlash.value = false }, 100)
    await new Promise(r => setTimeout(r, 1500))
  }
  store.nextStep('REVIEW')
}

onMounted(async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ 
      video: { 
        width: { ideal: 1920 }, 
        height: { ideal: 1080 },
        facingMode: "user"
      } 
    })
    if (videoRef.value) videoRef.value.srcObject = stream
    setTimeout(startCaptureSession, 2000)
  } catch (err) {
    alert("Kamera tidak ditemukan atau akses ditolak!")
  }
})
</script>