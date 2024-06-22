import React, { useEffect } from 'react';
import { useQuery } from 'react-query';
import axios from 'axios';
import moment from 'moment';
import Navbar from "./Navbar";
import { useNavigate } from 'react-router-dom';
import baseURL from "../config";

const fetchMesinData = async () => {
    console.log('Fetching data from API...');
    const { data } = await axios.get(`${baseURL}/all-mesin`);
    console.log('Data fetched:', data);
    return data;
};

export const mesinColorMap = {
    '100': 'bg-cyan-500',
    '101': 'bg-sky-500',
    '200': 'bg-blue-600',
    '300': 'bg-blue-700',
    '400': 'bg-teal-500',
    '500': 'bg-emerald-500',
    '600': 'bg-teal-800',
    '700': 'bg-orange-600',
    '701': 'bg-purple-500',
    '702': 'bg-purple-600',
    '703': 'bg-purple-600'
};
export const borderMesinColorMap = {
    '100': 'border-cyan-500',
    '101': 'border-sky-500',
    '200': 'border-blue-600',
    '300': 'border-blue-700',
    '400': 'border-teal-500',
    '500': 'border-emerald-500',
    '600': 'border-teal-800',
    '700': 'border-orange-600',
    '701': 'border-purple-500',
    '702': 'border-purple-600',
    '703': 'border-purple-600'
};


const AtributComponent = ({ name, data }) => {
    const isStale = data.last_edit && moment().diff(moment(data.last_edit), 'minutes') >= 3;
    return (
        <tr className="text-center">
            <td className="p-2 font-medium italic">{name}</td>
            <td className="p-2">
                <span className={`h-4 w-4 inline-block rounded-full ${data.status ? 'bg-green-500' : 'bg-red-500'}`}></span>
            </td>
            <td className={`rounded p-2 ${isStale ? 'bg-red-400 text-white' : ''}`}>
                {data.last_edit ? moment(data.last_edit).format('HH:mm:ss') : '-'}
            </td>
        </tr>
    );
};

const MesinCard = ({ mesin }) => {
    return (
        <div className={`border  rounded-xl shadow-lg ${borderMesinColorMap[mesin.nis]}`}>
            <h2 className={`text-lg font-bold mb-2 text-center text-white rounded-t-lg py-2 ${mesinColorMap[mesin.nis]}`}>{mesin.nama_admin} ({mesin.rfid})</h2>
            <table className="min-w-full divide-y divide-gray-200 mb-2">
                <thead className="bg-gray-50">
                <tr>
                    <th className="p-2">Atribut</th>
                    <th className="p-2">Status</th>
                    <th className="p-2">Terakhir Cek</th>
                </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                {Object.keys(mesin.atribut_mesin[0]).map((atribut, index) => (
                    <AtributComponent
                        key={index}
                        name={atribut}
                        data={mesin.atribut_mesin[0][atribut]}
                    />
                ))}
                </tbody>
            </table>
        </div>
    );
};

export const StatusMesinPage = () => {
    const { data: dataMesins, refetch } = useQuery('mesinData', fetchMesinData, {
        refetchInterval: 180000, // Refetch every 3 minutes
    });

    const navigate = useNavigate();

    useEffect(() => {
        console.log('StatusMesinPage mounted');
        return () => {
            console.log('StatusMesinPage unmounted');
            // React Query automatically handles cancellation on unmount, no need to manually cancel
        };
    }, []);

    return (
        <div>
            <Navbar></Navbar>
            <div className="p-4 space-y-4">
                {dataMesins?.map(mesin => (
                    <MesinCard key={mesin.nis} mesin={mesin} />
                ))}

                <div
                    className=" w-full bg-blue-500 text-white text-center py-4 rounded-lg"
                    onClick={() => navigate('/filter-mesin')}
                >
                    Pengaturan Filter Mesin
                </div>
            </div>



        </div>

    );
};
