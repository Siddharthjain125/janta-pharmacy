import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';

import { Products } from './containers/Products/Product';
import { Footer } from './components/Footer/Footer';
import { Navbar } from './components/navbar/navbar';

function App() {
  return (
  <Router>
    <Navbar />
    <Routes>
    <Route path="/products" element={<Products />} />
    </Routes>
    <Footer />
  </Router>
);
}

export default App;