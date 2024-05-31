// src/pages/JadwalKegiatanPage.jsx
import React, {useState} from 'react';
import {useQuery} from 'react-query';
import {Tab} from '@headlessui/react';
import {fetchMesin, fetchKelasLembaga, createKegiatan} from './apiFetch';
import axios from 'axios';
import 'tailwindcss/tailwind.css';
import Navbar from "./Navbar";

export const JadwalKegiatanPage = () => {
    const {data: daftarMesinAdmin} = useQuery('mesin', fetchMesin);
    const {data: listKelasLembaga} = useQuery('kelasLembaga', fetchKelasLembaga);

    const [lembaga, setLembaga] = useState('');
    const [academicYear, setAcademicYear] = useState('');
    const [namaKegiatan, setNamaKegiatan] = useState('');
    const [jamMulai, setJamMulai] = useState('');
    const [jamSelesai, setJamSelesai] = useState('');
    const [selectedMesin, setSelectedMesin] = useState([]);
    const [selectedKelasLembaga, setSelectedKelasLembaga] = useState([]);
    const [libur, setLibur] = useState('');

    const academicYears = Array.from({length: 8}, (_, i) => `${2023 + i}-${2024 + i}`);
    const daysOfWeek = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

    const handleSave = async () => {
        const data = {
            nama_kegiatan: namaKegiatan,
            pemilik: lembaga,
            libur_perminggu: libur,
            jam_mulai: jamMulai,
            jam_selesai: jamSelesai,
            daftar_mesin: selectedMesin.map(mesin => ({
                id_mesin: mesin.nis,
                lokasi_mesin: mesin.nama_admin
            })),
            peserta: selectedKelasLembaga.map(kelas => ({
                Kelas: kelas.kelas
            }))
        };
        await createKegiatan(data);
        // handle response or errors
    };

    const filteredKelas = listKelasLembaga?.filter(
        kelas => kelas.pemilik.toLowerCase() === lembaga.toLowerCase() && kelas.tahun_ajaran === academicYear
    );

    return (
        <div>
            <Navbar></Navbar>
            <div className="container mx-auto p-4">
                <Tab.Group>
                    <Tab.List className="flex m-2 p-1.5  bg-green-800 rounded-xl">
                        <Tab as="button" className={({selected}) =>
                            selected ? "bg-white text-cyan-500 w-full rounded-lg p-2.5 font-bold" :
                                "text-blue-100 hover:bg-white/[0.12] w-full rounded-lg p-2.5"
                        }>
                            Lihat & Edit
                        </Tab>
                        <Tab as="button" className={({selected}) =>
                            selected ? "bg-white text-orange-500 w-full rounded-lg p-2.5 font-bold" :
                                "text-blue-100 hover:bg-white/[0.12] w-full rounded-lg p-2.5"
                        }>
                            Tambah
                        </Tab>
                    </Tab.List>
                    <Tab.Panels>
                        <Tab.Panel>
                            {/* Lihat tab content */}
                        </Tab.Panel>
                        <Tab.Panel>
                            <div className="space-y-4">

                                <div className="mt-4 grid grid-cols-3">

                                <div>
                                    <label className="block ml-1 text-xs text-gray-500">Lembaga</label>
                                    <select onChange={(e) => setLembaga(e.target.value)} value={lembaga}
                                            className="block px-1 py-3 border-2">

                                        {['SDI', 'Mts', 'MA', 'Madin', 'Pondok'].map((option) => (
                                            <option key={option} value={option}>{option}</option>
                                        ))}
                                    </select>

                                </div>


                                <div>
                                    <label className="block ml-1 text-xs text-gray-500">Tahun Ajaran</label>
                                    <select onChange={(e) => setAcademicYear(e.target.value)} value={academicYear}
                                            className="block  px-1 py-3 border-2">
                                        {academicYears.map((year) => (
                                            <option key={year} value={year}>{year}</option>
                                        ))}
                                    </select>
                                </div>

                                </div>

                                <div>
                                    {/*<label className="block ml-1 text-xs text-gray-500">Tahun Ajaran</label>*/}
                                    <input type="text" placeholder="Nama Kegiatan" value={namaKegiatan}
                                           onChange={(e) => setNamaKegiatan(e.target.value)}
                                           className="block w-full px-1 py-3 border-2"/>
                                </div>

                                <div className="grid grid-cols-3 gap-4">

                                    <div className="">
                                        <label className="ml-1 text-xs text-gray-500">Waktu Mulai</label>
                                        <input type="time" value={jamMulai}
                                               onChange={(e) => setJamMulai(e.target.value)}
                                               className=" px-1 py-3 border-2"/>

                                    </div>


                                    <div className="">
                                        <label className="ml-1 text-xs text-gray-500">Waktu Selesai</label>
                                        <input type="time" value={jamSelesai}
                                               onChange={(e) => setJamSelesai(e.target.value)}
                                               className="px-1 py-3 border-2"/>
                                    </div>
                                </div>

                                <div className="px-2 py-3 border-2">
                                    <details>
                                        <summary>Daftar Mesin</summary>
                                        {daftarMesinAdmin?.map((mesin) => (
                                            <div key={mesin.nis} className="p-2">
                                                <label>
                                                    <input
                                                        className="mr-3"
                                                        type="checkbox" value={mesin.nis}
                                                        onChange={() => setSelectedMesin([...selectedMesin, mesin])}

                                                    />
                                                    {mesin.nama_admin}
                                                </label>
                                            </div>
                                        ))}
                                    </details>
                                </div>

                                <div className="px-2 py-3 border-2">
                                    <details>
                                        <summary>Daftar Kelas</summary>
                                        {filteredKelas?.map((kelas) => (
                                            <div key={kelas.id}>
                                                <label>
                                                    <input type="checkbox" value={kelas.id}
                                                           onChange={() => setSelectedKelasLembaga([...selectedKelasLembaga, kelas])}/>
                                                    {kelas.kelas}
                                                </label>
                                            </div>
                                        ))}
                                    </details>
                                </div>


                                <select onChange={(e) => setLibur(e.target.value)} value={libur}
                                        className="block w-full px-1 py-3 border-2">
                                    <option value="">Pilih Hari Libur</option>
                                    {daysOfWeek.map((day) => (
                                        <option key={day} value={day}>{day}</option>
                                    ))}
                                </select>
                                <button onClick={handleSave} className="bg-blue-500 text-white py-2 px-4">Simpan
                                </button>
                            </div>
                        </Tab.Panel>

                    </Tab.Panels>
                </Tab.Group>
            </div>
        </div>
    );
};

