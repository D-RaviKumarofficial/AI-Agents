export const iconPaths = [
 '<path d="m3 7 9-4 9 4-9 4zM3 12l9 4 9-4M3 17l9 4 9-4"/>',
 '<rect x="4" y="2" width="13" height="18" rx="3"/><path d="M7 6h7M7 10h5M7 14h3m8 5 4 3"/><circle cx="16" cy="16" r="4"/>',
 '<path d="M5 3h14a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2h-4l-3 4-3-4H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zM12 7v5m0 3v.1"/>',
 '<rect x="4" y="2" width="16" height="18" rx="2"/><path d="M7 6h10M7 9h7m-6 8-1 5 5-2 5 2-1-5"/><circle cx="12" cy="14" r="3"/>',
 '<path d="m4 12 2-6h12l2 6M3 12h18v7H3zm2 7v3m14-3v3M6 15h2m8 0h2M8 3h8"/>',
 '<path d="M3 22V9h6v13M9 22V3h8v19m0-13h4v13M12 7h2m-2 4h2m-2 4h2M5 12h2m-2 4h2M2 22h20"/>',
 '<path d="m2 10 5-6 5 2 5-2 5 6-4 7-4 4-3-2-3-1-3-4m2-10 5 5 3-2 4 4-4 5m-8-3 5 5m-3-8 6 6"/>',
 '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/><path d="m5 5 4 4m6 6 4 4M5 19l4-4m6-6 4-4"/>'
];

export const chooserShapes = {
 'document-verification':'<rect x="4" y="2" width="14" height="19" rx="3" fill="#25cd8d"/><path d="M7 7h8M7 11h6M7 15h3"/><circle cx="17" cy="18" r="5" fill="#fff"/><path d="m14.5 18 1.5 1.5 3-3"/>',
 'fast-track':'<circle cx="13" cy="12" r="10" fill="#25cd8d"/><path d="M13 5v7l5 3M1 5h4M0 10h4M0 15h5M2 20h5"/>',
 'attaching-documents':'<path d="m8 13 7-7a4 4 0 0 1 6 6L10 23a6 6 0 0 1-8-8L13 4a2 2 0 0 1 3 3L5 18"/>'
};

export function cleanSnapshot(text){
 return text.split('\n').map(line=>line.replace(/^\s*- /,'').replace(/^(?:heading|paragraph|text|listitem|cell|row|columnheader)[: ]/,'').replace(/\[level=\d\]/g,'').replace(/[\uE000-\uF8FF]/g,'').trim()).filter(line=>line&&!/^(?:button|img|list:|separator|navigation|combobox|textbox|spinbutton|tablist|tab |document)/.test(line)).join('\n');
}

export const emit = (name, detail) => document.dispatchEvent(new CustomEvent(name, { detail }));

export function hasGuest(){try{return sessionStorage.getItem('sandboxGuest')==='yes';}catch{return false;}}
export function rememberGuest(){try{sessionStorage.setItem('sandboxGuest','yes');}catch{}}

export const HOME_PATHS = ['/','/app','/app/home','/app/home/'];
export const readLocation = () => ({ pathname: location.pathname, search: location.search, hash: location.hash });
