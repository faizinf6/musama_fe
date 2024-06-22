import {BrowserRouter, Route, Routes} from "react-router-dom";
import Beranda from "./pages/Beranda";
import {PanelAdmin} from "./pages/PanelAdmin";
import {DataSantriPages} from "./pages/DataSantriPages";
import {LiveAbsensiPage} from "./pages/LiveAbsensiPage";
import {Auth} from "./pages/Auth";
import {JadwalKegiatanPage} from "./pages/JadwalKegiatanPage";
import KalenderLiburPage from "./pages/KalenderLiburPage";
import AuthRedirect from "./pages/AuthRedirect";
import {UserProfilePage} from "./pages/UserProfilePage";
import RekapAbsensiPage from "./pages/RekapAbsensiPage";
import {DaftarAdminPage} from "./pages/DaftarAdminPage";
import {TesUploudFilePage} from "./pages/TesUploudFilePage";
import {StatusMesinPage} from "./pages/StatusMesinPage";
import {FilterMesinPage} from "./pages/FilterMesinPage";

function App() {
  return (
     <div>
         <BrowserRouter>
             <Routes>
                 <Route path="/" element={< AuthRedirect/>} />
                 <Route path="/beranda" element={< Beranda/>} />
                 <Route path="/panel-admin" element={< PanelAdmin/>} />
                 <Route path="/data-santri" element={< DataSantriPages/>} />
                 <Route path="/live-absensi" element={< LiveAbsensiPage/>} />
                 <Route path="/auth" element={< Auth/>} />
                 <Route path="/jadwal-kegiatan" element={< JadwalKegiatanPage/>} />
                 <Route path="/kalender-libur" element={< KalenderLiburPage/>} />
                 <Route path="/profil" element={< UserProfilePage/>} />
                 <Route path="/status-mesin" element={< StatusMesinPage/>} />
                 <Route path="/filter-mesin" element={< FilterMesinPage/>} />
                 <Route path="/rekap-absensi" element={< RekapAbsensiPage/>} />
                 <Route path="panel-admin/daftar-admin" element={< DaftarAdminPage/>} />
                 <Route path="/panel-admin/tambah-santri" element={< TesUploudFilePage/>} />
             </Routes>
         </BrowserRouter>
     </div>
  );
}

export default App;
