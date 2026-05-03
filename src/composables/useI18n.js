import { ref } from 'vue'
import zh from '../i18n/zh'
import ja from '../i18n/ja'

const messages = { zh, ja }
const locale = ref(localStorage.getItem('ba-locale') || 'zh')

function t(key, params) {
  const keys = key.split('.')
  let val = messages[locale.value]
  for (const k of keys) {
    if (val == null) return key
    val = val[k]
  }
  if (val == null) return key
  if (params && typeof val === 'string') {
    return val.replace(/\{(\w+)\}/g, (_, name) => params[name] ?? '')
  }
  return val
}

function setLocale(lang) {
  locale.value = lang
  localStorage.setItem('ba-locale', lang)
}

export function useI18n() {
  return { locale, t, setLocale }
}
