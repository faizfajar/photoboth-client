import { defineStore } from "pinia";

export const useBoothStore = defineStore("booth", {
  state: () => ({
    currentStep: "START", // START -> FRAME -> CAPTURE -> REVIEW -> DONE
    deviceToken: localStorage.getItem("device_token") || "",
    selectedFrame: null,

    // UBAH: Photos sekarang menjadi array of objects untuk mendukung interaksi
    // Kita inisialisasi 4 slot langsung agar tidak error saat diakses index-nya
    photos: [
      { src: null, x: 50, y: 50, scale: 1, rotation: 0 },
      { src: null, x: 50, y: 50, scale: 1, rotation: 0 },
      { src: null, x: 50, y: 50, scale: 1, rotation: 0 },
      { src: null, x: 50, y: 50, scale: 1, rotation: 0 },
    ],

    locationName: "Jakarta, Indonesia",
    selectedEmoji: null,
    editingIndex: null, // Index foto yang lagi diedit di PhotoEditor
    activeIndex: 0, // Trace active index secara global untuk CameraPreview
    selectedFrameIndex: 0,
  }),

  actions: {
    nextStep(step) {
      this.currentStep = step;
    },

    // UBAH: Reset sekarang mengembalikan struktur objek photo ke awal
    reset() {
      this.currentStep = "START";
      this.selectedFrame = null;
      this.activeIndex = 0;
      this.selectedFrameIndex = 0;
      this.editingIndex = null;
      this.selectedEmoji = null;

      // Kembalikan ke 4 slot kosong dengan koordinat default
      this.photos = [
        { src: null, x: 50, y: 50, scale: 1, rotation: 0 },
        { src: null, x: 50, y: 50, scale: 1, rotation: 0 },
        { src: null, x: 50, y: 50, scale: 1, rotation: 0 },
        { src: null, x: 50, y: 50, scale: 1, rotation: 0 },
      ];
    },

    // Tambahan helper jika ingin mengupdate foto secara bersih
    setPhotoData(index, base64) {
      if (this.photos[index]) {
        this.photos[index].src = base64;
        // Opsional: Atur posisi otomatis agar tidak menumpuk sempurna di awal
        this.photos[index].x = 40 + index * 10;
        this.photos[index].y = 40 + index * 20;
      }
    },
  },
});
