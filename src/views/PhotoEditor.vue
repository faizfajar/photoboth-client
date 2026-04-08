<template>
  <div class="h-screen w-full flex flex-col bg-zinc-950 text-white overflow-hidden touch-none select-none">
    
    <header class="p-6 flex justify-between items-center bg-black/50 backdrop-blur-md z-10">
      <button @click="store.nextStep('REVIEW')" class="text-white/50 font-bold uppercase text-sm">← Back</button>
      <h2 class="text-2xl font-black italic text-yellow-400 uppercase">Creative Studio</h2>
      <button @click="savePhoto" class="bg-green-600 px-8 py-3 rounded-full font-black uppercase text-sm shadow-lg">Save ✓</button>
    </header>

    <div class="flex-1 flex flex-col md:flex-row p-6 gap-6 items-center justify-center">
      
      <div class="relative flex-1 aspect-square w-full max-w-[600px] bg-black rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white/10"
           ref="editorContainer"
           @mousemove="onMove"
           @touchmove.prevent="onMove"
           @mouseup="onEnd"
           @touchend="onEnd">
        
        <img :src="store.photos[store.editingIndex]" class="w-full h-full object-cover pointer-events-none" />

        <div v-for="(l, i) in layers" :key="l.id"
             class="absolute cursor-move select-none touch-none flex items-center justify-center group"
             :class="{ 'ring-2 ring-yellow-400': activeIdx === i }"
             :style="{ 
               left: l.x + 'px', 
               top: l.y + 'px', 
               width: l.size + 'px',
               height: l.type === 'text' ? 'auto' : l.size + 'px',
               transform: `rotate(${l.rotation}deg)`
             }"
             @mousedown="onStart($event, i)"
             @touchstart.prevent="onStart($event, i)">
          
          <span v-if="l.type === 'emoji'" :style="{ fontSize: (l.size * 0.8) + 'px' }">{{ l.content }}</span>
          
          <p v-else-if="l.type === 'text'" 
             :style="{ fontSize: (l.size * 0.3) + 'px', color: l.color, fontFamily: l.font }" 
             class="leading-tight text-center font-bold">
            {{ l.content }}
          </p>

          <img v-else-if="l.type === 'image'" :src="l.content" class="w-full h-full object-contain" />

          <div v-if="activeIdx === i" @click.stop="removeLayer(i)" 
               class="absolute -top-3 -right-3 bg-red-600 w-8 h-8 rounded-full flex items-center justify-center font-bold z-20 shadow-xl">✕</div>
        </div>
      </div>

      <div class="w-full md:w-80 bg-zinc-900 rounded-[2.5rem] p-6 flex flex-col gap-6 overflow-y-auto max-h-full">
        
        <div class="bg-white/5 p-5 rounded-3xl">
          <p class="text-[10px] font-bold opacity-40 uppercase mb-3">Add Text</p>
          <input v-model="activeText" type="text" placeholder="Type here..." 
                 class="w-full bg-black border border-white/10 rounded-xl px-4 py-3 mb-3 text-sm outline-none focus:border-yellow-400" />
          <button @click="addText" class="w-full py-3 bg-white text-black font-bold rounded-xl text-xs uppercase">Add Message</button>
        </div>

        <div class="bg-white/5 p-5 rounded-3xl">
          <p class="text-[10px] font-bold opacity-40 uppercase mb-3">Add Custom Image</p>
          <label class="w-full py-3 bg-zinc-800 flex items-center justify-center gap-2 rounded-xl text-xs font-bold cursor-pointer hover:bg-zinc-700 transition">
            <span>📷 Upload Sticker</span>
            <input type="file" class="hidden" accept="image/*" @change="addImage" />
          </label>
        </div>

        <div v-if="activeIdx !== null" class="bg-yellow-400/10 p-5 rounded-3xl border border-yellow-400/20 animate-in fade-in zoom-in duration-300">
          <p class="text-[10px] font-bold text-yellow-400 uppercase mb-4">Edit Selected</p>
          
          <label class="text-[10px] opacity-50 block mb-1">Size: {{ layers[activeIdx].size }}px</label>
          <input type="range" min="30" max="400" v-model.number="layers[activeIdx].size" class="w-full accent-yellow-400 mb-4" />

          <label class="text-[10px] opacity-50 block mb-1">Rotation: {{ layers[activeIdx].rotation }}°</label>
          <input type="range" min="-180" max="180" v-model.number="layers[activeIdx].rotation" class="w-full accent-yellow-400" />
        </div>
      </div>
    </div>

    <canvas ref="finalCanvas" class="hidden" width="1080" height="1080"></canvas>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useBoothStore } from '../store'

const store = useBoothStore()
const editorContainer = ref(null)
const finalCanvas = ref(null)
const layers = reactive([])
const activeIdx = ref(null)
const activeText = ref('')

let isDragging = false
let offset = { x: 0, y: 0 }

const addText = () => {
  if (!activeText.value) return
  layers.push({
    id: Date.now(),
    type: 'text',
    content: activeText.value,
    x: 100, y: 100, size: 100, rotation: 0,
    color: '#ffffff', font: 'Montserrat'
  })
  activeText.value = ''
  activeIdx.value = layers.length - 1
}

const addImage = (e) => {
  const file = e.target.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (event) => {
    layers.push({
      id: Date.now(),
      type: 'image',
      content: event.target.result,
      x: 150, y: 150, size: 150, rotation: 0
    })
    activeIdx.value = layers.length - 1
  }
  reader.readAsDataURL(file)
}

const removeLayer = (i) => {
  layers.splice(i, 1)
  activeIdx.value = null
}

// DRAG LOGIC
const onStart = (e, i) => {
  activeIdx.value = i
  isDragging = true
  const event = e.touches ? e.touches[0] : e
  offset.x = event.clientX - layers[i].x
  offset.y = event.clientY - layers[i].y
}

const onMove = (e) => {
  if (!isDragging || activeIdx.value === null) return
  const event = e.touches ? e.touches[0] : e
  layers[activeIdx.value].x = event.clientX - offset.x
  layers[activeIdx.value].y = event.clientY - offset.y
}

const onEnd = () => { isDragging = false }

const savePhoto = () => {
  const canvas = finalCanvas.value
  const ctx = canvas.getContext('2d')
  const baseImg = new Image()
  
  baseImg.onload = async () => {
    ctx.drawImage(baseImg, 0, 0, 1080, 1080)
    const scale = 1080 / editorContainer.value.getBoundingClientRect().width

    for (const l of layers) {
      ctx.save()
      const centerX = (l.x * scale) + ((l.size * scale) / 2)
      const centerY = (l.y * scale) + ((l.size * scale) / 2)
      
      ctx.translate(centerX, centerY)
      ctx.rotate((l.rotation * Math.PI) / 180)

      if (l.type === 'text') {
        ctx.fillStyle = l.color
        ctx.font = `bold ${(l.size * scale) * 0.3}px ${l.font}`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(l.content, 0, 0)
      } else if (l.type === 'image' || l.type === 'emoji') {
        const renderSize = l.size * scale
        if (l.type === 'emoji') {
          ctx.font = `${renderSize * 0.8}px serif`
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText(l.content, 0, 0)
        } else {
          const imgSticker = new Image()
          imgSticker.src = l.content
          await new Promise(r => imgSticker.onload = r)
          ctx.drawImage(imgSticker, -renderSize/2, -renderSize/2, renderSize, renderSize)
        }
      }
      ctx.restore()
    }
    store.photos[store.editingIndex] = canvas.toDataURL('image/jpeg', 0.95)
    store.nextStep('REVIEW')
  }
  baseImg.src = store.photos[store.editingIndex]
}
</script>