import React, { createContext, useContext, useEffect, useState } from "react";

// Define the context type
interface DeviceContextType {
  isMobile: boolean;
  isIOS: boolean;
  isAndroid: boolean;
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

  useEffect(() => {
    const userAgent = navigator.userAgent;

    // Check for mobile device
    const checkMobile = window.innerWidth <= 768;
    setIsMobile(checkMobile);

    // Check for iOS and Android
    setIsIOS(/iPhone|iPad|iPod/i.test(userAgent));
    setIsAndroid(/Android/i.test(userAgent));
  }, []);

  return (
    <DeviceContext.Provider value={{ isMobile, isIOS, isAndroid }}>
      {children}
    </DeviceContext.Provider>
  );
};
