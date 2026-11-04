import React from 'react';

const App = ({ children }) => {
  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '1rem', fontFamily: 'sans-serif' }}>
      <header
        style={{ marginBottom: '2rem', borderBottom: '1px solid #ddd', paddingBottom: '1rem' }}
      >
        <h1 style={{ margin: 0, fontSize: '1.5rem' }}>Qwen3-TTS</h1>
      </header>
      <main>{children}</main>
    </div>
  );
};

export default App;
