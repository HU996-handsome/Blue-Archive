<script setup>
import { ref, computed, onMounted, inject } from 'vue'
import { useSchoolColors } from '../composables/useSchoolColors.js'

const t = inject('t')
const locale = inject('locale')
const { getSchoolColor } = useSchoolColors()

const giftsData = ref(null)
const selectedSchool = ref('Gehenna')

onMounted(async () => {
  try {
    const res = await fetch('/assets/gifts.json')
    giftsData.value = await res.json()
  } catch (e) {
    console.error('Failed to load gifts:', e)
  }
})

const schools = computed(() => {
  if (!giftsData.value) return []
  return Object.keys(giftsData.value.preferences)
})

function getGift(id) {
  return giftsData.value?.gifts.find(g => g.id === id)
}

function getGiftName(gift) {
  if (!gift) return ''
  return locale.value === 'ja' ? gift.name.ja : gift.name.zh
}

const preferences = computed(() => {
  if (!giftsData.value) return null
  return giftsData.value.preferences[selectedSchool.value]
})
</script>

<template>
  <div class="gg-section glass-card">
    <div class="gg-header">
      <span class="gg-icon">🎁</span>
      <span class="gg-title">{{ t('tools.giftGuide') || '礼物偏好' }}</span>
    </div>
    <div class="gg-schools">
      <button
        v-for="s in schools"
        :key="s"
        class="gg-school-btn"
        :class="{ active: selectedSchool === s }"
        :style="selectedSchool === s ? { borderColor: getSchoolColor(s), color: getSchoolColor(s) } : {}"
        @click="selectedSchool = s"
      >{{ t('schoolNames.' + s) || s }}</button>
    </div>
    <div v-if="preferences" class="gg-body">
      <div class="gg-category">
        <div class="gg-cat-label">{{ t('tools.lovedGifts') || '喜爱' }} 💖</div>
        <div class="gg-items">
          <div v-for="id in preferences.loved" :key="id" class="gg-item loved">
            <span class="gg-item-icon">{{ getGift(id)?.image }}</span>
            <span class="gg-item-name">{{ getGiftName(getGift(id)) }}</span>
          </div>
        </div>
      </div>
      <div class="gg-category">
        <div class="gg-cat-label">{{ t('tools.likedGifts') || '喜欢' }} 💛</div>
        <div class="gg-items">
          <div v-for="id in preferences.liked" :key="id" class="gg-item liked">
            <span class="gg-item-icon">{{ getGift(id)?.image }}</span>
            <span class="gg-item-name">{{ getGiftName(getGift(id)) }}</span>
          </div>
        </div>
      </div>
      <div class="gg-category">
        <div class="gg-cat-label">{{ t('tools.dislikedGifts') || '不喜欢' }} 💔</div>
        <div class="gg-items">
          <div v-for="id in preferences.disliked" :key="id" class="gg-item disliked">
            <span class="gg-item-icon">{{ getGift(id)?.image }}</span>
            <span class="gg-item-name">{{ getGiftName(getGift(id)) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.gg-section {
  padding: 16px 18px;
  margin-bottom: 20px;
}

.gg-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.gg-icon { font-size: 1.1rem; }
.gg-title { font-size: 0.88rem; font-weight: 600; color: var(--text-primary); }

.gg-schools {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-bottom: 14px;
}

.gg-school-btn {
  padding: 3px 8px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.03);
  color: var(--text-secondary);
  font-size: 0.62rem;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
}

.gg-school-btn.active {
  background: rgba(255, 255, 255, 0.06);
}

.gg-body {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.gg-category {}

.gg-cat-label {
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 6px;
}

.gg-items {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.gg-item {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  border-radius: 8px;
  font-size: 0.68rem;
}

.gg-item.loved {
  background: rgba(255, 107, 157, 0.08);
  border: 1px solid rgba(255, 107, 157, 0.2);
  color: #ff6b9d;
}

.gg-item.liked {
  background: rgba(245, 200, 66, 0.06);
  border: 1px solid rgba(245, 200, 66, 0.15);
  color: #f5c842;
}

.gg-item.disliked {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  color: var(--text-secondary);
  opacity: 0.6;
}

.gg-item-icon { font-size: 0.8rem; }
.gg-item-name { white-space: nowrap; }
</style>
