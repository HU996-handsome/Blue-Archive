<script setup>
import { ref } from 'vue'

const quotes = [
  { text: '老师，今天也要加油哦！', char: '阿罗娜' },
  { text: '天空真是广啊……另一边会有些什么呢？', char: '阿罗娜' },
  { text: '偶尔也要为自己的健康着想啊，老师，我会很担心的。', char: '阿罗娜' },
  { text: '来，加油吧，老师！', char: '阿罗娜' },
  { text: '确认连接。老师，我在这里。', char: '普拉娜' },
  { text: '混乱，该行动无法理解。', char: '普拉娜' },
  { text: '正在待命，需要解决的任务还有很多。', char: '普拉娜' },
  { text: '老师，您回来了？我等您很久啦！', char: '阿罗娜' },
  { text: '今天又会有什么事情在等着我呢？', char: '阿罗娜' },
  { text: '嗯，不错，今天也是个好天气。', char: '阿罗娜' },
  { text: '老师，请不要戳我，会出现故障。', char: '普拉娜' },
  { text: '我明白了，老师现在无事可做，很无聊。', char: '普拉娜' },
  { text: '等您很久了。', char: '普拉娜' },
  { text: '只要和老师在一起，什么都不怕。', char: '阿罗娜' },
  { text: '老师是我的特别存在。', char: '阿罗娜' },
  { text: '数据同步完成。今日份的老师，比昨天更优秀。', char: '普拉娜' },
  { text: '老师的笑容，是我最珍贵的数据。', char: '普拉娜' },
  { text: '不管发生什么，我都会陪着老师。', char: '阿罗娜' },
  { text: '老师，累了的话就休息一下吧。', char: '阿罗娜' },
  { text: '运算结果：老师的幸运值为 MAX。', char: '普拉娜' },
]

const current = ref(quotes[Math.floor(Math.random() * quotes.length)])
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
