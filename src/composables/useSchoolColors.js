const schoolColors = {
  Gehenna: '#ff6b6b',
  Trinity: '#74b9ff',
  Millennium: '#a29bfe',
  Abydos: '#ffeaa7',
  Shanhaijing: '#55efc4',
  Hyakkiyako: '#fd79a8',
  RedWinter: '#dfe6e9',
  SRT: '#00cec9',
  Arius: '#636e72',
  Valkyrie: '#e17055',
  ETC: '#b2bec3',
  Tokiwadai: '#e056fd',
  Sakugawa: '#badc58',
}

export function useSchoolColors() {
  function getSchoolColor(school) {
    return schoolColors[school] || '#2dafff'
  }
  return { schoolColors, getSchoolColor }
}
