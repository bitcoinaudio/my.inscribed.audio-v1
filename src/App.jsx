import React from "react";
import { useDeviceContext } from "./utils/DeviceStore";
import Home from "./pages/Home";
import Collections from "./pages/Collections";
 import NavBar from "./components/NavBar";
import MyMedia from "./pages/MyMedia";
import Feature from "./pages/Feature";
import NK1 from "./pages/NK-1";
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
         <div id='' className="p-2 md:px-10">
          <NavBar />
          <Routes>
          <Route key="home" path="/" element={[<Home />, <Feature />]} />
          <Route key="collections" path="/collections" element={<Collections />} />
          <Route key="mymedia" path="/mymedia" element={<MyMedia />} />
          <Route key="nk-1" path="/nk-1" element={<NK1 />} />
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
