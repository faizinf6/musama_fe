// src/api.js
import axios from 'axios';
import baseURL from "../config";

export const fetchMesin = async () => {
    const response = await axios.get(`${baseURL}/all-mesin`);
    return response.data;
};

export const fetchKelasLembaga = async () => {
    const response = await axios.get(`${baseURL}/all-kelaslembaga`);
    return response.data;
};
export const fetchKegiatan = async () => {
    const response = await axios.get(`${baseURL}/all-kegiatan`);
    return response.data;
};

export const createKegiatan = async (data) => {

    const response = await axios.post(`${baseURL}/create-kegiatan`, data);
    return response.data;
};
