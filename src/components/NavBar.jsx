import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom"; 
import { Toggle } from "react-hook-theme";
import ConnectWallet from './ConnectWallet';
import ConnectMobile from './ConnectMobile';
import { useDeviceContext } from "../utils/DeviceStore";
import iaLogo from '/images/ia-bg3.png';
import { useWallet } from '../context/WalletContext';
import "react-hook-theme/dist/styles/style.css";
import { useLaserEyes } from '@omnisat/lasereyes-react'
import { inscriptionArray } from '../globalState';
 
const basenavigation = [
  { name: "My Inscribed Audio", href: "/" },
  { name: "Collections", href: "/collections" },
  { name: "Marketplace Demo", href: "/marketplace" },
  ];


const NavBar = () => {
  const [active, setActive] = useState("Home");
  const { isWalletConnected } = useWallet();
  const { isMobile } = useDeviceContext();
  const [showNav, setShowNav] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const { connect, disconnect, address, provider, hasUnisat, hasXverse, hasMagicEden } = useLaserEyes();

  // Check if wallet contains any IOM inscriptions
  const hasIOMInscription = () => {
    return inscriptionArray.some(inscription => inscription.isIOM === true);
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > lastScrollY) {
        setShowNav(false);
      } else {
        setShowNav(true);
      }
      setLastScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [lastScrollY]);

  const navigation = [
    ...basenavigation,
    ...(address ? [
      { name: "My Media", href: "/mymedia" },
      { name: "NK-1", href: "/nk-1" },
      ...(hasIOMInscription() ? [{ name: "Royalty Kit", href: "/royaltykit" }] : [])
    ] : [])
  ];
  //  console.log("isWalletConnected NavBar", isWalletConnected);

  return (
    <div className={`sticky top-0 z-50 flex justify-center py-4 gap-4 transition-transform duration-300 ${showNav ? 'translate-y-0' : '-translate-y-full'}`}>
      <div className="navbar ">
        <div className="navbar-start">
        <Link to="https://inscribed.audio" className="btn btn-ghost font-urbanist text-lg font-semibold gap-4 lg:hidden">
           <img src={iaLogo} alt="inscribed audio" className="w-10 h-10" />
          </Link>
          <div className="dropdown">
            {/* Mobile Menu */}
            
            <div tabIndex={0} role="button" className="btn btn-circle btn-ghost lg:hidden ">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h8m-8 6h16"
                />
              </svg>
            </div>
            {/* Mobile Menu */}

            <ul className="menu dropdown-content menu-md z-[1] mt-3 w-52 gap-2 rounded-box bg-base-100 p-2 shadow">
              {navigation.map((item, index) => (
                <li key={index}>
                  <Link to={item.href} className="font-urbanist">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
         
        </div>
        {/* Desktop Menu */}
        <div className="navbar-center ml-10 hidden lg:flex">
            <Link to="https://inscribed.audio" className="btn btn-ghost font-urbanist text-lg font-semibold gap-4 ">
           <img src={iaLogo} alt="inscribed audio" className="w-10 h-10" /><span className="text-sm font-semibold">Inscribed.Audio</span>
          </Link>
          {navigation.map((item, index) => (
            <nav key={index} className="menu menu-horizontal px-1">
              <Link
                to={item.href}
                className={`btn btn-ghost   font-urbanist text-sm font-light ${
                  active === item.name ? "bg-base-300" : ""
                }`}
                onClick={() => setActive(item.name)}
              >
                {item.name}
              </Link>
               
            </nav>
          ))}
        </div>

        <div className="navbar-end h-10 scale-75">
          <div className="flex flex-col gap-4">
          {isMobile ? <ConnectMobile /> : <ConnectWallet />}
          </div>

          <Toggle />
        </div>
      </div>
    </div>
  );
};

export default NavBar;
