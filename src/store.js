import { defineStore } from "pinia";

export const useBoothStore = defineStore("booth", {
  state: () => ({
    currentStep: "START",
    selectedLayout: null,
    activeIndex: 0,
    selectedFilter: 'filter-none',
    lastSavedPath: '',
    photos: [],
  }),

  actions: {
    // Navigasi antar view (START, FRAME, LAYOUT, CAPTURE, REVIEW)
    nextStep(step) {
      this.currentStep = step;
    },

    setLastSaved(path) {
      this.lastSavedPath = path;
    },

    setLayout(layout) {
      this.selectedLayout = layout;
      // Inisialisasi slot foto berdasarkan koordinat yang terkunci di layout ini
      this.photos = layout.slots.map((slot) => ({
        src: null,
        x: slot.x,
        y: slot.y,
        w: slot.w,
        h: slot.h,
        scale: 1,
        rotation: 0,
      }));
      this.nextStep("CAPTURE");
    },

    // Menyimpan data foto baru ke dalam slot tertentu
    // Re-assignment objek digunakan untuk menjamin update UI instan
   updatePhoto(index, photoData, ghostSrc = null) {
      if (this.photos[index]) {
        this.photos[index] = {
          ...this.photos[index],
          src: photoData,
          usedGhost: ghostSrc, // save referensi pose guide
        };
      }
    },

    retakePhoto(index) {
      this.activeIndex = index;
      this.nextStep('CAPTURE');
    },

    // Mengembalikan seluruh state ke kondisi pabrik untuk sesi baru
    reset() {
      this.currentStep = "START";
      this.selectedLayout = null;
      this.activeIndex = 0;
      this.photos = [];
    },
  },

  getters: {
    // Mengecek kelengkapan jepretan sebelum masuk ke tahap cetak
    allPhotosCaptured: (state) => {
      if (state.photos.length === 0) return false;
      return state.photos.every((p) => p.src !== null);
    },
  },
});
