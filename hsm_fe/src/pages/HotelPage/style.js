import styled from "styled-components";

export const FormContainer = styled.div`
//   max-width: 1000px;
  margin-top: 20px;
  padding: 15px;
  background: #fff;
  border-radius: 8px;
  // box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
`;

export const RowContainer = styled.div`
  display: flex;
  gap: 20px;
  
  > .ant-form-item {
    flex: 1;
  }
`;

export const FullWidthItem = styled.div`
  width: 100%;
  
  > .ant-form-item {
    width: 100%;
  }
`;

export const FormTitle = styled.h2`
    font-size: 24px;
    font-weight: bold;
    margin-bottom: 20px;
`;

export const ImageUploadSection = styled.div`
    text-align: center;
`;

export const MainImagePreview = styled.div`
    width: 100%;
    height: 240px;
    background:rgb(248, 247, 247);
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    margin-bottom: 10px;
    padding: 5px 0;
`;

export const MainImagePreviewImg = styled.img`
    max-width: 100%;
    max-height: 100%;
    border-radius: 8px;
`;

export const UploadWrapper = styled.div`
    display: flex;
    justify-content: flex-start;
    width: 100%;
`;
