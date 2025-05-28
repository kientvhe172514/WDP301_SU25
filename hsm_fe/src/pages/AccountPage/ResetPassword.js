import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { resetPassword } from '../../services/accountService';
import { icons } from '../../constants';
import './resetPass.css';

const ResetPassword = () => {
    const { token } = useParams();
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const validatePassword = (password) => {
        if (password.length < 8) return "Mật khẩu phải dài ít nhất 8 ký tự.";
        if (!/[A-Z]/.test(password)) return "Mật khẩu phải chứa ít nhất một chữ cái in hoa.";
        if (!/[a-z]/.test(password)) return "Mật khẩu phải chứa ít nhất một chữ cái thường.";
        if (!/[0-9]/.test(password)) return "Mật khẩu phải chứa ít nhất một số.";
        if (!/[@$!%*?&]/.test(password)) return "Mật khẩu phải chứa ít nhất một ký tự đặc biệt (@$!%*?&).";
        return null;
    };

    const getPasswordStrength = (password) => {
        let score = 0;
        if (password.length >= 8) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[a-z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[@$!%*?&]/.test(password)) score++;

        if (score < 3) return { strength: 'Yếu', colorClass: 'strength-bar-weak', width: '33%', textClass: 'strength-weak' };
        if (score < 5) return { strength: 'Trung bình', colorClass: 'strength-bar-medium', width: '66%', textClass: 'strength-medium' };
        return { strength: 'Mạnh', colorClass: 'strength-bar-strong', width: '100%', textClass: 'strength-strong' };
    };

    const passwordStrength = getPasswordStrength(newPassword);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        setIsLoading(true);

        if (!newPassword) {
            setError('Vui lòng nhập mật khẩu mới.');
            setIsLoading(false);
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('Mật khẩu xác nhận không khớp.');
            setIsLoading(false);
            return;
        }

        const passwordError = validatePassword(newPassword);
        if (passwordError) {
            setError(`${passwordError}`);
            setIsLoading(false);
            return;
        }

        try {
            const response = await resetPassword(token, newPassword);
            setMessage(`${response.message}`);
            setTimeout(() => navigate('/login'), 3000);
        } catch (err) {
            setError(`Lỗi: ${err.response?.data?.message || 'Không thể đặt lại mật khẩu.'}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="reset-password-container">
            <div className="reset-password-wrapper">
                {/* Header với icon và title */}
                <div className="header-section">
                    <div className="header-icon-container">
                        <img
                            src={icons.lock}
                            alt="lock"
                            className="header-icon"
                        />
                    </div>
                    <h1 className="header-title">Đặt Lại Mật Khẩu</h1>
                    <p className="header-subtitle">Tạo mật khẩu mới mạnh và bảo mật cho tài khoản của bạn</p>
                </div>

                {/* Form container */}
                <div className="form-container">
                    <form onSubmit={handleSubmit} className="form">
                        {/* New Password Field */}
                        <div className="field-container">
                            <label className="field-label">
                                Mật khẩu mới
                            </label>
                            <div className="input-wrapper">
                                <div className="input-icon">
                                    <img
                                        src={icons.lock}
                                        alt="password"
                                    />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Nhập mật khẩu mới"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="input-field"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="toggle-password-btn"
                                >
                                    <span className="toggle-password-text">
                                        {showPassword ? 'Ẩn' : 'Hiện'}
                                    </span>
                                </button>
                            </div>

                            {/* Password Strength Indicator */}
                            {newPassword && (
                                <div className="password-strength-container">
                                    <div className="password-strength-header">
                                        <span className="password-strength-label">Độ mạnh mật khẩu:</span>
                                        <span className={`password-strength-text ${passwordStrength.textClass}`}>
                                            {passwordStrength.strength}
                                        </span>
                                    </div>
                                    <div className="password-strength-bar-container">
                                        <div
                                            className={`password-strength-bar ${passwordStrength.colorClass}`}
                                            style={{ width: passwordStrength.width }}
                                        ></div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Confirm Password Field */}
                        <div className="field-container">
                            <label className="field-label">
                                Xác nhận mật khẩu
                            </label>
                            <div className="input-wrapper">
                                <div className="input-icon">
                                    <img
                                        src={icons.lock}
                                        alt="confirm password"
                                    />
                                </div>
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    placeholder="Nhập lại mật khẩu mới"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="input-field"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="toggle-password-btn"
                                >
                                    <span className="toggle-password-text">
                                        {showConfirmPassword ? 'Ẩn' : 'Hiện'}
                                    </span>
                                </button>
                            </div>

                            {/* Password Match Indicator */}
                            {confirmPassword && (
                                <div className="password-match-container">
                                    {newPassword === confirmPassword ? (
                                        <>
                                            <div className="match-indicator match-indicator-success"></div>
                                            <span className="match-text match-text-success">Mật khẩu khớp</span>
                                        </>
                                    ) : (
                                        <>
                                            <div className="match-indicator match-indicator-error"></div>
                                            <span className="match-text match-text-error">Mật khẩu không khớp</span>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="error-message">
                                <div className="error-message-content">
                                    <div className="error-icon">
                                        <span className="error-emoji">⚠️</span>
                                    </div>
                                    <div className="error-text-container">
                                        <p className="error-text">{error}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Success Message */}
                        {message && (
                            <div className="success-message">
                                <div className="success-message-content">
                                    <div className="success-icon">
                                        <span className="success-emoji">✅</span>
                                    </div>
                                    <div className="success-text-container">
                                        <p className="success-text">{message}</p>
                                        <p className="success-subtext">Đang chuyển hướng đến trang đăng nhập...</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading || !newPassword || !confirmPassword}
                            className="submit-button"
                        >
                            {isLoading ? (
                                <div className="button-loading">
                                    <div className="loading-spinner"></div>
                                    Đang xử lý...
                                </div>
                            ) : (
                                'Xác nhận đặt lại mật khẩu'
                            )}
                        </button>
                    </form>

                    {/* Footer */}
                    <div className="footer">
                        <p className="footer-text">
                            Bạn nhớ mật khẩu?
                            <button
                                onClick={() => navigate('/login')}
                                className="footer-link"
                            >
                                Đăng nhập ngay
                            </button>
                        </p>
                    </div>
                </div>

                {/* Password Requirements */}
                <div className="requirements-container">
                    <h3 className="requirements-title">Yêu cầu mật khẩu:</h3>
                    <ul className="requirements-list">
                        <li className="requirement-item">
                            <span className={`requirement-indicator ${newPassword.length >= 8 ? 'requirement-met' : 'requirement-not-met'}`}></span>
                            Ít nhất 8 ký tự
                        </li>
                        <li className="requirement-item">
                            <span className={`requirement-indicator ${/[A-Z]/.test(newPassword) ? 'requirement-met' : 'requirement-not-met'}`}></span>
                            Một chữ cái in hoa
                        </li>
                        <li className="requirement-item">
                            <span className={`requirement-indicator ${/[a-z]/.test(newPassword) ? 'requirement-met' : 'requirement-not-met'}`}></span>
                            Một chữ cải thường
                        </li>
                        <li className="requirement-item">
                            <span className={`requirement-indicator ${/[0-9]/.test(newPassword) ? 'requirement-met' : 'requirement-not-met'}`}></span>
                            Một số
                        </li>
                        <li className="requirement-item">
                            <span className={`requirement-indicator ${/[@$!%*?&]/.test(newPassword) ? 'requirement-met' : 'requirement-not-met'}`}></span>
                            Một ký tự đặc biệt (@$!%*?&)
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;