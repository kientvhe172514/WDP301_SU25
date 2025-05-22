import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { updateAccount } from "../../redux/accountSlice";
import * as AccountService from "../../services/accountService";
import { jwtDecode } from "jwt-decode";
import "./Login.css"; // Import file CSS riêng

const LoginPage = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const dispatch = useDispatch();

    useEffect(() => {
        const attemptSilentRefresh = async () => {
            try {
                const res = await AccountService.silentRefresh();

                if (res?.status === "OK" && res?.data) {
                    dispatch(updateAccount({
                        ...res.data,
                        access_token: res.access_token
                    }));
                    navigate("/dashboard");
                }
            } catch (error) {
                console.log("Silent refresh failed - user needs to login");
                localStorage.removeItem("access_token");
            }
        };

        // Try silent refresh when component mounts
        attemptSilentRefresh();
    }, [dispatch, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        try {
            const res = await AccountService.loginAccount({ email, password });

            if (res?.status === "ERR") {
                setError(res.message);
                return;
            }

            if (res?.data) {
                // Update Redux store with user data
                dispatch(updateAccount({
                    ...res.data,
                    access_token: res.access_token
                }));
                navigate("/dashboard");
            }
        } catch (error) {
            setError(error.response?.data?.message || "Login failed. Please try again.");
        }
    };

    return (
        <div className="container">
            <div className="login-box">
                {/* Left Section (Image Placeholder) */}
                <div className="image-section">
                    <div className="image-placeholder">
                        <img
                            src="https://du-lich.chudu24.com/f/m/2207/08/khach-san-lamor-boutique-10.jpg?w=550&c=1"
                            alt="Placeholder"
                            className="image-icon"
                        />
                    </div>
                </div>

                {/* Right Section (Login Form) */}
                <div className="form-section">
                    <h2 className="title">Welcome to PHM System</h2>
                    <p className="subtitle">Login to continue</p>

                    {error && <div className="error-message">{error}</div>}

                    <form onSubmit={handleSubmit}>
                        <div className="input-group">
                            <label>Email</label>
                            <input
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="input-group">
                            <label>Password</label>
                            <input
                                type="password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <div className="forgot-password">
                                <a href="/forgot-password">Forgot password?</a>
                            </div>
                        </div>

                        <button type="submit" className="login-button">
                            Login
                        </button>
                    </form>

                    <div className="separator">
                        <hr />
                        <span>or</span>
                        <hr />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
