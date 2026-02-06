import { defineStore } from "pinia";

export const useBoothStore = defineStore("booth", {
  state: () => ({
    // Status navigasi utama aplikasi
    currentStep: "START",

    // Asset frame terpilih dalam bentuk path/URL
    selectedFrame: null,

    // Data layout aktif yang diimpor dari layouts.json
    selectedLayout: null,

    // Penanda slot mana yang sedang aktif di layar kamera
    activeIndex: 0,

    // Koleksi foto hasil jepretan dengan koordinat slotnya
    photos: [],
  }),

  actions: {
    // Navigasi antar view (START, FRAME, LAYOUT, CAPTURE, REVIEW)
    nextStep(step) {
      this.currentStep = step;
    },

    // Inisialisasi struktur foto berdasarkan layout yang dipilih user
    setLayout(layout) {
      this.selectedLayout = layout;
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
    updatePhoto(index, photoData) {
      if (this.photos[index]) {
        this.photos[index] = {
          ...this.photos[index],
          src: photoData,
        };
      }
    },

    // Mengembalikan seluruh state ke kondisi pabrik untuk sesi baru
    reset() {
      this.currentStep = "START";
      this.selectedFrame = null;
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
