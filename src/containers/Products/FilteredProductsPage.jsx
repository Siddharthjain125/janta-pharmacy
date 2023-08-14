import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { Products } from "./Products";

export function FilteredProductsPage() {
  const { query } = useParams();
  const products = useSelector((state) => state.productsData.products);

  let filteredProducts;
  if (query === undefined) {
    filteredProducts = products;
  } else {
    filteredProducts = products.filter((product) =>
      product.title.toLowerCase().includes(query.toLowerCase())
    );
  }

  return <Products products={filteredProducts} />;
}
