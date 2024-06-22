import React, { useState, useEffect } from 'react';
import { Tab } from '@headlessui/react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import axios from 'axios';
import 'tailwindcss/tailwind.css';
import Navbar from "./Navbar";
import {toast, ToastContainer} from "react-toastify";
import baseURL from "../config";
import {borderMesinColorMap, mesinColorMap} from "./StatusMesinPage";
import {validateAdmin} from "./Beranda";

const fetchFilters = async () => {
    const { data } = await axios.get(`${baseURL}/all-filter-mesin`);
    return data;
};

const patchFilter = async (updatedFilter) => {
    console.log(updatedFilter)
    await axios.patch(`${baseURL}/update-filter-mesin`, updatedFilter);
};

export const FilterMesinPage = () => {
    const queryClient = useQueryClient();
    const { data: dataMesins, refetch } = useQuery('filters', fetchFilters);
    const mutation = useMutation(patchFilter, {
        onSuccess: () => {
            queryClient.invalidateQueries('filters');
            toast.success(`Berhasil!, filter tersimpan`, {autoClose: 2000,});

        },
    });

    const handleSave = (updatedFilter) => {
        mutation.mutate(updatedFilter);

    };

    return (
        <div>
            <Navbar></Navbar>
            <ToastContainer></ToastContainer>

            <div className="w-full max-w-4xl mx-auto p-4">
                <Tab.Group>
                    <Tab.List className="flex p-1 space-x-1 rounded-xl">
                        <Tab className={({ selected }) =>
                            selected ? 'bg-white shadow text-blue-700' : 'text-blue-100'
                        } className="w-full py-2.5 text-sm leading-5 font-medium text-blue-700 rounded-lg">
                            Pengaturan Filter
                        </Tab>
                        {/*<Tab className={({ selected }) =>*/}
                        {/*    selected ? 'bg-white shadow text-blue-700' : 'text-blue-100'*/}
                        {/*} className="w-full py-2.5 text-sm leading-5 font-medium text-blue-700 rounded-lg">*/}
                        {/*    Status Mesin*/}
                        {/*</Tab>*/}
                    </Tab.List>
                    <Tab.Panels className="mt-2">
                        <Tab.Panel className="bg-white rounded-xl p-3">
                            <button
                                className="mb-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
                                onClick={() => refetch()}
                            >
                                Refresh
                            </button>
                            <div className="grid grid-cols-1 gap-4">
                                {dataMesins?.map((dataMesin) => (
                                    <FilterBox key={dataMesin.dataMesin.filterMesinData.id} dataMesin={dataMesin} handleSave={handleSave} />
                                ))}
                            </div>
                        </Tab.Panel>
                        <Tab.Panel className="bg-white rounded-xl p-3">
                            {/* Future development for Status Mesin tab */}
                        </Tab.Panel>
                    </Tab.Panels>
                </Tab.Group>
            </div>
        </div>
    );
};

const FilterBox = ({ dataMesin, handleSave }) => {
    const [isLaki, setIsLaki] = useState(dataMesin.dataMesin.filterMesinData.is_laki);
    const [isPerempuan, setIsPerempuan] = useState(dataMesin.dataMesin.filterMesinData.is_perempuan);
    const [kelasTerfilter, setKelasTerfilter] = useState(dataMesin.dataMesin.filterMesinData.kelas_terfilter);


    const handleKelasChange = (index) => {
        const newKelasTerfilter = [...kelasTerfilter];
        newKelasTerfilter[index].aktif = !newKelasTerfilter[index].aktif;
        setKelasTerfilter(newKelasTerfilter);
    };

    const handleSaveClick = () => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (validateAdmin(user))
        {handleSave({
            id_kegiatan: dataMesin.dataMesin.filterMesinData.id_kegiatan,
            id_mesin: dataMesin.dataMesin.filterMesinData.id_mesin,
            is_laki: isLaki,
            is_perempuan: isPerempuan,
            kelas_terfilter: kelasTerfilter,
        });}

        else {
            toast.error(`Anda Bukan Admin/Operator`, {autoClose: 3100,});


        }
    };

    return (
        <div>
            <div className={`rounded-lg shadow-md border-2 ${borderMesinColorMap[dataMesin.dataMesin.adminData.nis]}`}>
                <div className={`${mesinColorMap[dataMesin.dataMesin.adminData.nis]} flex justify-center rounded-t-l`}>
                    {/* nama Admin */}
                    <h1 className={`items-center italic mx-2 py-2 font-bold text-white`}>{dataMesin.dataMesin.adminData.nama_admin} ({dataMesin.dataMesin.adminData.rfid})</h1>
                </div>

                <div className={`pl-4 pb-4 relative`}>
                    <p className={`font-bold mt-2 text-xl`}>{dataMesin.dataMesin.kegiatanData.nama_kegiatan}</p>
                    <p className={`font-bold mb-2 text-xs text-gray-700`}>{dataMesin.dataMesin.kegiatanData.pemilik}</p>
                    <label className={`italic text-gray-500 text-sm`}>Yang boleh Absen di Mesin ini:</label>
                    <div>
                        <label  className={`ml-1 mr-2 mt-2`}>
                            <input
                                className={`mr-2 mt-2`}
                                type="checkbox"
                                checked={isLaki}
                                onChange={() => setIsLaki(!isLaki)}
                            />
                            Laki-laki
                        </label>
                        <label  className={`ml-6 mr-2 mt-2`}>
                            <input
                                className={`mr-2 mt-2`}
                                type="checkbox"
                                checked={isPerempuan}
                                onChange={() => setIsPerempuan(!isPerempuan)}
                            />
                            Perempuan
                        </label>
                    </div>
                    <details className={   `flex mt-2 pr-40`}>
                        <summary className={`border-2 pl-4 py-2 rounded-lg`}>Filter Perkelas</summary>

                        {kelasTerfilter.map((kelas, index) => (
                            <label key={kelas.Kelas}>
                                <input className={`mr-2 mt-2`}
                                       type="checkbox"
                                       checked={kelas.aktif}
                                       onChange={() => handleKelasChange(index)}
                                />
                                {kelas.Kelas}
                            </label>
                        ))}
                    </details>
                    <div className="absolute bottom-0 right-0 p-4">
                        <button
                            className={`px-4 py-2.5 ${mesinColorMap[dataMesin.dataMesin.adminData.nis]} text-white rounded-full`}
                            onClick={handleSaveClick}
                        >
                            Simpan
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
