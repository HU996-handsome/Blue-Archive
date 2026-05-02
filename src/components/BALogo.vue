<script setup>
import { ref, onMounted } from 'vue'
import haloImg from '../assets/halo.png'
import crossImg from '../assets/cross.png'

const canvasRef = ref(null)

const CFG = {
  height: 80,
  fontSize: 32,
  textBaseLine: 0.68,
  tilt: -0.4,
  padX: 6,
  graphOffset: { X: 4, Y: 0 },
  hollowPath: [
    [284, 136], [321, 153], [159, 410], [148, 403],
  ],
}

const font = `${CFG.fontSize}px RoGSanSrfStd-Bd, GlowSansSC-Normal-Heavy_diff, "PingFang SC", "Microsoft YaHei", sans-serif`

async function loadImg(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.src = src
    img.onload = () => resolve(img)
    img.onerror = reject
  })
}

onMounted(async () => {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')

  const [halo, cross] = await Promise.all([loadImg(haloImg), loadImg(crossImg)])

  const textL = 'BA'
  const textR = '中转站'

  ctx.font = font
  const mL = ctx.measureText(textL)
  const mR = ctx.measureText(textR)

  const h = CFG.height
  const baseline = h * CFG.textBaseLine

  const widthL = mL.width - baseline * CFG.tilt
  const widthR = mR.width + (baseline - (mL.fontBoundingBoxAscent || CFG.fontSize * 0.7)) * CFG.tilt
  const totalW = Math.max(widthL + widthR + CFG.padX * 2, 260)

  canvas.width = totalW
  canvas.height = h

  const cx = widthL + CFG.padX

  // Clear
  ctx.clearRect(0, 0, totalW, h)

  // Blue left text
  ctx.font = font
  ctx.fillStyle = '#128AFA'
  ctx.textAlign = 'end'
  ctx.setTransform(1, 0, CFG.tilt, 1, 0, 0)
  ctx.fillText(textL, cx, baseline)
  ctx.resetTransform()

  // Halo
  const gx = cx - h / 2 + CFG.graphOffset.X
  const gy = CFG.graphOffset.Y
  ctx.drawImage(halo, gx, gy, h, h)

  // Right text (white on dark bg)
  ctx.font = font
  ctx.fillStyle = '#f0f6fc'
  ctx.textAlign = 'start'
  ctx.strokeStyle = 'rgba(0,0,0,0.3)'
  ctx.lineWidth = 4
  ctx.setTransform(1, 0, CFG.tilt, 1, 0, 0)
  ctx.strokeText(textR, cx, baseline)
  ctx.fillText(textR, cx, baseline)
  ctx.resetTransform()

  // Hollow triangle cutout
  ctx.beginPath()
  ctx.moveTo(gx + (CFG.hollowPath[0][0] / 500) * h, gy + (CFG.hollowPath[0][1] / 500) * h)
  for (let i = 1; i < 4; i++) {
    ctx.lineTo(gx + (CFG.hollowPath[i][0] / 500) * h, gy + (CFG.hollowPath[i][1] / 500) * h)
  }
  ctx.closePath()
  ctx.fillStyle = 'white'
  ctx.globalCompositeOperation = 'destination-out'
  ctx.fill()
  ctx.globalCompositeOperation = 'source-over'

  // Cross
  ctx.drawImage(cross, gx, gy, h, h)
})
</script>

<template>
  <canvas ref="canvasRef" class="ba-logo-canvas"></canvas>
</template>

<style scoped>
.ba-logo-canvas {
  display: block;
  max-width: 100%;
  height: auto;
}
</style>
