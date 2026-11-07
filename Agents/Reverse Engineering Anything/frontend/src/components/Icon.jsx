import { createContext, useContext } from 'react';
import { iconPaths, chooserShapes } from '../util.js';

export const IconContext = createContext({});

/** Mirrors icon(i,name): reference image if known, otherwise inline line icon. */
export function Icon({ index, name }) {
  const referenceIcons = useContext(IconContext);
  if (name && referenceIcons[name]) return <img src={referenceIcons[name]} alt="" width="80" height="80" />;
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" dangerouslySetInnerHTML={{ __html: iconPaths[index] ?? iconPaths[0] }} />;
}

export function ChooserIcon({ id, index }) {
  if (chooserShapes[id]) return <svg viewBox="0 0 25 25" fill="none" stroke="#00664c" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" dangerouslySetInnerHTML={{ __html: chooserShapes[id] }} />;
  return <Icon index={(index % 7) + 1} />;
}
