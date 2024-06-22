import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import axios from 'axios';
import baseURL from "../config";



export const TesUploudFilePage = () => {
    return (
        <div>
            <UnggahFileExcelPage />
        </div>
    )
};

export const UnggahFileExcelPage = () => {
    const [message, setMessage] = useState('');

    const sanitizeString = (str) => {
        const regex = /['"\\\/><&%?!:;|*^~\[\]{}()=]/g;
        return str.replace(regex, '');
    };

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (e) => {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });

            const filename = file.name;
            const [namaSekolah, tahunAjaran] = filename.split('.xlsx')[0].split(' ', 2);

            const namaKelas = workbook.SheetNames;
            const dataKelasLembaga = namaKelas.map(kelas => ({
                kelas,
                pemilik: namaSekolah,
                tahun_ajaran: tahunAjaran
            }));

            const dataKelasSantri = [];
            const dataSantri = [];

            const nisSet = new Set();
            const rfidSet = new Set();

            let validationFailed = false;
            let validationMessage = '';

            namaKelas.forEach(sheetName => {
                const worksheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

                const headers = jsonData[0];
                const nisIndex = headers.findIndex(header => header.toLowerCase().includes('nis'));
                const namaIndex = headers.findIndex(header => header.toLowerCase().includes('nama'));
                const jenisKelaminIndex = headers.findIndex(header => header.toLowerCase().includes('jenis kelamin'));
                const rfidIndex = headers.findIndex(header => header.toLowerCase().includes('rfid'));

                jsonData.slice(1).forEach((row, rowIndex) => {
                    const nisSantri = sanitizeString(String(row[nisIndex] || ''));
                    const namaSantri = sanitizeString(String(row[namaIndex] || ''));
                    const rfidSantri = sanitizeString(String(row[rfidIndex] || ''));
                    const genderSantri = sanitizeString(String(row[jenisKelaminIndex] || ''));

                    if (!nisSantri || !rfidSantri) {
                        validationFailed = true;
                        validationMessage = `Validation failed at sheet: ${sheetName}, row: ${rowIndex + 2}. nisSantri and rfidSantri cannot be empty or undefined.`;
                        return;
                    }

                    if (nisSet.has(nisSantri)) {
                        validationFailed = true;
                        validationMessage = `Validation failed at sheet: ${sheetName}, row: ${rowIndex + 2}. Duplicate nisSantri found: ${nisSantri}.`;
                        return;
                    }

                    // if (rfidSet.has(rfidSantri)) {
                    //     validationFailed = true;
                    //     validationMessage = `Validation failed at sheet: ${sheetName}, row: ${rowIndex + 2}. Duplicate rfidSantri found: ${rfidSantri}.`;
                    //     return;
                    // }

                    nisSet.add(nisSantri);
                    rfidSet.add(rfidSantri);

                    dataKelasSantri.push({
                        nis_santri: nisSantri,
                        kelas: sheetName,
                        pemilik: namaSekolah,
                        tahun_ajaran: tahunAjaran
                    });

                    dataSantri.push({
                        nis_santri: nisSantri,
                        nama_santri: namaSantri,
                        rfid: rfidSantri,
                        gender: genderSantri
                    });
                });

                if (validationFailed) return;
            });

            if (validationFailed) {
                setMessage(validationMessage);
                return;
            }

            const postData = {
                data_kelas_lembaga: dataKelasLembaga,
                data_kelas_santri: dataKelasSantri,
                data_santri: dataSantri
            };

            console.log(postData);

            try {
                const response = await axios.post(`${baseURL}/create-santri-banyak`, postData);

                if (response.status === 200) {
                    setMessage('Sukses');
                }
            } catch (error) {
                console.error('Error posting data:', error);
                setMessage('Error posting data');
            }
        };

        reader.readAsArrayBuffer(file);
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-xl font-bold mb-4">Unggah File Excel</h1>
            <input
                type="file"
                accept=".xlsx"
                onChange={handleFileUpload}
                className="mb-4 p-2 border rounded"
            />
            {message && <p>{message}</p>}
        </div>
    );
};
// const response = await axios.post(`${baseURL}/create-santri-banyak`, postData);
