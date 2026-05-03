<script setup>
import { ref, onMounted } from 'vue'

const visible = ref(false)
const hidden = ref(false)

const frames = [
  '/assets/arona_bounce/avatar1.c18ce793.png',
  '/assets/arona_bounce/avatar2.916294c1.png',
  '/assets/arona_bounce/avatar3.5e643647.png',
  '/assets/arona_bounce/avatar4.be61bf91.png',
]

const currentFrame = ref(0)
let bounceTimer = null

// Bounce position offset
const bounceY = ref(0)

onMounted(() => {
  // Fade in
  setTimeout(() => { visible.value = true }, 1500)

  // Bounce animation — switch frame every half cycle
  let t = 0
  let wasAbove = true
  bounceTimer = setInterval(() => {
    t += 0.1
    const s = Math.sin(t)
    bounceY.value = Math.abs(s) * 14
    // Switch frame at every zero crossing
    if ((s < 0 && wasAbove) || (s > 0 && !wasAbove)) {
      currentFrame.value = (currentFrame.value + 1) % frames.length
    }
    wasAbove = s >= 0
  }, 30)
})

function onClose() {
  hidden.value = true
  clearInterval(bounceTimer)
}
</script>

<template>
  <Transition name="arona-fade">
    <div
      v-if="visible && !hidden"
      class="bouncing-arona"
      :style="{ transform: `translateY(${-bounceY}px)` }"
      title="阿罗娜"
    >
      <img :src="frames[currentFrame]" class="arona-sprite" alt="Arona" />
      <button class="arona-close" @click="onClose" title="关闭">✕</button>
    </div>
  </Transition>
</template>

<style scoped>
.bouncing-arona {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 80;
  cursor: pointer;
  transition: transform 0.03s linear;
  filter: drop-shadow(0 4px 12px rgba(45, 175, 255, 0.3));
}

.bouncing-arona:hover {
  filter: drop-shadow(0 4px 20px rgba(45, 175, 255, 0.5));
}

.arona-sprite {
  width: 120px;
  height: 160px;
  object-fit: contain;
  image-rendering: auto;
}

.arona-close {
  position: absolute;
  top: -6px;
  right: -6px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #fff;
  font-size: 0.6rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s;
}

.bouncing-arona:hover .arona-close {
  opacity: 1;
}

.arona-fade-enter-active {
  transition: opacity 0.8s ease, transform 0.8s ease;
}

.arona-fade-leave-active {
  transition: opacity 0.4s ease;
}

.arona-fade-enter-from {
  opacity: 0;
  transform: translateY(40px);
}

.arona-fade-leave-to {
  opacity: 0;
}

@media (max-width: 600px) {
  .bouncing-arona {
    bottom: 70px;
    right: 10px;
  }
  .arona-sprite {
    width: 80px;
    height: 107px;
  }
}
</style>
