import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import { WalletProvider } from "./context/WalletContext";
import { LaserEyesProvider } from '@omnisat/lasereyes-react'
import { NetworkProvider, useLaserEyesConfig } from './hooks/useNetwork'
import { DeviceProvider } from "./utils/DeviceStore";

import LandingPage from "./pages/LandingPage";
import Home from "./pages/Home";
import Feature from "./pages/Feature";
import Collections from "./pages/Collections";
import RoyaltyKit from "./pages/RoyaltyKit";
import MarketplaceDemo from "./pages/MarketplaceDemo";
import MyMedia from "./pages/MyMedia";
import NK1 from "./pages/NK-1";
import NavBar from "./components/NavBar";
import FooterPage from "./pages/Footer";

// Inner App component that has access to network context
const AppContent = () => {
  const laserEyesConfig = useLaserEyesConfig();
  
  return (
    <LaserEyesProvider config={laserEyesConfig}>
      <DeviceProvider>
        <div className="p-2 md:px-10">
          <NavBar />
          <Routes>
            <Route path="/" element={<LandingPage />} />  
            <Route path="/home" element={<Home />} />
            <Route path="/feature" element={<Feature />} />
            <Route path="/collections" element={<Collections />} />
            <Route path="/royaltykit" element={<RoyaltyKit />} />
            <Route path="/marketplace" element={<MarketplaceDemo />} />
            <Route path="/mymedia" element={<MyMedia />} />
            <Route path="/nk-1" element={<NK1 />} />
          </Routes>
        </div>
        <FooterPage />
      </DeviceProvider>
    </LaserEyesProvider>
  );
};

const App = () => {
  // Load theme from localStorage
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  return (
    <Router>
      <NetworkProvider>
        <WalletProvider>
          <AppContent />
        </WalletProvider>
      </NetworkProvider>
    </Router>
  );
};


export default App;
