export const cartItemsCalculator = (products)  => {
    let cartCount = 0;
    products.forEach(product => {
        if( product.quantity >0) {
            cartCount += 1;
        }
    })
    return cartCount;
}