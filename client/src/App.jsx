import React, { useState, useEffect } from 'react';
import { fetchLanguages } from './api/language';
import { fetchCharacters } from './api/dataset';
import { generateSpeech } from './api/generate';

const App = () => {
  const [languages, setLanguages] = useState([]);
  const [languagesLoading, setLanguagesLoading] = useState(true);

  const [characters, setCharacters] = useState([]);
  const [charactersLoading] = useState(true);

  const [selectedLang, setSelectedLang] = useState('');
  const [selectedName, setSelectedName] = useState('');
  const [selectedRef, setSelectedRef] = useState('');
  const [text, setText] = useState('');
  const [filename, setFilename] = useState('');
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [mp3Url, setMp3Url] = useState('');

  // Fetch languages on mount
  useEffect(() => {
    setLanguagesLoading(true);
    fetchLanguages()
      .then((langs) => {
        setLanguages(langs);
        setSelectedLang(langs[0] || '');
      })
      .finally(() => setLanguagesLoading(false));
  }, []);

  // Fetch characters (with refs) on mount
  useEffect(() => {
    setCharactersLoading(true);
    fetchCharacters()
      .then((chars) => {
        setCharacters(chars);
        if (chars.length > 0) {
          setSelectedName(chars[0].name);
          setSelectedRef(chars[0].refs[0] || '');
        }
      })
      .finally(() => setCharactersLoading(false));
  }, []);

  const handleGenerate = async () => {
    setGenerating(true);
    setError('');
    try {
      const url = await generateSpeech({
        text,
        lang: selectedLang,
        name: selectedName,
        ref: selectedRef,
      });
      setMp3Url(url);
    } catch (err) {
      setError(err.message || 'Generation failed');
    }
    setGenerating(false);
  };

  return (
    <div style={{ maxWidth: 600, margin: '2rem auto', padding: '1rem', fontFamily: 'sans-serif' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '1rem' }}>Qwen3-TTS Generator</h1>

      {/* Language Dropdown */}
      <div style={{ marginBottom: '1rem' }}>
        <label htmlFor="language" style={{ display: 'block', marginBottom: '0.5rem' }}>
          Language:
        </label>
        <select
          id="language"
          value={selectedLang}
          onChange={(e) => {
            setSelectedLang(e.target.value);
            // When language changes, could reload names if needed - kept simple
          }}
        >
          <option value="">Select a language</option>
          {languages.map((lang) => (
            <option key={lang} value={lang}>
              {lang}
            </option>
          ))}
        </select>
        {languagesLoading && (
          <p style={{ fontSize: '0.8rem', color: 'gray' }}>Loading languages...</p>
        )}
      </div>

      {/* Name/Ref Selector - populated from characters endpoint */}
      <div style={{ marginBottom: '1rem' }}>
        <label htmlFor="name" style={{ display: 'block', marginBottom: '0.5rem' }}>
          Name with Ref:
        </label>
        <select id="name" value={selectedName} onChange={(e) => setSelectedName(e.target.value)}>
          <option value="">Select a name</option>
          {characters.map((char) => (
            <option key={char.name} value={char.name}>
              {char.name}
            </option>
          ))}
        </select>
        {charactersLoading && <p style={{ fontSize: '0.8rem', color: 'gray' }}>Loading names...</p>}
      </div>

      {/* Text Input */}
      <div style={{ marginBottom: '1rem' }}>
        <label htmlFor="text" style={{ display: 'block', marginBottom: '0.5rem' }}>
          Text to speak:
        </label>
        <textarea
          id="text"
          rows={3}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter the text you want to convert to speech..."
        ></textarea>
      </div>

      {/* Filename Input */}
      <div style={{ marginBottom: '1rem' }}>
        <label htmlFor="filename" style={{ display: 'block', marginBottom: '0.5rem' }}>
          Output filename (without .mp3):
        </label>
        <input
          id="filename"
          value={filename}
          onChange={(e) => setFilename(e.target.value)}
          placeholder="my_audio_file"
        />
      </div>

      {/* Generate Button */}
      <div style={{ textAlign: 'center', marginTop: '1rem' }}>
        <button
          onClick={handleGenerate}
          disabled={generating || !selectedLang || !selectedName || !text || !filename}
          style={{
            padding: '0.75rem 1.5rem',
            fontSize: '1rem',
            cursor: generating ? 'not-allowed' : 'pointer',
            background: generating ? '#cccccc' : '#0066cc',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
          }}
        >
          {generating ? 'Generating...' : 'Generate MP3'}
        </button>
      </div>

      {/* Error Message */}
      {error && <div style={{ marginTop: '1rem', color: 'red', textAlign: 'center' }}>{error}</div>}

      {/* MP3 Download Link */}
      {mp3Url && (
        <div style={{ marginTop: '1rem', textAlign: 'center' }}>
          <a
            href={mp3Url}
            download={filename ? `${filename}.mp3` : 'output.mp3'}
            style={{ color: 'green', textDecoration: 'underline' }}
          >
            Download {filename || 'output.mp3'}
          </a>
        </div>
      )}
    </div>
  );
};

export default App;
