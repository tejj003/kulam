// Configuration & globals
const CONFIG = {
    particleInitial: 1200,     // increased for fuller screen
    maxParticles: 2500,        // allow higher ceiling
    flowFieldResolution: 20,
    motionThreshold: 30,
    motionSampleStep: 5,
    enableTrails: true,        // turn trails back on for richness
    trailFadeStrength: 18,     // gentle fade (higher = faster clear)
    useAdditiveGlow: true,     // glowing accumulation
    ambientSpawnRate: 4        // passive particles per frame when no motion
};

let video;
let prevFrame;
let particles = [];
let flowField = [];
let cols = 0, rows = 0; // cached flow field dimensions
let colorPalette = [];
let time = 0;
let flipVideoLogic = false; // Set to true if motion feels horizontally reversed.

function setup() {
    createCanvas(windowWidth, windowHeight);

    // Enable HSB globally so palette generation uses hue/saturation correctly
    colorMode(HSB, 360, 100, 100, 255);

    const constraints = { video: { facingMode: 'user', width: 320, height: 240 }, audio: false };
    video = createCapture(constraints, () => {
        prevFrame = createImage(video.width, video.height);
    });
    video.size(320, 240);
    video.style('transform', ''); // ensure no mirror transform applied
    video.hide();

    generateColorPalette();

    for (let i = 0; i < CONFIG.particleInitial; i++) {
        particles.push(new Particle());
    }

    initFlowField();
}

function draw() {
    // Rich background layering
    if (CONFIG.enableTrails) {
        // Instead of hard background(), draw translucent rect for smoother persistence
        push();
        noStroke();
        // Slight radial darkening could be added later; for now uniform fade
        fill(0, 0, 0, CONFIG.trailFadeStrength); // HSB black with alpha
        rect(0, 0, width, height);
        pop();
    } else {
        background(0, 0, 0);
    }

    time += 0.01;
    const motion = detectMotion();
    updateFlowField(motion);

    if (CONFIG.useAdditiveGlow) blendMode(ADD);
    particles.forEach(p => { p.follow(flowField); p.update(); p.edges(); p.show(); });
    if (CONFIG.useAdditiveGlow) blendMode(BLEND);

    // Motion-driven spawning (bursts)
    if (motion.active) {
        for (let i = 0; i < 10; i++) { // more per burst
            const x = map(motion.x, 0, video.width, 0, width);
            const y = map(motion.y, 0, video.height, 0, height);
            particles.push(new Particle(x + random(-40,40), y + random(-40,40), true));
        }
    } else {
        // Ambient filling so display never feels empty
        for (let i = 0; i < CONFIG.ambientSpawnRate; i++) {
            particles.push(new Particle(random(width), random(height), false));
        }
    }

    // Trim overflow
    if (particles.length > CONFIG.maxParticles) particles.splice(0, particles.length - CONFIG.maxParticles);

    if (frameCount % 3600 === 0) generateColorPalette();

    if (frameCount % 120 === 0) {
        for (let i = 0; i < colorPalette.length; i++) {
            const c = colorPalette[i];
            const h = (hue(c) + 1) % 360;
            const s = saturation(c);
            const b = brightness(c);
            colorPalette[i] = color(h, s, b, alpha(c));
        }
    }
}

function detectMotion() {
    if (!video || !prevFrame) return { active: false, intensity: 0, x: video ? video.width / 2 : 0, y: video ? video.height / 2 : 0 };

    video.loadPixels();
    if (!video.pixels.length) return { active: false, intensity: 0, x: video.width / 2, y: video.height / 2 };
    prevFrame.loadPixels();

    let totalMotion = 0;
    let motionX = 0;
    let motionY = 0;
    let pixelCount = 0;

    for (let y = 0; y < video.height; y += CONFIG.motionSampleStep) {
        for (let x = 0; x < video.width; x += CONFIG.motionSampleStep) {
            const loc = (x + y * video.width) * 4;
            const r1 = video.pixels[loc];
            const g1 = video.pixels[loc + 1];
            const b1 = video.pixels[loc + 2];
            const r2 = prevFrame.pixels[loc];
            const g2 = prevFrame.pixels[loc + 1];
            const b2 = prevFrame.pixels[loc + 2];
            const diff = dist(r1, g1, b1, r2, g2, b2);
            if (diff > CONFIG.motionThreshold) {
                totalMotion += diff;
                motionX += x;
                motionY += y;
                pixelCount++;
            }
        }
    }

    prevFrame.copy(video, 0, 0, video.width, video.height, 0, 0, video.width, video.height);

    const avgMotion = totalMotion / (video.width * video.height / (CONFIG.motionSampleStep * CONFIG.motionSampleStep));
    let avgX = pixelCount > 0 ? motionX / pixelCount : video.width / 2;
    if (flipVideoLogic) avgX = video.width - avgX; // optional horizontal flip logic
    const avgY = pixelCount > 0 ? motionY / pixelCount : video.height / 2;

    return { active: avgMotion > 0.5, intensity: avgMotion, x: avgX, y: avgY };
}

function initFlowField() {
    cols = floor(width / CONFIG.flowFieldResolution) + 1;
    rows = floor(height / CONFIG.flowFieldResolution) + 1;
    flowField = new Array(cols * rows);
}

function updateFlowField(motion) {
    let xoff = 0;
    for (let x = 0; x < cols; x++) {
        let yoff = 0;
        for (let y = 0; y < rows; y++) {
            const index = x + y * cols;
            let angle = noise(xoff, yoff, time) * TWO_PI * 2;
            if (motion.active) {
                const motionX = map(motion.x, 0, video.width, 0, width);
                const motionY = map(motion.y, 0, video.height, 0, height);
                const d = dist(x * CONFIG.flowFieldResolution, y * CONFIG.flowFieldResolution, motionX, motionY);
                if (d < 200) {
                    const influence = map(d, 0, 200, PI, 0);
                    angle += influence * sin(time * 2);
                }
            }
            const v = p5.Vector.fromAngle(angle);
            v.setMag(1);
            flowField[index] = v;
            yoff += 0.05;
        }
        xoff += 0.05;
    }
}

function generateColorPalette() {
    colorPalette = [];
    const currentHour = hour();
    let baseHue;
    if (currentHour >= 6 && currentHour < 12) baseHue = 0;       // Morning red
    else if (currentHour >= 12 && currentHour < 18) baseHue = 50; // Noon golden
    else baseHue = 220;                                          // Evening blue

    // High impact palette: primary, accent, complementary pops
    const offsets = [0, 30, 180, 210, 330];
    for (let i = 0; i < offsets.length; i++) {
        colorPalette.push(color((baseHue + offsets[i]) % 360, 100, 100, 255));
    }
}

class Particle {
    constructor(x, y, isNew = false) {
        this.pos = createVector(x ?? random(width), y ?? random(height));
        this.vel = createVector(0, 0);
        this.acc = createVector(0, 0);
        this.maxspeed = random(2, 4);
        this.prevPos = this.pos.copy();
        this.color = random(colorPalette);
        this.size = isNew ? random(10, 20) : random(2, 8);
        this.lifespan = 255;
        this.isNew = isNew;
    }
    follow(vectors) {
        const x = floor(this.pos.x / CONFIG.flowFieldResolution);
        const y = floor(this.pos.y / CONFIG.flowFieldResolution);
        const index = x + y * cols;
        const force = vectors[index];
        if (force) this.applyForce(force);
    }
    applyForce(force) { this.acc.add(force); }
    update() {
        this.vel.add(this.acc).limit(this.maxspeed);
        this.pos.add(this.vel);
        this.acc.mult(0);
        if (this.isNew) { this.lifespan -= 4; this.size *= 0.985; }
    }
    edges() {
        if (this.pos.x > width) { this.pos.x = 0; this.prevPos.x = 0; }
        else if (this.pos.x < 0) { this.pos.x = width; this.prevPos.x = width; }
        if (this.pos.y > height) { this.pos.y = 0; this.prevPos.y = 0; }
        else if (this.pos.y < 0) { this.pos.y = height; this.prevPos.y = height; }
    }
    show() {
        push();
        colorMode(HSB, 360, 100, 100, 255);
        const alphaVal = this.isNew ? this.lifespan : 200; // stronger visibility
        this.color.setAlpha(alphaVal);
        stroke(this.color);
        strokeWeight(this.size);
        line(this.pos.x, this.pos.y, this.prevPos.x, this.prevPos.y);
        this.prevPos = this.pos.copy();
        pop();
    }
}

function windowResized() { resizeCanvas(windowWidth, windowHeight); initFlowField(); }
