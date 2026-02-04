import { defineStore } from "pinia";

export const useBoothStore = defineStore("booth", {
  state: () => ({
    currentStep: "START", // START -> FRAME -> CAPTURE -> DONE
    deviceToken: localStorage.getItem("device_token") || "",
    selectedFrame: null,
    photos: [],
  }),
  actions: {
    nextStep(step) {
      this.currentStep = step;
    },
    reset() {
      this.currentStep = "START";
      this.selectedFrame = null;
      this.photos = [];
    },
  },
});
