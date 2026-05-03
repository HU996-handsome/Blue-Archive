import { ref, computed } from 'vue'

let studentsData = null
let loadPromise = null

export function useStudents() {
  const students = ref(studentsData || [])
  const loading = ref(!studentsData)

  async function loadStudents() {
    if (studentsData) { students.value = studentsData; return }
    if (loadPromise) { await loadPromise; students.value = studentsData; return }
    loadPromise = (async () => {
      try {
        const res = await fetch('/assets/students.json')
        studentsData = await res.json()
        students.value = studentsData
      } catch (e) {
        console.error('Failed to load students:', e)
      } finally {
        loading.value = false
      }
    })()
    await loadPromise
  }

  const bySchool = computed(() => {
    const map = {}
    for (const s of students.value) {
      if (!map[s.school]) map[s.school] = []
      map[s.school].push(s)
    }
    return map
  })

  const byStar = computed(() => {
    const map = { 3: [], 2: [], 1: [] }
    for (const s of students.value) {
      if (map[s.star]) map[s.star].push(s)
    }
    return map
  })

  const schools = computed(() => [...new Set(students.value.map(s => s.school))].sort())

  return { students, loading, loadStudents, bySchool, byStar, schools }
}
