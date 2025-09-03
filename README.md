# Interactive Generative Art Installation

A beautiful, responsive generative art piece that reacts to human movement via camera input. Perfect for large vertical displays in public spaces.

## Features

- **Motion Detection**: Uses webcam to detect movement and create interactive effects
- **Particle System**: Flowing particles that respond to motion and create organic patterns
- **Dynamic Color Palettes**: Automatically generates harmonious color schemes
- **Vertical Display Optimized**: Designed for tall screens and installations
- **Performance Optimized**: Maintains smooth animation with hundreds of particles

## Setup

1. Open `index.html` in a modern web browser
2. Allow camera permissions when prompted
3. Move in front of the camera to interact with the art

## How It Works

- The system captures video from your webcam
- Motion is detected by comparing consecutive frames
- Movement influences a flow field that guides particles
- New particles are spawned at motion points
- Colors shift over time creating an ever-changing display

## Customization

You can modify these parameters in `sketch.js`:
- `motionThreshold`: Sensitivity to movement (default: 30)
- `flowFieldResolution`: Detail level of flow field (default: 20)
- Particle count and behavior
- Color palette generation

## Display Requirements

- Modern web browser with WebGL support
- Webcam/camera access
- For best results, use a high-resolution vertical display
- Ensure good lighting for motion detection

## Privacy

All processing happens locally in the browser. No video data is stored or transmitted.
