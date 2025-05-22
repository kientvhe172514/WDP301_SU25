// pages/AccountPage/ForgotPassword.js
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { resetPassword } from '../../services/accountService';
import './Login.css';
import { icons } from '../../constants';

const ResetPassword = () => {
    const { token } = useParams();
    const [newPassword, setNewPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const validatePassword = (password) => {
        if (password.length < 8) return "Mật khẩu phải dài ít nhất 8 ký tự.";
        if (!/[A-Z]/.test(password)) return "Mật khẩu phải chứa ít nhất một chữ cái in hoa.";
        if (!/[a-z]/.test(password)) return "Mật khẩu phải chứa ít nhất một chữ cái thường.";
        if (!/[0-9]/.test(password)) return "Mật khẩu phải chứa ít nhất một số.";
        if (!/[@$!%*?&]/.test(password)) return "Mật khẩu phải chứa ít nhất một ký tự đặc biệt (@$!%*?&).";
        return null;
    };

    const handleSubmit = async () => {
        setMessage('');
        setError('');
        if (!newPassword) {
            setError('Vui lòng nhập mật khẩu mới.');
            return;
        }

        const passwordError = validatePassword(newPassword);
        if (passwordError) {
            setError(`${passwordError}`);
            return;
        }

        try {
            const response = await resetPassword(token, newPassword);
            setMessage(`${response.message}`);
            setTimeout(() => navigate('/login'), 3000);
        } catch (err) {
            setError(`Lỗi: ${err.response?.data?.message || 'Không thể đặt lại mật khẩu.'}`);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <h2 className="form-title">Reset Password</h2>
                <div className="login-form">
                    <div className="input-wrapper">
                        <img src={icons.lock} alt="password" className="input-icon" />
                        <input
                            type="password"
                            placeholder="Mật khẩu mới"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="input-field"
                        />
                    </div>
                    {error && <p style={{ color: 'red' }}>{error}</p>}
                    {message && <p style={{ color: 'green' }}>{message}</p>}
                    <button onClick={handleSubmit} className="login-button">
                        Xác nhận đặt lại mật khẩu
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ResetPassword;