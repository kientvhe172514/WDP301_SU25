// pages/AccountPage/ForgotPassword.js
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
        <div className="forgot-container">
            <div className="forgot-card">
                <h2 className="forgot-form-title">Forgot Password</h2>
                <p className="forgot-description">Nhập địa chỉ email và chúng tôi sẽ gửi liên kết để đặt lại mật khẩu.</p>
                <div className="forgot-form">
                    <div className="forgot-input-wrapper">
                        <img src={icons.mail} alt="email" className="forgot-input-icon" />
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="input-field"
                        />
                    </div>
                    {error && <p className="forgot-error-message" style={{ color: 'red' }}>{error}</p>}
                    {message && <p className="forgot-success-message" style={{ color: 'green' }}>{message}</p>}
                    <button onClick={handleResetPassword} className="forgot-button">
                        Gửi liên kết đặt lại mật khẩu
                    </button>
                    <p className="signup-prompt">
                        <Link to="/login" className="signup-link">Quay lại đăng nhập</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default ForgotPassword;

