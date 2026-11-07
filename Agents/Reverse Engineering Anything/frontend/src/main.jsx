import { createRoot } from 'react-dom/client';
// Same stylesheet order as the original public/index.html.
import './styles/styles.css';
import './styles/directory.css';
import './styles/shell.css';
import './styles/chooser.css';
import './styles/reference-theme.css';
import './styles/alignment.css';
import './styles/catalog-layout.css';
import './styles/interactions.css';
import './styles/react-root.css';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(<App />);
