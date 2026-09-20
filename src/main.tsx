import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { TimetableProvider } from './context/TimetableContext';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TimetableProvider>
      <App />
    </TimetableProvider>
  </StrictMode>,
);
