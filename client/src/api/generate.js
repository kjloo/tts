const BASE = '/api';

export const generateSpeech = async (payload) => {
  try {
    const resp = await fetch(`${BASE}/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!resp.ok) {
      const errData = await resp.json().catch(() => ({}));
      throw new Error(errData.detail || `HTTP ${resp.status}`);
    }
    const data = await resp.json();
    if (!data.filepath) throw new Error('No filepath in generation response');
    const fileResp = await fetch(data.filepath);
    if (!fileResp.ok) throw new Error('Failed to fetch generated MP3');
    const blob = await fileResp.blob();
    return {
      url: URL.createObjectURL(blob),
      filename: data.filename || data.filepath.split('/').pop() || 'output.mp3',
    };
  } catch (err) {
    throw new Error(err.message || 'Generation failed');
  }
};
