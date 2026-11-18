// Shared styles for LandingPage.jsx.
// Moved out of the component file so style definitions live next to the
// component they belong to, and are imported rather than declared inline.

export const styles = {
  inputStyle: {
    width: '100%',
    padding: '0.5rem',
    paddingRight: '0.75rem', // padding on the right so the native select arrow isn't squished
    fontSize: '1rem',
    boxSizing: 'border-box',
  },
  labelStyle: { display: 'block', marginBottom: '0.5rem' },
  fieldStyle: { marginBottom: '1rem' },
  helpStyle: { fontSize: '0.8rem', color: '#666', marginTop: '0.25rem' },
};

// Select-specific style: same as inputStyle but with a custom dropdown arrow
// positioned with clear space from the right edge.
export const selectStyle = {
  ...styles.inputStyle,
  paddingLeft: '0.75rem',
  paddingRight: '2rem', // extra space for the custom arrow
  appearance: 'none',
  WebkitAppearance: 'none',
  MozAppearance: 'none',
  backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23333' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 0.75rem center',
  backgroundSize: '1rem',
};

export const modeButtonStyle = (active) => ({
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

// Flex row that holds the speaker dropdown and its dice button side by side.
export const speakerRowStyle = {
  display: 'flex',
  gap: '0.5rem',
  alignItems: 'center',
};

// Borderless icon button for the random-speaker dice icon.
// Explicitly removes the browser default button border and background so it
// looks like a plain icon rather than a raised button.
// Default color is muted; on hover it transitions to a slightly darker muted
// color to indicate clickability.
export const randomSpeakerButtonStyle = {
  display: 'flex',
  alignItems: 'center',
  padding: '0.35rem',
  fontSize: '1rem',
  cursor: 'pointer',
  border: 'none',
  borderRadius: '4px',
  background: 'transparent',
  color: '#777',
  transition: 'color 0.2s',
};
