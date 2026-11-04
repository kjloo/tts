import React, { useState, useEffect } from 'react';
import { fetchLanguages } from '../api/language';
import { fetchCharacters } from '../api/dataset';
import { generateSpeech } from '../api/generate';

const LandingPage = () => {
  const [languages, setLanguages] = useState([]);
  const [languagesLoading, setLanguagesLoading] = useState(true);
  const [selectedLang, setSelectedLang] = useState('');

  const [characters, setCharacters] = useState([]);
  const [charactersLoading, setCharactersLoading] = useState(true);

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
      .catch((err) => {
        console.error('Failed to load languages:', err);
        setError(err.message || 'Failed to load languages');
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
      .catch((err) => {
        console.error('Failed to load characters:', err);
        setError(err.message || 'Failed to load characters');
      })
      .finally(() => setCharactersLoading(false));
  }, []);

  // When speaker changes, reset ref selection
  const handleSpeakerChange = (speaker) => {
    setSelectedName(speaker);
    // Get refs for this speaker
    const char = characters.find((c) => c.name === speaker);
    setSelectedRef(char ? char.refs[0] || '' : '');
  };

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

  // Available refs for selected speaker
  const availableRefs = selectedName
    ? characters.find((c) => c.name === selectedName)?.refs || []
    : [];

  const canGenerate =
    selectedName && selectedRef && text && filename && selectedLang && !generating;

  return (
    <div style={{ maxWidth: 600, margin: '2rem auto', padding: '1rem', fontFamily: 'sans-serif' }}>
      <header style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <h1 style={{ marginBottom: '0.5rem' }}>Qwen3-TTS Voice Cloning</h1>
        <p style={{ color: '#666', marginBottom: '1.5rem' }}>
          Generate speech using a reference voice sample
        </p>
      </header>

      {/* Language Dropdown */}
      <div style={{ marginBottom: '1rem' }}>
        <label htmlFor="language" style={{ display: 'block', marginBottom: '0.5rem' }}>
          Language:
        </label>
        <select
          id="language"
          value={selectedLang}
          onChange={(e) => setSelectedLang(e.target.value)}
          disabled={languagesLoading}
        >
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

      {/* Speaker Name Dropdown */}
      <div style={{ marginBottom: '1rem' }}>
        <label htmlFor="name" style={{ display: 'block', marginBottom: '0.5rem' }}>
          Speaker Name:
        </label>
        <select
          id="name"
          value={selectedName}
          onChange={(e) => handleSpeakerChange(e.target.value)}
          disabled={charactersLoading}
        >
          {characters.map((char) => (
            <option key={char.name} value={char.name}>
              {char.name}
            </option>
          ))}
        </select>
        {charactersLoading && (
          <p style={{ fontSize: '0.8rem', color: 'gray' }}>Loading speakers...</p>
        )}
        <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.25rem' }}>
          Speaker with available voice reference samples
        </p>
      </div>

      {/* Reference Label Dropdown (filtered) */}
      <div style={{ marginBottom: '1rem' }}>
        <label htmlFor="ref" style={{ display: 'block', marginBottom: '0.5rem' }}>
          Reference Label:
        </label>
        <select
          id="ref"
          value={selectedRef}
          onChange={(e) => setSelectedRef(e.target.value)}
          disabled={charactersLoading || !selectedName}
        >
          {availableRefs.map((ref) => (
            <option key={ref} value={ref}>
              {ref}
            </option>
          ))}
        </select>
        {selectedName && !charactersLoading && availableRefs.length === 0 && (
          <p style={{ fontSize: '0.8rem', color: 'red' }}>
            No references available for this speaker
          </p>
        )}
        <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.25rem' }}>
          Voice sample reference for the selected speaker
        </p>
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
          style={{ width: '100%', padding: '0.5rem', fontSize: '1rem', boxSizing: 'border-box' }}
        ></textarea>
      </div>

      {/* Filename Input */}
      <div style={{ marginBottom: '1rem' }}>
        <label htmlFor="filename" style={{ display: 'block', marginBottom: '0.5rem' }}>
          Output filename (without .mp3):
        </label>
        <input
          id="filename"
          type="text"
          value={filename}
          onChange={(e) => setFilename(e.target.value)}
          placeholder="my_audio_file"
          style={{ width: '100%', padding: '0.5rem', fontSize: '1rem', boxSizing: 'border-box' }}
        />
      </div>

      {/* Generate Button */}
      <div style={{ textAlign: 'center', marginTop: '1rem' }}>
        <button
          onClick={handleGenerate}
          disabled={!canGenerate}
          style={{
            padding: '0.75rem 1.5rem',
            fontSize: '1rem',
            cursor: canGenerate ? 'pointer' : 'not-allowed',
            background: canGenerate ? '#0066cc' : '#cccccc',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            width: '100%',
            maxWidth: '300px',
          }}
        >
          {generating ? 'Generating...' : 'Generate MP3'}
        </button>
      </div>

      {/* Offline / Empty-state banner */}
      {!languagesLoading && languages.length === 0 && (
        <div
          style={{
            marginTop: '1rem',
            padding: '1rem',
            background: '#fff3cd',
            border: '1px solid #ffc107',
            borderRadius: '4px',
            textAlign: 'center',
            color: '#856404',
          }}
        >
          <strong>Server unreachable.</strong> The local API (port 8000) is not responding. You can
          still use this page; data will load once the server starts.
        </div>
      )}

      {/* Error Message */}
      {error && <div style={{ marginTop: '1rem', color: 'red', textAlign: 'center' }}>{error}</div>}

      {/* MP3 Download Link */}
      {mp3Url && (
        <div style={{ marginTop: '1rem', textAlign: 'center' }}>
          <a
            href={mp3Url}
            download={filename ? `${filename}.mp3` : 'output.mp3'}
            style={{ color: 'green', textDecoration: 'underline', fontWeight: 500 }}
          >
            Download {filename || 'output.mp3'}
          </a>
        </div>
      )}
    </div>
  );
};

export default LandingPage;
