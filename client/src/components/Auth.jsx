import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // 1. WE MUST IMPORT THIS

const Auth = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });

    const navigate = useNavigate(); // 2. WE MUST INITIALIZE THIS RIGHT HERE

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Determine if we are hitting the login or register route
        const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';

        try {
            // Send the request to your backend running on port 5000
            const response = await fetch(`https://thumb-gen-master.vercel.app${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                if (data.user) {
                    localStorage.setItem('user', JSON.stringify(data.user));
                }
                if (data.token) {
                    localStorage.setItem('token', data.token);
                }

                if (isLogin) {
                    navigate('/dashboard');
                } else {
                    setIsLogin(true); // Switch to login view after successful registration
                }
            } else {
                alert(data.message || 'Something went wrong');
            }
        } catch (err) {
            console.error(err);
            alert('Failed to connect to the backend server.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
            <div className="bg-gray-800 p-8 rounded-xl shadow-lg w-full max-w-md">
                <h2 className="text-3xl font-bold text-center mb-6 text-pink-500">
                    {isLogin ? 'Welcome Back' : 'Create Account'}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {!isLogin && (
                        <>
                            <input
                                type="text" name="name" placeholder="Full Name" required
                                className="w-full p-3 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:border-pink-500"
                                onChange={handleChange}
                            />
                        </>
                    )}
                    <input
                        type="email" name="email" placeholder="Email Address" required
                        className="w-full p-3 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:border-pink-500"
                        onChange={handleChange}
                    />
                    <input
                        type="password" name="password" placeholder="Password" required
                        className="w-full p-3 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:border-pink-500"
                        onChange={handleChange}
                    />
                    <button type="submit" className="w-full bg-pink-600 hover:bg-pink-500 text-white p-3 rounded font-bold transition">
                        {isLogin ? 'Login' : 'Sign Up'}
                    </button>
                </form>

                <p className="text-center mt-4 text-gray-400">
                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                    <span
                        className="text-pink-400 cursor-pointer hover:underline"
                        onClick={() => setIsLogin(!isLogin)}
                    >
                        {isLogin ? 'Sign up' : 'Login'}
                    </span>
                </p>
            </div>
        </div>
    );
};

export default Auth;