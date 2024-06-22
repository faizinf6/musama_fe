import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useQuery } from 'react-query';
import moment from 'moment';
import html2canvas from 'html2canvas';
import * as XLSX from 'xlsx';
import '../index.css';
import Navbar from "./Navbar";
import { ToastContainer } from "react-toastify";
import baseURL from "../config";

const RekapAbsensiPage = () => {
    const [lembaga, setLembaga] = useState('SDI');
    const [tahunAjaran, setTahunAjaran] = useState('2023-2024');
    const [kelas, setKelas] = useState([]);
    const [kegiatan, setKegiatan] = useState([]);
    const [selectedKelas, setSelectedKelas] = useState('');
    const [selectedKegiatan, setSelectedKegiatan] = useState('');
    const [selectedNamaKegiatan, setNamaSelectedKegiatan] = useState('');
    const [month, setMonth] = useState('Januari');
    const [selectedYear, setSelectedYear] = useState('2023');
    const [umurBulanHijri, setUmurBulanHijri] = useState(0);
    const [attendanceData, setAttendanceData] = useState([]);
    const [saveFormat, setSaveFormat] = useState('image');
    const [tanggalSelesai, setTanggalSelesai] = useState('31');
    const [tanggalMulai, setTanggalMulai] = useState('1');

    const namabulanMiladi = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    const namaBulanHijri = ['Muharam', 'Safar', 'Rabiul Awal', 'Rabiul Akhir', 'Jumadil Awal', 'Jumadil Akhir', 'Rajab', 'Syaban', 'Ramadhan', 'Syawal', 'Dzulqodah', 'Dzulhijjah'];
    const years = Array.from({ length: 8 }, (_, i) => (2023 + i).toString());
    const hijriYears = Array.from({ length: 8 }, (_, i) => (1445 + i).toString());

    const { data: kelasData } = useQuery('kelasData', () =>
        axios.get(`${baseURL}/all-kelaslembaga`).then(res => res.data)
    );

    const { data: kegiatanData } = useQuery('kegiatanData', () =>
        axios.get(`${baseURL}/all-kegiatan`).then(res => res.data)
    );

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

    const keteranganKehadiranMap = {
        'HADIR': '·',
        'ALPA': 'A',
        'SAKIT': 'S',
        'IZIN': 'I',
        'LIBUR': '',
        'null': '-'
    };

    const singkatanMap = {
        'MADIN': 'Madrasah Diniyah Darussaadah',
        'MTS': 'Madrasah Tsanawiyah Assaadah',
    };

    useEffect(() => {
        if (kelasData) {
            const filteredKelas = kelasData.filter(k => k.pemilik.toLowerCase() === lembaga.toLowerCase() && k.tahun_ajaran === tahunAjaran);
            setKelas(filteredKelas);
        }
    }, [kelasData, lembaga, tahunAjaran]);

    useEffect(() => {
        if (kegiatanData) {
            const filteredKegiatan = kegiatanData.filter(k => k.pemilik.toLowerCase() === lembaga.toLowerCase());
            setKegiatan(filteredKegiatan);
            if (filteredKegiatan.length > 0) {
                setSelectedKegiatan(filteredKegiatan[0].id);
                setNamaSelectedKegiatan(filteredKegiatan[0].nama_kegiatan);
            } else {
                setSelectedKegiatan('');
                setNamaSelectedKegiatan('');
            }
        }
    }, [kegiatanData, lembaga]);

    useEffect(() => {
        const calculateDaysInMonth = () => {
            const monthIndexMiladi = namabulanMiladi.indexOf(month) + 1;
            const monthIndexHijri = namaBulanHijri.indexOf(month) + 1;

            let tanggalMulaiHijri = '1';
            let jumlahHariBulanHijri = 1;
            let tanggalSelesaiHijri = '1';

            if (lembaga === 'MADIN') {
                const tanggalMiladi = hijriToGregorian(selectedYear, monthIndexHijri, 1);
                tanggalMulaiHijri = `${tanggalMiladi.day}-${tanggalMiladi.month}-${tanggalMiladi.year}`;
                const tanggal30 = hijriToGregorian(selectedYear, monthIndexHijri, 30);
                const tanggalHijri30 = masehiToHijri(tanggal30.year, tanggal30.month, tanggal30.day);

                if (monthIndexHijri === tanggalHijri30.month) {
                    jumlahHariBulanHijri = 30;
                } else {
                    jumlahHariBulanHijri = 29;
                }

                const tanggalHijriMahfud = hijriToGregorian(selectedYear, monthIndexHijri, jumlahHariBulanHijri);
                tanggalSelesaiHijri = `${tanggalHijriMahfud.day}-${tanggalHijriMahfud.month}-${tanggalHijriMahfud.year}`;

                setTanggalSelesai(`${tanggalSelesaiHijri}`);
                setTanggalMulai(`${tanggalMulaiHijri}`);
                setUmurBulanHijri(jumlahHariBulanHijri);
            } else {
                const tanggalDihitungMiladi = totalDaysOfMonthInt(monthIndexMiladi, selectedYear);
                setTanggalSelesai(`${tanggalDihitungMiladi.tanggal_selesai}-${monthIndexMiladi}-${selectedYear}`);
                setTanggalMulai(`${tanggalDihitungMiladi.tanggal_mulai}-${monthIndexMiladi}-${selectedYear}`);
            }
        };

        calculateDaysInMonth();
    }, [month, selectedYear, lembaga]);

    useEffect(() => {
        const calculateDaysInMonth = () => {
            const currentMoment = moment();
            const day = currentMoment.date();
            const month = currentMoment.month() + 1;
            const year = currentMoment.year();

            const currentMonthHijri = masehiToHijri(year, month, day).month;

            if (lembaga === 'MADIN') {
                let hijri = masehiToHijri(year, month, day).year;
                setSelectedYear(`${hijri}`);
                setTahunAjaran('1445-1446');
                setMonth(namaBulanHijri[currentMonthHijri - 1]);
            } else {
                setSelectedYear(`${year}`);
                setTahunAjaran('2023-2024');
                setMonth(namabulanMiladi[month - 1]);
            }
        };

        calculateDaysInMonth();
    }, [lembaga]);

    useEffect(() => {
        if (selectedNamaKegiatan === 'Musyawarah') {
            if (kelasData) {
                const filteredKelas = kelasData.filter(k => k.pemilik.toLowerCase() === lembaga.toLowerCase() && k.tahun_ajaran === tahunAjaran);
                setKelas(filteredKelas);
            }
        } else if (selectedNamaKegiatan === 'Sekolah Pagi') {
            if (kelasData) {
                const filteredKelas = kelasData.filter(k => k.pemilik.toLowerCase() === lembaga.toLowerCase() && k.tahun_ajaran === tahunAjaran && k.kelas.toLowerCase().endsWith('pagi'));
                setKelas(filteredKelas);
            }
        } else if (selectedNamaKegiatan === 'Sekolah Siang') {
            if (kelasData) {
                const filteredKelas = kelasData.filter(k => k.pemilik.toLowerCase() === lembaga.toLowerCase() && k.tahun_ajaran === tahunAjaran && k.kelas.toLowerCase().endsWith('siang'));
                setKelas(filteredKelas);
            }
        }
    }, [selectedNamaKegiatan, kelasData, lembaga, tahunAjaran]);

    useEffect(() => {
        if (kelas.length > 0) {
            setSelectedKelas(kelas[0].kelas);
        } else {
            setSelectedKelas('');
        }
    }, [kelas]);

    const handleFetchAttendance = async () => {
        let hijriDate = masehiToHijri(2024, 6, 11);
        let miladiDate = hijriToGregorian(hijriDate.year, hijriDate.month, hijriDate.day);
        console.log(`Miladi Date: ${miladiDate.day}-${miladiDate.month}-${miladiDate.year}`);
        console.log(tanggalMulai);
        console.log(tanggalSelesai);

        const bodyreqData = {
            id_kegiatan: selectedKegiatan.toString(),
            nama_pemilik: lembaga.toLowerCase(),
            nama_kelas: selectedKelas,
            tahun_ajaran: tahunAjaran,
            tanggal_mulai: tanggalMulai,
            tanggal_sampai: tanggalSelesai
        };

        console.log(bodyreqData);
        const response = await axios.post(`${baseURL}/rekap-absensi`, bodyreqData);
        setAttendanceData(response.data);
        console.log(response.data);
    };

    const handleSave = () => {
        const table = document.getElementById('attendanceTableContainer');
        const tableContainer = document.getElementById('attendanceTableContainer');
        const tableContainerWidth = tableContainer.scrollWidth;
        const tableContainerHeight = tableContainer.scrollHeight;
        const tableContainerScrollX = tableContainer.scrollLeft;
        const tableContainerScrollY = tableContainer.scrollTop;

        if (saveFormat === 'image') {
            html2canvas(table, {
                scale: 4,
                useCORS: true,
                width: tableContainerWidth,
                height: tableContainerHeight,
                x: -tableContainerScrollX,
                y: -tableContainerScrollY
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

    const handleMonthChange = (e) => {
        setAttendanceData([]);
        setMonth(e.target.value);
        if (lembaga === 'MADIN') {
            const hijriMonthIndex = namaBulanHijri.indexOf(e.target.value) + 1;
            console.log(`Selected Hijri Month: ${hijriMonthIndex}`);
        }
    };

    return (
        <div>
            <Navbar />
            <ToastContainer />

            <div className="container mx-auto p-4">
                <h1 className="text-2xl font-bold mb-4">Rekap Absensi</h1>
                <div className={`grid grid-cols-2 gap-2 mt-4`}>
                    <div className="">
                        <label className="block mb-1 ml-1 text-xs text-gray-500">Institusi</label>
                        <select value={lembaga} onChange={e => {
                            setLembaga(e.target.value);
                            setAttendanceData([]);
                        }} className="p-2 border rounded w-full bg-white">
                            <option value="SDI">SDI</option>
                            <option value="MTS">MTS</option>
                            <option value="Ma">MA</option>
                            <option value="MADIN">MADIN</option>
                        </select>
                    </div>
                    <div className="">
                        <label className="block mb-1 ml-1 text-xs text-gray-500">Tahun Ajaran</label>
                        <select value={tahunAjaran} onChange={e => {
                            setTahunAjaran(e.target.value);
                            setAttendanceData([]);
                        }} className="p-2 border rounded w-full bg-white">
                            {generateTahunAjaranOptions(lembaga).map(option => (
                                <option key={option} value={option}>{option}</option>
                            ))}
                        </select>
                    </div>
                    <div className="">
                        <label className="block mb-1 ml-1 text-xs text-gray-500">Kelas</label>
                        <select value={selectedKelas} onChange={e => {
                            setSelectedKelas(e.target.value);
                            setAttendanceData([]);
                        }} className="p-2 border rounded w-full bg-white">
                            {kelas.map(k => (
                                <option key={k.id} value={k.kelas}>{k.kelas}</option>
                            ))}
                        </select>
                    </div>
                    <div className="">
                        <label className="block mb-1 ml-1 text-xs text-gray-500">Kegiatan</label>
                        <select value={selectedKegiatan} onChange={e => {
                            setSelectedKegiatan(e.target.value);
                            const selectedKeg = kegiatan.find(k => k.id === parseInt(e.target.value));
                            setNamaSelectedKegiatan(selectedKeg ? selectedKeg.nama_kegiatan : '');
                            setAttendanceData([]);
                        }} className="p-2 border rounded w-full bg-white">
                            {kegiatan.map(k => (
                                <option key={k.id} value={k.id}>{k.nama_kegiatan}</option>
                            ))}
                        </select>
                    </div>
                    <div className="">
                        <label className="block mb-1 ml-1 text-xs text-gray-500">Bulan</label>
                        <select value={month} onChange={handleMonthChange} className="p-2 border rounded w-full bg-white">
                            {(lembaga === 'MADIN' ? namaBulanHijri : namabulanMiladi).map((m, idx) => (
                                <option key={idx} value={m}>{m}</option>
                            ))}
                        </select>
                    </div>
                    <div className="">
                        <label className="block mb-1 ml-1 text-xs text-gray-500">Tahun</label>
                        <select value={selectedYear} onChange={e => {
                            setSelectedYear(e.target.value);
                            setAttendanceData([]);
                        }} className="p-2 border rounded w-full bg-white">
                            {(lembaga === 'MADIN' ? hijriYears : years).map((y, idx) => (
                                <option key={idx} value={y}>{y}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="my-4">
                    <button onClick={handleFetchAttendance} className="p-2 bg-blue-500 text-white rounded">Proses</button>
                </div>
                {attendanceData.length > 0 && (
                    <div className="mb-4">
                        <div id="attendanceTableContainer" className="max-w-full w-full py-2">
                            <div id="attendanceTable" className="w-full">
                                <div className="w-full justify-center mb-2 mt-5">
                                    <div className="w-full flex justify-center">
                                        <h1 className="text-xl font-semibold flex-nowrap mb-3">
                                            Absensi {selectedNamaKegiatan} {singkatanMap[lembaga]} {tahunAjaran}
                                        </h1>
                                    </div>
                                    <div className="w-full grid grid-cols-3 justify-center">
                                        <h2 className="ml-1 text-l text-gray-700">
                                            Bulan {month}
                                        </h2>
                                        <h2 className="text-l font-semibold text-center whitespace-nowrap">
                                            Kelas {selectedKelas}
                                        </h2>
                                    </div>
                                </div>
                                <table className="table-auto w-full p-4 custom-table border-2 border-black">
                                    <thead className="bg-yellow-300">
                                    <tr>
                                        <th className="py-1 border border-black text-xs font-semibold text-gray-600 uppercase whitespace-nowrap">Nama Santri</th>
                                        {Array.from({ length: extractDay(lembaga, umurBulanHijri, tanggalSelesai) }, (_, i) => (
                                            <th key={i} className="py-1 border border-black text-xs font-semibold text-black uppercase whitespace-nowrap">{i + 1}</th>
                                        ))}
                                        <th className="py-1 border-l-2 border border-black text-xs font-semibold text-black uppercase whitespace-nowrap">H</th>
                                        <th className="py-1 border border-black text-xs font-semibold text-black uppercase whitespace-nowrap">A</th>
                                        <th className="py-1 border border-black text-xs font-semibold text-black uppercase whitespace-nowrap">S</th>
                                        <th className="py-1 border border-black text-xs font-semibold text-black uppercase whitespace-nowrap">I</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {attendanceData.map((record, idx) => (
                                        <tr key={idx} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-100'}`}>
                                            <td className="whitespace-nowrap px-3 border border-black">{record.santri.nama_santri}</td>
                                            {Array.from({ length: extractDay(lembaga, umurBulanHijri, tanggalSelesai) }, (_, i) => (
                                                <td key={i} className={`${record.attendance_data[`day${i + 1}`]} px-3 py-1 border border-black text-sm ${record.attendance_data[`day${i + 1}`] === 'HADIR' ? 'font-black text-xl' : ''} ${record.attendance_data[`day${i + 1}`] === 'LIBUR' ? 'bg-gray-300' : ''}`}>{keteranganKehadiranMap[record.attendance_data[`day${i + 1}`]] || ''}</td>
                                            ))}
                                            <td className="px-3 py-1 border-l-2 border border-black font-bold text-sm">{record.totalHadir}</td>
                                            <td className="px-3 py-1 border border-black font-bold text-sm">{record.totalAlpa}</td>
                                            <td className="px-3 py-1 border border-black font-bold text-sm">{record.totalSakit}</td>
                                            <td className="px-3 py-1 border border-black font-bold text-sm">{record.totalIzin}</td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="mt-6">
                            <label className="block mb-2 italic">Unduh Absensi, pilih format file:</label>
                            <div className="mb-4">
                                <label className="mr-4">
                                    <input type="radio" value="image" checked={saveFormat === 'image'} onChange={() => setSaveFormat('image')} /> Foto
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

export default RekapAbsensiPage

function totalDaysOfMonth(month, year) {
    console.log(month)
    year = parseInt(year)
    const months = {
        "Januari": 31,
        "Februari": isLeapYear(year) ? 29 : 28,
        "Maret": 31,
        "April": 30,
        "Mei": 31,
        "Juni": 30,
        "Juli": 31,
        "Agustus": 31,
        "September": 30,
        "Oktober": 31,
        "November": 30,
        "Desember": 31
    };

    return {
      tanggal_mulai:1,
      tanggal_selesai:months[month]  || 0
    };
}


function totalDaysOfMonthInt(month, year) {
    year = parseInt(year)
    month = parseInt(month)

    const months = {
        1: 31, // January
        2: isLeapYear(year) ? 29 : 28, // February
        3: 31, // March
        4: 30, // April
        5: 31, // May
        6: 30, // June
        7: 31, // July
        8: 31, // August
        9: 30, // September
        10: 31, // October
        11: 30, // November
        12: 31 // December
    };

    const days = months[month] || 0;
    return {
        tanggal_mulai: 1,
        tanggal_selesai: days
    };
}

function extractDay(lembaga,umur,tanggalSelesai) {

    let umurHariMahfudz = 0

    if (lembaga==='MADIN'){
        umurHariMahfudz = umur
    } else {
        // Split the string by the "-" separator
        const parts = tanggalSelesai.split('-');
        // The first part is the day
        const day = parts[0];
        umurHariMahfudz = parseInt(day)
    }

    return umurHariMahfudz;
}


function isLeapYear(year) {
    if (year % 4 !== 0) {
        return false; // Not divisible by 4
    } else if (year % 100 !== 0) {
        return true; // Divisible by 4 but not by 100
    } else if (year % 400 !== 0) {
        return false; // Divisible by 100 but not by 400
    } else {
        return true; // Divisible by 400
    }
}


export function masehiToHijri(tahun, bulan, tanggal) {
    tahun = parseInt(tahun)
    bulan = parseInt(bulan)
    tanggal = parseInt(tanggal)
    const julianDay = tanggalKeJulianDay(tahun, bulan, tanggal, 0, 0, 0);
    const selisih_hari = julianDay - 1948438.5;
    let siklus = Math.floor((selisih_hari - 1) / 10631);
    if (selisih_hari < 0) siklus = Math.floor((selisih_hari - 1) / 10631);
    const tahun_siklus = siklus * 30;
    const sisahari1 = selisih_hari - (siklus * 10631);

    let tambahan_tahun = 0;
    let sisahari2 = 0;
    if (sisahari1 >= 1 && sisahari1 <= 354) { tambahan_tahun = 1; sisahari2 = sisahari1; }
    else if (sisahari1 >= 355 && sisahari1 <= 709) { tambahan_tahun = 2; sisahari2 = sisahari1 - 354; }
    else if (sisahari1 >= 710 && sisahari1 <= 1063) { tambahan_tahun = 3; sisahari2 = sisahari1 - 709; }
    else if (sisahari1 >= 1064 && sisahari1 <= 1417) { tambahan_tahun = 4; sisahari2 = sisahari1 - 1063; }
    else if (sisahari1 >= 1418 && sisahari1 <= 1772) { tambahan_tahun = 5; sisahari2 = sisahari1 - 1417; }
    else if (sisahari1 >= 1772 && sisahari1 <= 2126) { tambahan_tahun = 6; sisahari2 = sisahari1 - 1772; }
    else if (sisahari1 >= 2127 && sisahari1 <= 2481) { tambahan_tahun = 7; sisahari2 = sisahari1 - 2126; }
    else if (sisahari1 >= 2482 && sisahari1 <= 2835) { tambahan_tahun = 8; sisahari2 = sisahari1 - 2481; }
    else if (sisahari1 >= 2836 && sisahari1 <= 3189) { tambahan_tahun = 9; sisahari2 = sisahari1 - 2835; }
    else if (sisahari1 >= 3190 && sisahari1 <= 3544) { tambahan_tahun = 10; sisahari2 = sisahari1 - 3189; }
    else if (sisahari1 >= 3545 && sisahari1 <= 3898) { tambahan_tahun = 11; sisahari2 = sisahari1 - 3544; }
    else if (sisahari1 >= 3899 && sisahari1 <= 4252) { tambahan_tahun = 12; sisahari2 = sisahari1 - 3898; }
    else if (sisahari1 >= 4253 && sisahari1 <= 4607) { tambahan_tahun = 13; sisahari2 = sisahari1 - 4252; }
    else if (sisahari1 >= 4608 && sisahari1 <= 4961) { tambahan_tahun = 14; sisahari2 = sisahari1 - 4607; }
    else if (sisahari1 >= 4962 && sisahari1 <= 5315) { tambahan_tahun = 15; sisahari2 = sisahari1 - 4961; }
    else if (sisahari1 >= 5316 && sisahari1 <= 5670) { tambahan_tahun = 16; sisahari2 = sisahari1 - 5315; }
    else if (sisahari1 >= 5671 && sisahari1 <= 6024) { tambahan_tahun = 17; sisahari2 = sisahari1 - 5670; }
    else if (sisahari1 >= 6025 && sisahari1 <= 6379) { tambahan_tahun = 18; sisahari2 = sisahari1 - 6024; }
    else if (sisahari1 >= 6380 && sisahari1 <= 6733) { tambahan_tahun = 19; sisahari2 = sisahari1 - 6379; }
    else if (sisahari1 >= 6734 && sisahari1 <= 7087) { tambahan_tahun = 20; sisahari2 = sisahari1 - 6733; }
    else if (sisahari1 >= 7088 && sisahari1 <= 7442) { tambahan_tahun = 21; sisahari2 = sisahari1 - 7087; }
    else if (sisahari1 >= 7443 && sisahari1 <= 7796) { tambahan_tahun = 22; sisahari2 = sisahari1 - 7442; }
    else if (sisahari1 >= 7797 && sisahari1 <= 8150) { tambahan_tahun = 23; sisahari2 = sisahari1 - 7796; }
    else if (sisahari1 >= 8150 && sisahari1 <= 8505) { tambahan_tahun = 24; sisahari2 = sisahari1 - 8150; }
    else if (sisahari1 >= 8506 && sisahari1 <= 8859) { tambahan_tahun = 25; sisahari2 = sisahari1 - 8505; }
    else if (sisahari1 >= 8860 && sisahari1 <= 9214) { tambahan_tahun = 26; sisahari2 = sisahari1 - 8859; }
    else if (sisahari1 >= 9215 && sisahari1 <= 9568) { tambahan_tahun = 27; sisahari2 = sisahari1 - 9214; }
    else if (sisahari1 >= 9569 && sisahari1 <= 9922) { tambahan_tahun = 28; sisahari2 = sisahari1 - 9568; }
    else if (sisahari1 >= 9923 && sisahari1 <= 10277) { tambahan_tahun = 29; sisahari2 = sisahari1 - 9922; }
    else if (sisahari1 >= 10277 && sisahari1 <= 10631) { tambahan_tahun = 30; sisahari2 = sisahari1 - 10277; }

    let bulan_utuh_tamm;
    if (sisahari2 === 355) bulan_utuh_tamm = 11;
    else bulan_utuh_tamm = Math.floor((sisahari2 - 1) / 29.5);

    let jumlah_hari_bulan_tamm;
    if ((bulan_utuh_tamm % 2) === 0) jumlah_hari_bulan_tamm = 29.5 * bulan_utuh_tamm;
    else jumlah_hari_bulan_tamm = 29.5 * (bulan_utuh_tamm - 1) + 30;

    const tanggal_hijri = Math.floor(sisahari2 - jumlah_hari_bulan_tamm);
    const bulan_hijri = bulan_utuh_tamm + 1;
    const tahun_hijri = tahun_siklus + tambahan_tahun;

    return {
        epoch: 0,
        day: tanggal_hijri,
        month: bulan_hijri,
        year: tahun_hijri
    };
}

function tanggalKeJulianDay(tahun, bulan, tanggal, jam, menit, detik) {
    if (bulan <= 2) {
        bulan += 12;
        tahun -= 1;
    }

    let A;
    let B = 0;

    if ((tahun + bulan / 100 + tanggal / 10000) >= 1582.1015) {
        A = Math.floor(tahun / 100);
        B = 2 + Math.floor(A / 4) - A;
    }

    const julian_day = 1720994.5 + Math.floor(365.25 * tahun) + Math.floor(30.60001 * (bulan + 1)) + tanggal + B + (jam + (menit / 60) + (detik / 3600)) / 24;

    return julian_day;
}

function hijriToGregorian(tahun, bulan, tanggal) {
    let siklus = Math.floor((tahun - 1) / 30);
    let sisa_siklus = tahun - (siklus * 30);
    let banyaknya_hari = 30 * (bulan - 1) - Math.floor((bulan - 1) / 2) + tanggal;

    let jumlah_hari = 0;
    if (sisa_siklus <= 2) {
        jumlah_hari = 354 * (sisa_siklus - 1);
    } else if (sisa_siklus > 2 && sisa_siklus <= 5) {
        jumlah_hari = 354 * (sisa_siklus - 1) + 1;
    } else if (sisa_siklus > 5 && sisa_siklus <= 7) {
        jumlah_hari = 354 * (sisa_siklus - 1) + 2;
    } else if (sisa_siklus > 7 && sisa_siklus <= 10) {
        jumlah_hari = 354 * (sisa_siklus - 1) + 3;
    } else if (sisa_siklus > 10 && sisa_siklus <= 13) {
        jumlah_hari = 354 * (sisa_siklus - 1) + 4;
    } else if (sisa_siklus > 13 && sisa_siklus <= 16) {
        jumlah_hari = 354 * (sisa_siklus - 1) + 5;
    } else if (sisa_siklus > 16 && sisa_siklus <= 18) {
        jumlah_hari = 354 * (sisa_siklus - 1) + 6;
    } else if (sisa_siklus > 18 && sisa_siklus <= 21) {
        jumlah_hari = 354 * (sisa_siklus - 1) + 7;
    } else if (sisa_siklus > 21 && sisa_siklus <= 24) {
        jumlah_hari = 354 * (sisa_siklus - 1) + 8;
    } else if (sisa_siklus > 24 && sisa_siklus <= 26) {
        jumlah_hari = 354 * (sisa_siklus - 1) + 9;
    } else if (sisa_siklus > 26 && sisa_siklus <= 29) {
        jumlah_hari = 354 * (sisa_siklus - 1) + 10;
    } else if (sisa_siklus === 30) {
        jumlah_hari = 354 * (sisa_siklus - 1) + 11;
    }

    let total_hari = siklus * 10631 + jumlah_hari + banyaknya_hari;
    let julian_day = 1948438.5 + total_hari;

    let Z = julian_day + 0.5;

    let AA = Math.floor((Z - 1867216.25) / 36524.25);
    let A;
    if (Z < 2299161) {
        A = Math.floor(Z);
    } else {
        A = Math.floor(Z + 1 + AA - Math.floor(AA / 4));
    }

    let B = A + 1524;
    let C = Math.floor((B - 122.1) / 365.25);
    let D = Math.floor(365.25 * C);
    let E = Math.floor((B - D) / 30.6001);
    let tanggal_masehi = B - D - Math.floor(30.6001 * E);

    let bulan_masehi;
    if (E < 14) {
        bulan_masehi = E - 1;
    } else {
        bulan_masehi = E - 13;
    }

    let tahun_masehi;
    if (bulan_masehi > 2) {
        tahun_masehi = C - 4716;
    } else {
        tahun_masehi = C - 4715;
    }

    return {
        epoch: 0,
        day: tanggal_masehi,
        month: bulan_masehi,
        year: tahun_masehi
    };
}



