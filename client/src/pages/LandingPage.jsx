import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { fetchLanguages } from '../api/language';
import { fetchCharacters } from '../api/dataset';
import { generateSpeech } from '../api/generate';

// Memoized shared styles to prevent unnecessary re-render on every state update
const styles = useMemo(
  () => ({
    inputStyle: {
      width: '100%',
      padding: '0.5rem',
      fontSize: '1rem',
      boxSizing: 'border-box',
    },
    labelStyle: { display: 'block', marginBottom: '0.5rem' },
    fieldStyle: { marginBottom: '1rem' },
    helpStyle: { fontSize: '0.8rem', color: '#666', marginTop: '0.25rem' },
  }),
  [],
);

const modeButtonStyle = (active) => ({
  flex: 1,
  padding: '0.65rem 1rem',
  fontSize: '0.95rem',
  fontWeight: 600,
  cursor: 'pointer',
  borderRadius: '4px',
  border: '1px solid #0066cc',
  background: active ? '#0066cc' : '#f2f2f2',
  color: active ? 'white' : '#333',
});

const LandingPage = () => {
  const [mode, setMode] = useState('clone');

  const [languages, setLanguages] = useState([]);
  const [languagesLoading, setLanguagesLoading] = useState(true);
  const [selectedLang, setSelectedLang] = useState('');

  const [characters, setCharacters] = useState([]);
  const [charactersLoading, setCharactersLoading] = useState(true);

  const [selectedName, setSelectedName] = useState('');
  const [selectedRef, setSelectedRef] = useState('');
  const [instruct, setInstruct] = useState('');

  // Common Qwen3-TTS generation settings (generate mode).
  const [temperature, setTemperature] = useState('0.9');
  const [topK, setTopK] = useState('50');
  const [topP, setTopP] = useState('1.0');
  const [repetitionPenalty, setRepetitionPenalty] = useState('1.05');
  const [maxTokens, setMaxTokens] = useState('2048');

  const [text, setText] = useState('');
  const [filename, setFilename] = useState('');
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [mp3Url, setMp3Url] = useState('');
  const [mp3Filename, setMp3Filename] = useState('');

  // Input refs for focus/caret stabilization during state updates and paste
  const textRef = useRef(null);
  const filenameRef = useRef(null);
  const instructRef = useRef(null);

  // Hover state for buttons to ensure instant hover feedback
  const [hoveredButton, setHoveredButton] = useState(null);

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
    const char = characters.find((c) => c.name === speaker);
    setSelectedRef(char ? char.refs[0] || '' : '');
  };

  const handleGenerate = async () => {
    setGenerating(true);
    setError('');
    setMp3Url('');
    setMp3Filename('');

    const payload = {
      mode,
      text,
      lang: selectedLang,
      filename,
    };

    if (mode === 'clone') {
      payload.name = selectedName;
      payload.ref = selectedRef;
    } else {
      payload.instruct = instruct;
      payload.temperature = Number(temperature);
      payload.top_k = Number(topK);
      payload.top_p = Number(topP);
      payload.repetition_penalty = Number(repetitionPenalty);
      payload.max_tokens = Number(maxTokens);
    }

    try {
      const result = await generateSpeech(payload);
      setMp3Url(result.url);
      setMp3Filename(result.filename);
    } catch (err) {
      setError(err.message || 'Generation failed');
    }
    setGenerating(false);
  };

  // Available refs for selected speaker
  const availableRefs = selectedName
    ? characters.find((c) => c.name === selectedName)?.refs || []
    : [];

  const samplingReady =
    [temperature, topK, topP, repetitionPenalty, maxTokens].every(
      (value) => value !== '' && Number.isFinite(Number(value)),
    ) && Number(maxTokens) > 0;

  const commonReady = Boolean(text.trim() && filename.trim() && selectedLang && !generating);
  const modeReady =
    mode === 'clone'
      ? Boolean(selectedName && selectedRef)
      : Boolean(instruct.trim() && samplingReady);

  const canGenerate = commonReady && modeReady;

  const samplingFields = useMemo(
    () => [
      {
        id: 'temperature',
        label: 'Temperature',
        value: temperature,
        onChange: setTemperature,
        min: '0',
        max: '2',
        step: '0.05',
      },
      {
        id: 'top-k',
        label: 'Top K',
        value: topK,
        onChange: setTopK,
        min: '0',
        step: '1',
      },
      {
        id: 'top-p',
        label: 'Top P',
        value: topP,
        onChange: setTopP,
        min: '0',
        max: '1',
        step: '0.05',
      },
      {
        id: 'repetition-penalty',
        label: 'Repetition penalty',
        value: repetitionPenalty,
        onChange: setRepetitionPenalty,
        min: '0',
        step: '0.05',
      },
      {
        id: 'max-tokens',
        label: 'Max tokens',
        value: maxTokens,
        onChange: setMaxTokens,
        min: '1',
        step: '64',
      },
    ],
    [temperature, topK, topP, repetitionPenalty, maxTokens],
  );

  // Handle paste for text inputs using the Clipboard API
  // to ensure immediate response after click, avoiding any
  // async delay from native paste event handling.
  const handlePaste = useCallback((e, setValue) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text/plain');
    if (!pastedText) return;

    setValue((prev) => prev + pastedText);

    // Preserve focus/cursor position after paste
    const input = e.target;
    input.focus();
  }, []);

  // Create input element props with paste handling, hover, and focus stabilization
  const makeInputProps = useCallback(
    (valueRef, value, onChange, inputId, pasteHandler) => ({
      id: inputId,
      value,
      onChange: (e) => onChange(e.target.value),
      onPaste: (e) => pasteHandler(e, onChange),
      ref: valueRef,
    }),
    [],
  );

  return (
    <div style={{ maxWidth: 600, margin: '2rem auto', padding: '1rem', fontFamily: 'sans-serif' }}>
      <header style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <h1 style={{ marginBottom: '0.5rem' }}>Qwen3-TTS</h1>
        <p style={{ color: '#666', marginBottom: '1.5rem' }}>
          Clone a voice from your dataset or generate a new one from a description
        </p>
      </header>

      {/* Mode Selector */}
      <div role="group" aria-label="Generation mode" style={{ display: 'flex', gap: '0.5rem' }}>
        <button
          type="button"
          onClick={() => setMode('clone')}
          onMouseEnter={() => setHoveredButton('clone')}
          onMouseLeave={() => setHoveredButton(null)}
          style={{
            ...modeButtonStyle(mode === 'clone'),
            border: hoveredButton === 'clone' ? '1px solid #004a99' : '1px solid #0066cc',
          }}
        >
          Voice Clone
        </button>
        <button
          type="button"
          onClick={() => setMode('generate')}
          onMouseEnter={() => setHoveredButton('generate')}
          onMouseLeave={() => setHoveredButton(null)}
          style={{
            ...modeButtonStyle(mode === 'generate'),
            border: hoveredButton === 'generate' ? '1px solid #004a99' : '1px solid #0066cc',
          }}
        >
          Generate Voice
        </button>
      </div>
      <p style={{ ...styles.helpStyle, marginBottom: '1.5rem' }}>
        {mode === 'clone'
          ? 'Uses the selected speaker’s reference audio and transcript.'
          : 'Creates a voice from a text description with configurable sampling.'}
      </p>

      {/* Language Dropdown */}
      <div style={styles.fieldStyle}>
        <label htmlFor="language" style={styles.labelStyle}>
          Language:
        </label>
        <select
          id="language"
          value={selectedLang}
          onChange={(e) => setSelectedLang(e.target.value)}
          disabled={languagesLoading}
          style={styles.inputStyle}
        >
          {languages.map((lang) => (
            <option key={lang} value={lang}>
              {lang}
            </option>
          ))}
        </select>
        {languagesLoading && <p style={styles.helpStyle}>Loading languages...</p>}
      </div>

      {mode === 'clone' ? (
        <>
          {/* Speaker Name Dropdown */}
          <div style={styles.fieldStyle}>
            <label htmlFor="name" style={styles.labelStyle}>
              Speaker Name:
            </label>
            <select
              id="name"
              value={selectedName}
              onChange={(e) => handleSpeakerChange(e.target.value)}
              disabled={charactersLoading}
              style={styles.inputStyle}
            >
              {characters.map((char) => (
                <option key={char.name} value={char.name}>
                  {char.name}
                </option>
              ))}
            </select>
            {charactersLoading && <p style={styles.helpStyle}>Loading speakers...</p>}
          </div>

          {/* Reference Label Dropdown (filtered) */}
          <div style={styles.fieldStyle}>
            <label htmlFor="ref" style={styles.labelStyle}>
              Reference Label:
            </label>
            <select
              id="ref"
              value={selectedRef}
              onChange={(e) => setSelectedRef(e.target.value)}
              disabled={charactersLoading || !selectedName}
              style={styles.inputStyle}
            >
              {availableRefs.map((ref) => (
                <option key={ref} value={ref}>
                  {ref}
                </option>
              ))}
            </select>
            {selectedName && !charactersLoading && availableRefs.length === 0 && (
              <p style={{ ...styles.helpStyle, color: 'red' }}>
                No references available for this speaker
              </p>
            )}
          </div>
        </>
      ) : (
        <>
          {/* Voice Instruction */}
          <div style={styles.fieldStyle}>
            <label htmlFor="instruct" style={styles.labelStyle}>
              Voice description:
            </label>
            <textarea
              id="instruct"
              rows={3}
              {...makeInputProps(instructRef, instruct, setInstruct, 'instruct', handlePaste)}
              placeholder="A calm, deep male voice with a slight British accent..."
              style={styles.inputStyle}
            />
          </div>

          {/* Sampling Settings */}
          <fieldset
            style={{
              marginBottom: '1rem',
              border: '1px solid #ddd',
              borderRadius: '4px',
              padding: '0.75rem 1rem',
            }}
          >
            <legend style={{ padding: '0 0.25rem', fontSize: '0.9rem', color: '#444' }}>
              Generation settings
            </legend>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              {samplingFields.map((field) => (
                <label
                  key={field.id}
                  htmlFor={field.id}
                  style={{ display: 'block', fontSize: '0.9rem' }}
                >
                  {field.label}
                  <input
                    id={field.id}
                    type="number"
                    value={field.value}
                    onChange={(e) => field.onChange(e.target.value)}
                    min={field.min}
                    max={field.max}
                    step={field.step}
                    style={{ ...styles.inputStyle, marginTop: '0.25rem' }}
                  />
                </label>
              ))}
            </div>
          </fieldset>
        </>
      )}

      {/* Text Input */}
      <div style={styles.fieldStyle}>
        <label htmlFor="text" style={styles.labelStyle}>
          Text to speak:
        </label>
        <textarea
          id="text"
          rows={3}
          {...makeInputProps(textRef, text, setText, 'text', handlePaste)}
          placeholder="Enter the text you want to convert to speech..."
          style={styles.inputStyle}
        />
      </div>

      {/* Filename Input */}
      <div style={styles.fieldStyle}>
        <label htmlFor="filename" style={styles.labelStyle}>
          Output filename (without .mp3):
        </label>
        <input
          id="filename"
          type="text"
          {...makeInputProps(filenameRef, filename, setFilename, 'filename', handlePaste)}
          placeholder="my_audio_file"
          style={styles.inputStyle}
        />
        <p style={styles.helpStyle}>
          {mode === 'clone'
            ? 'Saved as <speaker>_<filename>_01.mp3, incrementing the number if it already exists.'
            : 'Saved as Design_<filename>_01.mp3, incrementing the number if it already exists.'}
        </p>
      </div>

      {/* Generate Button */}
      <div style={{ textAlign: 'center', marginTop: '1rem' }}>
        <button
          type="button"
          onClick={handleGenerate}
          onMouseEnter={() => setHoveredButton('generate-btn')}
          onMouseLeave={() => setHoveredButton(null)}
          disabled={!canGenerate}
          style={{
            padding: '0.75rem 1.5rem',
            fontSize: '1rem',
            cursor: canGenerate ? 'pointer' : 'not-allowed',
            background: canGenerate ? '#0066cc' : '#cccccc',
            color: 'white',
            border: hoveredButton === 'generate-btn' ? '1px solid #004a99' : 'none',
            borderRadius: '4px',
            width: '100%',
            maxWidth: '300px',
          }}
        >
          {generating ? 'Generating...' : mode === 'clone' ? 'Clone Voice' : 'Generate MP3'}
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

      {/* MP3 Player and Download Link */}
      {mp3Url && (
        <div style={{ marginTop: '1rem', textAlign: 'center' }}>
          <audio
            controls
            src={mp3Url}
            style={{ width: '100%', maxWidth: '400px', marginBottom: '0.5rem' }}
          >
            Your browser does not support the audio element.
          </audio>
          <div>
            <a
              href={mp3Url}
              download={mp3Filename || 'output.mp3'}
              style={{ color: 'green', textDecoration: 'underline', fontWeight: 500 }}
            >
              Download {mp3Filename || 'output.mp3'}
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingPage;
