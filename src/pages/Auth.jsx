import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import baseURL from "../config";
import logo from "../logo_ppds.png"
import logo_kadza from "../logo_kadza.png"

export const Auth = () => {
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async () => {
        try {
            const response = await axios.post(`${baseURL}/auth`, { phone, password });
            localStorage.setItem('user', JSON.stringify(response.data.admin));
            navigate('/beranda');
        } catch (error) {
            setError('Number or password wrong');
        }
    };

    return (
        <div className="flex flex-col items-center   justify-between relative">
            <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
                <img
                    className="mx-auto h-24 w-auto"
                    src={logo}
                    alt="Madinku"
                />
                <h1 className="italic mt-1 text-center text-2xl font-bold tracking-tight text-green-900">
                    Musama PPDS
                </h1>

                <h2 className=" text-center text-xs italic font-bold text-gray-700 mb-4">
                    (Manajemen Absensi Santri Multiguna)
                </h2>

            </div>

            <div className="bg-white p-6 rounded-xl shadow-xl w-80 mb-20 border-2 border-green-600 ">

                <input
                    type="text"
                    placeholder="Nomer Hape"
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
                <button onClick={handleLogin} className="w-full bg-green-600 text-white p-2 rounded">Masuk</button>
            </div>

            <div className=" flex flex-col items-center ">
                <label className="text-xs italic text-gray-300 mb-1">Powered by:</label>
                {/*myLogo*/}
                <img
                    className="h-16 w-auto rounded-full  border-2 border-gray-300 "
                    src={logo_kadza}
                    alt="Madinku"
                />
            </div>
        </div>
    );
};

