/**
 * Audio synthesis helper using native Web Audio API
 * Generates a clean two-tone chime when the rest timer finishes without requiring external mp3 assets.
 */
export function playRestTimerChime() {
  try {
    // Respect user's sound preference from Settings
    if (localStorage.getItem("rest_timer_sound") === "false") {
      return;
    }

    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    // Two-tone bell note: 587.33 Hz (D5) transitioning to 880 Hz (A5)
    osc.frequency.setValueAtTime(587.33, now);
    osc.frequency.setValueAtTime(880, now + 0.12);

    // Smooth decay volume envelope
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.6);
  } catch (error) {
    console.debug("Web Audio playback error or gesture policy:", error);
  }
}
