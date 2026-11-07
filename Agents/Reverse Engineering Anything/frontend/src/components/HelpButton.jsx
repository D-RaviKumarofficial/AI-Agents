export default function HelpButton({ onHelp }) {
  return (
    <button className="help-badge" data-help aria-label="Need Help? Call 901" onClick={onHelp}>
      <span className="help-left" aria-hidden="true">
        <svg className="ico help-phone" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M5 4h3.5l1.8 4.6-2.3 1.4a10.5 10.5 0 0 0 5 5l1.4-2.3 4.6 1.8V18a2 2 0 0 1-2 2A15 15 0 0 1 3 6a2 2 0 0 1 2-2z" /></svg>
        <strong>901</strong>
      </span>
      <span className="help-text"><b>Need Help?</b><b>Call 901</b></span>
    </button>
  );
}
