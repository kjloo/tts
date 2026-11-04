const BASE = '/api';

export const fetchLanguages = async () => {
  try {
    const resp = await fetch(`${BASE}/languages/`);
    if (!resp.ok) return [];
    const data = await resp.json();
    return data.languages || [];
  } catch {
    return [];
  }
};
