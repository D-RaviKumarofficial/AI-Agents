/** Shared service action motion observed on the official services directory. */
export default function MotionButton({ children, className = '', tone = 'green', arrow = true, ...props }) {
  return (
    <button {...props} className={`${className} motion-button motion-button--${tone}${arrow ? ' motion-button--arrow' : ''}`}>
      <span className="button-sweep" aria-hidden="true" />
      <span className="button-content">
        {children}
        {arrow && <span className="button-arrow" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="24" height="24" focusable="false">
            <path fill="currentColor" d="m15.586 10.657-3.95-3.95a1 1 0 0 1 1.414-1.414l5.657 5.657a1 1 0 0 1 0 1.414l-5.657 5.657a1 1 0 0 1-1.414-1.414l3.95-3.95H6a1 1 0 0 1 0-2z" />
          </svg>
        </span>}
      </span>
    </button>
  );
}
