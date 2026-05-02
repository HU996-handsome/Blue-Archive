<script setup>
import { onMounted, onUnmounted, watch, inject } from 'vue'

const settings = inject('settings')

class MouseSpark {
  constructor(opts = {}) {
    this.color = opts.color || '45,175,255'
    this.scale = opts.scale || 1.5
    this.opacity = opts.opacity || 1.0
    this.speed = opts.speed || 1.0
    this.maxTrail = opts.maxTrail || 16
    this.trailEnabled = true
    this.clickEnabled = true

    this.sparkPool = []
    this.wavePool = []
    this.waves = []
    this.sparks = []
    this.trail = []
    this.isDown = false
    this.lastPos = null
    this.baseFrameMs = 1000 / 60
    this.maxDeltaMs = 100
    this.lastFrameTime = performance.now()

    this.c = document.getElementById('sparkCanvas')
    this.ctx = this.c.getContext('2d')
    this.resize()
    this._resizeHandler = () => this.resize()
    this._mouseDownHandler = (e) => this.onMouseDown(e)
    this._mouseMoveHandler = (e) => this.onMouseMove(e)
    this._mouseUpHandler = () => { this.isDown = false }
    this._touchStartHandler = (e) => this.onTouchStart(e)
    this._touchMoveHandler = (e) => this.onTouchMove(e)
    this._touchEndHandler = () => { this.isDown = false }

    window.addEventListener('resize', this._resizeHandler)
    window.addEventListener('mousedown', this._mouseDownHandler)
    window.addEventListener('mousemove', this._mouseMoveHandler)
    window.addEventListener('mouseup', this._mouseUpHandler)
    window.addEventListener('touchstart', this._touchStartHandler, { passive: false })
    window.addEventListener('touchmove', this._touchMoveHandler, { passive: false })
    window.addEventListener('touchend', this._touchEndHandler)

    requestAnimationFrame((now) => this.loop(now))
  }

  alpha(value) {
    return Math.max(0, Math.min(1, value * this.opacity))
  }

  resize() {
    const dpr = window.devicePixelRatio || 1
    this.c.width = window.innerWidth * dpr
    this.c.height = window.innerHeight * dpr
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  }

  onMouseDown(e) {
    if (!this.clickEnabled) return
    this.isDown = true
    this.lastPos = { x: e.clientX, y: e.clientY }
    this.boom(this.lastPos.x, this.lastPos.y)
  }

  onMouseMove(e) {
    if (!this.trailEnabled) return
    if (!this.isDown) return
    const p = { x: e.clientX, y: e.clientY }
    if (!this.lastPos) this.lastPos = p
    const dist = Math.hypot(p.x - this.lastPos.x, p.y - this.lastPos.y)
    if (this.lastPos && dist > 2) {
      this.trail.push({ x: p.x, y: p.y, life: 1 })
      this.lastPos = p
      if (this.trail.length > this.maxTrail) this.trail.shift()
      if (Math.random() < 0.3) {
        const a = Math.random() * Math.PI * 2
        const speedAdjust = this.scale / 1.5
        this.sparks.push({
          x: p.x + Math.cos(a) * 10 * this.scale,
          y: p.y + Math.sin(a) * 10 * this.scale,
          vx: Math.cos(a) * 1.3 * speedAdjust,
          vy: Math.sin(a) * 1.3 * speedAdjust,
          rot: Math.random() * Math.PI * 2,
          rs: 0.16, s: 9 * this.scale, a: 0.7, f: 0.95,
        })
      }
    }
  }

  onTouchStart(e) {
    if (!this.clickEnabled) return
    const t = e.touches[0]
    this.isDown = true
    this.lastPos = { x: t.clientX, y: t.clientY }
    this.boom(this.lastPos.x, this.lastPos.y)
  }

  onTouchMove(e) {
    if (!this.trailEnabled) return
    if (!this.isDown) return
    const t = e.touches[0]
    const p = { x: t.clientX, y: t.clientY }
    if (!this.lastPos) this.lastPos = p
    const dist = Math.hypot(p.x - this.lastPos.x, p.y - this.lastPos.y)
    if (this.lastPos && dist > 2) {
      this.trail.push({ x: p.x, y: p.y, life: 1 })
      this.lastPos = p
      if (this.trail.length > this.maxTrail) this.trail.shift()
      if (Math.random() < 0.3) {
        const a = Math.random() * Math.PI * 2
        const speedAdjust = this.scale / 1.5
        this.sparks.push({
          x: p.x + Math.cos(a) * 10 * this.scale,
          y: p.y + Math.sin(a) * 10 * this.scale,
          vx: Math.cos(a) * 1.3 * speedAdjust,
          vy: Math.sin(a) * 1.3 * speedAdjust,
          rot: Math.random() * Math.PI * 2,
          rs: 0.16, s: 9 * this.scale, a: 0.7, f: 0.95,
        })
      }
    }
  }

  boom(x, y) {
    let wave
    if (this.wavePool.length > 0) {
      wave = this.wavePool.pop()
      wave.x = x; wave.y = y; wave.life = 0; wave.max = 18; wave.r = 0
      wave.ring.ang = Math.random() * Math.PI * 2; wave.ring.life = 0
    } else {
      wave = {
        x, y, life: 0, max: 18, r: 0,
        ring: {
          ang: Math.random() * Math.PI * 2,
          segs: [
            { off: -0.25 * Math.PI, len: 1.15 * Math.PI },
            { off: 0.00 * Math.PI, len: 1.15 * Math.PI },
            { off: 0.25 * Math.PI, len: 1.15 * Math.PI },
          ],
          life: 0, maxLife: 30, rs: 0.08,
        },
      }
    }
    this.waves.push(wave)
    const particleCount = 4
    const speedAdjust = this.scale / 1.5
    for (let i = 0; i < particleCount; i++) {
      const a = Math.random() * Math.PI * 2
      const speed = (4.8 + Math.random() * 2) * speedAdjust
      let spark
      if (this.sparkPool.length > 0) {
        spark = this.sparkPool.pop()
        spark.x = x; spark.y = y
        spark.vx = Math.cos(a) * speed; spark.vy = Math.sin(a) * speed
        spark.rot = Math.random() * Math.PI * 2
        spark.rs = (Math.random() - 0.5) * 0.28
        spark.s = (4 + Math.random() * 3) * this.scale
        spark.a = 1; spark.f = 0.9
      } else {
        spark = {
          x, y, vx: Math.cos(a) * speed, vy: Math.sin(a) * speed,
          rot: Math.random() * Math.PI * 2, rs: (Math.random() - 0.5) * 0.28,
          s: (4 + Math.random() * 3) * this.scale, a: 1, f: 0.9,
        }
      }
      this.sparks.push(spark)
    }
  }

  loop(now) {
    const deltaMs = Math.min(now - this.lastFrameTime, this.maxDeltaMs)
    this.lastFrameTime = now
    const frameScale = (deltaMs / this.baseFrameMs) * this.speed
    const hasContent = this.waves.length > 0 || this.sparks.length > 0 || this.trail.length > 0
    if (hasContent) {
      this.ctx.clearRect(0, 0, this.c.width, this.c.height)
      this.ctx.globalCompositeOperation = 'lighter'
      // trail fade
      for (let i = this.trail.length - 1; i >= 0; i--) {
        this.trail[i].life -= (this.isDown ? 0.085 : 0.18) * frameScale
        if (this.trail[i].life <= 0) this.trail.splice(i, 1)
      }
      // draw trail
      if (this.trail.length > 1) {
        this.ctx.lineWidth = 5.0
        this.ctx.shadowColor = `rgba(${this.color}, 0.6)`
        this.ctx.shadowBlur = 3
        this.ctx.shadowOffsetX = 0
        this.ctx.shadowOffsetY = 0
        const lastIdx = this.trail.length - 1
        for (let i = 0; i < lastIdx; i++) {
          const a0 = this.trail[i], a1 = this.trail[i + 1]
          const segGrad = this.ctx.createLinearGradient(a0.x, a0.y, a1.x, a1.y)
          segGrad.addColorStop(0, `rgba(${this.color}, ${i / lastIdx})`)
          segGrad.addColorStop(1, `rgba(${this.color}, ${(i + 1) / lastIdx})`)
          this.ctx.beginPath(); this.ctx.moveTo(a0.x, a0.y); this.ctx.lineTo(a1.x, a1.y)
          this.ctx.strokeStyle = segGrad; this.ctx.stroke()
        }
        this.ctx.shadowColor = 'transparent'
      }
      // draw waves
      for (let i = this.waves.length - 1; i >= 0; i--) {
        const w = this.waves[i]
        w.life += frameScale
        const progress = w.life / w.max
        const ease = 1 - Math.pow(1 - Math.min(progress, 1), 3)
        w.r = 26 * this.scale * ease
        const alpha = Math.max(0, 1 - progress)
        if (alpha > 0) {
          this.ctx.beginPath(); this.ctx.arc(w.x, w.y, w.r, 0, Math.PI * 2)
          this.ctx.fillStyle = `rgba(${this.color},${this.alpha(alpha)})`; this.ctx.fill()
        }
        const r = w.ring; r.life += frameScale
        const rProg = Math.min(r.life / r.maxLife, 1); r.ang -= r.rs * frameScale
        r.segs.forEach((seg) => {
          const shrink = Math.max(0, 1 - rProg)
          const start = r.ang + seg.off
          this.ctx.beginPath()
          this.ctx.arc(w.x, w.y, w.r + 3 * this.scale, start, start + seg.len * shrink)
          this.ctx.lineWidth = 3.7
          this.ctx.strokeStyle = `rgba(245,248,252,${this.alpha(1 - rProg)})`
          this.ctx.stroke()
        })
        if (progress >= 1 && rProg >= 1) { this.wavePool.push(this.waves[i]); this.waves.splice(i, 1) }
      }
      // draw sparks
      for (let i = this.sparks.length - 1; i >= 0; i--) {
        const s = this.sparks[i]
        s.x += s.vx * frameScale; s.y += s.vy * frameScale
        s.vx *= Math.pow(s.f, frameScale); s.vy *= Math.pow(s.f, frameScale)
        s.rot += s.rs * frameScale; s.a -= 0.032 * frameScale
        if (s.a <= 0) { this.sparkPool.push(this.sparks[i]); this.sparks.splice(i, 1); continue }
        this.ctx.save(); this.ctx.translate(s.x, s.y); this.ctx.rotate(s.rot)
        this.ctx.beginPath()
        this.ctx.moveTo(0, -s.s); this.ctx.lineTo(s.s * 0.6, s.s * 0.6); this.ctx.lineTo(-s.s * 0.6, s.s * 0.6)
        this.ctx.fillStyle = `rgba(255,255,255,${this.alpha(s.a)})`; this.ctx.fill()
        this.ctx.restore()
      }
      this.ctx.globalCompositeOperation = 'source-over'
    }
    requestAnimationFrame((nextNow) => this.loop(nextNow))
  }

  destroy() {
    window.removeEventListener('resize', this._resizeHandler)
    window.removeEventListener('mousedown', this._mouseDownHandler)
    window.removeEventListener('mousemove', this._mouseMoveHandler)
    window.removeEventListener('mouseup', this._mouseUpHandler)
    window.removeEventListener('touchstart', this._touchStartHandler)
    window.removeEventListener('touchmove', this._touchMoveHandler)
    window.removeEventListener('touchend', this._touchEndHandler)
  }
}

let sparkInstance = null

onMounted(() => {
  sparkInstance = new MouseSpark({
    color: settings.trailColor,
    scale: settings.trailScale,
    opacity: 1.0, speed: 1.0,
  })
  sparkInstance.trailEnabled = settings.trailEnabled
  sparkInstance.clickEnabled = settings.clickEffectEnabled
})

watch(() => settings.trailEnabled, (v) => { if (sparkInstance) sparkInstance.trailEnabled = v })
watch(() => settings.clickEffectEnabled, (v) => { if (sparkInstance) sparkInstance.clickEnabled = v })
watch(() => settings.trailColor, (v) => { if (sparkInstance) sparkInstance.color = v })
watch(() => settings.trailScale, (v) => { if (sparkInstance) sparkInstance.scale = v })

onUnmounted(() => { if (sparkInstance) sparkInstance.destroy() })
</script>

<template>
  <canvas v-show="settings.trailEnabled || settings.clickEffectEnabled" id="sparkCanvas"
    style="position:fixed;top:0;left:0;width:100%;height:100%;z-index:9999;pointer-events:none;">
  </canvas>
</template>
