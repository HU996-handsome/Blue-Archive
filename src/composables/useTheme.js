import { ref, watchEffect } from 'vue'

const themes = {
  'arona-blue': {
    label: 'Arona Blue',
    accent1: '#2dafff',
    accent2: '#4dc9f6',
    accent3: '#f5c842',
    accent4: '#ff9ecd',
    baBlue: '#2dafff',
    baDark: '#0b1a2e',
    glassBorder: 'rgba(45, 175, 255, 0.15)',
    glassCardBorder: 'rgba(45, 175, 255, 0.12)',
    glassCardShadow: '0 8px 32px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(45, 175, 255, 0.08)',
    glassCardHoverShadow: '0 16px 48px rgba(0, 0, 0, 0.35), 0 0 20px rgba(45, 175, 255, 0.08)',
    gradientBorder: 'linear-gradient(135deg, rgba(45, 175, 255, 0.2), transparent 50%, rgba(45, 175, 255, 0.08))',
    scrollbarThumb: 'rgba(45, 175, 255, 0.15)',
    scrollbarThumbHover: 'rgba(45, 175, 255, 0.3)',
    btnShadow: 'rgba(45, 175, 255, 0.4)',
  },
  'plana-pink': {
    label: 'Plana Pink',
    accent1: '#ff6b9d',
    accent2: '#ff9ecd',
    accent3: '#f5c842',
    accent4: '#c9b1ff',
    baBlue: '#ff6b9d',
    baDark: '#1a0b1e',
    glassBorder: 'rgba(255, 107, 157, 0.15)',
    glassCardBorder: 'rgba(255, 107, 157, 0.12)',
    glassCardShadow: '0 8px 32px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 107, 157, 0.08)',
    glassCardHoverShadow: '0 16px 48px rgba(0, 0, 0, 0.35), 0 0 20px rgba(255, 107, 157, 0.08)',
    gradientBorder: 'linear-gradient(135deg, rgba(255, 107, 157, 0.2), transparent 50%, rgba(255, 107, 157, 0.08))',
    scrollbarThumb: 'rgba(255, 107, 157, 0.15)',
    scrollbarThumbHover: 'rgba(255, 107, 157, 0.3)',
    btnShadow: 'rgba(255, 107, 157, 0.4)',
  },
  'sakura': {
    label: 'Sakura',
    accent1: '#ffb7c5',
    accent2: '#ffd4e0',
    accent3: '#f5c842',
    accent4: '#a8e6cf',
    baBlue: '#ffb7c5',
    baDark: '#1a1018',
    glassBorder: 'rgba(255, 183, 197, 0.15)',
    glassCardBorder: 'rgba(255, 183, 197, 0.12)',
    glassCardShadow: '0 8px 32px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 183, 197, 0.08)',
    glassCardHoverShadow: '0 16px 48px rgba(0, 0, 0, 0.35), 0 0 20px rgba(255, 183, 197, 0.08)',
    gradientBorder: 'linear-gradient(135deg, rgba(255, 183, 197, 0.2), transparent 50%, rgba(255, 183, 197, 0.08))',
    scrollbarThumb: 'rgba(255, 183, 197, 0.15)',
    scrollbarThumbHover: 'rgba(255, 183, 197, 0.3)',
    btnShadow: 'rgba(255, 183, 197, 0.4)',
  },
  'golden': {
    label: 'Golden',
    accent1: '#f5c842',
    accent2: '#ffd700',
    accent3: '#ff6b6b',
    accent4: '#ff9ecd',
    baBlue: '#f5c842',
    baDark: '#1a1608',
    glassBorder: 'rgba(245, 200, 66, 0.15)',
    glassCardBorder: 'rgba(245, 200, 66, 0.12)',
    glassCardShadow: '0 8px 32px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(245, 200, 66, 0.08)',
    glassCardHoverShadow: '0 16px 48px rgba(0, 0, 0, 0.35), 0 0 20px rgba(245, 200, 66, 0.08)',
    gradientBorder: 'linear-gradient(135deg, rgba(245, 200, 66, 0.2), transparent 50%, rgba(245, 200, 66, 0.08))',
    scrollbarThumb: 'rgba(245, 200, 66, 0.15)',
    scrollbarThumbHover: 'rgba(245, 200, 66, 0.3)',
    btnShadow: 'rgba(245, 200, 66, 0.4)',
  },
  'midnight': {
    label: 'Midnight',
    accent1: '#a78bfa',
    accent2: '#c4b5fd',
    accent3: '#f5c842',
    accent4: '#ff9ecd',
    baBlue: '#a78bfa',
    baDark: '#0f0b1e',
    glassBorder: 'rgba(167, 139, 250, 0.15)',
    glassCardBorder: 'rgba(167, 139, 250, 0.12)',
    glassCardShadow: '0 8px 32px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(167, 139, 250, 0.08)',
    glassCardHoverShadow: '0 16px 48px rgba(0, 0, 0, 0.35), 0 0 20px rgba(167, 139, 250, 0.08)',
    gradientBorder: 'linear-gradient(135deg, rgba(167, 139, 250, 0.2), transparent 50%, rgba(167, 139, 250, 0.08))',
    scrollbarThumb: 'rgba(167, 139, 250, 0.15)',
    scrollbarThumbHover: 'rgba(167, 139, 250, 0.3)',
    btnShadow: 'rgba(167, 139, 250, 0.4)',
  },
}

const currentTheme = ref(localStorage.getItem('ba-theme') || 'arona-blue')

function applyTheme(name) {
  const t = themes[name]
  if (!t) return
  const r = document.documentElement.style
  r.setProperty('--accent-1', t.accent1)
  r.setProperty('--accent-2', t.accent2)
  r.setProperty('--accent-3', t.accent3)
  r.setProperty('--accent-4', t.accent4)
  r.setProperty('--ba-blue', t.baBlue)
  r.setProperty('--ba-dark', t.baDark)
  r.setProperty('--glass-border', t.glassBorder)
  // glass-card uses hardcoded rgba in style.css, override via CSS vars
  r.setProperty('--glass-card-border', t.glassCardBorder)
  r.setProperty('--glass-card-shadow', t.glassCardShadow)
  r.setProperty('--glass-card-hover-shadow', t.glassCardHoverShadow)
  r.setProperty('--gradient-border', t.gradientBorder)
  r.setProperty('--scrollbar-thumb', t.scrollbarThumb)
  r.setProperty('--scrollbar-thumb-hover', t.scrollbarThumbHover)
  r.setProperty('--btn-shadow', t.btnShadow)
}

watchEffect(() => {
  applyTheme(currentTheme.value)
})

export function useTheme() {
  function setTheme(name) {
    if (!themes[name]) return
    currentTheme.value = name
    localStorage.setItem('ba-theme', name)
    applyTheme(name)
  }

  function getThemes() {
    return Object.entries(themes).map(([key, t]) => ({ key, label: t.label, color: t.accent1 }))
  }

  return { currentTheme, setTheme, getThemes }
}
