import { useEffect, useState } from 'react'
import './App.css'

type Options = {
  languages: string[]
  names: string[]
  refs: Record<string, string[]>
}

const EMPTY_OPTIONS: Options = { languages: [], names: [], refs: {} }

function App() {
  const [options, setOptions] = useState<Options>(EMPTY_OPTIONS)
  const [name, setName] = useState('')
  const [ref, setRef] = useState('')
  const [lang, setLang] = useState('')
  const [text, setText] = useState('')
  const [out, setOut] = useState('')
  const [audioUrl, setAudioUrl] = useState('')
  const [error, setError] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)

  useEffect(() => {
    fetch('/api/options')
      .then((response) => response.json())
      .then((data: Options) => {
        setOptions(data)
        setName(data.names[0] ?? '')
        setLang(data.languages[0] ?? '')
      })
      .catch(() => setError('Could not reach the TTS server.'))
  }, [])

  const refs = options.refs[name] ?? []
  // Falls back to the first label whenever the selected speaker has no such label.
  const selectedRef = refs.includes(ref) ? ref : refs[0] ?? ''

  async function generate(event: React.FormEvent) {
    event.preventDefault()
    setError('')
    setAudioUrl('')
    setIsGenerating(true)
    try {
      const response = await fetch('/api/clone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, lang, name, ref: selectedRef, out: out || null }),
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.detail ?? 'Generation failed.')
      }
      setAudioUrl(data.url)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Generation failed.')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <main className="page">
      <header>
        <h1>Qwen3-TTS</h1>
        <p>Clone a voice from your dataset.</p>
      </header>

      <form onSubmit={generate}>
        <label>
          Speaker name
          <select value={name} onChange={(event) => setName(event.target.value)} required>
            {options.names.length === 0 && <option value="">No speakers in dataset</option>}
            {options.names.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <label>
          Reference label
          <select value={selectedRef} onChange={(event) => setRef(event.target.value)} required>
            {refs.length === 0 && <option value="">No references for this speaker</option>}
            {refs.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <label>
          Language
          <select value={lang} onChange={(event) => setLang(event.target.value)} required>
            {options.languages.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <label>
          Text
          <textarea
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="Target phrase to say."
            rows={4}
            required
          />
        </label>

        <label>
          Output filename <span className="hint">optional</span>
          <input
            value={out}
            onChange={(event) => setOut(event.target.value)}
            placeholder="auto-named from speaker and language"
          />
        </label>

        <button type="submit" disabled={isGenerating || !name || !selectedRef}>
          {isGenerating ? 'Generating…' : 'Generate'}
        </button>
      </form>

      {error && <p className="error">{error}</p>}

      {audioUrl && (
        <section className="result">
          <audio controls src={audioUrl} />
          <a href={audioUrl} download>
            Download MP3
          </a>
        </section>
      )}
    </main>
  )
}

export default App
