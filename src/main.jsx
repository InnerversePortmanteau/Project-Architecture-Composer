import './index.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './Composer.jsx';

// Import the initialized Firebase services.
// This line runs the code in src/firebase.js and initializes Firebase once.

import { auth, db } from './firebase.js';
// Optional: If you want to provide auth and db to all components via Context
// You could create a FirebaseContext and wrap your App
// For simplicity, let's assume components will import `auth` and `db` directly from `src/firebase.js`

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
