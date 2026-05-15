export function matchesSearch(text: string, query: string) {
  const q = query.trim().toLowerCase()
  if (!q) return true
  return text.toLowerCase().includes(q)
}
