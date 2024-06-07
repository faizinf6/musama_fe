import React, { useState } from 'react';
import { Tab } from '@headlessui/react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import 'tailwindcss/tailwind.css';
import Navbar from "./Navbar";
import {ToastContainer, toast} from 'react-toastify';
import {ArrowPathIcon} from "@heroicons/react/24/solid";
import baseURL from "../config";
import moment from "moment-timezone";

// Fetch activities from the API
const fetchKegiatan = async () => {
    const response = await axios.get(`${baseURL}/all-kegiatan`);
    return response.data;
};

// Fetch holidays from the API
const fetchKalenderLibur = async () => {
    const response = await axios.get(`${baseURL}/all-kalenderlibur`);
    return response.data;
};

// Save kalender libur data to the API
const saveKalenderLibur = async (data) => {
    const response = await axios.post(`${baseURL}/create-kalenderlibur`, data);
    return response.data;
};

const KalenderLiburPage = () => {
    const queryClient = useQueryClient();

    // Use the useQuery hook to fetch kegiatan
    const { data: daftarKegiatan = [], isLoading: isLoadingKegiatan, isError: isErrorKegiatan } = useQuery({
        queryKey: ['kegiatan'],
        queryFn: fetchKegiatan,
    });

    // Use the useQuery hook to fetch kalender libur
    const { data: jadwalHariLibur = [], refetch: refetchKalenderLibur, isLoading: isLoadingKalenderLibur, isError: isErrorKalenderLibur } = useQuery({
        queryKey: ['kalenderLibur'],
        queryFn: fetchKalenderLibur,
    });

    // Use the useMutation hook for saving kalender libur
    const mutation = useMutation({
        mutationFn: saveKalenderLibur,
        onSuccess: () => {
            queryClient.invalidateQueries(['kegiatan']);
            queryClient.invalidateQueries(['kalenderLibur']);
            resetForm();
            toast.success(`Berhasil membuat Hari Libur`, {autoClose: 1100,});

        },
    });

    const [selectedDate, setSelectedDate] = useState(moment.tz('Asia/Jakarta').toDate());
    const [namaHari, setNamaHari] = useState('');
    const [selectedKegiatan, setSelectedKegiatan] = useState([]);
    const [selectAll, setSelectAll] = useState(false);

    const handleSelectAll = () => {
        setSelectAll(!selectAll);
        if (!selectAll) {
            setSelectedKegiatan(daftarKegiatan.map(k => k.id));
        } else {
            setSelectedKegiatan([]);
        }
    };

    const handleCheckboxChange = (id) => {
        setSelectedKegiatan(prev =>
            prev.includes(id) ? prev.filter(k => k !== id) : [...prev, id]
        );
    };

    const handleSubmit = () => {
        const data = {
            sudah_terlewati: false,
            id_kegiatan_terimbas: selectedKegiatan,
            tanggal: moment(selectedDate).tz('Asia/Jakarta').format('YYYY-MM-DD'), // Format as YYYY-MM-DD
            nama_hari: namaHari,
        };
        mutation.mutate(data);
    };
    const resetForm = () => {
        setSelectedDate(new Date());
        setNamaHari('');
        setSelectedKegiatan([]);
        setSelectAll(false);
    };

    return (
        <div>
            <Navbar />
            <ToastContainer />
            <div className="container mx-auto p-4">
                <Tab.Group>
                    <Tab.List className="flex m-2 p-1.5 bg-green-800 rounded-xl">
                        <Tab as="button" className={({ selected }) =>
                            selected ? "bg-white text-cyan-500 w-full rounded-lg p-2.5 font-bold" :
                                "text-blue-100 hover:bg-white/[0.12] w-full rounded-lg p-2.5"
                        }>
                            Daftar Hari Libur
                        </Tab>
                        <Tab as="button" className={({ selected }) =>
                            selected ? "bg-white text-orange-500 w-full rounded-lg p-2.5 font-bold" :
                                "text-blue-100 hover:bg-white/[0.12] w-full rounded-lg p-2.5"
                        }>
                            Tambah Hari Libur
                        </Tab>
                    </Tab.List>
                    <Tab.Panels className="mt-2">
                        <Tab.Panel>
                            <div className="space-y-4">
                                <ArrowPathIcon
                                    onClick={() => refetchKalenderLibur()}
                                    className="mt-4 w-10 h-10 bg-green-800 text-white p-2 rounded-lg"
                                >
                                </ArrowPathIcon>
                                {isLoadingKalenderLibur && <p>Loading...</p>}
                                {isErrorKalenderLibur && <p>Error loading data.</p>}
                                {jadwalHariLibur.map((libur,index) => (
                                    <div key={libur.id} className={`border p-4 rounded shadow bg-teal-700`}>
                                        <div className={`flex justify-between mb-3 items-center text-white`}>
                                            <p className="font-bold">{libur.nama_hari}</p>
                                            <p className="font-bold">{libur.tanggal}</p>

                                        </div>
                                        <label className="block text-xs text-white">Berlaku pada kegiatan:</label>

                                        <ul className="list-disc list-inside text-l text-white">
                                            {libur.id_kegiatan_terimbas.map(id => {
                                                const kegiatan = daftarKegiatan.find(k => k.id === id);
                                                return kegiatan ? <li key={id} className={``}>{kegiatan.nama_kegiatan} ({kegiatan.pemilik})</li> : null;
                                            })}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        </Tab.Panel>
                        <Tab.Panel>
                            <div className="space-y-4">
                                <div>
                                    <label className="block ml-1 text-xs text-gray-500">Pilih Tanggal</label>
                                    <DatePicker
                                        selected={selectedDate}
                                        onChange={date => setSelectedDate(date)}
                                        dateFormat="dd-MM-yyyy"
                                        className="border p-2 rounded "
                                    />
                                </div>
                                <div>
                                    <label className="block ml-1 text-xs text-gray-500">Nama Libur</label>
                                    <input
                                        type="text"
                                        value={namaHari}
                                        onChange={e => setNamaHari(e.target.value)}
                                        placeholder="Nama Hari"
                                        className="font-bold border p-2 rounded w-full"
                                    />
                                </div>
                                <div className="px-2 py-3 border-2">
                                    <details>
                                        <summary>Berlaku Untuk kegiatan:</summary>
                                        <div className="accordion-body p-2">
                                            <div className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    checked={selectAll}
                                                    onChange={handleSelectAll}
                                                />
                                                <label className="ml-2">Pilih Semua</label>
                                            </div>
                                            {isLoadingKegiatan && <p>Loading...</p>}
                                            {isErrorKegiatan && <p>Error loading data.</p>}
                                            {daftarKegiatan.map(kegiatan => (
                                                <div key={kegiatan.id} className="flex items-center mt-2">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedKegiatan.includes(kegiatan.id)}
                                                        onChange={() => handleCheckboxChange(kegiatan.id)}
                                                    />
                                                    <label className="ml-2">{kegiatan.nama_kegiatan}</label>
                                                </div>
                                            ))}
                                        </div>
                                    </details>
                                </div>

                            </div>

                            <div className={`flex justify-between mt-20`}>
                                <div></div>
                                <button
                                    onClick={handleSubmit}
                                    className="bg-green-700 text-white p-2 rounded"
                                >
                                    Simpan
                                </button>
                            </div>
                        </Tab.Panel>
                    </Tab.Panels>
                </Tab.Group>
            </div>
        </div>
    );
};

export default KalenderLiburPage;
