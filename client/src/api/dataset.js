const BASE = '/api'

export const fetchCharacters = async () => {
  const resp = await fetch(`${BASE}/dataset/characters`)
  if (!resp.ok) throw new Error('Failed to fetch characters')
  const data = await resp.json()
  return data.characters || []
}