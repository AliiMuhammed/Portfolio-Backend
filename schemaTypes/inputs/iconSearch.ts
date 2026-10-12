import {isIconId} from './iconIdentifiers'
const cache = new Map<string, {time: number; icons: string[]}>()
export async function searchIcons(query: string, signal: AbortSignal, fetcher: typeof fetch = fetch): Promise<string[]> {
  const term = query.trim().replace(/\s+/g, ' ').toLowerCase()
  if (term.length < 2) return []
  const saved = cache.get(term)
  if (saved && Date.now() - saved.time < 300000) return saved.icons
  const response = await fetcher(`https://api.iconify.design/search?${new URLSearchParams({query: term, limit: '32'})}`, {signal, credentials: 'omit', referrerPolicy: 'no-referrer'})
  if (!response.ok) throw new Error('Icon search is unavailable. Try again or choose a local favorite.')
  const data = await response.json()
  if (!Array.isArray(data.icons)) throw new Error('The icon service returned an unreadable response.')
  const icons = [...new Set<string>(data.icons.filter((id: unknown) => isIconId(id) && !id.startsWith('local:')))].slice(0, 32)
  if (!signal.aborted) {
    if (cache.size >= 50) cache.delete(cache.keys().next().value!)
    cache.set(term, {time: Date.now(), icons})
  }
  return icons
}
