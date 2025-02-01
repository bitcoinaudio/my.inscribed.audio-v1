import React from "react";
import { useDeviceContext } from "./utils/DeviceStore";
import Contact from "./pages/Contact";
import Home from "./pages/Home";
import Collections from "./pages/Collections";
 import NavBar from "./components/NavBar";
import MyMedia from "./pages/MyMedia";
import Team from "./pages/Team";
import Feature from "./pages/Feature";
import FooterPage  from "./pages/Footer";

import { LaserEyesProvider, MAINNET } from "@omnisat/lasereyes";
import { DeviceProvider } from "./utils/DeviceStore"; 
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { WalletProvider } from './context/WalletContext';
const App = () => {

  return (
    <Router>
      <WalletProvider>
      <LaserEyesProvider config={{ network: MAINNET }}>
        <DeviceProvider>  
        {/* <NavBar />
        <Home />
        <Feature /> */}
         <div className="p-2 md:px-10">
          <NavBar />
          <Routes>
          <Route path="/" element={[<Home />, <Feature />]} />
          <Route path="/collections" element={<Collections />} />
          <Route path="/mymedia" element={<MyMedia />} />
          <Route path="/team" element={<Team />} />
          </Routes>
         </div>
         <FooterPage />
      </DeviceProvider>
      </LaserEyesProvider>
      </WalletProvider>
    </Router>
    
  );
}

export default App;
