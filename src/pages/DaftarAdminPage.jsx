import React from 'react';
import axios from 'axios';
import { useQuery } from 'react-query';
import Navbar from "./Navbar";

const fetchAdmins = async () => {
    const { data } = await axios.get('http://localhost:5000/all-admin');
    return data;
};

export const DaftarAdminPage = () => {
    const { data: dataAdmin, refetch } = useQuery('dataAdmin', fetchAdmins);

    return (
        <div>
            <Navbar></Navbar>
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Admin Table</h1>
            <button
                onClick={refetch}
                className="mb-4 px-4 py-2 bg-blue-500 text-white rounded"
            >
                Refresh
            </button>
            {dataAdmin ? (
                <table className="min-w-full bg-white border">
                    <thead>
                    <tr>
                        <th className="py-2">NIS</th>
                        <th className="py-2">RFID</th>
                        <th className="py-2">Nama Admin</th>
                        <th className="py-2">Kategori</th>
                        <th className="py-2">Gender</th>
                        <th className="py-2">Nomer HP</th>
                    </tr>
                    </thead>
                    <tbody>
                    {dataAdmin.map((admin) => (
                        <tr key={admin.nis}>
                            <td className="border px-4 py-2">{admin.nis}</td>
                            <td className="border px-4 py-2">{admin.rfid}</td>
                            <td className="border px-4 py-2">{admin.nama_admin}</td>
                            <td className="border px-4 py-2">{admin.kategori}</td>
                            <td className="border px-4 py-2">{admin.gender}</td>
                            <td className="border px-4 py-2">{admin.nomer_hp}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            ) : (
                <p>Loading...</p>
            )}
        </div></div>
    );



}