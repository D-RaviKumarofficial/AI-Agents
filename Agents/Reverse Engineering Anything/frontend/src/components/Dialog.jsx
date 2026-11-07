import { useEffect, useRef } from 'react';

/** Native <dialog> driven by React state (showModal/close kept in sync). */
export default function Dialog({ open, onClose, children, ...props }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);
  return <dialog ref={ref} onClose={() => onClose?.()} {...props}>{children}</dialog>;
}
