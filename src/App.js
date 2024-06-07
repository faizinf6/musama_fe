import {BrowserRouter, Route, Routes} from "react-router-dom";
import Beranda from "./pages/Beranda";
import {PanelAdmin} from "./pages/PanelAdmin";
import {DataSantriPages} from "./pages/DataSantriPages";
import {LiveAbsensiPage} from "./pages/LiveAbsensiPage";
import {Auth} from "./pages/Auth";
import {JadwalKegiatanPage} from "./pages/JadwalKegiatanPage";
import KalenderLiburPage from "./pages/KalenderLiburPage";
import AuthRedirect from "./pages/AuthRedirect";

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
             </Routes>

         </BrowserRouter>

     </div>
  );
}

export default App;
