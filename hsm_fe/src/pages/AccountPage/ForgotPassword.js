// pages/AccountPage/ForgotPassword.js
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { icons } from '../../constants';
import "./Login.css";
import * as AccountService from "../../services/accountService";

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleResetPassword = async () => {
        setMessage('');
        setError('');
        if (!email) {
            setError('Vui lòng nhập địa chỉ email.');
            return;
        }
        try {
            const response = await AccountService.requestPasswordReset(email);
            setMessage(`${response.message}`);
        } catch (err) {
            setError(`Lỗi: ${err.response?.data?.message || 'Không thể gửi yêu cầu đặt lại mật khẩu.'}`);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <h2 className="form-title">Forgot Password</h2>
                <p className="forgot-description">Nhập địa chỉ email và chúng tôi sẽ gửi liên kết để đặt lại mật khẩu.</p>
                <div className="login-form">
                    <div className="input-wrapper">
                        <img src={icons.mail} alt="email" className="input-icon" />
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="input-field"
                        />
                    </div>
                    {error && <p className="error-message" style={{ color: 'red' }}>{error}</p>}
                    {message && <p className="success-message" style={{ color: 'green' }}>{message}</p>}
                    <button onClick={handleResetPassword} className="login-button">
                        Gửi liên kết đặt lại mật khẩu
                    </button>
                    <p className="signup-prompt">
                        <a href="/login" className="signup-link">Quay lại đăng nhập</a>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default ForgotPassword;

