// import styled from "styled-components";

// export const DashboardContainer = styled.div`
//   background-color: #f4f6f9;
//   padding: 20px;
//   min-height: 100vh;
// `;

// export const StyledCard = styled.div`
//   background: white;
//   border-radius: 12px;
//   padding: 20px;
//   box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
//   margin: 10px;
// `;

// export const CardHeader = styled.div`
//   font-size: 18px;
//   font-weight: bold;
//   display: flex;
//   justify-content: space-between;
//   align-items: center;
//   margin-bottom: 15px;
// `;

// export const RecentlyAddedContainer = styled.div`
//   display: flex;
//   flex-direction: column;
//   gap: 10px;
// `;

// export const EmployeeItem = styled.div`
//   display: flex;
//   align-items: center;
//   background: #f9f9f9;
//   padding: 10px;
//   border-radius: 8px;
//   transition: 0.3s;
//   &:hover {
//     background: #eef1f6;
//   }
// `;

// export const EmployeeAvatar = styled.img`
//   width: 40px;
//   height: 40px;
//   border-radius: 50%;
//   margin-right: 10px;
// `;

// export const EmployeeInfo = styled.div`
//   display: flex;
//   flex-direction: column;
//   strong {
//     font-size: 14px;
//     color: #333;
//   }
//   span {
//     font-size: 12px;
//     color: #888;
//   }
// `;

// export const HotelTableContainer = styled.div`
//   overflow-x: auto;
// `;

// export const StyledTable = styled.table`
//   width: 100%;
//   border-collapse: collapse;
//   th, td {
//     padding: 12px;
//     text-align: left;
//   }
//   th {
//     background: #f4f6f9;
//     font-weight: bold;
//   }
//   tr:nth-child(even) {
//     background: #f9f9f9;
//   }
// `;

// export const Button = styled.button`
//   background: #4c6ef5;
//   color: white;
//   border: none;
//   padding: 8px 12px;
//   border-radius: 5px;
//   cursor: pointer;
//   &:hover {
//     background: #3b5bdb;
//   }
// `;

// export const TableContainer = styled.div`
//   width: 100%;
//   overflow-x: auto;
//   margin-top: 10px;
// `;

import styled from "styled-components";

export const DashboardContainer = styled.div`
  background-color: #f4f6f9;
  padding: 20px;
  min-height: 100vh;
`;

export const StyledCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
  margin: 10px;
`;

export const CardHeader = styled.div`
  font-size: 18px;
  font-weight: bold;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
`;

export const RecentlyAddedContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

export const EmployeeItem = styled.div`
  display: flex;
  align-items: center;
  background: #f9f9f9;
  padding: 10px;
  border-radius: 8px;
  transition: 0.3s;
  &:hover {
    background: #eef1f6;
  }
`;

export const EmployeeAvatar = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 10px;
`;

export const EmployeeInfo = styled.div`
  display: flex;
  flex-direction: column;
  strong {
    font-size: 14px;
    color: #333;
  }
  span {
    font-size: 12px;
    color: #888;
  }
`;

export const HotelTableContainer = styled.div`
  overflow-x: auto;
`;

export const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  th, td {
    padding: 12px;
    text-align: left;
  }
  th {
    background: #f4f6f9;
    font-weight: bold;
  }
  tr:nth-child(even) {
    background: #f9f9f9;
  }
`;

export const Button = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  display: inline-flex;
  align-items: center;
  justify-content: center;

  &.btn-info {
    background: #4c6ef5;
    color: white;
    padding: 8px 12px;
    border-radius: 5px;
    &:hover {
      background: #3b5bdb;
    }
  }

  &.edit-button {
    color: #ffa726;
    margin-right: 8px;
    &:hover {
      color: #fb8c00;
    }
  }

  &.btn-danger {
    color: #ff0000;
    &:hover {
      color: #cc0000;
    }
  }
`;

export const TableContainer = styled.div`
  width: 100%;
  overflow-x: auto;
  margin-top: 10px;
`;