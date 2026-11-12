/**
 * Beat Detector — Energy flux based detection
 *
 * Algorithm:
 * 1. Compute instantaneous energy (sum of squared frequency bin values)
 * 2. Maintain a rolling average of energy over recent history
 * 3. If instantaneous energy exceeds threshold * average → BEAT
 * 4. Estimate BPM from median of recent inter-beat intervals
 */
export class BeatDetector {
  constructor(analyser) {
    this.analyser = analyser;
    this.bufferLength = analyser.frequencyBinCount;
    this.dataArray = new Uint8Array(this.bufferLength);

    this.energyHistory = [];
    this.historySize = 43; // ~1 second at 43fps
    this.threshold = 1.4;

    this.beatTimes = [];
    this.maxBeatHistory = 8;
    this.lastBeatTime = 0;
    this.minBeatInterval = 250; // ms — max 240 BPM

    this.isBeat = false;
    this.bpm = 0;
  }

  /**
   * Check for beat in current frame
   * Returns true if this frame contains a beat
   */
  detect() {
    this.analyser.getByteFrequencyData(this.dataArray);

    // Compute instantaneous energy (sum of squared magnitudes)
    let energy = 0;
    for (let i = 0; i < this.bufferLength; i++) {
      const val = this.dataArray[i] / 255;
      energy += val * val;
    }
    energy /= this.bufferLength;

    // Add to history
    this.energyHistory.push(energy);
    if (this.energyHistory.length > this.historySize) {
      this.energyHistory.shift();
    }

    // Need enough history
    if (this.energyHistory.length < this.historySize) {
      this.isBeat = false;
      return false;
    }

    // Compute rolling average
    let avgEnergy = 0;
    for (const e of this.energyHistory) {
      avgEnergy += e;
    }
    avgEnergy /= this.energyHistory.length;

    // Beat detection
    const now = performance.now();
    this.isBeat = false;

    if (energy > avgEnergy * this.threshold && energy > 0.01) {
      if (now - this.lastBeatTime > this.minBeatInterval) {
        this.isBeat = true;
        this.lastBeatTime = now;

        // Track beat intervals for BPM
        this.beatTimes.push(now);
        if (this.beatTimes.length > this.maxBeatHistory) {
          this.beatTimes.shift();
        }

        this._computeBPM();
        return true;
      }
    }

    return false;
  }

  _computeBPM() {
    if (this.beatTimes.length < 2) return;

    const intervals = [];
    for (let i = 1; i < this.beatTimes.length; i++) {
      intervals.push(this.beatTimes[i] - this.beatTimes[i - 1]);
    }

    // Median of intervals
    intervals.sort((a, b) => a - b);
    const median = intervals[Math.floor(intervals.length / 2)];

    this.bpm = Math.round(60000 / median);
  }

  setThreshold(value) {
    this.threshold = value;
  }
}
