import styled from '@emotion/styled';

export const ProductsWrapper = styled.div`
  display: grid;
  gap: 20px;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  padding: 20px;
`;

export const CardContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 400px;
`;

export const CardContentWrapper = styled.div`
  height: 20%;
  flex: 1;
  overflow: hidden;
  padding: 5px;
`;

export const CardTitleContainer = styled.div`
  height: 70%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  max-height: 200px;
  overflow: auto;
`;

export const CardDescription = styled.div`
  height: 25%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 8px;
`;
