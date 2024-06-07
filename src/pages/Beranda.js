import Navbar from "./Navbar";
import {Tab} from "@headlessui/react";
import {
    CalculatorIcon, CalendarDaysIcon,
    ChartPieIcon,
    ClipboardDocumentCheckIcon, ClipboardDocumentListIcon, ClockIcon, CodeBracketIcon, EnvelopeOpenIcon,
    PresentationChartBarIcon,
    PresentationChartLineIcon, ShieldCheckIcon, SignalIcon,
    UserGroupIcon, UsersIcon
} from "@heroicons/react/16/solid";
import {useNavigate} from "react-router-dom";
import {useEffect} from "react";

function Beranda() {

    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));

    return (
      <div>
          <Navbar/>
          <div className="flex flex-col items-center justify-center">
              <h1 className="text-l italic font-bold mt-4">Selamat datang, {user?.nama_admin}</h1>
          </div>

          <Tab.Group>
              <Tab.List className="flex m-2 p-1.5  bg-green-800 rounded-xl">
                  {/* Individual Tab buttons */}
                  <Tab as="button"  className={({ selected }) =>
                      selected ? "bg-white text-cyan-500 w-full rounded-lg p-2.5 font-bold" :
                          "text-blue-100 hover:bg-white/[0.12] w-full rounded-lg p-2.5"
                  }>
                      Santri
                  </Tab>
                  <Tab as="button" className={({ selected }) =>
                      selected ? "bg-white text-orange-500 w-full rounded-lg p-2.5 font-bold" :
                          "text-blue-100 hover:bg-white/[0.12] w-full rounded-lg p-2.5"
                  }>
                      Guru
                  </Tab>
                  <Tab as="button" className={({ selected }) =>
                      selected ? "bg-white text-red-500 w-full rounded-lg p-2.5 font-bold" :
                          "text-blue-100 hover:bg-white/[0.12] w-full rounded-lg p-2.5"
                  }>
                      Informasi
                  </Tab>
              </Tab.List>
              <Tab.Panels className="mt-2">
                  {/* Murid Panel */}
                  <Tab.Panel className="bg-white rounded-xl p-3">
                      <a onClick={()=>{navigate('/data-santri') }}>
                          <div className="mr-3 ml-3 mt-3 p-6 max-w-lg mx-auto bg-white rounded-xl shadow-lg flex items-center space-x-4 border border-cyan-500">
                              <div className="shrink-0">
                                  <UserGroupIcon className="h-10 w-10 text-cyan-500" aria-hidden="true" />

                              </div>

                              <div>
                                  <div className="text-xl font-medium text-black">Data Santri</div>
                                  <p className="text-slate-500">Lihat, Cari dan edit Data Santri  </p>
                              </div>

                          </div>
                      </a>
                      <a onClick={()=>{navigate('/live-absensi') }}>
                          <div className="mr-3 ml-3 mt-3 p-6 max-w-lg mx-auto bg-white rounded-xl shadow-lg flex items-center space-x-4 border border-cyan-500">
                              <div className="shrink-0">
                                  <SignalIcon className="h-10 w-10 text-cyan-500" aria-hidden="true" />

                              </div>

                              <div>
                                  <div className="text-xl font-medium text-black">Live Absensi / Presensi</div>
                                  <p className="text-slate-500">Tambah, Hapus dan Edit Data Murid disini </p>
                              </div>

                          </div>
                      </a>
                      <a onClick={()=>{navigate('/data-murid') }}>
                          <div className="mr-3 ml-3 mt-3 p-6 max-w-lg mx-auto bg-white rounded-xl shadow-lg flex items-center space-x-4 border border-cyan-500">
                              <div className="shrink-0">
                                  <PresentationChartLineIcon className="h-10 w-10 text-cyan-500" aria-hidden="true" />

                              </div>

                              <div>
                                  <div className="text-xl font-medium text-black">Rekap & Laporan</div>
                                  <p className="text-slate-500">Tambah, Hapus dan Edit Data Murid disini </p>
                              </div>

                          </div>
                      </a>


                  </Tab.Panel>
                  {/* Guru Panel */}
                  <Tab.Panel className="bg-white rounded-xl p-3">


                      <a onClick={()=>{navigate('/data-murid') }}>
                          <div className="mr-3 ml-3 mt-3 p-6 max-w-lg mx-auto bg-white rounded-xl shadow-lg flex items-center space-x-4 border border-orange-400">
                              <div className="shrink-0">
                                  <UsersIcon className="h-10 w-10" aria-hidden="true" color="orange" />

                              </div>

                              <div>
                                  <div className="text-xl font-medium text-black">Data Guru</div>
                                  <p className="text-slate-500">Tambah, Hapus dan Edit Data Guru disini </p>
                              </div>

                          </div>
                      </a>
                      <a onClick={()=>{navigate('/data-murid') }}>
                          <div className="mr-3 ml-3 mt-3 p-6 max-w-lg mx-auto bg-white rounded-xl shadow-lg flex items-center space-x-4 border border-orange-400">
                              <div className="shrink-0">
                                  <ClipboardDocumentCheckIcon className="h-10 w-10" aria-hidden="true" color="orange" />

                              </div>

                              <div>
                                  <div className="text-xl font-medium text-black">Absensi / Presensi</div>
                                  <p className="text-slate-500">Tambah, Hapus dan Edit Data Murid disini </p>
                              </div>

                          </div>
                      </a>
                      <a onClick={()=>{navigate('/data-murid') }}>
                          <div className="mr-3 ml-3 mt-3 p-6 max-w-lg mx-auto bg-white rounded-xl shadow-lg flex items-center space-x-4 border border-orange-400">
                              <div className="shrink-0">
                                  <PresentationChartBarIcon className="h-10 w-10" aria-hidden="true" color="orange" />

                              </div>

                              <div>
                                  <div className="text-xl font-medium text-black">Rekap & Laporan</div>
                                  <p className="text-slate-500">Tambah, Hapus dan Edit Data Murid disini </p>
                              </div>

                          </div>
                      </a>

                  </Tab.Panel>
                  {/* Admin Panel */}
                  <Tab.Panel className="bg-white rounded-xl p-3">
                      <a onClick={()=>{navigate('/data-murid') }}>
                          <div className="mr-3 ml-3 mt-3 p-6 max-w-lg mx-auto bg-white rounded-xl shadow-lg flex items-center space-x-4 border border-red-500">
                              <div className="shrink-0">
                                  <CalculatorIcon className="h-10 w-10 text-red-500" aria-hidden="true" />

                              </div>

                              <div>
                                  <div className="text-xl font-medium text-black">Status Mesin Absen</div>
                                  <p className="text-slate-500">Tambah, Hapus dan Edit Data Guru disini </p>
                              </div>

                          </div>
                      </a>
                      <a onClick={()=>{navigate('/panel-admin') }}>
                          <div className="mr-3 ml-3 mt-3 p-6 max-w-lg mx-auto bg-white rounded-xl shadow-lg flex items-center space-x-4 border border-red-500">
                              <div className="shrink-0">
                                  <ShieldCheckIcon className="h-10 w-10 text-red-500" aria-hidden="true" />
                              </div>

                              <div>
                                  <div className="text-xl font-medium text-black">Panel Admin</div>
                                  <p className="text-slate-500">Halaman Khusus Admin atau pengurus yang diberi izin</p>
                              </div>

                          </div>
                      </a>
                      <a onClick={()=>{navigate('/jadwal-kegiatan') }}>
                          <div className="mr-3 ml-3 mt-3 p-6 max-w-lg mx-auto bg-white rounded-xl shadow-lg flex items-center space-x-4 border border-red-500">
                              <div className="shrink-0">
                                  <ClockIcon className="h-10 w-10 text-red-500" aria-hidden="true" />

                              </div>

                              <div>
                                  <div className="text-xl font-medium text-black">Jadwal Kegiatan</div>
                                  <p className="text-slate-500">Tambah, Hapus dan Edit Data Murid disini </p>
                              </div>

                          </div>
                      </a>

                      <a onClick={()=>{navigate('/kalender-libur') }}>
                          <div className="mr-3 ml-3 mt-3 p-6 max-w-lg mx-auto bg-white rounded-xl shadow-lg flex items-center space-x-4 border border-red-500">
                              <div className="shrink-0">
                                  <CalendarDaysIcon className="h-10 w-10 text-red-500" aria-hidden="true" />

                              </div>

                              <div>
                                  <div className="text-xl font-medium text-black">Pengaturan Hari Libur</div>
                                  <p className="text-slate-500">Tambah, Hapus dan Edit Data Murid disini </p>
                              </div>

                          </div>
                      </a>

                      <a onClick={()=>{navigate('/data-murid') }}>
                          <div className="mr-3 ml-3 mt-3 p-6 max-w-lg mx-auto bg-white rounded-xl shadow-lg flex items-center space-x-4 border border-red-500">
                              <div className="shrink-0">
                                  <PresentationChartLineIcon className="h-10 w-10 text-red-500" aria-hidden="true" />

                              </div>

                              <div>
                                  <div className="text-xl font-medium text-black">Rekap & Laporan</div>
                                  <p className="text-slate-500">Tambah, Hapus dan Edit Data Murid disini </p>
                              </div>

                          </div>
                      </a>




                  </Tab.Panel>
              </Tab.Panels>
          </Tab.Group>





      </div>
  );


}
// Add this function inside your Tab component




export default Beranda;
