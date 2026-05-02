<script setup>
import { ref, inject } from 'vue'
import { useSupabase } from '../composables/useSupabase.js'

const showAuth = inject('showAuth')
const closeAuth = inject('closeAuth')
const onAuthSuccess = inject('onAuthSuccess')

const { signIn, signUp, isConfigured } = useSupabase()

const mode = ref('login') // 'login' | 'register'
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const errorMsg = ref('')
const loading = ref(false)
const rememberMe = ref(true)

function resetForm() {
  email.value = ''
  password.value = ''
  confirmPassword.value = ''
  errorMsg.value = ''
  loading.value = false
}

function switchMode() {
  mode.value = mode.value === 'login' ? 'register' : 'login'
  errorMsg.value = ''
}

async function handleSubmit() {
  errorMsg.value = ''

  if (!email.value.trim() || !password.value.trim()) {
    errorMsg.value = '请填写邮箱和密码'
    return
  }

  if (mode.value === 'register') {
    if (password.value.length < 6) {
      errorMsg.value = '密码至少 6 位'
      return
    }
    if (password.value !== confirmPassword.value) {
      errorMsg.value = '两次密码不一致'
      return
    }
  }

  loading.value = true

  if (mode.value === 'login') {
    // Save remember preference before login
    localStorage.setItem('ba-remember-me', rememberMe.value ? '1' : '0')
    const result = await signIn(email.value.trim(), password.value)
    if (result.error) {
      errorMsg.value = result.error === 'Invalid login credentials' ? '邮箱或密码错误' : result.error
      loading.value = false
      return
    }
    loading.value = false
    resetForm()
    onAuthSuccess?.()
    closeAuth()
  } else {
    const result = await signUp(email.value.trim(), password.value)
    if (result.error) {
      errorMsg.value = result.error
      loading.value = false
      return
    }
    if (result.data?.user?.identities?.length === 0) {
      errorMsg.value = '该邮箱已注册'
      loading.value = false
      return
    }
    // Auto-login after registration
    loading.value = false
    resetForm()
    onAuthSuccess?.()
    closeAuth()
  }
}

</script>

<template>
  <Transition name="auth-panel">
    <div v-if="showAuth" class="auth-overlay" @click.self="closeAuth()">
      <div class="auth-panel glass">
        <div class="auth-header">
          <h2 class="auth-title">{{ mode === 'login' ? '🔑 登录' : '📝 注册' }}</h2>
          <button class="close-btn" @click="closeAuth(); resetForm()">✕</button>
        </div>

        <div v-if="!isConfigured" class="auth-notice">
          <p>账号系统尚未配置 Supabase</p>
          <p class="auth-notice-sub">请在 .env 文件中填入 Supabase 凭据</p>
        </div>

        <form v-else class="auth-body" @submit.prevent="handleSubmit">
          <div class="auth-field">
            <label class="auth-label">邮箱</label>
            <input
              v-model="email"
              type="email"
              class="auth-input"
              placeholder="your@email.com"
              autocomplete="email"
            />
          </div>

          <div class="auth-field">
            <label class="auth-label">密码</label>
            <input
              v-model="password"
              type="password"
              class="auth-input"
              placeholder="至少 6 位"
              autocomplete="current-password"
            />
          </div>

          <div v-if="mode === 'register'" class="auth-field">
            <label class="auth-label">确认密码</label>
            <input
              v-model="confirmPassword"
              type="password"
              class="auth-input"
              placeholder="再输一次密码"
              autocomplete="new-password"
            />
          </div>

          <label v-if="mode === 'login'" class="auth-remember">
            <input type="checkbox" v-model="rememberMe" class="auth-remember-cb" />
            <span class="auth-remember-label">自动登录</span>
          </label>

          <div v-if="errorMsg" class="auth-error">{{ errorMsg }}</div>

          <button type="submit" class="btn auth-submit" :disabled="loading">
            {{ loading ? '处理中...' : (mode === 'login' ? '登录' : '注册') }}
          </button>

          <div class="auth-switch">
            <span v-if="mode === 'login'">没有账号？</span>
            <span v-else>已有账号？</span>
            <button type="button" class="auth-switch-btn" @click="switchMode">
              {{ mode === 'login' ? '去注册' : '去登录' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.auth-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  z-index: 600;
  display: flex;
  align-items: center;
  justify-content: center;
}

.auth-panel {
  width: 380px;
  max-width: 92vw;
  border-radius: 20px;
  overflow: hidden;
  background: rgba(11, 26, 46, 0.95);
  backdrop-filter: blur(30px);
  -webkit-backdrop-filter: blur(30px);
  border: 1px solid rgba(45, 175, 255, 0.15);
}

.auth-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px 16px;
  border-bottom: 1px solid rgba(45, 175, 255, 0.08);
}

.auth-title {
  font-size: 1.15rem;
  font-weight: 600;
  color: var(--text-primary);
}

.close-btn {
  background: none;
  border: none;
  color: var(--text-secondary);
  font-size: 1.1rem;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 8px;
  transition: all 0.2s;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.08);
  color: var(--text-primary);
}

.auth-notice {
  padding: 24px;
  text-align: center;
  color: var(--text-secondary);
  font-size: 0.88rem;
}

.auth-notice-sub {
  font-size: 0.75rem;
  opacity: 0.6;
  margin-top: 8px;
}

.auth-body {
  padding: 20px 24px 24px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.auth-field {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.auth-label {
  font-size: 0.78rem;
  font-weight: 500;
  color: var(--text-secondary);
}

.auth-input {
  padding: 10px 14px;
  border-radius: 10px;
  border: 1px solid rgba(45, 175, 255, 0.12);
  background: rgba(255, 255, 255, 0.04);
  color: var(--text-primary);
  font-family: inherit;
  font-size: 0.85rem;
  outline: none;
  transition: all 0.2s;
}

.auth-input:focus {
  border-color: rgba(45, 175, 255, 0.4);
  background: rgba(255, 255, 255, 0.06);
  box-shadow: 0 0 8px rgba(45, 175, 255, 0.12);
}

.auth-input::placeholder {
  color: var(--text-secondary);
  opacity: 0.4;
}

.auth-error {
  font-size: 0.78rem;
  color: #ff6b6b;
  padding: 6px 10px;
  border-radius: 8px;
  background: rgba(255, 107, 107, 0.08);
  border: 1px solid rgba(255, 107, 107, 0.15);
}

.auth-submit {
  width: 100%;
  padding: 11px !important;
  font-size: 0.92rem !important;
  margin-top: 4px;
}

.auth-submit:disabled {
  opacity: 0.5;
  pointer-events: none;
}

.auth-switch {
  text-align: center;
  font-size: 0.78rem;
  color: var(--text-secondary);
}

.auth-switch-btn {
  background: none;
  border: none;
  color: #2dafff;
  cursor: pointer;
  font-family: inherit;
  font-size: 0.78rem;
  padding: 2px 4px;
  transition: all 0.2s;
}

.auth-switch-btn:hover {
  text-shadow: 0 0 8px rgba(45, 175, 255, 0.4);
}

/* Remember me */
.auth-remember {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  user-select: none;
}

.auth-remember-cb {
  width: 16px;
  height: 16px;
  accent-color: #2dafff;
  cursor: pointer;
}

.auth-remember-label {
  font-size: 0.78rem;
  color: var(--text-secondary);
}

/* Panel transitions */
.auth-panel-enter-active {
  transition: opacity 0.25s ease;
}
.auth-panel-leave-active {
  transition: opacity 0.2s ease;
}
.auth-panel-enter-from,
.auth-panel-leave-to {
  opacity: 0;
}
.auth-panel-enter-active .auth-panel {
  animation: authSlideIn 0.3s ease;
}
.auth-panel-leave-active .auth-panel {
  animation: authSlideOut 0.2s ease;
}

@keyframes authSlideIn {
  from { opacity: 0; transform: translateY(16px) scale(0.96); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

@keyframes authSlideOut {
  from { opacity: 1; transform: translateY(0) scale(1); }
  to { opacity: 0; transform: translateY(16px) scale(0.96); }
}
</style>
