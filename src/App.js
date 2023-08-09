import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "./App.css";

import { Products } from "./containers/Products/Product";
import { Footer } from "./components/Footer/Footer";
import { Navbar } from "./components/navbar/navbar";
import { Cart } from "./components/Cart/Cart";
import { Checkout } from "./components/Checkout/Checkout";
import { Dashboard } from "./containers/Dashboard/Dashboard";

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Dashboard/>} />
        <Route path="/products" element={<Products />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;
