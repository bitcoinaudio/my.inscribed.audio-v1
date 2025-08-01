import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import { WalletProvider } from "./context/WalletContext";
import { LaserEyesProvider } from '@omnisat/lasereyes-react'
import { MAINNET, REGTEST, TESTNET } from '@omnisat/lasereyes-core'
import { DeviceProvider } from "./utils/DeviceStore";

import LandingPage from "./pages/LandingPage";
import Home from "./pages/Home";
import Feature from "./pages/Feature";
import Collections from "./pages/Collections";
import RoyaltyKit from "./pages/RoyaltyKit";
import MyMedia from "./pages/MyMedia";
import NK1 from "./pages/NK-1";
import NavBar from "./components/NavBar";
import FooterPage from "./pages/Footer";

const App = () => {
  // Load theme from localStorage
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  return (
    <Router>
      <WalletProvider>
        <LaserEyesProvider config={{ network: TESTNET }}>
          <DeviceProvider>
            <div className="p-2 md:px-10">
              <NavBar />
              <Routes>
                <Route path="/" element={<LandingPage />} />  
                <Route path="/home" element={<Home />} />
                <Route path="/feature" element={<Feature />} />
                <Route path="/collections" element={<Collections />} />
                <Route path="/royaltykit" element={<RoyaltyKit />} />
                <Route path="/mymedia" element={<MyMedia />} />
                <Route path="/nk-1" element={<NK1 />} />
              </Routes>
            </div>
            <FooterPage />
          </DeviceProvider>
        </LaserEyesProvider>
      </WalletProvider>
    </Router>
  );
};

export default App;
