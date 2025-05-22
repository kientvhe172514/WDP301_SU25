import { Radio } from "antd";
import { Button } from "bootstrap/dist/js/bootstrap.bundle.min";
import styled from "styled-components";

export const RoomFormContainer = styled.div`
    // padding: 0 15px;
    background: #fff;
    border-radius: 8px;
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
    height: 250px;
    background: #f0f0f0;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    margin-bottom: 10px;
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

export const ThumbnailContainer = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    justify-content: center;
    margin-bottom: 10px;
    padding-bottom: 10px; 
    border-bottom: 2px solid #ccc; 
`;

export const Thumbnail = styled.img`
    width: 60px;
    height: 60px;
    object-fit: cover;
    border-radius: 4px;
    cursor: pointer;
    border: 2px solid transparent;
    &:hover {
        border-color: #1890ff;
    }
`;

export const UploadBtn = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 10px;
`;

export const SubmitBtn = styled.button`
    width: 100%;
    background: #1890ff;
    border: none;
    font-size: 16px;
    padding: 10px;
    color: white;
    cursor: pointer;
    border-radius: 4px;

    &:hover {
        background: #40a9ff;
    }
`;

export const StyledRadioGroup = styled(Radio.Group)`
  margin-bottom: 15px;
  font-weight: bold;
`;

export const StyledRadioButton = styled(Radio.Button)`
  background-color: ${({ value, selected }) =>
        selected ? (value === "single" ? "#ff7f50" : "#4682b4") : "#f0f0f0"};
  color: ${({ selected }) => (selected ? "white" : "black")};
  border-color: ${({ value, selected }) =>
        selected ? (value === "single" ? "#ff4500" : "#1e90ff") : "#d9d9d9"};

  &:hover {
    background-color: ${({ value, selected }) =>
        selected ? (value === "single" ? "#ff6347" : "#5a9bd3") : "#e6e6e6"};
  }

  // Giữ nền khi được chọn
  &.ant-radio-button-wrapper-checked {
    background-color: ${({ value }) =>
        value === "single" ? "#4DA1A9" : "#2E5077"} !important;
    color: white !important;
    border-color: ${({ value }) =>
        value === "single" ? "#2E5077" : "#4DA1A9"} !important;
  }
`;

export const StyledButton = styled.button`
    background-color: rgb(121, 215, 190);
    border: 1px solid rgb(121, 215, 190);
    color: black;
    font-size: 16px;
    cursor: pointer;
    border-radius: 4px;
    transition: 0.3s ease-in-out;

    &:hover {
        background-color: rgb(100, 200, 180);
        border-color: rgb(100, 200, 180);
    }
`;