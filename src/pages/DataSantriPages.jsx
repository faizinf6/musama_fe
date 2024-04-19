import React, { useState, useEffect, useMemo } from 'react';
import { useQuery } from 'react-query';
import axios from 'axios';
import Navbar from "./Navbar";

const fetchStudentsData = (institution, kelas, tahunAjaran, page) => {
    const normalizedInstitution = institution.replace(/\s+/g, '%20').toLowerCase();
    const normalizedKelas = kelas.replace(/\s+/g, '%20').toLowerCase();
    const normalizedTahunAjaran = tahunAjaran;
    // console.log("Fetching data for:", normalizedInstitution, normalizedKelas, normalizedTahunAjaran);
    return axios.get(`http://192.168.0.3:5000/${normalizedInstitution}/${normalizedKelas}/${normalizedTahunAjaran}/${page}`);
};

const fetchClasses = async () => {
    const response = await axios.get('http://localhost:5000/all-kelaslembaga');
    console.log(response.data)
    return response.data;
};

export const DataSantriPages = () => {
    const [institution, setInstitution] = useState('semua instansi');
    const [kelas, setKelas] = useState('semua kelas');
    const [tahunAjaran, setTahunAjaran] = useState('2023-2024');
    const [currentPage, setCurrentPage] = useState(1);

    const { data: classData, status: classStatus } = useQuery('classes', fetchClasses);

    const { data, status } = useQuery(['students', institution, kelas, tahunAjaran, currentPage], () =>
        fetchStudentsData(institution, kelas, tahunAjaran, currentPage)
    );

    useEffect(() => {
        if (classStatus === 'success' && classData.length > 0) {
            const filteredClasses = classData.filter(c => c.pemilik.toLowerCase() === institution.toLowerCase());
            setKelas(filteredClasses.length > 0 ? filteredClasses[0].kelas : 'semua kelas');
        }
    }, [institution, classData, classStatus]);

    // Sorted data based on pemilik, kelas, and gender
    const sortedData = useMemo(() => {
        if (data?.data) {
            return [...data.data].sort((a, b) => {
                // Sort by pemilik
                if (a.pemilik < b.pemilik) return -1;
                if (a.pemilik > b.pemilik) return 1;
                // If pemilik is the same, sort by kelas
                if (a.kelas < b.kelas) return -1;
                if (a.kelas > b.kelas) return 1;
                // If kelas is the same, sort by gender
                return a.santriDetail.gender.localeCompare(b.santriDetail.gender);
            });
        }
        return [];
    }, [data]);
    const getClassOptions = () => {
        if (classStatus === 'loading') return ['Loading...'];
        if (classStatus === 'error') return ['Error loading classes'];

        let filteredClasses = classData.filter(c => c.pemilik.toLowerCase() === institution.toLowerCase());

        // Sort classes alphabetically unless the institution is 'madin'
        if (institution.toLowerCase() !== 'madin') {
            filteredClasses = filteredClasses.sort((a, b) => a.kelas.localeCompare(b.kelas));
        }

        return filteredClasses.map(c => c.kelas);
    };

    const generateTahunAjaranOptions = () => {
        let options = [];
        for (let year = 2023; year <= 2030; year++) {
            options.push(`${year}-${year + 1}`);
        }
        return options;
    };

    return (
        <>
            <Navbar/>
            <div className="sticky top-0 bg-white p-4 shadow">
                <div className="flex gap-4 mb-4">
                    <select onChange={e => setInstitution(e.target.value)} className="form-select px-1 py-3 border border-black shadow-lg bg-white font-bold">
                        {["Semua Instansi", "Madin", "Ma", "Mts", "Sdi"].map(option => (
                            <option key={option} value={option}>{option}</option>
                        ))}
                    </select>
                    <select value={kelas} onChange={e => setKelas(e.target.value)} className="form-select px-2 py-3 border border-black shadow-lg bg-white font-bold">
                        {getClassOptions().map(option => (
                            <option key={option} value={option}>{option}</option>
                        ))}
                    </select>
                    <select onChange={e => setTahunAjaran(e.target.value)} className="form-select px-1 py-3 border border-black shadow-lg bg-white font-bold">
                        {generateTahunAjaranOptions().map(option => (
                            <option key={option} value={option}>{option}</option>
                        ))}
                    </select>
                </div>
                <div className="overflow-auto">
                    <table className="min-w-full divide-y divide-gray-500">
                        <thead>
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Santri</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kelas</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">L/P</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tahun Ajaran</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pemilik</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NIS Santri</th>
                        </tr>
                        </thead>
                        <tbody>
                        {status === 'loading' ? (
                            <tr><td colSpan="6">Loading...</td></tr>
                        ) : status === 'error' ? (
                            <tr><td colSpan="6">Error fetching data.</td></tr>
                        ) : (
                            sortedData.map((student, index) => (
                                <tr key={student.id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-yellow-100'}`}>
                                    <td className="px-6 py-4 whitespace-nowrap text-lg font-bold text-black">{student.santriDetail.nama_santri}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-lg font-bold text-black">{student.kelas}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-lg font-bold text-black">{student.santriDetail.gender}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-lg font-bold text-black">{student.tahun_ajaran}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-lg font-bold text-black">{student.pemilik}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.nis_santri}</td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>
                <div className="flex justify-center mt-4">
                    <button className="mx-2 bg-blue-500 text-white font-bold  px-6 py-2 rounded shadow-lg shadow-blue-900" onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1}>Sebelumnya</button>
                    <button className="bg-blue-500 text-white font-bold  px-6 py-2 rounded shadow-lg shadow-blue-900" onClick={() => setCurrentPage(currentPage + 1)}>Selanjutnya</button>
                </div>
            </div>
        </>
    );
};
