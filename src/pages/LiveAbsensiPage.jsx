import React, { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import axios from 'axios';
import { format } from 'date-fns';

const fetchActivities = async () => {
    console.log("Fetching activities...");
    const { data } = await axios.get(`http://localhost:5000/all-kegiatan`);
    console.log(data)
    return data;
};

const fetchClasses = async () => {
    console.log("Fetching classes...");
    const { data } = await axios.get(`http://localhost:5000/all-kelaslembaga`);
    return data;
};

const fetchStudents = async (params) => {
    const { institution, activity, classInstitution, year } = params;
    const normalizedInstitution = institution.replace(/\s+/g, '%20').toLowerCase();
    const normalizedActivity = activity.replace(/\s+/g, '%20').toLowerCase();
    const normalizedClassInstitution = classInstitution.replace(/\s+/g, '%20').toLowerCase();
    const today = format(new Date(), 'yyyy-MM-dd');
    // const url = `http://localhost:5000/get-absensi/${today}/${normalizedInstitution}/${normalizedActivity}/${normalizedClassInstitution}/${year}/${1}`;
    const url = `http://localhost:5000/get-absensi/2024-04-01/${normalizedInstitution}/${normalizedClassInstitution}/${year}/${1}`;
    console.log(`Fetching students with URL: ${url}`);

    const { data } = await axios.get(url);
    console.log(data)
    return data;
};

export const LiveAbsensiPage = () => {
    const [institution, setInstitution] = useState(localStorage.getItem('institution') || 'Semua');
    const [activity, setActivity] = useState(localStorage.getItem('activity') || '');
    const [classInstitution, setClassInstitution] = useState(localStorage.getItem('classInstitution') || '');
    const [year, setYear] = useState(localStorage.getItem('year') || '');

    const { data: activities } = useQuery('activities', fetchActivities);
    const { data: classes } = useQuery('classes', fetchClasses);
    const { data: students, refetch } = useQuery(['students', institution, activity, classInstitution, year], () => fetchStudents({ institution, activity, classInstitution, year }), {
        enabled: !!institution && !!activity && !!classInstitution && !!year,
        refetchInterval: 30000 // Refetch every 30 seconds
    });
    const handleDropdownChange = (e, setter, key) => {
        const value = e.target.value;
        setter(value);
        localStorage.setItem(key, value);
    };


    useEffect(() => {
        const currentYear = new Date().getFullYear();
        let years = [];
        for (let i = 0; i <= 7; i++) {
            years.push(`${currentYear - i}-${currentYear - i + 1}`);
        }
        setYear(localStorage.getItem('year') || years[0]);
    }, []);

    return (
        <div className="p-4">
            <div className="grid grid-cols-4 gap-4">
                <select className="p-2 border rounded" value={institution} onChange={(e) => handleDropdownChange(e, setInstitution, 'institution')}>
                    {['Semua', 'SDi', 'MTs', 'MA', 'Madin'].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
                <select className="p-2 border rounded" value={activity} onChange={(e) => handleDropdownChange(e, setActivity, 'activity')} disabled={!activities}>
                    {activities?.map(act => <option key={act.id} value={act.nama_kegiatan}>{act.nama_kegiatan}</option>)}
                </select>
                <select className="p-2 border rounded" value={classInstitution} onChange={(e) => handleDropdownChange(e, setClassInstitution, 'classInstitution')} disabled={!classes}>
                    {classes?.map(cls => <option key={cls.id} value={cls.kelas}>{cls.kelas}</option>)}
                </select>
                <select className="p-2 border rounded" value={year} onChange={(e) => handleDropdownChange(e, setYear, 'year')}>
                    {Array.from({ length: 8 }, (_, i) => `${new Date().getFullYear() - i}-${new Date().getFullYear() - i + 1}`).map(year => <option key={year} value={year}>{year}</option>)}
                </select>
            </div>
            <div className="mt-4">
                {students?.length > 0 ? (
                    <table className="min-w-full table-auto">
                        <thead>
                        <tr>
                            <th className="border px-4 py-2">Nama Santri</th>
                            <th className="border px-4 py-2">Kelas</th>
                            <th className="border px-4 py-2">Pemilik</th>
                            <th className="border px-4 py-2">Status Absensi</th>
                        </tr>
                        </thead>
                        <tbody>

                        {students.map(student => (

                            <tr key={student.id} >
                                {/*className={`bg-${student.absensi.status_absensi === 'ALPHA' ? 'red-500' : 'green-500'}`}*/}
                                <td className="border px-4 py-2">{student.santriDetail.nama_santri}</td>
                                <td className="border px-4 py-2">{student.kelas}</td>
                                <td className="border px-4 py-2">{student.pemilik}</td>
                                {/*<td className="border px-4 py-2">{student.absensi.status_absensi}</td>*/}
                            </tr>
                        ))}
                        </tbody>
                    </table>
                ) : (
                    <p>No data available.</p>
                )}
            </div>
        </div>
    );
};

export default LiveAbsensiPage;
