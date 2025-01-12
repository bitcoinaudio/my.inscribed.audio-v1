import React from "react";
import { useDeviceContext } from "./utils/DeviceStore";
import Contact from "./pages/Contact";
import Home from "./pages/Home";
import Collections from "./pages/Collections";
 import NavBar from "./components/NavBar";
import Services from "./pages/Services";
import Team from "./pages/Team";
import Testimonial from "./pages/Testimonial";
import AboutPage from "./pages/AboutPage";
import Feature from "./pages/Feature";
import { LaserEyesProvider, MAINNET } from "@omnisat/lasereyes";
import { DeviceProvider } from "./utils/DeviceStore"; 
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

const App = () => {

  return (
    <Router>
      <LaserEyesProvider config={{ network: MAINNET }}>
        <DeviceProvider>    
         <div className="p-2 md:px-10">
          <NavBar />
          <Routes>
          <Route path="/home" element={<Home />} />
          <Route path="/collections" element={<Collections />} />
          <Route path="/services" element={<Services />} />
           <Route path="/team" element={<Team />} />
            </Routes>
         </div>
      </DeviceProvider>
      </LaserEyesProvider>
    </Router>
  );
}

export default App;
