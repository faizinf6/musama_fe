import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export const Auth = () => {
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async () => {
        try {
            const response = await axios.post('http://localhost:5000/auth', { phone, password });
            localStorage.setItem('user', JSON.stringify(response.data.admin));
            navigate('/beranda');
        } catch (error) {
            setError('Number or password wrong');
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <div className="bg-white p-6 rounded shadow-md w-80">
                <h1 className="text-2xl font-bold mb-4">Login</h1>
                <input
                    type="text"
                    placeholder="Phone Number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full mb-4 p-2 border rounded"
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full mb-4 p-2 border rounded"
                />
                {error && <h1 className="text-red-500 mb-4">{error}</h1>}
                <button onClick={handleLogin} className="w-full bg-blue-500 text-white p-2 rounded">Login</button>
            </div>
        </div>
    );
};


