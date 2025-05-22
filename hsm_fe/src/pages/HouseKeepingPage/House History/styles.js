import styled from "styled-components";
import { Select, Table } from "antd";


export const StyledContainer = styled.div`
  padding: 20px;
  background: #f9f9f9;
`;


export const StyledTitle = styled.h2`
  color: #333;
`;


export const StyledTable = styled(Table)`
  margin-top: 20px;
`;


export const StyledSelectContainer = styled.div`
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
`;


export const StyledSelect = styled(Select)`
  width: 250px;
`;
