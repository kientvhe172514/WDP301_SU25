import React, { useState, useEffect, useRef } from "react";
import { Form, Input, Button, Card } from "antd";
import * as CreateAccount from "../../services/accountService";
import { useMutation } from "@tanstack/react-query";

const AccountPage = () => {
    const [formData, setFormData] = useState({
        FullName: "",
        Email: "",
        Username: "",
        Password: "",
    });
    const formRef = useRef(null);

    const mutation = useMutation({
        mutationFn: (data) => CreateAccount.createAccount(data),
    });
    const { data, isLoading, isSuccess } = mutation;

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
        <Card
            title="Đăng Ký Tài Khoản"
            style={{ width: 400, margin: "auto", marginTop: 50 }}
        >
            <Form ref={formRef} layout="vertical" onFinish={handleSubmit}>
                <Form.Item
                    label="Họ và Tên"
                    name="FullName"
                // rules={[{ required: true, message: "Vui lòng nhập họ tên!" }]}
                >
                    <Input
                        placeholder="Nhập họ tên"
                        name="FullName"
                        value={formData.FullName}
                        onChange={handleOnChange}
                    />
                </Form.Item>

                <Form.Item
                    label="Username"
                    name="Username"
                    rules={[{ required: true, message: "Vui lòng nhập Username!" }]}
                >
                    <Input
                        placeholder="Nhập Username"
                        name="Username"
                        value={formData.Username}
                        onChange={handleOnChange}
                    />
                </Form.Item>

                <Form.Item
                    label="Email"
                    name="Email"
                    rules={[
                        { required: true, message: "Vui lòng nhập email!" },
                        { type: "email", message: "Email không hợp lệ!" },
                    ]}
                >
                    <Input
                        placeholder="Nhập email"
                        name="Email"
                        value={formData.Email}
                        onChange={handleOnChange}
                    />

                </Form.Item>

                <Form.Item
                    label="Mật khẩu"
                    name="Password"
                    rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
                >
                    <Input.Password
                        placeholder="Nhập mật khẩu"
                        name="Password"
                        value={formData.Password}
                        onChange={handleOnChange}
                    />
                </Form.Item>
                {data?.status === "ERR" && (
                    <span style={{ color: "red" }}>{data?.message}</span>
                )}
                <Form.Item>
                    <Button
                        type="primary"
                        htmlType="submit"
                        loading={mutation.isLoading}
                        block
                    >
                        Đăng Ký
                    </Button>
                </Form.Item>
            </Form>
        </Card>
    );
};

export default AccountPage;
