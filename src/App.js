import { Route, HashRouter as Router, Routes } from "react-router-dom";
import "./App.css";

import { Cart } from "./components/Cart/Cart";
import { Checkout } from "./components/Checkout/Checkout";
import { Footer } from "./components/Footer/Footer";
import { Navbar } from "./components/navbar/navbar";
import { Dashboard } from "./containers/Dashboard/Dashboard";
import { AllProducts } from "./containers/Products/AllProducts";
import { FilteredProductsPage } from "./containers/Products/FilteredProductsPage";

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/products" element={<AllProducts />} />
        <Route path="/search/:query" element={<FilteredProductsPage />} />
        <Route path="/search" element={<FilteredProductsPage />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;
