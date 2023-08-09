import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { Provider } from 'react-redux';
import store from './redux/store';

const rootElement = document.getElementById('root');

// Use createRoot to asynchronously render the React application
const root = ReactDOM.createRoot(rootElement);

// Wrap the App component with the Provider and pass the Redux store
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);
