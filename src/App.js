import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "./App.css";

import { Products } from "./containers/Products/Product";
import { Footer } from "./components/Footer/Footer";
import { Navbar } from "./components/navbar/navbar";
import { Cart } from "./components/Cart/Cart";

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/products" element={<Products />} />
        <Route path="/cart" element={<Cart />} />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;
