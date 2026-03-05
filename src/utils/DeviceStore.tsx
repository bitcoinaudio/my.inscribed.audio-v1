import React, { createContext, useContext, useEffect, useState } from "react";
import { getWalletRuntime, type WalletBrowserType } from "./walletRuntime";

// Define the context type
interface DeviceContextType {
  isMobile: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  inWalletBrowser: boolean;
  walletBrowserType: WalletBrowserType;
}

// Create the context with a default value
const DeviceContext = createContext<DeviceContextType | undefined>(undefined);

// Custom hook to access the device context
export const useDeviceContext = () => {
  const context = useContext(DeviceContext);
  if (!context) {
    throw new Error("useDeviceContext must be used within a DeviceProvider");
  }
  return context;
};

// DeviceProvider component to wrap your app
export const DeviceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [inWalletBrowser, setInWalletBrowser] = useState(false);
  const [walletBrowserType, setWalletBrowserType] = useState<WalletBrowserType>(null);

  useEffect(() => {
    const refreshRuntime = () => {
      const runtime = getWalletRuntime();
      setIsMobile(runtime.isMobile);
      setIsIOS(runtime.isIOS);
      setIsAndroid(runtime.isAndroid);
      setInWalletBrowser(runtime.inWalletBrowser);
      setWalletBrowserType(runtime.walletBrowserType);
    };

    refreshRuntime();
    window.addEventListener("resize", refreshRuntime);

    return () => {
      window.removeEventListener("resize", refreshRuntime);
    };
  }, []);

  return (
    <DeviceContext.Provider value={{ isMobile, isIOS, isAndroid, inWalletBrowser, walletBrowserType }}>
      {children}
    </DeviceContext.Provider>
  );
};
