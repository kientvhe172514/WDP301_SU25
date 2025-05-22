import { useState, useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Card, Form, Input, Button } from "antd";
import { updateAccount } from "../../redux/accountSlice";
import * as AccountService from "../../services/accountService";
import "./Login.css";
import { jwtDecode } from "jwt-decode";
import background from "../../asset/img/backgroud.png";

const LoginPage = () => {
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const [captcha, setCaptcha] = useState(true);

    const formRef = useRef(null);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const res = await AccountService.silentRefresh();
                if (res?.status === "OK" && res?.data) {
                    // Fetch employee details if available
                    let employeeData = null;
                    try {
                        const decoded = jwtDecode(res.token);
                        const employeeRes = await AccountService.getEmployeeByAccountId(decoded.id, res.token);
                        if (employeeRes?.data) {
                            employeeData = employeeRes.data;
                        }
                    } catch (error) {
                        console.error("Error fetching employee details:", error);
                    }
                    localStorage.setItem("access_token", res.access_token);
                    dispatch(
                        updateAccount({
                            ...res.data,
                            access_token: res.access_token,
                            employee: employeeData
                        })
                    );
                    navigate("/dashboard");
                }


            } catch (error) {
                console.log("No valid session found, showing login form");
            }
        };

        checkAuth();
    }, [dispatch, navigate]);

    const mutation = useMutation({
        mutationFn: (data) => AccountService.loginAccount(data),
        onSuccess: (data) => {
            if (data.status === "OK") {
                localStorage.setItem("access_token", data.access_token);
                dispatch(updateAccount({ ...data.user, access_token: data.access_token }));
                navigate("/dashboard");
            } else {
                console.error("Login failed:", data.message);
            }
        },
        onError: (error) => {
            console.error("System error:", error.message);
        },
    });

    const handleOnChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    const handleSubmit = () => {
        mutation.mutate(formData);
    };

    return (
        <div className="login-page__container"
            style={{
                backgroundImage: `url(${background})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
            }}>

            <Card
                title={<>
                    <h2 className="title">Welcome to HMS System</h2>
                    <p className="subtitle">Login to continue</p>
                </>
                }
                style={{
                    width: "500px",
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    padding: "24px",
                    borderRadius: "16px",
                    backdropFilter: "blur(10px)",
                    background: "rgba(255, 255, 255, 0.8)",
                    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.2)",
                    border: "1px solid rgba(255, 255, 255, 0.3)",
                }}

            >
                <Form ref={formRef} layout="vertical" onFinish={handleSubmit}>
                    <Form.Item
                        label="Username"
                        name="email" // Changed to "email"
                        rules={[{ required: true, message: "Please enter your username!" }]}
                    >
                        <Input
                            placeholder="Nhập email"
                            name="email" // Changed to lowercase "email"
                            value={formData.email}
                            onChange={handleOnChange}
                        />
                    </Form.Item>

                    <Form.Item
                        label="Password"
                        name="password" // Changed to "password"
                        rules={[{ required: true, message: "Please enter your password!" }]}
                    >
                        <Input.Password
                            placeholder="Enter password"
                            name="password" // Changed to lowercase "password"
                            value={formData.password}
                            onChange={handleOnChange}
                        />
                    </Form.Item>

                    {mutation?.data?.status === "ERR" && (
                        <span style={{ color: "red" }}>{mutation?.data?.message}</span>
                    )}

                    <div className="forgot-password">
                        <a href="#">Forgot password?</a>
                    </div>

                    <Form.Item>
                        <Button
                            style={{ backgroundColor: "rgb(121, 215, 190)", marginTop: "10px" }}
                            type="primary"
                            htmlType="submit"
                            loading={mutation.isLoading}
                            block
                            disabled={mutation.isLoading || !captcha}
                        >
                            Login
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default LoginPage;
