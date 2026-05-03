<script setup>
import { ref, computed, inject } from 'vue'

const t = inject('t')

const quotes = computed(() => t('quotes'))

const current = computed(() => quotes.value[Math.floor(Math.random() * quotes.value.length)])
</script>

<template>
  <div class="daily-quote glass-card">
    <div class="quote-icon">💬</div>
    <div class="quote-content">
      <p class="quote-text">「{{ current.text }}」</p>
      <span class="quote-char">—— {{ current.char }}</span>
    </div>
  </div>
</template>

<style scoped>
.daily-quote {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 18px;
  margin-bottom: 24px;
  cursor: default;
}

.quote-icon {
  font-size: 1.4rem;
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background: rgba(245, 200, 66, 0.08);
}

.quote-content {
  flex: 1;
  min-width: 0;
}

.quote-text {
  font-size: 0.88rem;
  color: var(--text-primary);
  line-height: 1.6;
  margin-bottom: 4px;
}

.quote-char {
  font-size: 0.72rem;
  color: #f5c842;
  opacity: 0.8;
}
</style>
