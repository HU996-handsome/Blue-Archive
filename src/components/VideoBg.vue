<script setup>
import bgVideo from '../assets/background.mp4'

const videoSrc = bgVideo
</script>

<template>
  <div class="video-bg">
    <video
      v-if="videoSrc"
      class="bg-video"
      :src="videoSrc"
      autoplay
      muted
      loop
      playsinline
    ></video>
    <!-- CSS animated gradient fallback -->
    <div class="bg-fallback" v-else>
      <div class="fb-orb fb-1"></div>
      <div class="fb-orb fb-2"></div>
      <div class="fb-orb fb-3"></div>
      <div class="fb-orb fb-4"></div>
      <div class="fb-orb fb-5"></div>
    </div>
    <!-- Overlay vignette -->
    <div class="video-overlay"></div>
  </div>
</template>

<style scoped>
.video-bg {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  overflow: hidden;
}

.bg-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.78;
}

/* ========== CSS Animated Fallback ========== */
.bg-fallback {
  position: absolute;
  inset: 0;
  background: #060e1a;
  overflow: hidden;
}

.fb-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(100px);
  opacity: 0.5;
  will-change: transform;
}

.fb-1 {
  width: 600px; height: 600px;
  background: radial-gradient(circle, #1a6fff, transparent 70%);
  top: -15%; left: -10%;
  animation: drift1 20s ease-in-out infinite;
}

.fb-2 {
  width: 500px; height: 500px;
  background: radial-gradient(circle, #2dafff, transparent 70%);
  top: 40%; right: -8%;
  animation: drift2 24s ease-in-out infinite;
}

.fb-3 {
  width: 400px; height: 400px;
  background: radial-gradient(circle, #4dc9f6, transparent 70%);
  bottom: -10%; left: 25%;
  animation: drift3 18s ease-in-out infinite;
}

.fb-4 {
  width: 300px; height: 300px;
  background: radial-gradient(circle, #f5c842, transparent 70%);
  top: 15%; right: 30%;
  opacity: 0.25;
  animation: drift4 22s ease-in-out infinite;
}

.fb-5 {
  width: 350px; height: 350px;
  background: radial-gradient(circle, #ff9ecd, transparent 70%);
  bottom: 30%; left: 60%;
  opacity: 0.2;
  animation: drift5 26s ease-in-out infinite;
}

@keyframes drift1 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(100px, 80px) scale(1.1); }
  66% { transform: translate(-30px, 120px) scale(0.95); }
}

@keyframes drift2 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(-80px, -60px) scale(1.08); }
  66% { transform: translate(50px, 30px) scale(0.9); }
}

@keyframes drift3 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(70px, -50px) scale(0.92); }
  66% { transform: translate(-80px, -30px) scale(1.08); }
}

@keyframes drift4 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(-50px, 60px) scale(1.15); }
  66% { transform: translate(30px, -80px) scale(0.88); }
}

@keyframes drift5 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(40px, -30px) scale(1.05); }
  66% { transform: translate(-60px, 50px) scale(0.92); }
}

/* ========== Overlay ========== */
.video-overlay {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse at top, rgba(255,255,255,0.08), transparent 60%),
    linear-gradient(to bottom, transparent 50%, rgba(6, 14, 26, 0.6));
  pointer-events: none;
}
</style>
