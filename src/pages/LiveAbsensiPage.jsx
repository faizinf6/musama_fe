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

export const LiveAbsensiPage = () => {
    const [schoolName, setSchoolName] = useState(localStorage.getItem('schoolName') || 'Semua');
    const [activity, setActivity] = useState(JSON.parse(localStorage.getItem('activity')) || null);
    const [classes, setClasses] = useState(JSON.parse(localStorage.getItem('classes')) || null);
    const [academicYear, setAcademicYear] = useState(localStorage.getItem('academicYear') || `${new Date().getFullYear() - 1}-${new Date().getFullYear()}`);
    const [attendanceData, setAttendanceData] = useState([]);
    const [intervalId, setIntervalId] = useState(null);
    const [isButtonDisabled, setIsButtonDisabled] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [selectedDate, setSelectedDate] = useState(moment.tz('Asia/Jakarta').toDate());

    const { data: activities } = useQuery(['activities', schoolName], () =>
        axios.get(`${baseURL}/all-kegiatan`).then(res =>
            res.data.filter(a => a.pemilik.toLowerCase() === schoolName.toLowerCase())), {
        enabled: !!schoolName && schoolName !== 'Semua',
        onSuccess: data => {
            if (data.length && !activity) setActivity(data[0]);
        }
    });

    const { data: classesData } = useQuery(['classes', schoolName], () =>
        axios.get(`${baseURL}/all-kelaslembaga`).then(res =>
            res.data.filter(c => c.pemilik.toLowerCase() === schoolName.toLowerCase())), {
        enabled: !!schoolName && schoolName !== 'Semua',
        onSuccess: data => {
            if (data.length && !classes) setClasses(data[0]);
        }
    });

    useEffect(() => {
        localStorage.setItem('schoolName', schoolName);
        localStorage.setItem('activity', JSON.stringify(activity));
        localStorage.setItem('classes', JSON.stringify(classes));
        localStorage.setItem('academicYear', academicYear);
    }, [schoolName, activity, classes, academicYear]);

    const handleSchoolNameChange = (newSchoolName) => {
        setSchoolName(newSchoolName);
        setActivity('');
        setClasses('');
        clearInterval(intervalId);
        setIntervalId(null);
        setIsButtonDisabled(false);
        console.log('Updated schoolName:', newSchoolName);
    };

    const handleActivityChange = (newActivityId) => {
        const newActivity = activities.find(a => a.id === parseInt(newActivityId));
        setActivity(newActivity);
        clearInterval(intervalId);
        setIntervalId(null);
        setIsButtonDisabled(false);
        console.log('Updated activity:', newActivity);
    };

    const handleClassChange = (newClassId) => {
        const newClass = classesData.find(c => c.id === parseInt(newClassId));
        setClasses(newClass);
        clearInterval(intervalId);
        setIntervalId(null);
        setIsButtonDisabled(false);
        console.log('Updated classes:', newClass);
    };

    const fetchAttendance = () => {
        if (!activity || !classes) {
            console.error('Select all fields before processing.');
            return;
        }

        const formattedSelecteddate = moment(selectedDate).tz('Asia/Jakarta').format('YYYY-MM-DD') // Format as YYYY-MM-DD
        const normalizedClassInstitution = classes.kelas.replace(/\s+/g, '%20').toLowerCase();
        const url = `${baseURL}/get-absensi/${formattedSelecteddate}/${activity.id}/${schoolName}/${normalizedClassInstitution}/${academicYear}/${1}`;
        console.log("Fetching data from server...");
        // console.log(url)
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
    };

    const handleKehadiranClick = (student) => {
        console.log(student)
        if (student.absensi==null)
        {
            console.log("data null bang")
        }else {

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
                        value={schoolName}
                        options={['Semua', 'sdi', 'mts', 'ma', 'madin'].map(s => ({ value: s, label: s.toUpperCase() }))}
                        onChange={handleSchoolNameChange}
                    />
                    <Dropdown
                        label="Kegiatan"
                        value={activity?.id || ''}
                        options={(activities || []).map(a => ({ value: a.id, label: a.nama_kegiatan }))}
                        onChange={handleActivityChange}
                    />
                    <Dropdown
                        label="Kelas"
                        value={classes?.id || ''}
                        options={(classesData || []).map(c => ({ value: c.id, label: c.kelas }))}
                        onChange={handleClassChange}
                    />
                    <Dropdown
                        label="Tahun Ajaran"
                        value={academicYear}
                        options={Array.from({ length: 8 }, (_, i) => `${new Date().getFullYear() - 1 + i}-${new Date().getFullYear() + i}`)
                            .map(y => ({ value: y, label: y }))}
                        onChange={setAcademicYear}
                    />
                </div>
                <div className="flex justify-between items-center ">
                    <div>
                        <label className="block ml-1 text-xs text-gray-500">Pilih Tanggal Absensi</label>
                        <DatePicker
                            selected={selectedDate}
                            onChange={date => setSelectedDate(date)}
                            dateFormat="dd-MM-yyyy"
                            className="border p-2 rounded "
                        />
                    </div>
                    <button
                        className={`mt-4 px-4 py-2 rounded shadow focus:outline-none ${isButtonDisabled ? 'bg-gray-200 text-gray-300' : 'bg-green-700 text-white'}`}
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
                <th className="py-3 border-b border-gray-200 bg-teal-400 text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                <th className="py-1 border-b border-gray-200 bg-teal-400 text-xs font-semibold text-gray-600 uppercase tracking-wider">Class</th>
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
