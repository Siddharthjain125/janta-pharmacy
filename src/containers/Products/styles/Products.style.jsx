import styled from '@emotion/styled';

export const ProductsWrapper= styled.div`
display: grid;
gap: 20px;
grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
padding: 20px;
.card-content{
    height: 100px;
}
.jp-product-description{
    height: 50px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}


`;