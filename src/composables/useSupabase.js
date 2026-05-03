import { createClient } from '@supabase/supabase-js'
import { ref, computed } from 'vue'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

const supabase = supabaseUrl && supabaseKey && supabaseKey !== 'your-anon-key-here'
  ? createClient(supabaseUrl, supabaseKey)
  : null

const user = ref(null)
const authLoading = ref(true)

// Check if Supabase is configured
const isConfigured = computed(() => !!supabase)

// Current auth state
const isAuthenticated = computed(() => !!user.value)

// Initialize auth state
if (supabase) {
  supabase.auth.getSession().then(({ data: { session } }) => {
    user.value = session?.user ?? null
    authLoading.value = false
  })

  supabase.auth.onAuthStateChange((_event, session) => {
    user.value = session?.user ?? null
  })
} else {
  authLoading.value = false
}

// Sign up with email/password
async function signUp(email, password) {
  if (!supabase) return { error: 'Supabase 未配置' }
  const { data, error } = await supabase.auth.signUp({ email, password })
  if (error) return { error: error.message }
  return { data }
}

// Sign in with email/password
async function signIn(email, password) {
  if (!supabase) return { error: 'Supabase 未配置' }
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) return { error: error.message }
  return { data }
}

// Sign out
async function signOut() {
  if (!supabase) return
  await supabase.auth.signOut()
  user.value = null
}

// Load user data from Supabase
async function loadUserData() {
  if (!supabase || !user.value) return null
  const { data, error } = await supabase
    .from('user_data')
    .select('data')
    .eq('user_id', user.value.id)
    .single()
  if (error && error.code !== 'PGRST116') { // PGRST116 = no rows
    console.error('Load user data error:', error)
    return null
  }
  return data?.data || null
}

// Save user data to Supabase
async function saveUserData(userData) {
  if (!supabase || !user.value) return
  const { error } = await supabase
    .from('user_data')
    .upsert({
      user_id: user.value.id,
      data: userData,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' })
  if (error) console.error('Save user data error:', error)
}

// Collect all current localStorage data
function collectLocalData() {
  const get = (key, fallback) => {
    try {
      const v = localStorage.getItem(key)
      return v ? JSON.parse(v) : fallback
    } catch { return fallback }
  }
  return {
    settings: get('ba-site-settings', null),
    favorites: get('ba-favorites', []),
    recentVisits: get('ba-recent-visits', []),
    clickStats: get('ba-click-stats', {}),
    gachaHistory: get('ba-gacha-history', []),
    bgmVolume: parseFloat(localStorage.getItem('ba-bgm-volume') ?? '0.7'),
  }
}

// Apply loaded data to localStorage
function applyDataToLocal(data) {
  if (!data) return
  if (data.settings) localStorage.setItem('ba-site-settings', JSON.stringify(data.settings))
  if (data.favorites) localStorage.setItem('ba-favorites', JSON.stringify(data.favorites))
  if (data.recentVisits) localStorage.setItem('ba-recent-visits', JSON.stringify(data.recentVisits))
  if (data.clickStats) localStorage.setItem('ba-click-stats', JSON.stringify(data.clickStats))
  if (data.gachaHistory) localStorage.setItem('ba-gacha-history', JSON.stringify(data.gachaHistory))
  if (data.bgmVolume != null) localStorage.setItem('ba-bgm-volume', data.bgmVolume.toString())
}

// Merge cloud data with local data (cloud takes precedence for conflicts)
function mergeData(cloudData, localData) {
  if (!cloudData) return localData
  if (!localData) return cloudData
  return {
    settings: cloudData.settings || localData.settings,
    favorites: [...new Set([...(cloudData.favorites || []), ...(localData.favorites || [])])],
    recentVisits: (() => {
      const merged = [...(cloudData.recentVisits || []), ...(localData.recentVisits || [])]
      const seen = new Set()
      return merged
        .filter(v => { if (seen.has(v.url)) return false; seen.add(v.url); return true })
        .sort((a, b) => (b.time || 0) - (a.time || 0))
        .slice(0, 10)
    })(),
    clickStats: { ...(localData.clickStats || {}), ...(cloudData.clickStats || {}) },
    gachaHistory: (() => {
      const merged = [...(cloudData.gachaHistory || []), ...(localData.gachaHistory || [])]
      return merged.sort((a, b) => (b.time || 0) - (a.time || 0)).slice(0, 50)
    })(),
    bgmVolume: cloudData.bgmVolume ?? localData.bgmVolume ?? 0.7,
  }
}

// Called on login — merge local into cloud, then reload
async function syncOnLogin() {
  const localData = collectLocalData()
  const cloudData = await loadUserData()
  const merged = mergeData(cloudData, localData)
  applyDataToLocal(merged)
  await saveUserData(merged)
  return merged
}

// Called on logout — save current data to cloud, then clear local user data
async function syncOnLogout() {
  const localData = collectLocalData()
  await saveUserData(localData)
  // Clear user-specific localStorage (keep onboarding)
  const keepKeys = ['ba-onboarding-done-v2']
  const allKeys = [
    'ba-site-settings', 'ba-favorites', 'ba-recent-visits',
    'ba-click-stats', 'ba-gacha-history', 'ba-bgm-volume',
  ]
  allKeys.forEach(k => { if (!keepKeys.includes(k)) localStorage.removeItem(k) })
}

// Debounced save — avoid too many writes
let saveTimer = null
function debouncedSave() {
  if (saveTimer) clearTimeout(saveTimer)
  saveTimer = setTimeout(() => {
    if (user.value) {
      saveUserData(collectLocalData())
    }
  }, 1000)
}

// Immediate save — for critical operations (favorites, etc.)
function saveNow() {
  if (saveTimer) { clearTimeout(saveTimer); saveTimer = null }
  if (user.value) {
    saveUserData(collectLocalData())
  }
}

// Save before page unload — uses keepalive so request completes after page closes
function saveBeforeUnload() {
  if (!supabase || !user.value) return
  const data = collectLocalData()
  fetch(`${supabaseUrl}/rest/v1/user_data?on_conflict=user_id`, {
    method: 'POST',
    keepalive: true,
    headers: {
      'Content-Type': 'application/json',
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
      'Prefer': 'resolution=merge-duplicates,return=minimal',
    },
    body: JSON.stringify({
      user_id: user.value.id,
      data: data,
      updated_at: new Date().toISOString(),
    }),
  }).catch(() => {})
}

export function useSupabase() {
  return {
    supabase,
    user,
    authLoading,
    isConfigured,
    isAuthenticated,
    signUp,
    signIn,
    signOut,
    loadUserData,
    saveUserData,
    syncOnLogin,
    syncOnLogout,
    debouncedSave,
    saveNow,
    saveBeforeUnload,
    collectLocalData,
    applyDataToLocal,
  }
}
