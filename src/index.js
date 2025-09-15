// src/index.js - CORRIGIDO

import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { ReactFlowProvider } from 'reactflow'; // 1. Importe o ReactFlowProvider

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {/* 2. Embrulhe o componente App com o Provider */}
    <ReactFlowProvider> 
      <App />
    </ReactFlowProvider>
  </React.StrictMode>
);

reportWebVitals();