import {BrowserRouter, Route, Routes} from "react-router-dom";
import Beranda from "./pages/Beranda";
import {PanelAdmin} from "./pages/PanelAdmin";
import {DataSantriPages} from "./pages/DataSantriPages";
import {LiveAbsensiPage} from "./pages/LiveAbsensiPage";

function App() {
  return (
     <div>
         <BrowserRouter>
             <Routes>
                 <Route path="/" element={< Beranda/>} />
                 <Route path="/beranda" element={< Beranda/>} />
                 <Route path="/panel-admin" element={< PanelAdmin/>} />
                 <Route path="/data-santri" element={< DataSantriPages/>} />
                 <Route path="/live-absensi" element={< LiveAbsensiPage/>} />
             </Routes>

         </BrowserRouter>

     </div>
  );
}

export default App;
