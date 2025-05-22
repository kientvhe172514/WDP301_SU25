import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Result, Spin, Card, Typography, Button, Space } from "antd";
import { LoadingOutlined, CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;
const API_URL = process.env.REACT_APP_API_URL_BACKEND;

export const verifyPayment = async (queryParams) => {
    console.log("Sending verification request with params:", queryParams);

    try {
        // First verify the payment
        const res = await axios.post(`${API_URL}/transactions/verifypayment`, null, {
            params: queryParams,
        });

        // Check VNPay's transaction status
        if (queryParams.vnp_TransactionStatus === "00") {
            // If payment is successful, update the transaction's paid amount
            const paidAmount = parseInt(queryParams.vnp_Amount) / 100;
            const updateResponse = await axios.put(
                `${API_URL}/transactions/${queryParams.transactionID}/information`,
                {
                    PaidAmount: paidAmount
                }
            );

            if (updateResponse.data.status === "OK") {
                return {
                    status: "OK",
                    message: "Payment verified and updated successfully",
                    data: updateResponse.data
                };
            }
        }

        return {
            status: "ERR",
            message: "Payment verification failed",
            data: res.data
        };
    } catch (error) {
        console.error("Error verifying payment:", error);
        return {
            status: "ERR",
            message: error.response?.data?.message || "Verification failed"
        };
    }
};

export const usePaymentVerification = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [verificationStatus, setVerificationStatus] = useState({
        status: "loading",
        message: "",
        transactionID: "",
        amount: 0
    });

    useEffect(() => {
        console.log("usePaymentVerification triggered. Current location:", location.search);

        const urlParams = new URLSearchParams(location.search);
        const queryParams = Object.fromEntries(urlParams.entries());

        console.log("Extracted query params:", queryParams);

        let transactionID = queryParams.transactionID;
        if (transactionID && transactionID.includes("?")) {
            transactionID = transactionID.split("?")[0];
        }

        console.log("Cleaned Transaction ID:", transactionID);

        if (transactionID) {
            verifyPayment(queryParams).then((response) => {
                console.log("Payment verification completed. Response:", response);

                const amount = parseInt(queryParams.vnp_Amount) / 100;
                // Set verification status based on VNPay's response
                setVerificationStatus({
                    status: queryParams.vnp_TransactionStatus === "00" ? "success" : "error",
                    message: queryParams.vnp_TransactionStatus === "00"
                        ? `Payment of ${amount.toLocaleString()} VND was successful`
                        : "Payment verification failed",
                    transactionID: transactionID,
                    amount: amount
                });

                // Automatically redirect after 5 seconds on success
                if (queryParams.vnp_TransactionStatus === "00") {
                    setTimeout(() => {
                        navigate("/reservationlist");
                    }, 5000);
                }
            });
        } else {
            setVerificationStatus({
                status: "error",
                message: "No valid transaction ID found",
                transactionID: "",
                amount: 0
            });
        }
    }, [navigate, location]);

    return verificationStatus;
};

const VerificationPage = () => {
    const verificationStatus = usePaymentVerification();

    const getStatusContent = () => {
        switch (verificationStatus.status) {
            case "loading":
                return (
                    <Result
                        icon={<LoadingOutlined style={{ fontSize: 48 }} spin />}
                        title="Verifying Payment"
                        subTitle="Please wait while we verify your payment..."
                    />
                );
            case "success":
                return (
                    <Result
                        icon={<CheckCircleOutlined style={{ color: "#52c41a", fontSize: 48 }} />}
                        status="success"
                        title="Payment Verified Successfully!"
                        subTitle={
                            <Space direction="vertical">
                                <Text>Transaction ID: {verificationStatus.transactionID}</Text>
                                <Text>Amount: {verificationStatus.amount.toLocaleString()} VND</Text>
                                <Text type="secondary">{verificationStatus.message}</Text>
                                <Text type="secondary">Redirecting to reservations in 5 seconds...</Text>
                            </Space>
                        }
                        extra={[
                            <Button type="primary" key="reservations" onClick={() => window.location.href = "/reservationlist"}>
                                Go to Reservations
                            </Button>
                        ]}
                    />
                );
            case "error":
                return (
                    <Result
                        icon={<CloseCircleOutlined style={{ color: "#ff4d4f", fontSize: 48 }} />}
                        status="error"
                        title="Payment Verification Failed"
                        subTitle={
                            <Space direction="vertical">
                                {verificationStatus.transactionID && (
                                    <Text>Transaction ID: {verificationStatus.transactionID}</Text>
                                )}
                                <Text type="danger">{verificationStatus.message}</Text>
                            </Space>
                        }
                    />
                );
            default:
                return null;
        }
    };

    return (
        <div style={{
            minHeight: "100vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "#f0f2f5"
        }}>
            <Card
                style={{
                    width: "100%",
                    maxWidth: 600,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    borderRadius: "8px"
                }}
            >
                {getStatusContent()}
            </Card>
        </div>
    );
};

export default VerificationPage;
