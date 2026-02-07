// Utilitas untuk menghasilkan suara tanpa file MP3
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

export const playTick = () => {
  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();

  oscillator.type = 'sine'; // Suara tick yang bersih
  oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // Nada Tinggi (A5)
  
  gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.1);

  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  oscillator.start();
  oscillator.stop(audioCtx.currentTime + 0.1);
};

export const playShutter = () => {
  const bufferSize = audioCtx.sampleRate * 0.1; // Durasi 0.1 detik
  const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const data = buffer.getChannelData(0);

  // Menghasilkan White Noise untuk suara "Chack!"
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }

  const noise = audioCtx.createBufferSource();
  noise.buffer = buffer;

  const gainNode = audioCtx.createGain();
  gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.1);

  noise.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  noise.start();
};