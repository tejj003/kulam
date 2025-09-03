# Generative Motion Reactive Display

High-impact, vibrant particle art that reacts to live camera motion. Designed for large-format installations (lobbies, events, exhibitions) with ultra-bright hues and fluid motion trails.

## ✨ Key Capabilities
- Motion-driven flow field influencing particle vectors
- Time-of-day adaptive palette (Morning: Red, Noon: Gold, Evening/Night: Blue)
- Additive glow rendering for luminous color blending
- Automatic hue drift for subtle evolution
- Performance safeguards (particle cap & sampling stride)

## 🚀 Quick Start
1. Open `index.html` in a Chromium-based browser (Chrome / Edge).
2. Grant camera permission.
3. Move in front of the display—watch particles respond and bloom.

## 🛠 Tech Overview
File | Purpose
---- | -------
`index.html` | Loads p5.js + sketch.
`sketch.js` | Core logic: video capture, motion detection, flow field, particles, dynamic palette.

## 🎨 Color Logic
Time Slice | Base Hue | Mood
---------- | -------- | ----
Morning (06–11) | 0 | Energetic crimson
Noon (12–17) | 50 | Radiant golden
Evening/Night (18–05) | 220 | Electric blue

Palette offsets: `[0, 30, 180, 210, 330]` with full saturation (100) & brightness (100) rendered using additive blending for maximum vibrancy.

## 🔍 Important Tunables (`CONFIG` in `sketch.js`)
Name | Default | Description
---- | ------- | -----------
`particleInitial` | 500 | Starting particle count
`maxParticles` | 1000 | Hard cap for stability
`flowFieldResolution` | 20 | Lower = more detailed flow
`motionThreshold` | 30 | Sensitivity to pixel change
`motionSampleStep` | 5 | Spatial subsampling stride

## 🧠 How Motion Works
1. Webcam frames are diffed against previous frame.
2. Significant pixel deltas accumulate motion centroid.
3. Motion injects directional turbulence into Perlin-noise field.
4. Particles follow vector field, leaving luminous trails.

## 🖥 Deployment Tips
- Run from a local/static server if browser blocks camera on `file://`.
- Lock the machine to prevent sleep during installations.
- Prefer a dark environment to enhance contrast.

## 🔒 Privacy
All processing is in-browser. No frames leave the machine.

## ✅ Health Checklist
- Camera permission granted
- Particles moving & reacting
- Colors match time of day
- Trails luminous (additive blend active)

## 🧩 Ideas for Future Enhancements
- OSC / MIDI reactive mode
- QR code overlay to explain piece
- Fullscreen auto-toggle + kiosk mode
- Multi-camera fusion
- Audio-reactive shader layer

## 📄 License
Internal / Demo Use. Add a formal license if distributing.

---
Curate the experience by adjusting ambient lighting, distance, and motion pacing for best visual elegance.
