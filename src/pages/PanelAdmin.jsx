
import Navbar from "./Navbar";
import { QueryClient, QueryClientProvider } from 'react-query';
import {
    DocumentChartBarIcon,
    TableCellsIcon,
    UserGroupIcon,
    UserMinusIcon,
    UserPlusIcon
} from "@heroicons/react/16/solid";
import React, {useState} from "react";
import { Dialog } from '@headlessui/react';
import { XMarkIcon } from "@heroicons/react/24/outline";
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import * as XLSX from 'xlsx';
import {ToastContainer, toast} from 'react-toastify';
import {useNavigate} from "react-router-dom";
import baseURL from "../config";
import {UnggahFileExcelPage} from "./TesUploudFilePage";

const convertAndSendExcelData = (file) => {

    const reader = new FileReader();

    reader.onload = (e) => {
        const data = e.target.result;
        const workbook = XLSX.read(data, { type: 'binary' });

        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet);

        const json_data = json.map(row => {
            const asrama_value = String(row["Asrama"]).toLowerCase();
            const is_pondok = !asrama_value.includes('laju');

            const sekolah_value = String(row["Sekolah"]).toLowerCase();
            const madrasah_value = String(row["Madrasah"]).toLowerCase();

            const is_sdi = /\bsdi\b/.test(sekolah_value);
            const is_mts = /\bmts\b/.test(sekolah_value);
            const is_ma = /\bma\b/.test(sekolah_value);
            const is_madin = /\bmadin\b/.test(madrasah_value);

            return {
                nis: String(row["NIS"]),
                rfid: String(row["RFID"]),
                nama_santri: row["Nama"],
                gender: row["Jenis Kelamin"],
                is_pondok: is_pondok,
                is_sdi: is_sdi,
                is_mts: is_mts,
                is_ma: is_ma,
                is_madin: is_madin,
                kelas_sdi: is_sdi ? row["Kelas Sekolah"] : "-",
                kelas_mts: is_mts ? row["Kelas Sekolah"] : "-",
                kelas_ma: is_ma ? row["Kelas Sekolah"] : "-",
                kelas_madin: is_madin ? row["Kelas Madrasah"] : "-"
            };
        });
        console.log(json_data)

        axios.post(`${baseURL}/create-santri-banyak`, json_data)
            .then(response => {console.log('Upload successful:', response)
                toast.success("Berhasil!",{autoClose:1000})
            })
            .catch(error => console.error('Upload failed:', error));
    };

    reader.onerror = (error) => console.error('File reading error:', error);
    reader.readAsBinaryString(file);
};




const queryClient = new QueryClient();

export const PanelAdmin = () => {
    const [isModalOpen, setModalOpen] = useState(false);
    const [file, setFile] = useState(null);
    const navigate = useNavigate();

    const uploadFile = () => {
        if (file) {
            convertAndSendExcelData(file);
            setModalOpen(false)

        }

    };

    return (
        <QueryClientProvider client={queryClient}>
        <div>
            <Navbar/>
            <ToastContainer/>

            <div className="flex justify-center items-center space-x-5 mt-4">
                <div onClick={() => setModalOpen(true)} className={`flex flex-col items-center justify-center bg-orange-500 text-white py-5 w-28 rounded-md overflow-hidden shadow-lg shadow-orange-800`}>
                    <UserPlusIcon className="h-10 w-10 text-white" aria-hidden="true" />
                    <p className="mt-4 font-bold text-xs text-center">
                        Tambah Banyak!
                    </p>
                </div>

                <div
                    onClick={()=>{navigate('tambah-santri')}}
                    className={`flex flex-col items-center justify-center bg-orange-500 text-white py-5 w-28 rounded-md overflow-hidden shadow-lg shadow-orange-800`}>
                    <DocumentChartBarIcon className="h-10 w-10 text-white" aria-hidden="true" />
                    <p className="mt-4 font-bold text-xs text-center">
                        Dokumen
                    </p>
                </div>
                <div
                    onClick={()=>{navigate('daftar-admin')}}
                    className={`flex flex-col items-center justify-center bg-orange-500 text-white py-5 w-28 rounded-md overflow-hidden shadow-lg shadow-orange-800`}>
                    <TableCellsIcon className="h-10 w-10 text-white" aria-hidden="true" />
                    <p className="mt-4 font-bold text-xs text-center">
                        Daftar Admin
                    </p>
                </div>

            </div>



            <Dialog open={isModalOpen} onClose={() => setModalOpen(false)} className="relative z-50">
                <div className="fixed inset-0 bg-black/30" aria-hidden="true"></div>
                <div className="fixed inset-0 flex items-center justify-center p-4">
                    <Dialog.Panel className="relative mx-auto max-w-sm bg-white p-6 rounded-xl">
                        <button
                            onClick={() => setModalOpen(false)}
                            className="absolute top-0 right-0 mt-2 mr-2 bg-red-500 p-2 rounded-lg text-white"
                            aria-label="Close"
                        >
                            <XMarkIcon className="h-5 w-5" />
                        </button>

                        <UnggahFileExcelPage/>
                    </Dialog.Panel>
                </div>
            </Dialog>





        </div>
</QueryClientProvider>
    )
};
