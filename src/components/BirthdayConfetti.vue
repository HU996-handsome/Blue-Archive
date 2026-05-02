<script setup>
import { ref, onMounted } from 'vue'

const show = ref(false)
const canvasRef = ref(null)

onMounted(async () => {
  try {
    const res = await fetch('/assets/students_birthday.json')
    const data = await res.json()
    const now = new Date()
    const today = `${now.getMonth() + 1}/${now.getDate()}`
    if (data.some(s => s.bd === today)) {
      show.value = true
      setTimeout(() => startConfetti(), 500)
    }
  } catch {}
})

function startConfetti() {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight

  const colors = ['#f5c842', '#ff9ecd', '#2dafff', '#4dc9f6', '#55efc4', '#a29bfe', '#ff6b6b']
  const particles = []

  for (let i = 0; i < 80; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height - canvas.height,
      w: Math.random() * 8 + 4,
      h: Math.random() * 6 + 3,
      color: colors[Math.floor(Math.random() * colors.length)],
      vx: (Math.random() - 0.5) * 3,
      vy: Math.random() * 3 + 2,
      rot: Math.random() * 360,
      rotSpeed: (Math.random() - 0.5) * 10,
      opacity: 1,
    })
  }

  let frame = 0
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    let alive = false
    particles.forEach(p => {
      if (p.opacity <= 0) return
      alive = true
      p.x += p.vx
      p.y += p.vy
      p.vy += 0.05
      p.rot += p.rotSpeed
      if (frame > 120) p.opacity -= 0.015

      ctx.save()
      ctx.translate(p.x, p.y)
      ctx.rotate(p.rot * Math.PI / 180)
      ctx.globalAlpha = Math.max(0, p.opacity)
      ctx.fillStyle = p.color
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h)
      ctx.restore()
    })
    frame++
    if (alive && frame < 400) requestAnimationFrame(animate)
    else { ctx.clearRect(0, 0, canvas.width, canvas.height); show.value = false }
  }
  animate()
}
</script>

<template>
  <canvas v-if="show" ref="canvasRef" class="confetti-canvas"></canvas>
</template>

<style scoped>
.confetti-canvas {
  position: fixed;
  inset: 0;
  z-index: 9999;
  pointer-events: none;
}
</style>
