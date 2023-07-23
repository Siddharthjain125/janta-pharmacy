import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import { Navbar } from './components/navbar/navbar';

import { About } from './containers/aboutUs/aboutUs';
import { ContactUs } from './containers/contactUs/contactUs';
import { Products } from './containers/Products/Product';

function App() {
  return (
    <Router>
    <Navbar />
    <Routes>
    <Route path="/products" element={<Products />} />
    <Route path="/about" element={<About />} />
    <Route path="/contactUs" element={<ContactUs />} />
    </Routes>
  </Router>
);
}

export default App;