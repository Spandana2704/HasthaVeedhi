// frontend/src/index.js
import 'leaflet/dist/leaflet.css';  // Import Leaflet CSS
import React from 'react';
import ReactDOM from 'react-dom/client'; // For React 18+
import { BrowserRouter } from 'react-router-dom'; // Router should be here
import './styles/index.css';
import App from './App';

// Create a root and render the app inside BrowserRouter
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  
  <BrowserRouter>
  
    <App />
  
  </BrowserRouter>
  
);
