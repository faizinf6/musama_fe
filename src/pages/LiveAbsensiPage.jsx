import {
    ChevronDownIcon
} from "@heroicons/react/16/solid";

import React, { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import axios from 'axios';

export const LiveAbsensiPage = () => {
    const [schoolName, setSchoolName] = useState(localStorage.getItem('schoolName') || 'Semua');
    const [activity, setActivity] = useState(JSON.parse(localStorage.getItem('activity')) || null);
    const [classes, setClasses] = useState(JSON.parse(localStorage.getItem('classes')) || null);
    const [academicYear, setAcademicYear] = useState(localStorage.getItem('academicYear') || `${new Date().getFullYear()}/${new Date().getFullYear() + 1}`);
    const [attendanceData, setAttendanceData] = useState([]);
    const [intervalId, setIntervalId] = useState(null);
    const [isButtonDisabled, setIsButtonDisabled] = useState(false); // State to manage button disabled status

    const { data: activities } = useQuery(['activities', schoolName], () =>
        axios.get('http://localhost:5000/all-kegiatan').then(res =>
            res.data.filter(a => a.pemilik.toLowerCase() === schoolName.toLowerCase())), {
        enabled: !!schoolName && schoolName !== 'Semua',
        onSuccess: data => {
            if (data.length && !activity) setActivity(data[0]);
        }
    });

    const { data: classesData } = useQuery(['classes', schoolName], () =>
        axios.get('http://localhost:5000/all-kelaslembaga').then(res =>
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
        const normalizedClassInstitution = classes.kelas.replace(/\s+/g, '%20').toLowerCase();
        const url = `http://localhost:5000/get-absensi/2024-04-01/${activity.id}/${schoolName}/${normalizedClassInstitution}/${academicYear}/${1}`;
        console.log("Fetching data from server...");
        axios.get(url).then(res => {
            setAttendanceData(res.data);
            setIsButtonDisabled(true); // Disable button after fetching
        }).catch(() => {
            setIsButtonDisabled(false); // Re-enable button if there's an error
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

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-xl font-bold">Live Absensi Page</h1>
            <Dropdown
                label="School Name"
                value={schoolName}
                options={['Semua', 'sdi', 'mts', 'ma', 'madin'].map(s => ({ value: s, label: s.toUpperCase() }))}
                onChange={handleSchoolNameChange}
            />
            <Dropdown
                label="Activity"
                value={activity?.id || ''}
                options={(activities || []).map(a => ({ value: a.id, label: a.nama_kegiatan }))}
                onChange={handleActivityChange}
            />
            <Dropdown
                label="Class"
                value={classes?.id || ''}
                options={(classesData || []).map(c => ({ value: c.id, label: c.kelas }))}
                onChange={handleClassChange}
            />
            <Dropdown
                label="Academic Year"
                value={academicYear}
                options={Array.from({ length: 8 }, (_, i) => `${new Date().getFullYear() - 1 + i}-${new Date().getFullYear() + i}`)
                    .map(y => ({ value: y, label: y }))}
                onChange={setAcademicYear}
            />
            <button
                className={`mt-4 px-4 py-2 rounded shadow focus:outline-none ${isButtonDisabled ? 'bg-gray-500' : 'bg-blue-500 hover:bg-blue-700 text-white'}`}
                onClick={handleProses}
                disabled={isButtonDisabled} // Disable button when fetching
            >
                PROSES
            </button>
            <AttendanceTable data={attendanceData} />
        </div>
    );
};

const Dropdown = ({ label, value, options, onChange }) => (
    <div className="my-2">
        <label className="block mb-1 font-semibold">{label}</label>
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

const AttendanceTable = ({ data }) => {
    const statusColors = {
        ALPHA: 'bg-red-500 text-white',
        HADIR: 'bg-green-500',
        IZIN: 'bg-cyan-500',
        SAKIT: 'bg-yellow-500',
        'null': 'bg-gray-500',  // Handle null case explicitly
        '': 'bg-gray-500'  // Handle empty case explicitly
    };

    return (
        <table className="min-w-full leading-normal mt-5 px-2 border-separate text-center whitespace-nowrap" style={{ borderSpacing: '0 20px' }}>
            <thead>
            <tr>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-teal-400  text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                <th className="px-5 py-3 border-b border-gray-200 bg-teal-400  text-xs font-semibold text-gray-600 uppercase tracking-wider">Class</th>
                <th className="px-5 py-3 border-b border-gray-200 bg-teal-400  text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                <th className="px-5 py-3 border-b border-gray-200 bg-teal-400 text-xs font-semibold text-gray-600 uppercase tracking-wider">L/P</th>
                <th className="px-5 py-3 border-b border-gray-200 bg-teal-400  text-xs font-semibold text-gray-600 uppercase tracking-wider">NIS</th>
            </tr>
            </thead>
            <tbody>
            {data.map((item, index) => (
                <tr key={index} className={`${index % 2 === 0 ? 'bg-gray-100' : 'bg-gray-300'}`}>
                    <td className="px-5 py-3 border-b border-gray-200 text-sm">{item.santriDetail.nama_santri}</td>
                    <td className="px-5 py-3 border-b border-gray-200 text-sm">{item.kelas}</td>
                    <td className={`px-5 py-3 border-b border-gray-200 ${statusColors[item.absensi?.status_absensi || 'null']} text-sm`}>{item.absensi?.status_absensi || 'Unknown'}</td>
                    <td className="px-2 py-3 border-b border-gray-200 text-sm">{item.santriDetail.gender}</td>

                    <td className="px-5 py-3 border-b border-gray-200 text-sm">{item.nis_santri}</td>
                </tr>
            ))}
            </tbody>
        </table>


    );
};

export default LiveAbsensiPage;
