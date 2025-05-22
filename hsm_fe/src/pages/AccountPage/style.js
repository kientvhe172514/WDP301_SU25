import styled from "styled-components";
import { Card, Input, Button, Form } from "antd";

export const LoginContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  // background-image: url("../../asset/img/backgroud.png");
  background-repeat: repeat;
  background-size: cover;
  background-position: center;
`;

export const LoginCard = styled(Card)`
  width: 500px;
  padding: 30px;
  border-radius: 20px;
  box-shadow: 0px 10px 30px rgba(0, 87, 155, 0.2);
  background-color: white;
`;

export const Title = styled.h2`
  color: #2e5077;
  text-align: center;
`;

export const Subtitle = styled.p`
  color: #2e5077;
  text-align: center;
  margin-bottom: 20px;
`;

export const StyledInput = styled(Input)`
  border-radius: 8px;
  height: 45px;
`;

export const StyledPasswordInput = styled(Input.Password)`
  border-radius: 8px;
  height: 45px;
`;

export const StyledButton = styled(Button)`
  width: 100%;
  height: 50px;
  font-size: 16px;
  background-color: #4da1a9;
  color: white;
  border: none;
  border-radius: 8px;

  &:hover {
    background-color: #3b8288 !important;
  }
`;

export const ForgotPassword = styled.div`
  text-align: left;
  margin-bottom: 10px;

  a {
    color: #223b79;
    font-weight: bold;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
`;

export const CaptchaContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #eeeee9;
  padding: 10px;
  border-radius: 8px;
  margin-bottom: 15px;
`;

export const CaptchaCheckboxContainer = styled.div`
  display: flex;
  align-items: center;
`;

export const CaptchaCheckbox = styled.input`
  width: 20px;
  height: 20px;
  margin-right: 10px;
`;

export const CaptchaText = styled.span`
  font-size: 16px;
  color: #333;
`;

export const CaptchaImage = styled.img`
  width: 60px;
  height: 60px;
`;
