import React, { useState } from "react";
import { Link } from "react-router-dom"; 
import { Toggle } from "react-hook-theme";
import ConnectWallet from './ConnectWallet';
import ConnectMobile from './ConnectMobile';
import { useDeviceContext } from "../utils/DeviceStore";
import iaLogo from '/images/ia-bg3.png';
 
import "react-hook-theme/dist/styles/style.css";

const navigation = [
  { name: "Home", href: "/home" },
  { name: "Collections", href: "/collections" },
  { name: "Services", href: "/services" },
  { name: "Team", href: "/team" },
  ];

const NavBar = () => {
  const [active, setActive] = useState("Home");
  const { isMobile, isIOS, isAndroid } = useDeviceContext();

  return (
    <div className="sticky top-0 z-50 flex justify-center py-4 gap-4">
         
      {/* <div>
        <p>Mobile: {isMobile ? "Yes" : "No"}</p>
        <p>iOS: {isIOS ? "Yes" : "No"}</p>
        <p>Android: {isAndroid ? "Yes" : "No"}</p>
      </div> */}
      <div className="navbar ">
        <div className="navbar-start">
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
          <Link to="/" className="btn btn-ghost font-urbanist text-lg font-semibold gap-4 ">
           <img src={iaLogo} alt="Ordinal" className="w-10 h-10" />
          </Link>
        </div>
        {/* Desktop Menu */}
        <div className="navbar-center ml-10 hidden lg:flex">
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
          
          {isMobile ? <ConnectMobile />  : <ConnectWallet />}

          <Toggle />
        </div>
      </div>
    </div>
  );
};

export default NavBar;
