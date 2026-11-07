import { useState } from 'react';
import Dialog from './Dialog.jsx';

/** React port of shell.js utility dialogs (SOS, Help, Happiness, Language, Accessibility). */
export default function UtilityDialog({ kind, onClose, navigate, a11y, toggleContrast, toggleLargeText, toggleReduceMotion }) {
  const go = path => { onClose(); navigate(path); };
  const content = {
    sos: ['SOS', <>
      <p className="coverage-note"><strong>No emergency request has been sent.</strong> This website cannot dispatch emergency services.</p>
      <p>In an emergency, call 999 directly.</p>
    </>],
    help: ['Need Help?', <>
      <p>Call 901 for help with Dubai Police services.</p>
      <button className="secondary" id="help-contact" onClick={() => go('/app/home/contactus')}>Contact Us</button>
    </>],
    happiness: ['Happiness Meter', <Happiness key={kind} />],
    language: ['Language', <>
      <p>Choose your language.</p>
      <button className="primary" id="select-english" onClick={onClose}>English ✓</button>
      <button className="secondary" disabled lang="ar">العربية (coming soon)</button>
    </>],
    accessibility: ['Accessibility options', <>
      <div className="accessibility-options">
        <button className="secondary" id="utility-contrast" onClick={toggleContrast}>Toggle high contrast</button>
        <button className="secondary" id="utility-text" aria-pressed={a11y.largeText} onClick={toggleLargeText}>Toggle larger text</button>
        <button className="secondary" id="utility-motion" aria-pressed={a11y.reduceMotion} onClick={toggleReduceMotion}>Toggle reduced motion</button>
      </div>
      <p>Keyboard navigation and field labels are available throughout the website.</p>
    </>]
  }[kind];

  return (
    <Dialog id="utility-dialog" aria-labelledby="utility-title" open={!!kind} onClose={onClose}>
      <div id="utility-content">
        {content && <>
          <div className="dialog-top"><h2 id="utility-title">{content[0]}</h2><button className="dialog-close" id="utility-close" aria-label="Close" onClick={onClose}>×</button></div>
          {content[1]}
        </>}
      </div>
    </Dialog>
  );
}

function Happiness() {
  const [rating, setRating] = useState(null);
  const options = [['Happy', '☺'], ['Neutral', '😐'], ['Unhappy', '☹']];
  return <>
    <p>How was your experience?</p>
    <div className="happiness-options" role="group" aria-label="Your experience">
      {options.map(([r, glyph]) => (
        <button key={r} className="secondary" data-rating={r} aria-label={r} aria-pressed={rating ? rating === r : undefined} onClick={() => setRating(r)}>{glyph}</button>
      ))}
    </div>
    <p id="rating-status" role="status">{rating ? `${rating} selected.` : ''}</p>
  </>;
}
