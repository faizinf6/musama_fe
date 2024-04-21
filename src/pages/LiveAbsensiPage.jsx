import {
    ChevronDownIcon
} from "@heroicons/react/16/solid";

import React, { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import axios from 'axios';
import { format } from 'date-fns';

export const LiveAbsensiPage = () => {
    const [schoolName, setSchoolName] = useState(localStorage.getItem('schoolName') || 'Semua');
    const [activity, setActivity] = useState(localStorage.getItem('activity') || '');
    const [classes, setClasses] = useState(localStorage.getItem('classes') || '');
    const [academicYear, setAcademicYear] = useState(localStorage.getItem('academicYear') || `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`);
    const [attendanceData, setAttendanceData] = useState([]);
    const [fetchInterval, setFetchInterval] = useState(null);

    console.log('State:', { schoolName, activity, classes, academicYear });

    const { data: activities, isLoading: activitiesLoading } = useQuery(['activities', schoolName], () =>
        axios.get('http://localhost:5000/all-kegiatan').then(res =>
            res.data.filter(a => a.pemilik.toLowerCase() === schoolName.toLowerCase())), {
        enabled: schoolName !== 'Semua'
    });

    const { data: classesData, isLoading: classesLoading } = useQuery(['classes', schoolName], () =>
        axios.get('http://localhost:5000/all-kelaslembaga').then(res =>
            res.data.filter(c => c.pemilik.toLowerCase() === schoolName.toLowerCase())), {
        enabled: schoolName !== 'Semua'
    });

    const handleSchoolNameChange = (newSchoolName) => {
        setSchoolName(newSchoolName);
        setActivity('');
        setClasses('');
        console.log('Updated schoolName:', newSchoolName);
    };

    const handleActivityChange = (newActivityId) => {
        const newActivity = activities.find(a => a.id === parseInt(newActivityId));
        setActivity(newActivity);
        console.log('Updated activity:', newActivity);
    };

    const handleClassChange = (newClassId) => {
        const newClass = classesData.find(c => c.id === parseInt(newClassId));
        setClasses(newClass);
        console.log('Updated classes:', newClass);
    };

    const fetchAttendance = () => {
        const normalizedClassInstitution = classes.kelas.replace(/\s+/g, '%20').toLowerCase();
        const url = `http://localhost:5000/get-absensi/2024-04-01/${activity.id}/${schoolName}/${normalizedClassInstitution}/${academicYear}/${1}`;
        console.log('Fetching attendance data from:', url);
        axios.get(url).then(res => {
            setAttendanceData(res.data);
            console.log('Attendance data fetched:', res.data);
            if (!fetchInterval) {
                const interval = setInterval(fetchAttendance, 30000);
                setFetchInterval(interval);
                console.log('Set interval for fetching attendance data');
            }
        });
    };

    useEffect(() => {
        return () => {
            if (fetchInterval) {
                clearInterval(fetchInterval);
                console.log('Cleared interval for fetching attendance data');
            }
        };
    }, [fetchInterval]);

    const handleProses = () => {
        if (!activity || !classes) {
            console.error('Select all fields before processing.');
            return;
        }
        fetchAttendance();
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
                options={Array.from({ length: 8 }, (_, i) => `${new Date().getFullYear()-1 + i}-${new Date().getFullYear() + i}`)
                    .map(y => ({ value: y, label: y }))}
                onChange={setAcademicYear}
            />
            <button
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded shadow hover:bg-blue-700 focus:outline-none"
                onClick={handleProses}
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

const statusColors = {
    ALPHA: 'bg-red-500',
    HADIR: 'bg-green-500',
    IZIN: 'bg-cyan-500',
    SAKIT: 'bg-yellow-500',
    '': 'bg-gray-500'
};

const AttendanceTable = ({ data }) => (
    <table className="min-w-full leading-normal mt-5">
        <thead>
        <tr>
            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Class</th>
            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Gender</th>
            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
        </tr>
        </thead>
        <tbody>
        {data.map((item) => (
            <tr key={item.id} className={statusColors[item.absensi.status_absensi || '']}>
                <td className="px-5 py-3 border-b border-gray-200 bg-white text-sm">{item.santriDetail.nama_santri}</td>
                <td className="px-5 py-3 border-b border-gray-200 bg-white text-sm">{item.kelas}</td>
                <td className="px-5 py-3 border-b border-gray-200 bg-white text-sm">{item.santriDetail.gender}</td>
                <td className="px-5 py-3 border-b border-gray-200 bg-white text-sm">{item.absensi.status_absensi}</td>
            </tr>
        ))}
        </tbody>
    </table>
);





export default LiveAbsensiPage;
