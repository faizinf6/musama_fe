import React from 'react';
import axios from 'axios';
import { useQuery } from 'react-query';
import Navbar from "./Navbar";
import {ArrowPathIcon} from "@heroicons/react/24/solid";
import baseURL from "../config";

const fetchAdmins = async () => {
    const { data } = await axios.get(`${baseURL}/all-admin`);
    return data;
};

export const DaftarAdminPage = () => {
    const { data: dataAdmin, refetch } = useQuery('dataAdmin', fetchAdmins);

    return (
        <div>
            <Navbar></Navbar>
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Daftar Pengguna</h1>
            <ArrowPathIcon
                onClick={refetch}
                className="w-10 h-10 py-2 bg-blue-500 text-white rounded mb-10"
            >
            </ArrowPathIcon>
            {dataAdmin ? (
                <table className="min-w-full bg-white border ">
                    <thead>
                    <tr className={``}>
                        <th className="py-2 whitespace-nowrap">Nama Pengguna</th>
                        <th className="py-2 whitespace-nowrap">Kategori</th>
                        <th className="py-2 whitespace-nowrap">L/P</th>
                        <th className="py-2 whitespace-nowrap">Nomer HP</th>
                    </tr>
                    </thead>
                    <tbody>
                    {dataAdmin.map((admin) => (
                        <tr key={admin.nis}>
                            <td className="border px-4 py-2 whitespace-nowrap">{admin.nama_admin}</td>
                            <td className="border px-4 py-2 whitespace-nowrap">{admin.kategori}</td>
                            <td className="border px-4 py-2 whitespace-nowrap">{admin.gender}</td>
                            <td className="border px-4 py-2 whitespace-nowrap">{admin.nomer_hp}</td>
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