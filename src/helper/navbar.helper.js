export const cartItemsCalculator = (productsQuantity)  => {
    let cartCount = 0;
    productsQuantity.forEach(product => {
        if( product.quantity >0) {
            cartCount += 1;
        }
    })
    return cartCount;
}