import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/base.css';
import './styles/components.css';
import './styles/responsive.css';
import './styles/variables.css';
import App from './App';

// If you want to use a service worker for PWA support, uncomment this
// import * as serviceWorker from './serviceWorker';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
// serviceWorker.unregister();