const BASE = '/api';

export const fetchCharacters = async () => {
  try {
    const resp = await fetch(`${BASE}/dataset/characters`);
    if (!resp.ok) return [];
    const data = await resp.json();
    return data.characters || [];
  } catch {
    return [];
  }
};
