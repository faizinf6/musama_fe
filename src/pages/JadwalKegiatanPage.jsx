// src/pages/JadwalKegiatanPage.jsx
import React, {useEffect, useState} from 'react';
import { useQuery } from 'react-query';
import { Switch, Tab } from '@headlessui/react';
import { fetchMesin, fetchKelasLembaga, fetchKegiatan, createKegiatan } from './apiFetch';
import 'tailwindcss/tailwind.css';
import Navbar from "./Navbar";
import axios from 'axios';
import { ArrowPathIcon } from "@heroicons/react/24/solid";
import baseURL from "../config";
import {ToastContainer, toast} from 'react-toastify';
import {validateAdmin} from "./Beranda";


export const JadwalKegiatanPage = () => {
    const { data: daftarMesinAdmin } = useQuery('mesin', fetchMesin);
    const { data: listKelasLembaga } = useQuery('kelasLembaga', fetchKelasLembaga);
    const { data: daftarKegiatan, refetch: refetchKegiatan } = useQuery('kegiatan', fetchKegiatan);

    // State for "Tambah" tab
    const [lembaga, setLembaga] = useState('SDI');
    const [tahunAjaran, setTahunAjaran] = useState('2023-2024');
    const [namaKegiatan, setNamaKegiatan] = useState('');
    const [jamMulai, setJamMulai] = useState('');
    const [jamSelesai, setJamSelesai] = useState('');
    const [flagTerlambat, setFlagTerlambat] = useState(false);
    const [jamTerlambat, setJamTerlambat] = useState('');
    const [selectedMesin, setSelectedMesin] = useState([]);
    const [selectedKelasLembaga, setSelectedKelasLembaga] = useState([]);
    const [libur, setLibur] = useState('Tidak_Ada');
    const [selectAllKelas, setSelectAllKelas] = useState(false);

    // State for "Lihat" tab
    const [lembagaLihat, setLembagaLihat] = useState('Semua');

    const generateTahunAjaranOptions = (Instansi) => {
        let options = [];
        if (Instansi.toLowerCase() === 'madin') {
            for (let year = 1445; year <= 1460; year++) {
                options.push(`${year}-${year + 1}`);
            }
        } else {
            for (let year = 2023; year <= 2030; year++) {
                options.push(`${year}-${year + 1}`);
            }
        }
        return options;
    };
    const daysOfWeek = [ 'Tidak_Ada','Sabtu', 'Ahad','Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'];

    const handleSave = async () => {
        const data = {
            nama_kegiatan: namaKegiatan,
            pemilik: lembaga,
            libur_perminggu: libur,
            jam_mulai: jamMulai,
            jam_selesai: jamSelesai,
            bisa_terlambat: flagTerlambat,
            jam_terlambat: jamTerlambat,
            daftar_mesin: selectedMesin.map(mesin => ({
                id_mesin: mesin.nis,
                lokasi_mesin: mesin.rfid
            })),
            peserta: selectedKelasLembaga.map(kelas => ({
                Kelas: kelas.kelas
            }))
        };
        console.log(data);
        try {
            await createKegiatan(data);
            // Clear all fields if the request is successful
            setLembaga('SDI');
            setTahunAjaran('2023-2024');
            setNamaKegiatan('');
            setJamMulai('');
            setJamSelesai('');
            setJamTerlambat('');
            setSelectedMesin([]);
            setSelectedKelasLembaga([]);
            setLibur('Tidak_Ada');
            setSelectAllKelas(false);

            toast.success(`Berhasil membuat Kegiatan ${namaKegiatan}`, {autoClose: 1100,});

        } catch (error) {
            // Handle errors if needed
            console.error("Error creating kegiatan:", error);
        }
    };

    useEffect(() => {
        if (lembaga.toLowerCase() === 'madin') {
            setTahunAjaran('1445-1446');
        } else {
            setTahunAjaran('2023-2024');
        }
    }, [lembaga]);

    const handleStatusChange = async (kegiatan) => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (validateAdmin(user)){
            const updatedStatus = !kegiatan.status_kegiatan;
            try {
                await axios.patch(`${baseURL}/update-kegiatan`, {
                    ...kegiatan,
                    status_kegiatan: updatedStatus
                });
                refetchKegiatan();
            } catch (error) {
                console.error("Error updating kegiatan status:", error);
            }

        } else {
            toast.error(`hanya Admin / Operator yang dapat menonaktifkan kegiatan`, {autoClose: 3100,});
        }

    };

    const handleSelectAllKelas = () => {
        if (selectAllKelas) {
            setSelectedKelasLembaga([]);
        } else {
            setSelectedKelasLembaga(filteredKelas);
        }
        setSelectAllKelas(!selectAllKelas);
    };

    const filteredKelas = listKelasLembaga?.filter(
        kelas => kelas.pemilik.toLowerCase() === lembaga.toLowerCase() && kelas.tahun_ajaran === tahunAjaran
    );

    const colorMap = {
        'SDI': 'bg-orange-500',
        'Mts': 'bg-red-500',
        'MA': 'bg-blue-500',
        'Madin': 'bg-teal-500',
        'Pondok': 'bg-purple-500'
    };

    const colorBorderMap = {
        'SDI': 'border-orange-500',
        'Mts': 'border-red-500',
        'MA': 'border-blue-500',
        'Madin': 'border-teal-500',
        'Pondok': 'border-purple-500'
    };

    const filteredKegiatan = lembagaLihat === 'Semua'
        ? daftarKegiatan
        : daftarKegiatan?.filter(kegiatan => kegiatan.pemilik.toLowerCase() === lembagaLihat.toLowerCase());

    return (
        <div>
            <Navbar />
            <ToastContainer></ToastContainer>
            <div className="container mx-auto p-4">
                <Tab.Group>
                    <Tab.List className="flex m-2 p-1.5 bg-green-800 rounded-xl">
                        <Tab as="button" className={({ selected }) =>
                            selected ? "bg-white text-cyan-500 w-full rounded-lg p-2.5 font-bold" :
                                "text-blue-100 hover:bg-white/[0.12] w-full rounded-lg p-2.5"
                        }>
                            Lihat & Edit
                        </Tab>
                        <Tab as="button" className={({ selected }) =>
                            selected ? "bg-white text-orange-500 w-full rounded-lg p-2.5 font-bold" :
                                "text-blue-100 hover:bg-white/[0.12] w-full rounded-lg p-2.5"
                        }>
                            Tambah
                        </Tab>
                    </Tab.List>
                    <Tab.Panels>
                        <Tab.Panel>
                            <div className="space-y-4">
                                <div className="mt-4 flex items-center justify-between">
                                    <select onChange={(e) => setLembagaLihat(e.target.value)} value={lembagaLihat}
                                            className="block px-1 py-2.5 border-2 bg-white ml-2">
                                        {['Semua', 'SDI', 'Mts', 'MA', 'Madin', 'Pondok'].map((option) => (
                                            <option key={option} value={option}>{option}</option>
                                        ))}
                                    </select>
                                    <ArrowPathIcon onClick={refetchKegiatan} className="w-10 h-10 bg-teal-800 text-white p-1.5 rounded-lg"></ArrowPathIcon>
                                </div>
                                {filteredKegiatan?.map((kegiatan) => (
                                    <div key={kegiatan.id} className={`rounded-lg mx-2 pb-4 pl-4 shadow-md border-2 ${kegiatan.status_kegiatan ? colorBorderMap[kegiatan.pemilik] : `border-gray-200`}`}>
                                        <div className={`grid grid-cols-2 gap-2 `}>
                                            <div className="text-xl font-bold pt-2">{kegiatan.nama_kegiatan}</div>
                                            <div className={`ml-10 text-l font-bold text-white rounded-bl-2xl shadow ${kegiatan.status_kegiatan ? colorMap[kegiatan.pemilik] : `bg-gray-200`} p-2 text-center`}>{kegiatan.pemilik}</div>
                                        </div>
                                        <div className={`flex items-center`}>
                                            <div className="bg-gray-100 max-w-24 text-sm text-center p-1 mt-2">{`${kegiatan.jam_mulai} - ${kegiatan.jam_selesai}`}</div>
                                        </div>



                                        <div className="py-3 pr-3 ">
                                            <details>
                                                <summary>Lokasi Mesin Absen</summary>
                                                <table className="mt-2 w-full ">
                                                    <thead>
                                                    <tr>
                                                        <th>ID Mesin</th>
                                                        <th>Lokasi Mesin</th>
                                                    </tr>
                                                    </thead>
                                                    <tbody>
                                                    {kegiatan.daftar_mesin.map((mesin) => (
                                                        <tr key={mesin.id_mesin} className={`text-center border`}>
                                                            <td className={`py-1`}>{mesin.id_mesin}</td>
                                                            <td>{mesin.lokasi_mesin}</td>
                                                        </tr>
                                                    ))}
                                                    </tbody>
                                                </table>
                                            </details>
                                        </div>
                                        <div className="py-3">
                                            <details>
                                                <summary>Peserta Kegiatan</summary>
                                                <table className="mt-2 text-sm ">
                                                    <tbody>
                                                    {kegiatan.peserta.map((peserta, index) => (
                                                        <tr key={index}>
                                                            <td>{peserta.Kelas}</td>
                                                        </tr>
                                                    ))}
                                                    </tbody>
                                                </table>
                                            </details>
                                        </div>
                                        <div className="grid grid-cols-2 pr-3 mt-4">
                                            <Switch
                                                checked={kegiatan.status_kegiatan}
                                                onChange={() => handleStatusChange(kegiatan)}
                                                className={`relative inline-flex items-center h-6 rounded-full w-11 focus:outline-none ${kegiatan.status_kegiatan ? colorMap[kegiatan.pemilik] : 'bg-gray-300'}`}
                                            >
                                                <span className="sr-only">Toggle status</span>
                                                <span
                                                    className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${kegiatan.status_kegiatan ? 'translate-x-6' : 'translate-x-1'}`}
                                                />
                                            </Switch>
                                            <div className="border-b justify-self-end self-end text-sm text-gray-500">
                                                {`Libur tiap: ${kegiatan.libur_perminggu.toUpperCase()}`}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Tab.Panel>
                        <Tab.Panel>
                            <div className="space-y-4">
                                <div className="mt-4 grid grid-cols-3">
                                    <div>
                                        <label className="block ml-1 text-xs text-gray-500">Lembaga</label>
                                        <select onChange={(e) => setLembaga(e.target.value)} value={lembaga}
                                                className="block px-1 py-3 border-2 bg-white">
                                            {['SDI', 'Mts', 'MA', 'Madin', 'Pondok'].map((option) => (
                                                <option key={option} value={option}>{option}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block ml-1 text-xs text-gray-500">Tahun Ajaran</label>
                                        <select value={tahunAjaran} onChange={e => setTahunAjaran(e.target.value)} className="form-select px-1 py-3 border border-black shadow-lg bg-white font-bold">
                                            {generateTahunAjaranOptions(lembaga).map(option => (
                                                <option key={option} value={option}>{option}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <input type="text" placeholder="Nama Kegiatan" value={namaKegiatan}
                                           onChange={(e) => setNamaKegiatan(e.target.value)}
                                           className="block w-full px-1 py-3 border-2" />
                                </div>

                                <div>
                                    <label className="block ml-1 text-xs text-gray-500">Hari Libur berulang (dalam seminggu)</label>
                                    <select onChange={(e) => setLibur(e.target.value)} value={libur}
                                            className="block w-full px-1 py-3 border-2 bg-white">
                                        {daysOfWeek.map((day) => (
                                            <option key={day} value={day}>{day}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="px-2 py-3 border-2">
                                    <details>
                                        <summary>Waktu Absensi Kegiatan</summary>
                                        <div className={`mt-4 flex  items-center`} >

                                            <label className=" px-2 text-xs text-gray-500">Aktifkan Waktu Terlambat?</label>
                                            <Switch
                                                checked={flagTerlambat}
                                                onChange={() => setFlagTerlambat(!flagTerlambat)}
                                                className={`relative inline-flex items-center h-6 rounded-full w-11 focus:outline-none ${flagTerlambat ? 'bg-green-600': 'bg-gray-300'}`}
                                            >
                                                <span className="sr-only">Toggle status</span>
                                                <span
                                                    className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${flagTerlambat ? 'translate-x-6' : 'translate-x-1'}`}
                                                />
                                            </Switch>

                                        </div>

                                        <div className={`mb-2 mt-2`}>
                                            <input type="time" value={jamMulai}
                                                   onChange={(e) => setJamMulai(e.target.value)}
                                                   className="px-1 py-3 border-2 bg-white" />

                                            <label className="px-2 ml-1 text-xs text-gray-500">Mulai Absensi</label>

                                        </div>
                                        {flagTerlambat&& (<div className={`mb-2 mt-2`}>
                                            <input type="time" value={jamTerlambat}
                                                   onChange={(e) => setJamTerlambat(e.target.value)}
                                                   className="px-1 py-3 border-2 bg-white"/>
                                            <label className="px-2 ml-1 text-xs text-gray-500">Batas Terlambat</label>

                                        </div>)}
                                        <div className={`mb-2 mt-2`}>
                                            <input type="time" value={jamSelesai}
                                                   onChange={(e) => setJamSelesai(e.target.value)}
                                                   className="px-1 py-3 border-2 bg-white" />
                                            <label className="px-2 ml-1 text-xs text-gray-500">Selesai Absensi</label>

                                        </div>

                                    </details>
                                </div>


                                <div className="px-2 py-3 border-2">
                                    <details>
                                        <summary>Pilih Lokasi Mesin</summary>
                                        {daftarMesinAdmin?.map((mesin) => (
                                            <div key={mesin.nis} className="p-2 border-b">
                                                <label>
                                                    <input
                                                        className="mr-3 mt-1"
                                                        type="checkbox"
                                                        value={mesin.nis}
                                                        checked={selectedMesin.some(selected => selected.nis === mesin.nis)}
                                                        onChange={() => {
                                                            if (selectedMesin.some(selected => selected.nis === mesin.nis)) {
                                                                setSelectedMesin(selectedMesin.filter(selected => selected.nis !== mesin.nis));
                                                            } else {
                                                                setSelectedMesin([...selectedMesin, mesin]);
                                                            }
                                                        }}
                                                    />
                                                    {mesin.nama_admin} ({mesin.rfid})
                                                </label>
                                            </div>
                                        ))}
                                    </details>
                                </div>
                                <div className="px-2 py-3 border-2">
                                    <details>
                                        <summary>Pilih Peserta Kegiatan (Kelas)</summary>
                                        <div className="p-2 border-b">
                                            <label>
                                                <input
                                                    className="mr-3 mt-1"
                                                    type="checkbox"
                                                    checked={selectAllKelas}
                                                    onChange={handleSelectAllKelas}
                                                />
                                                Pilih semua
                                            </label>
                                        </div>
                                        {filteredKelas?.map((kelas) => (
                                            <div key={kelas.id} className="p-2 border-b">
                                                <label>
                                                    <input
                                                        className="mr-3 mt-1"
                                                        type="checkbox"
                                                        value={kelas.id}
                                                        checked={selectedKelasLembaga.some(selected => selected.id === kelas.id)}
                                                        onChange={() => {
                                                            if (selectedKelasLembaga.some(selected => selected.id === kelas.id)) {
                                                                setSelectedKelasLembaga(selectedKelasLembaga.filter(selected => selected.id !== kelas.id));
                                                            } else {
                                                                setSelectedKelasLembaga([...selectedKelasLembaga, kelas]);
                                                            }
                                                        }}
                                                    />
                                                    {kelas.kelas}
                                                </label>
                                            </div>
                                        ))}
                                    </details>
                                </div>
                                <button onClick={handleSave} className="bg-blue-500 text-white py-2 px-4">Simpan</button>
                            </div>
                        </Tab.Panel>
                    </Tab.Panels>
                </Tab.Group>
            </div>
        </div>
    );
};

export default JadwalKegiatanPage;
