import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';
import { useAlert } from '../context/AlertContext';
import Loader from '../components/Loader';
import { ShopContext } from '../context/ShopContext';
import Button from '../components/common/Button';
import Input from '../components/common/Input';

const Login = () => {
    const [currentState, setCurrentState] = useState('Login');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [showSuccessLoader, setShowSuccessLoader] = useState(false);

    const { login, token, navigate } = useContext(ShopContext);
    const alert = useAlert();

    // Redirect if already logged in
    useEffect(() => {
        if (token) {
            navigate('/');
        }
    }, [token, navigate]);

    const onSubmitHandler = async (e) => {
        e.preventDefault();

        if (!email || (currentState !== 'Forgot Password' && !password) || (currentState === 'Sign Up' && !name) || (currentState === 'Reset Password' && !otp)) {
            alert.error('Please fill in all required fields.');
            return;
        }

        setLoading(true);

        try {
            if (currentState === 'Login') {
                const response = await api.post('/api/user/login', { email, password });
                if (response.data.success) {
                    setShowSuccessLoader(true);
                    setTimeout(() => {
                        setShowSuccessLoader(false);
                        login(response.data.token);
                        alert.success('Welcome back!');
                        navigate('/');
                    }, 1500);
                } else {
                    alert.error(response.data.message || 'Login failed');
                }
            } else if (currentState === 'Sign Up') {
                const response = await api.post('/api/user/register', { name, email, password });
                if (response.data.success) {
                    alert.success('Registration successful! Please login.');
                    setCurrentState('Login');
                } else {
                    alert.error(response.data.message || 'Registration failed');
                }
            } else if (currentState === 'Forgot Password') {
                const response = await api.post('/api/user/forgot-password', { email });
                if (response.data.success) {
                    alert.success(response.data.message || 'OTP sent to your email');
                    setCurrentState('Reset Password');
                } else {
                    alert.error(response.data.message || 'Failed to send OTP');
                }
            } else if (currentState === 'Reset Password') {
                const response = await api.post('/api/user/reset-password', { email, otp, password });
                if (response.data.success) {
                    alert.success(response.data.message || 'Password reset successful!');
                    setCurrentState('Login');
                } else {
                    alert.error(response.data.message || 'Failed to reset password');
                }
            }
        } catch (error) {
            console.error('Error:', error);
            alert.error(error.response?.data?.message || 'Authentication error. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
            <Loader show={showSuccessLoader} />

            <form
                onSubmit={onSubmitHandler}
                className='flex flex-col items-center w-full max-w-[450px] bg-white p-8 sm:p-12 rounded-3xl shadow-xl theme-border border border-gray-50 gap-6'
            >
                <div className='flex flex-col items-center gap-2 mb-4'>
                    <h1 className='prata-regular text-4xl text-gray-800 tracking-tight'>{currentState}</h1>
                    <div className='w-12 h-1 bg-[#FFD1DC] rounded-full'></div>
                </div>

                <div className='w-full flex flex-col gap-4'>
                    {currentState === 'Sign Up' && (
                        <Input
                            label="Full Name"
                            placeholder='Enter your name'
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    )}

                    <Input
                        label="Email Address"
                        type="email"
                        placeholder='your@email.com'
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />

                    {currentState === 'Reset Password' && (
                        <Input
                            label="Verification Code (OTP)"
                            placeholder='Enter 6-digit OTP'
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            required
                        />
                    )}

                    {currentState !== 'Forgot Password' && (
                        <Input
                            label={currentState === 'Reset Password' ? 'New Password' : 'Password'}
                            type="password"
                            placeholder='••••••••'
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    )}
                </div>

                <div className='w-full flex justify-between text-xs font-semibold text-gray-500 uppercase tracking-widest mt-[-8px]'>
                    {currentState === 'Login' ? (
                        <span onClick={() => setCurrentState('Forgot Password')} className='cursor-pointer hover:text-[#FFD1DC] transition-colors'>Forgot password?</span>
                    ) : (
                        <span onClick={() => setCurrentState('Login')} className='cursor-pointer hover:text-[#FFD1DC] transition-colors'>Back to login</span>
                    )}

                    {currentState === 'Login' && (
                        <span onClick={() => setCurrentState('Sign Up')} className='cursor-pointer hover:text-[#FFD1DC] transition-colors'>Create account</span>
                    )}
                </div>

                <Button
                    type="submit"
                    variant="secondary"
                    className="w-full mt-4"
                    disabled={loading}
                >
                    {loading ? 'Processing...' :
                        currentState === 'Login' ? 'Sign In' :
                            currentState === 'Sign Up' ? 'Join Now' :
                                currentState === 'Forgot Password' ? 'Send OTP' : 'Update Password'}
                </Button>

                {currentState === 'Sign Up' && (
                    <p className='text-[10px] text-center text-gray-400 mt-2 uppercase tracking-widest'>
                        By signing up, you agree to our <span className='underline cursor-pointer'>Terms</span> & <span className='underline cursor-pointer'>Privacy Policy</span>.
                    </p>
                )}
            </form>
        </div>
    )
}

export default Login;