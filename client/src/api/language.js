const BASE = '/api';

export const fetchLanguages = async () => {
  const resp = await fetch(`${BASE}/languages/`);
  if (!resp.ok) throw new Error('Failed to fetch languages');
  const data = await resp.json();
  return data.languages || [];
};
