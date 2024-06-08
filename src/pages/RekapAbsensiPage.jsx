import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useQuery } from 'react-query';
import moment from 'moment';
import html2canvas from 'html2canvas';
import * as XLSX from 'xlsx';
import '../index.css';
import Navbar from "./Navbar";
import {ToastContainer} from "react-toastify";
import baseURL from "../config";

const RekapAbsensiPage = () => {
    const [institution, setInstitution] = useState('SDI');
    const [academicYear, setAcademicYear] = useState('2023-2024');
    const [kelas, setKelas] = useState([]);
    const [kegiatan, setKegiatan] = useState([]);
    const [selectedKelas, setSelectedKelas] = useState('');
    const [selectedKegiatan, setSelectedKegiatan] = useState('');
    const [selectedNamaKegiatan, setNamaSelectedKegiatan] = useState('');
    const [month, setMonth] = useState('Januari');
    const [year, setYear] = useState('2023');
    const [daysInMonth, setDaysInMonth] = useState(31);
    const [attendanceData, setAttendanceData] = useState([]);
    const [saveFormat, setSaveFormat] = useState('image');

    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    const years = Array.from({ length: 8 }, (_, i) => (2023 + i).toString());

    const { data: kelasData } = useQuery('kelasData', () =>
        axios.get(`${baseURL}/all-kelaslembaga`).then(res => res.data)
    );

    const { data: kegiatanData } = useQuery('kegiatanData', () =>
        axios.get(`${baseURL}/all-kegiatan`).then(res => res.data)
    );

    const keteranganKehadiranMap = {
        'HADIR': '·',
        'ALPA': 'A',
        'SAKIT': 'S',
        'IZIN': 'I',
        'null': '-'
    };


    useEffect(() => {
        if (kelasData) {
            const filteredKelas = kelasData.filter(k => k.pemilik.toLowerCase() === institution.toLowerCase() && k.tahun_ajaran === academicYear);
            setKelas(filteredKelas);
            if (filteredKelas.length > 0) {
                setSelectedKelas(filteredKelas[0].kelas);
            } else {
                setSelectedKelas('');
            }
        }
    }, [kelasData, institution, academicYear]);

    useEffect(() => {
        if (kegiatanData) {
            const filteredKegiatan = kegiatanData.filter(k => k.pemilik.toLowerCase() === institution.toLowerCase());
            setKegiatan(filteredKegiatan);
            if (filteredKegiatan.length > 0) {
                setSelectedKegiatan(filteredKegiatan[0].id);
                setNamaSelectedKegiatan(filteredKegiatan[0].nama_kegiatan);

            } else {
                setSelectedKegiatan('');
                setNamaSelectedKegiatan('');
            }
        }
    }, [kegiatanData, institution]);

    useEffect(() => {
        const calculateDaysInMonth = () => {
            const monthIndex = months.indexOf(month) + 1; // Adjust for 1-based index
            const days = moment(`${year}-${monthIndex}`, 'YYYY-MM').daysInMonth();
            setDaysInMonth(days);
        };

        calculateDaysInMonth();
    }, [month, year]);

    const handleFetchAttendance = async () => {
        const bodyreqData = {
            id_kegiatan: selectedKegiatan,
            nama_pemilik: institution,
            nama_kelas: selectedKelas,
            tahun_ajaran: academicYear,
            days: daysInMonth
        }
        console.log(bodyreqData)
        const response = await axios.post(`${baseURL}/rekap-absensi`, bodyreqData);
        setAttendanceData(response.data);
    };

    const handleSave = () => {
        const table = document.getElementById('attendanceTable');
        if (saveFormat === 'image') {
            html2canvas(table, {
                scale: 4,
                useCORS: true
            }).then(canvas => {
                const link = document.createElement('a');
                link.download = 'attendanceTable.png';
                link.href = canvas.toDataURL('image/png', 1.0);
                link.click();
            });
        } else {
            const workbook = XLSX.utils.table_to_book(table);
            XLSX.writeFile(workbook, 'attendanceTable.xlsx');
        }
    };


    return (
        <div>
            <Navbar></Navbar>
            <ToastContainer></ToastContainer>

        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Rekap Absensi</h1>
            <div className={`grid grid-cols-2 gap-2 mt-4`}>
                <div className="">
                    <label className="block mb-1 ml-1 text-xs text-gray-500">Institusi</label>
                    <select value={institution} onChange={e => setInstitution(e.target.value)} className="p-2 border rounded w-full bg-white">
                        <option value="SDI">SDI</option>
                        <option value="MTS">MTS</option>
                        <option value="Ma">MA</option>
                        <option value="MADIN">MADIN</option>
                    </select>
                </div>
                <div className="">
                    <label className="block mb-1 ml-1 text-xs text-gray-500">Tahun Ajaran</label>
                    <select value={academicYear} onChange={e => setAcademicYear(e.target.value)} className="p-2 border rounded w-full bg-white">
                        <option value="2023-2024">2023-2024</option>
                        <option value="2024-2025">2024-2025</option>
                        <option value="2025-2026">2025-2026</option>
                    </select>
                </div>
                <div className="">
                    <label className="block mb-1 ml-1 text-xs text-gray-500">Kelas</label>
                    <select value={selectedKelas} onChange={e => setSelectedKelas(e.target.value)} className="p-2 border rounded w-full bg-white">
                        {kelas.map(k => (
                            <option key={k.id} value={k.kelas}>{k.kelas}</option>
                        ))}
                    </select>
                </div>
                <div className="">
                    <label className="block mb-1 ml-1 text-xs text-gray-500">Kegiatan</label>
                    <select value={selectedKegiatan} onChange={e => {
                        setSelectedKegiatan(e.target.value)
                        setNamaSelectedKegiatan(e.target.value);

                    }} className="p-2 border rounded w-full bg-white">
                        {kegiatan.map(k => (
                            <option key={k.id} value={k.id}>{k.nama_kegiatan}</option>
                        ))}
                    </select>
                </div>

                <div className="">
                    <label className="block mb-1 ml-1 text-xs text-gray-500">Bulan</label>
                    <select value={month} onChange={e => setMonth(e.target.value)} className="p-2 border rounded w-full bg-white">
                        {months.map((m, idx) => (
                            <option key={idx} value={m}>{m}</option>
                        ))}
                    </select>
                </div>
                <div className="">
                    <label className="block mb-1 ml-1 text-xs text-gray-500">Tahun</label>
                    <select value={year} onChange={e => setYear(e.target.value)} className="p-2 border rounded w-full bg-white">
                        {years.map((y, idx) => (
                            <option key={idx} value={y}>{y}</option>
                        ))}
                    </select>
                </div>


            </div>

            <div className="my-4">
                <button onClick={handleFetchAttendance} className="p-2 bg-blue-500 text-white rounded">Proses</button>
            </div>
            {attendanceData.length > 0 && (
                <div className="mb-4 ">
                    <div>
                        <h1>Absensi {selectedNamaKegiatan}</h1>

                    <table id="attendanceTable" className="table-auto w-full p-4 custom-table border-2 border-black">
                        <thead className={`bg-yellow-300 `}>
                        <tr>
                            <th className="py-1 border border-black  text-xs font-semibold text-gray-600 uppercase whitespace-nowrap">Nama Santri</th>
                            {Array.from({ length: daysInMonth }, (_, i) => (
                                <th key={i} className="py-1 border border-black  text-xs font-semibold text-black uppercase whitespace-nowrap">{i + 1}</th>
                            ))}
                            <th className="py-1 border  border-black text-xs font-semibold text-black uppercase whitespace-nowrap">H</th>
                            <th className="py-1 border border-black  text-xs font-semibold text-black uppercase whitespace-nowrap">A</th>
                            <th className="py-1 border border-black  text-xs font-semibold text-black uppercase whitespace-nowrap">S</th>
                            <th className="py-1 border  border-black text-xs font-semibold text-black uppercase whitespace-nowrap">I</th>
                        </tr>
                        </thead>
                        <tbody>
                        {attendanceData.map((record, idx) => (
                            <tr key={idx} className={`${idx%2===0 ? 'bg-white' : 'bg-gray-100'} }`}>
                                <td className="whitespace-nowrap px-3 border border-black">{record.santri.nama_santri}</td>
                                {Array.from({ length: daysInMonth }, (_, i) => (
                                    <td key={i} className={`px-3 py-1 border border-black text-sm ${record.attendance_data[`day${i + 1}`] === 'HADIR' ? 'font-black text-xl' : ''}`}>{keteranganKehadiranMap[record.attendance_data[`day${i + 1}`]] || ''}</td>
                                ))}
                                <td className="px-3 py-1 border border-black text-sm">{record.totalHadir}</td>
                                <td className="px-3 py-1 border border-black text-sm">{record.totalAlpa}</td>
                                <td className="px-3 py-1 border border-black text-sm">{record.totalSakit}</td>
                                <td className="px-3 py-1 border border-black text-sm">{record.totalIzin}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>

                    </div>
                    <div className="mt-4">
                        <label className="block mb-2">Save Format</label>
                        <div className="mb-4">
                            <label className="mr-4">
                                <input type="radio" value="image" checked={saveFormat === 'image'} onChange={() => setSaveFormat('image')} /> Image
                            </label>
                            <label>
                                <input type="radio" value="excel" checked={saveFormat === 'excel'} onChange={() => setSaveFormat('excel')} /> Excel
                            </label>
                        </div>
                        <button onClick={handleSave} className="p-2 bg-green-500 text-white rounded">Simpan</button>
                    </div>
                </div>
            )}
        </div>
        </div>
    );
};

export default RekapAbsensiPage;
