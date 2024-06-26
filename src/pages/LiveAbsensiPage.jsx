import {
    ChevronDownIcon
} from "@heroicons/react/16/solid";
import React, { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import axios from 'axios';
import baseURL from "../config";
import Navbar from "./Navbar";
import {ToastContainer} from "react-toastify";
import moment from 'moment-timezone';
import DatePicker from "react-datepicker";
import {masehiToHijri} from "./RekapAbsensiPage";


const KehadiranModal = ({ isOpen, onClose, student, activity, status, onSave }) => {
    const [initialStatus, setInitialStatus] = useState(status || 'ALPA');
    const [selectedStatus, setSelectedStatus] = useState(initialStatus);
    const [newEditorName, setNewEditorName] = useState('-');

    useEffect(() => {
        if (isOpen) {
            setInitialStatus(status || 'ALPA');
            setSelectedStatus(status || 'ALPA');
            setNewEditorName(student.absensi.data_editor.nama_admin);
        }
    }, [isOpen, status, student]);

    const handleSave = () => {
        const user = JSON.parse(localStorage.getItem('user'));
        const now = new Date();
        const dateTimeWithTimezone = moment.tz(now, 'Asia/Jakarta').format('YYYY-MM-DD HH:mm:ss');
        const localDate = moment.tz(now, 'Asia/Jakarta').format('YYYY-MM-DD');

        const data = {
            id_kegiatan: activity.id,
            nis_santri: student.nis_santri,
            tanggal: localDate,
            status_absensi: selectedStatus.toUpperCase(),
            editor:  user.nis ,
            last_edit: dateTimeWithTimezone
        };

        console.log(data)

        // setNewEditorName(user.nama_admin);


        axios.patch(`${baseURL}/update-absensi`, data)
            .then(() => {
                onSave(selectedStatus, user.nama_admin, dateTimeWithTimezone);
                console.log("BERHASIL");
                console.log(user.nama_admin)
                onClose();
            })
            .catch(err => {
                console.error(err);
                console.log("GAGAL");
            });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
            <div className="bg-white rounded-lg p-6">
                <h2 className="text-xl font-bold">Edit Data Kehadiran</h2>
                <h3 className="mt-2 mb-3 font-black">{student.santriDetail.nama_santri}</h3>
                {/* Last editor name */}
                <h3 className="mt-1 mb-1">{`Data terakhir diubah oleh:`}</h3>
                <h3 className="mt-1 mb-2">{` ${newEditorName}`}</h3>
                {/* Last status */}
                <h3 className="mt-1 mb-1">{`Status Kehadiran terakhir: ${initialStatus}`}</h3>
                {/* Last edit time */}
                <h3 className="mt-1 mb-1">{`Waktu: ${student.absensi.last_edit}`}</h3>

                <h3 className="mt-5 mb-2">Silahkan pilih status kehadiran (Baru):</h3>
                <div className="flex justify-around mb-20">
                    {['HADIR', 'ALPA', 'IZIN', 'SAKIT'].map(status => (
                        <button
                            key={status}
                            className={`px-4 py-2 rounded ${selectedStatus === status ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                            onClick={() => setSelectedStatus(status)}
                        >
                            {status}
                        </button>
                    ))}
                </div>
                <div className="flex justify-between">
                    <button className="bg-gray-500 text-white px-4 py-2 rounded mr-2" onClick={onClose}>
                        BATAL
                    </button>
                    <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={handleSave}>
                        SIMPAN
                    </button>
                </div>
            </div>
        </div>
    );
};
function getDateParts(date) {
    const day = date.getDate();
    const month = date.getMonth() + 1; // getMonth() returns 0-11
    const year = date.getFullYear();

    return { day, month, year };
}

export const LiveAbsensiPage = () => {
    const [lembaga, setLembaga] = useState(localStorage.getItem('schoolName') || 'Semua');
    const [activity, setActivity] = useState(JSON.parse(localStorage.getItem('activity')) || null);
    const [kelas, setKelas] = useState(JSON.parse(localStorage.getItem('classes')) || null);
    const [filteredKelas, setFilteredKelas] = useState([]);
    const [tahunAjaran, setTahunAjaran] = useState(localStorage.getItem('academicYear') || `${new Date().getFullYear() - 1}-${new Date().getFullYear()}`);
    const [tanggalhijri, setTanggalhijri] = useState('');
    const [attendanceData, setAttendanceData] = useState([]);
    const [intervalId, setIntervalId] = useState(null);
    const [isButtonDisabled, setIsButtonDisabled] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [selectedDate, setSelectedDate] = useState(moment.tz('Asia/Jakarta').toDate());
    const namaBulanHijri = ['Muharam', 'Safar', 'Rabiul Awal', 'Rabiul Akhir', 'Jumadil Awal', 'Jumadil Akhir', 'Rajab', 'Syaban', 'Ramadhan', 'Syawal', 'Dzulqodah', 'Dzulhijjah'];

    const { data: kegiatanData } = useQuery(['activities', lembaga], () =>
        axios.get(`${baseURL}/all-kegiatan`).then(res =>
            res.data.filter(a => a.pemilik.toLowerCase() === lembaga.toLowerCase())), {
        enabled: !!lembaga && lembaga !== 'Semua',
        onSuccess: data => {
            if (data.length && !activity) setActivity(data[0]);
        }
    });

    const { data: kelasData } = useQuery(['classes', lembaga], () =>
        axios.get(`${baseURL}/all-kelaslembaga`).then(res =>
            res.data.filter(c => c.pemilik.toLowerCase() === lembaga.toLowerCase())), {
        enabled: !!lembaga && lembaga !== 'Semua',
        onSuccess: data => {
            if (data.length && !kelas) setKelas(data[0]);
        }
    });

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

    useEffect(() => {
        const currentMoment = moment();
        const day = currentMoment.date();
        const month = currentMoment.month() + 1;
        const year = currentMoment.year();

        const tanggalHijri = masehiToHijri(year, month, day);
        setTanggalhijri(`${tanggalHijri.day} - ${namaBulanHijri[tanggalHijri.month-1]} - ${tanggalHijri.year}`);

        if (lembaga.toLowerCase() === 'madin') {
            setTahunAjaran('1445-1446');
        } else {
            setTahunAjaran('2023-2024');
        }
    }, [lembaga]);

    useEffect(() => {
        localStorage.setItem('schoolName', lembaga);
        localStorage.setItem('activity', JSON.stringify(activity));
        localStorage.setItem('classes', JSON.stringify(kelas));
        localStorage.setItem('academicYear', tahunAjaran);
    }, [lembaga, activity, kelas, tahunAjaran]);

    useEffect(() => {
        if (activity && Array.isArray(kelasData)) {
            const newKelasData = kelasData.filter(c => {
                if (activity.nama_kegiatan.toLowerCase().includes('pagi')) {
                    return c.kelas.toLowerCase().includes('pagi');
                } else if (activity.nama_kegiatan.toLowerCase().includes('siang')) {
                    return c.kelas.toLowerCase().includes('siang');
                } else {
                    return true;
                }
            });
            setFilteredKelas(newKelasData);
            setKelas(newKelasData.length ? newKelasData[0] : null);
        }
    }, [activity, kelasData]);

    const handleSchoolNameChange = (newSchoolName) => {
        setLembaga(newSchoolName);
        setActivity(null);
        setKelas(null);
        setFilteredKelas([]);
        clearInterval(intervalId);
        setIntervalId(null);
        setIsButtonDisabled(false);
        console.log('Updated schoolName:', newSchoolName);
    };

    const handleActivityChange = (newActivityId) => {
        const newActivity = kegiatanData.find(a => a.id === parseInt(newActivityId));
        setActivity(newActivity);
        clearInterval(intervalId);
        setIntervalId(null);
        setIsButtonDisabled(false);
        console.log('Updated activity:', newActivity);
    };

    const handleDateChange = (newDate) => {
        setSelectedDate(newDate);
        const dateParts = getDateParts(newDate);
        const tanggalHijri = masehiToHijri(dateParts.year, dateParts.month, dateParts.day);
        setTanggalhijri(`${tanggalHijri.day} - ${namaBulanHijri[tanggalHijri.month-1]} - ${tanggalHijri.year}`);
        clearInterval(intervalId);
        setIsButtonDisabled(false);
        setIntervalId(null);
    };

    const handleClassChange = (newClassId) => {
        const newClass = filteredKelas.find(c => c.id === parseInt(newClassId));
        setKelas(newClass);
        clearInterval(intervalId);
        setIntervalId(null);
        setIsButtonDisabled(false);
        console.log('Updated classes:', newClass);
    };

    const fetchAttendance = () => {
        if (!activity || !kelas) {
            console.error('Select all fields before processing.');
            return;
        }

        const formattedSelectedDate = moment(selectedDate).tz('Asia/Jakarta').format('YYYY-MM-DD');
        const normalizedClassInstitution = kelas.kelas.replace(/\s+/g, '%20').toLowerCase();
        const url = `${baseURL}/get-absensi/${formattedSelectedDate}/${activity.id}/${lembaga}/${normalizedClassInstitution}/${tahunAjaran}/${1}`;
        console.log("Fetching data from server...");
        axios.get(url).then(res => {
            setAttendanceData(res.data);
            setIsButtonDisabled(true);
        }).catch(() => {
            setIsButtonDisabled(false);
        });
    };

    useEffect(() => {
        return () => {
            if (intervalId) {
                clearInterval(intervalId);
                console.log('Cleared interval on component unmount');
            }
        };
    }, [intervalId]);

    const handleProses = () => {
        if (intervalId) {
            clearInterval(intervalId);
        }
        fetchAttendance();
        const newIntervalId = setInterval(fetchAttendance, 5000);
        setIntervalId(newIntervalId);
        console.log(activity);
    };

    const handleKehadiranClick = (student) => {
        console.log(student);
        if (student.absensi == null) {
            console.log("data null bang");
        } else {
            setSelectedStudent(student);
            setIsModalOpen(true);
        }
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setSelectedStudent(null);
    };

    const handleModalSave = (status, editorName, lastEdit) => {
        setAttendanceData(prevData => prevData.map(item =>
            item.nis_santri === selectedStudent.nis_santri
                ? {
                    ...item,
                    absensi: {
                        ...item.absensi,
                        status_absensi: status,
                        data_editor: { nama_admin: editorName },
                        last_edit: lastEdit
                    }
                }
                : item));
    };

    return (
        <div>
            <Navbar />
            <ToastContainer />
            <div className="container mx-auto p-4">
                <div className="flex justify-center items-center">
                    <div className="text-xl font-bold mr-3 ">
                        Absensi
                    </div>
                    {isButtonDisabled && (
                        <p className="border border-red-500 rounded-xl px-2.5 animate-text bg-gradient-to-r from-red-200 via-pink-600 to-red-800 bg-clip-text text-transparent text-l font-black">
                            Live
                        </p>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-2 mt-4">
                    <Dropdown
                        label="Lembaga"
                        value={lembaga}
                        options={['Semua', 'sdi', 'mts', 'ma', 'madin'].map(s => ({ value: s, label: s.toUpperCase() }))}
                        onChange={handleSchoolNameChange}
                    />
                    <Dropdown
                        label="Kegiatan"
                        value={activity?.id || ''}
                        options={(kegiatanData || []).map(a => ({ value: a.id, label: a.nama_kegiatan }))}
                        onChange={handleActivityChange}
                    />
                    <Dropdown
                        label="Kelas"
                        value={kelas?.id || ''}
                        options={filteredKelas.map(c => ({ value: c.id, label: c.kelas }))}
                        onChange={handleClassChange}
                    />
                    <div>
                        <label className="block ml-1 text-xs text-gray-500">Tahun Ajaran</label>
                        <select value={tahunAjaran} onChange={e => setTahunAjaran(e.target.value)} className="block appearance-none w-full bg-white border border-gray-300 text-gray-700 py-2 px-3 pr-8 rounded leading-tight focus:outline-none focus:shadow-outline">
                            {generateTahunAjaranOptions(lembaga).map(option => (
                                <option key={option} value={option}>{option}</option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="flex justify-between items-center ">
                    <div>
                        <label className="block ml-1 text-xs text-gray-500">Pilih Tanggal Absensi</label>
                        <DatePicker
                            selected={selectedDate}
                            onChange={handleDateChange}
                            dateFormat="dd-MM-yyyy"
                            className="border p-2 rounded "
                        />
                        <label className="block ml-1 text-xs  items-center text-gray-900">{tanggalhijri}</label>
                    </div>

                    <button
                        className={`px-4 py-2 rounded shadow focus:outline-none ${isButtonDisabled ? 'bg-gray-200 text-gray-300' : 'bg-green-700 text-white'}`}
                        onClick={handleProses}
                        disabled={isButtonDisabled}
                    >
                        Mulai
                    </button>
                </div>

                <AttendanceTable data={attendanceData} onKehadiranClick={handleKehadiranClick} />
                <KehadiranModal
                    isOpen={isModalOpen}
                    onClose={handleModalClose}
                    activity={activity}
                    student={selectedStudent}
                    status={selectedStudent?.absensi?.status_absensi}
                    onSave={handleModalSave}
                />
            </div>
        </div>
    );
};
const Dropdown = ({ label, value, options, onChange }) => (
    <div className="my-1">
        <label className="block ml-1 text-xs text-gray-500">{label}</label>
        <div className="relative">
            <select
                className="block appearance-none w-full bg-white border border-gray-300 text-gray-700 py-2 px-3 pr-8 rounded leading-tight focus:outline-none focus:shadow-outline"
                value={value}
                onChange={e => onChange(e.target.value)}>
                {options.map(option => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <ChevronDownIcon className="h-4 w-4" />
            </div>
        </div>
    </div>
);

const AttendanceTable = ({ data, onKehadiranClick }) => {
    const statusColors = {
        ALPA: 'bg-red-500 text-white',
        HADIR: 'bg-green-600 text-white',
        IZIN: 'bg-cyan-400',
        SAKIT: 'bg-yellow-400',
        'null': 'bg-gray-300',
        '': 'bg-gray-300'
    };

    return (
        <table className="min-w-full leading-normal border-separate text-center whitespace-nowrap" style={{ borderSpacing: '0 20px' }}>
            <thead>
            <tr>
                <th className="py-3 border-b border-gray-200 bg-teal-400 text-xs font-semibold text-gray-600 uppercase tracking-wider">Nama</th>
                <th className="py-1 border-b border-gray-200 bg-teal-400 text-xs font-semibold text-gray-600 uppercase tracking-wider">Kelas</th>
                <th className="py-3 border-b border-gray-200 bg-teal-400 text-xs font-semibold text-gray-600 uppercase tracking-wider">Kehadiran</th>
            </tr>
            </thead>
            <tbody>
            {data.map((item, index) => (
                <tr key={index} className={`${index % 2 === 0 ? 'bg-gray-100' : 'bg-gray-100'}`}>
                    <td className="font-bold px-2 py-3 border-b border-gray-200">{item.santriDetail.nama_santri}</td>
                    <td className="px-5 py-1 border-b border-gray-200 text-sm">{item.kelas}</td>
                    <td className={`border-b border-gray-200`}>
                        <button
                            className={`px-5 py-2 rounded-xl shadow-lg min-w-[90px] ${statusColors[item.absensi?.status_absensi || 'null']}`}
                            onClick={() => onKehadiranClick(item)}
                        >
                            {item.absensi?.status_absensi || '--'}
                        </button>
                    </td>
                </tr>
            ))}
            </tbody>
        </table>
    );
};

export default LiveAbsensiPage;
